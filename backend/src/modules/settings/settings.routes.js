const express = require("express");
const { z } = require("zod");
const asyncHandler = require("../../core/asyncHandler");
const { ok, created } = require("../../core/ApiResponse");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const { requireStaff, requireAdmin } = require("../../middlewares/rbac");
const audit = require("../../services/audit.service");
const AppError = require("../../core/AppError");
const cache = require("../../core/cache");
const Settings = require("../../models/SettingsModel");
const TaxRate = require("../../models/TaxRateModel");
const ShippingZone = require("../../models/ShippingZoneModel");
const shippingService = require("../../services/shipping.service");
const { idParam } = require("../../utils/schemas");

/* -------------------------------- Validation ------------------------------- */

const hexColor = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Enter a valid hex colour");

const updateSettingsSchema = z
  .object({
    store: z
      .object({
        name: z.string().trim().max(120).optional(),
        tagline: z.string().trim().max(200).optional(),
        email: z.string().trim().email().or(z.literal("")).optional(),
        phone: z.string().trim().max(30).optional(),
        logo: z.string().trim().max(500).optional(),
        favicon: z.string().trim().max(500).optional(),
        address: z.record(z.string(), z.string().max(200)).optional(),
        socialLinks: z.record(z.string(), z.string().max(300)).optional(),
      })
      .optional(),
    localisation: z
      .object({
        currency: z.string().trim().length(3).optional(),
        currencySymbol: z.string().trim().max(4).optional(),
        timezone: z.string().trim().max(60).optional(),
        dateFormat: z.string().trim().max(20).optional(),
      })
      .optional(),
    orders: z
      .object({
        orderPrefix: z.string().trim().max(10).optional(),
        minOrderAmount: z.coerce.number().min(0).optional(),
        allowCashOnDelivery: z.coerce.boolean().optional(),
        allowOnlinePayment: z.coerce.boolean().optional(),
        cancellationWindowHours: z.coerce.number().min(0).optional(),
        autoConfirmOrders: z.coerce.boolean().optional(),
      })
      .optional(),
    tax: z
      .object({
        pricesIncludeTax: z.coerce.boolean().optional(),
        displayTaxInCart: z.coerce.boolean().optional(),
        defaultTaxRate: z.coerce.number().min(0).max(100).optional(),
      })
      .optional(),
    inventory: z
      .object({
        trackInventory: z.coerce.boolean().optional(),
        allowBackorders: z.coerce.boolean().optional(),
        lowStockThreshold: z.coerce.number().int().min(0).optional(),
        hideOutOfStockProducts: z.coerce.boolean().optional(),
      })
      .optional(),
    notifications: z
      .object({
        orderConfirmationEmail: z.coerce.boolean().optional(),
        orderStatusEmail: z.coerce.boolean().optional(),
        lowStockAlertEmail: z.coerce.boolean().optional(),
        adminAlertEmail: z.string().trim().email().or(z.literal("")).optional(),
      })
      .optional(),
    appearance: z
      .object({
        themeMode: z.enum(["light", "dark", "system"]).optional(),
        accentColor: hexColor.optional(),
        fontSize: z.enum(["sm", "md", "lg"]).optional(),
        density: z.enum(["compact", "comfortable", "spacious"]).optional(),
        sidebarCollapsed: z.coerce.boolean().optional(),
      })
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one section to update",
  });

const taxRateBody = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  code: z.string().trim().min(1, "Code is required").max(20),
  rate: z.coerce.number().min(0).max(100),
  country: z.string().trim().max(120).optional().default("India"),
  states: z.array(z.string().trim().max(120)).optional().default([]),
  isInclusive: z.coerce.boolean().optional().default(false),
  isDefault: z.coerce.boolean().optional().default(false),
  isActive: z.coerce.boolean().optional().default(true),
  description: z.string().trim().max(500).optional().default(""),
});

const shippingRateBody = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z.string().trim().max(300).optional().default(""),
  price: z.coerce.number().min(0),
  minOrderAmount: z.coerce.number().min(0).optional().default(0),
  maxOrderAmount: z.coerce.number().min(0).optional().default(0),
  freeAboveAmount: z.coerce.number().min(0).optional().default(0),
  minDeliveryDays: z.coerce.number().int().min(0).optional().default(2),
  maxDeliveryDays: z.coerce.number().int().min(0).optional().default(7),
  isActive: z.coerce.boolean().optional().default(true),
  position: z.coerce.number().int().min(0).optional().default(0),
});

const shippingZoneBody = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z.string().trim().max(500).optional().default(""),
  country: z.string().trim().max(120).optional().default("India"),
  states: z.array(z.string().trim().max(120)).optional().default([]),
  pinCodePrefixes: z.array(z.string().trim().max(10)).optional().default([]),
  rates: z.array(shippingRateBody).optional().default([]),
  isFallback: z.coerce.boolean().optional().default(false),
  isActive: z.coerce.boolean().optional().default(true),
  position: z.coerce.number().int().min(0).optional().default(0),
});

const shippingQuoteSchema = z.object({
  address: z.object({
    state: z.string().trim().optional().default(""),
    city: z.string().trim().optional().default(""),
    pinCode: z.union([z.string(), z.number()]).optional(),
    country: z.string().trim().optional().default("India"),
  }),
  orderAmount: z.coerce.number().min(0),
});

