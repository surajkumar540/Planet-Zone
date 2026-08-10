const mongoose = require("mongoose");

/**
 * Store-wide configuration, held as a single document.
 *
 * `key` is fixed to "default" and uniquely indexed, which makes the singleton
 * a property of the schema rather than something callers must remember.
 */
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true, immutable: true },

    store: {
      name: { type: String, default: "Planet" },
      tagline: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      logo: { type: String, default: "" },
      favicon: { type: String, default: "" },
      address: {
        line1: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        pinCode: { type: String, default: "" },
        country: { type: String, default: "India" },
      },
      socialLinks: {
        facebook: { type: String, default: "" },
        instagram: { type: String, default: "" },
        twitter: { type: String, default: "" },
        youtube: { type: String, default: "" },
      },
    },

    localisation: {
      currency: { type: String, default: "INR" },
      currencySymbol: { type: String, default: "₹" },
      // IANA zone, used when bucketing analytics by day.
      timezone: { type: String, default: "Asia/Kolkata" },
      dateFormat: { type: String, default: "DD/MM/YYYY" },
    },

    orders: {
      /** Prefix for generated order numbers. */
      orderPrefix: { type: String, default: "ORD" },
      minOrderAmount: { type: Number, min: 0, default: 0 },
      allowCashOnDelivery: { type: Boolean, default: true },
      allowOnlinePayment: { type: Boolean, default: true },
      /** Hours after placement during which a customer may self-cancel. */
      cancellationWindowHours: { type: Number, min: 0, default: 24 },
      autoConfirmOrders: { type: Boolean, default: true },
    },

    tax: {
      /** Product prices already include tax. */
      pricesIncludeTax: { type: Boolean, default: false },
      displayTaxInCart: { type: Boolean, default: true },
      defaultTaxRate: { type: Number, min: 0, max: 100, default: 0 },
    },

    inventory: {
      trackInventory: { type: Boolean, default: true },
      allowBackorders: { type: Boolean, default: false },
      lowStockThreshold: { type: Number, min: 0, default: 5 },
      hideOutOfStockProducts: { type: Boolean, default: false },
    },

    notifications: {
      orderConfirmationEmail: { type: Boolean, default: true },
      orderStatusEmail: { type: Boolean, default: true },
      lowStockAlertEmail: { type: Boolean, default: true },
      /** Where operational alerts are sent. */
      adminAlertEmail: { type: String, default: "" },
    },

    /**
     * Default look of the dashboard. Individual users may override these in
     * their own appearance preferences.
     */
    appearance: {
      themeMode: { type: String, enum: ["light", "dark", "system"], default: "system" },
      accentColor: { type: String, default: "#16a34a" },
      fontSize: { type: String, enum: ["sm", "md", "lg"], default: "md" },
      density: { type: String, enum: ["compact", "comfortable", "spacious"], default: "comfortable" },
      sidebarCollapsed: { type: Boolean, default: false },
    },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

/** Reads the singleton, creating it with schema defaults on first access. */
settingsSchema.statics.getSettings = async function getSettings() {
  const existing = await this.findOne({ key: "default" });
  if (existing) return existing;
  return this.create({ key: "default" });
};

module.exports = mongoose.model("Settings", settingsSchema);
