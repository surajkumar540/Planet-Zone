const { z } = require("zod");
const express = require("express");
const prisma = require("../../db/client");
const { toContactMessage } = require("../../db/mappers");
const AppError = require("../../core/AppError");
const asyncHandler = require("../../core/asyncHandler");
const { ok, created, paginated } = require("../../core/ApiResponse");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const { requireStaff } = require("../../middlewares/rbac");
const {
  listQuery,
  idParam,
  email,
  parseSort,
  searchFilter,
  sortable,
} = require("../../utils/schemas");

/** Messages one address may submit within the window below. */
const MAX_MESSAGES_PER_WINDOW = 5;
const WINDOW_MS = 60 * 60 * 1000;

const SORTABLE = sortable("createdAt", "name", "email", "city");

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
    const recentCount = await prisma.contactMessage.count({
      where: {
        email: req.body.email,
        createdAt: { gte: new Date(Date.now() - WINDOW_MS) },
      },
    });

    if (recentCount >= MAX_MESSAGES_PER_WINDOW) {
      throw AppError.tooManyRequests(
        "You have sent several messages recently. Please wait before sending another."
      );
    }

    await prisma.contactMessage.create({ data: req.body });
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
    const where = {
      ...searchFilter(search, ["name", "email", "city", "message"]),
      ...(isRead !== undefined ? { isRead } : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: parseSort(sort, SORTABLE),
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    return paginated(res, { items: rows.map(toContactMessage), total, page, limit });
  })
);

router.patch(
  "/contactUs/:id/read",
  authenticate,
  requireStaff,
  validate({ params: idParam("id") }),
  asyncHandler(async (req, res) => {
    const exists = await prisma.contactMessage.count({ where: { id: req.params.id } });
    if (!exists) throw AppError.notFound("Message not found");

    const row = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { isRead: true, handledById: req.auth.userId },
    });
    return ok(res, { data: toContactMessage(row), message: "Marked as read" });
  })
);

router.delete(
  "/contactUs/:id",
  authenticate,
  requireStaff,
  validate({ params: idParam("id") }),
  asyncHandler(async (req, res) => {
    const { count } = await prisma.contactMessage.deleteMany({ where: { id: req.params.id } });
    if (count === 0) throw AppError.notFound("Message not found");
    return ok(res, { message: "Message deleted" });
  })
);

router.delete(
  "/contact/deleteAll",
  authenticate,
  requireStaff,
  asyncHandler(async (req, res) => {
    const { count } = await prisma.contactMessage.deleteMany({});
    return ok(res, { message: `${count} messages deleted` });
  })
);

module.exports = router;