const router = express.Router();
const staffOnly = [authenticate, requireStaff];

const SETTINGS_CACHE_KEY = "settings:public";

/* -------------------------------- Settings --------------------------------- */

/**
 * Store details the storefront needs before a user signs in: branding,
 * currency and the default appearance. Operational settings are withheld.
 */
router.get(
  "/settings/public",
  asyncHandler(async (req, res) => {
    const data = await cache.remember(SETTINGS_CACHE_KEY, 5 * 60 * 1000, async () => {
      const settings = await Settings.getSettings();
      return {
        store: settings.store,
        localisation: settings.localisation,
        appearance: settings.appearance,
        orders: {
          allowCashOnDelivery: settings.orders.allowCashOnDelivery,
          allowOnlinePayment: settings.orders.allowOnlinePayment,
          minOrderAmount: settings.orders.minOrderAmount,
        },
      };
    });
    return ok(res, { data });
  })
);

router.get(
  "/settings",
  staffOnly,
  asyncHandler(async (req, res) => ok(res, { data: await Settings.getSettings() }))
);

router.patch(
  "/settings",
  authenticate,
  requireAdmin,
  validate({ body: updateSettingsSchema }),
  asyncHandler(async (req, res) => {
    const settings = await Settings.getSettings();

    // Merged section by section so a partial update never drops sibling keys.
    for (const [section, values] of Object.entries(req.body)) {
      settings.set(section, { ...(settings[section]?.toObject?.() ?? settings[section]), ...values });
    }
    settings.updatedBy = req.auth.userId;
    await settings.save();

    cache.invalidate("settings:");
    await audit.record({
      req,
      action: "settings.update",
      entityType: "Settings",
      entityId: settings._id,
      changes: req.body,
    });

    return ok(res, { data: settings.toObject(), message: "Settings updated" });
  })
);

/* ------------------------------- Tax rates --------------------------------- */

router.get(
  "/tax-rates",
  staffOnly,
  asyncHandler(async (req, res) =>
    ok(res, { data: await TaxRate.find({}).sort({ isDefault: -1, name: 1 }).lean() })
  )
);

router.post(
  "/tax-rates",
  staffOnly,
  validate({ body: taxRateBody }),
  asyncHandler(async (req, res) => {
    const rate = await TaxRate.create(req.body);
    if (rate.isDefault) {
      await TaxRate.updateMany({ _id: { $ne: rate._id } }, { $set: { isDefault: false } });
    }
    return created(res, { data: rate.toObject(), message: "Tax rate created" });
  })
);

router.patch(
  "/tax-rates/:id",
  staffOnly,
  validate({ params: idParam("id"), body: taxRateBody.partial() }),
  asyncHandler(async (req, res) => {
    const rate = await TaxRate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!rate) throw AppError.notFound("Tax rate not found");

    if (req.body.isDefault) {
      await TaxRate.updateMany({ _id: { $ne: rate._id } }, { $set: { isDefault: false } });
    }
    return ok(res, { data: rate, message: "Tax rate updated" });
  })
);

router.delete(
  "/tax-rates/:id",
  staffOnly,
  validate({ params: idParam("id") }),
  asyncHandler(async (req, res) => {
    const rate = await TaxRate.findByIdAndDelete(req.params.id).lean();
    if (!rate) throw AppError.notFound("Tax rate not found");
    return ok(res, { message: "Tax rate deleted" });
  })
);

/* ----------------------------- Shipping zones ------------------------------ */

router.get(
  "/shipping-zones",
  staffOnly,
  asyncHandler(async (req, res) =>
    ok(res, { data: await ShippingZone.find({}).sort({ position: 1, name: 1 }).lean() })
  )
);

router.post(
  "/shipping-zones",
  staffOnly,
  validate({ body: shippingZoneBody }),
  asyncHandler(async (req, res) => {
    const zone = await ShippingZone.create(req.body);
    return created(res, { data: zone.toObject(), message: "Shipping zone created" });
  })
);

router.patch(
  "/shipping-zones/:id",
  staffOnly,
  validate({ params: idParam("id"), body: shippingZoneBody.partial() }),
  asyncHandler(async (req, res) => {
    const zone = await ShippingZone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!zone) throw AppError.notFound("Shipping zone not found");
    return ok(res, { data: zone, message: "Shipping zone updated" });
  })
);

router.delete(
  "/shipping-zones/:id",
  staffOnly,
  validate({ params: idParam("id") }),
  asyncHandler(async (req, res) => {
    const zone = await ShippingZone.findByIdAndDelete(req.params.id).lean();
    if (!zone) throw AppError.notFound("Shipping zone not found");
    return ok(res, { message: "Shipping zone deleted" });
  })
);

/** Delivery options available for an address, used at checkout. */
router.post(
  "/shipping/quote",
  authenticate,
  validate({ body: shippingQuoteSchema }),
  asyncHandler(async (req, res) =>
    ok(res, {
      data: await shippingService.getShippingOptions({
        address: req.body.address,
        orderAmount: req.body.orderAmount,
      }),
    })
  )
);

module.exports = router;
