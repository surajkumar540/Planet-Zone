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
const prisma = require("../../db/client");
const { toSettings, toTaxRate, toShippingZone } = require("../../db/mappers");
const { SETTINGS_DEFAULTS } = require("./settings.defaults");
const shippingService = require("../../services/shipping.service");
const { idParam, patchSchema } = require("../../utils/schemas");

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

/** Reads the singleton row, creating it with the defaults on first access. */
const getSettings = async () =>
  toSettings(
    await prisma.settings.upsert({
      where: { key: "default" },
      create: { key: "default", ...SETTINGS_DEFAULTS },
      update: {},
    })
  );

/** Makes `code` uppercase wherever a payload carries one. */
const withUpperCode = ({ code, ...rest }) => ({
  ...rest,
  ...(code ? { code: code.toUpperCase() } : {}),
});

const clearOtherDefaultRates = (keepId) =>
  prisma.taxRate.updateMany({ where: { id: { not: keepId } }, data: { isDefault: false } });

const WITH_RATES = { rates: { orderBy: [{ position: "asc" }, { price: "asc" }] } };

/* -------------------------------- Settings --------------------------------- */

/**
 * Store details the storefront needs before a user signs in: branding,
 * currency and the default appearance. Operational settings are withheld.
 */
router.get(
  "/settings/public",
  asyncHandler(async (req, res) => {
    const data = await cache.remember(SETTINGS_CACHE_KEY, 5 * 60 * 1000, async () => {
      const settings = await getSettings();
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
  asyncHandler(async (req, res) => ok(res, { data: await getSettings() }))
);

router.patch(
  "/settings",
  authenticate,
  requireAdmin,
  validate({ body: updateSettingsSchema }),
  asyncHandler(async (req, res) => {
    const current = await getSettings();

    // Merged section by section so a partial update never drops sibling keys.
    const data = { updatedById: req.auth.userId };
    for (const [section, values] of Object.entries(req.body)) {
      data[section] = { ...current[section], ...values };
    }
    const settings = toSettings(await prisma.settings.update({ where: { id: current._id }, data }));

    cache.invalidate("settings:");
    await audit.record({
      req,
      action: "settings.update",
      entityType: "Settings",
      entityId: settings._id,
      changes: req.body,
    });

    return ok(res, { data: settings, message: "Settings updated" });
  })
);

/* ------------------------------- Tax rates --------------------------------- */

router.get(
  "/tax-rates",
  staffOnly,
  asyncHandler(async (req, res) =>
    ok(res, {
      data: (
        await prisma.taxRate.findMany({ orderBy: [{ isDefault: "desc" }, { name: "asc" }] })
      ).map(toTaxRate),
    })
  )
);

router.post(
  "/tax-rates",
  staffOnly,
  validate({ body: taxRateBody }),
  asyncHandler(async (req, res) => {
    const rate = await prisma.taxRate.create({ data: withUpperCode(req.body) });
    if (rate.isDefault) await clearOtherDefaultRates(rate.id);
    return created(res, { data: toTaxRate(rate), message: "Tax rate created" });
  })
);

router.patch(
  "/tax-rates/:id",
  staffOnly,
  validate({ params: idParam("id"), body: patchSchema(taxRateBody) }),
  asyncHandler(async (req, res) => {
    const exists = await prisma.taxRate.count({ where: { id: req.params.id } });
    if (!exists) throw AppError.notFound("Tax rate not found");

    const rate = await prisma.taxRate.update({
      where: { id: req.params.id },
      data: withUpperCode(req.body),
    });

    if (req.body.isDefault) await clearOtherDefaultRates(rate.id);
    return ok(res, { data: toTaxRate(rate), message: "Tax rate updated" });
  })
);

router.delete(
  "/tax-rates/:id",
  staffOnly,
  validate({ params: idParam("id") }),
  asyncHandler(async (req, res) => {
    const { count } = await prisma.taxRate.deleteMany({ where: { id: req.params.id } });
    if (count === 0) throw AppError.notFound("Tax rate not found");
    return ok(res, { message: "Tax rate deleted" });
  })
);

/* ----------------------------- Shipping zones ------------------------------ */

router.get(
  "/shipping-zones",
  staffOnly,
  asyncHandler(async (req, res) =>
    ok(res, {
      data: (
        await prisma.shippingZone.findMany({
          orderBy: [{ position: "asc" }, { name: "asc" }],
          include: WITH_RATES,
        })
      ).map(toShippingZone),
    })
  )
);

router.post(
  "/shipping-zones",
  staffOnly,
  validate({ body: shippingZoneBody }),
  asyncHandler(async (req, res) => {
    const { rates, ...fields } = req.body;
    const zone = await prisma.shippingZone.create({
      data: { ...fields, rates: { create: rates } },
      include: WITH_RATES,
    });
    return created(res, { data: toShippingZone(zone), message: "Shipping zone created" });
  })
);

router.patch(
  "/shipping-zones/:id",
  staffOnly,
  validate({ params: idParam("id"), body: patchSchema(shippingZoneBody) }),
  asyncHandler(async (req, res) => {
    const exists = await prisma.shippingZone.count({ where: { id: req.params.id } });
    if (!exists) throw AppError.notFound("Shipping zone not found");

    // A supplied rate list replaces the existing one as a whole.
    const { rates, ...fields } = req.body;
    const zone = await prisma.shippingZone.update({
      where: { id: req.params.id },
      data: {
        ...fields,
        ...(rates !== undefined ? { rates: { deleteMany: {}, create: rates } } : {}),
      },
      include: WITH_RATES,
    });
    return ok(res, { data: toShippingZone(zone), message: "Shipping zone updated" });
  })
);

router.delete(
  "/shipping-zones/:id",
  staffOnly,
  validate({ params: idParam("id") }),
  asyncHandler(async (req, res) => {
    const { count } = await prisma.shippingZone.deleteMany({ where: { id: req.params.id } });
    if (count === 0) throw AppError.notFound("Shipping zone not found");
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
