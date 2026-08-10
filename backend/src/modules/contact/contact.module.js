const { z } = require("zod");
const express = require("express");
const ContactMessage = require("../../models/ContactMessageModel");
const AppError = require("../../core/AppError");
const asyncHandler = require("../../core/asyncHandler");
const { ok, created, paginated } = require("../../core/ApiResponse");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const { requireStaff } = require("../../middlewares/rbac");
const { listQuery, idParam, email, parseSort, searchFilter } = require("../../utils/schemas");

/** Messages one address may submit within the window below. */
const MAX_MESSAGES_PER_WINDOW = 5;
const WINDOW_MS = 60 * 60 * 1000;

const contactBody = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email,
  city: z.string().trim().min(1, "City is required").max(120),
  message: z.string().trim().min(1, "Message is required").max(5000),
});

const listContactQuery = listQuery.extend({
  isRead: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

const router = express.Router();

/**
 * Public submission.
 *
 * Previously a second message from the same address was rejected outright,
 * which permanently locked out returning customers. Repeat contact is allowed;
 * only bursts are throttled.
 */
router.post(
  "/contactUs",
  validate({ body: contactBody }),
  asyncHandler(async (req, res) => {
    const recentCount = await ContactMessage.countDocuments({
      email: req.body.email,
      createdAt: { $gte: new Date(Date.now() - WINDOW_MS) },
    });

    if (recentCount >= MAX_MESSAGES_PER_WINDOW) {
      throw AppError.tooManyRequests(
        "You have sent several messages recently. Please wait before sending another."
      );
    }

    await ContactMessage.create(req.body);
    return created(res, { message: "Message sent successfully" });
  })
);

/* -------------------------------- Management ------------------------------- */

router.get(
  "/contactUs",
  authenticate,
  requireStaff,
  validate({ query: listContactQuery }),
  asyncHandler(async (req, res) => {
    const { page, limit, search, sort, isRead } = req.query;
    const filter = {
      ...searchFilter(search, ["name", "email", "city", "message"]),
      ...(isRead !== undefined ? { isRead } : {}),
    };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      ContactMessage.find(filter).sort(parseSort(sort)).skip(skip).limit(limit).lean(),
      ContactMessage.countDocuments(filter),
    ]);

    return paginated(res, { items, total, page, limit });
  })
);

router.patch(
  "/contactUs/:id/read",
  authenticate,
  requireStaff,
  validate({ params: idParam("id") }),
  asyncHandler(async (req, res) => {
    const doc = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true, handledBy: req.auth.userId },
      { new: true }
    ).lean();
    if (!doc) throw AppError.notFound("Message not found");
    return ok(res, { data: doc, message: "Marked as read" });
  })
);

router.delete(
  "/contactUs/:id",
  authenticate,
  requireStaff,
  validate({ params: idParam("id") }),
  asyncHandler(async (req, res) => {
    const doc = await ContactMessage.findByIdAndDelete(req.params.id).lean();
    if (!doc) throw AppError.notFound("Message not found");
    return ok(res, { message: "Message deleted" });
  })
);

router.delete(
  "/contact/deleteAll",
  authenticate,
  requireStaff,
  asyncHandler(async (req, res) => {
    const { deletedCount } = await ContactMessage.deleteMany({});
    return ok(res, { message: `${deletedCount} messages deleted` });
  })
);

module.exports = router;
