/** Values a store starts with; written once when the settings row is first created. */
const SETTINGS_DEFAULTS = Object.freeze({
  store: {
    name: "Planet",
    tagline: "",
    email: "",
    phone: "",
    logo: "",
    favicon: "",
    address: { line1: "", city: "", state: "", pinCode: "", country: "India" },
    socialLinks: { facebook: "", instagram: "", twitter: "", youtube: "" },
  },
  localisation: {
    currency: "INR",
    currencySymbol: "₹",
    // IANA zone, used when bucketing analytics by day.
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
  },
  orders: {
    orderPrefix: "ORD",
    minOrderAmount: 0,
    allowCashOnDelivery: true,
    allowOnlinePayment: true,
    // Hours after placement during which a customer may self-cancel.
    cancellationWindowHours: 24,
    autoConfirmOrders: true,
  },
  tax: {
    // Product prices already include tax.
    pricesIncludeTax: false,
    displayTaxInCart: true,
    defaultTaxRate: 0,
  },
  inventory: {
    trackInventory: true,
    allowBackorders: false,
    lowStockThreshold: 5,
    hideOutOfStockProducts: false,
  },
  notifications: {
    orderConfirmationEmail: true,
    orderStatusEmail: true,
    lowStockAlertEmail: true,
    // Where operational alerts are sent.
    adminAlertEmail: "",
  },
  appearance: {
    themeMode: "system",
    accentColor: "#16a34a",
    fontSize: "md",
    density: "comfortable",
    sidebarCollapsed: false,
  },
});

module.exports = { SETTINGS_DEFAULTS };
