/** How a coupon's `value` should be interpreted. */
const DISCOUNT_TYPES = Object.freeze({
  PERCENTAGE: "percentage",
  FIXED: "fixed",
  FREE_SHIPPING: "free_shipping",
});

const DISCOUNT_TYPE_VALUES = Object.values(DISCOUNT_TYPES);

module.exports = { DISCOUNT_TYPES, DISCOUNT_TYPE_VALUES };
