/** Rounds to two decimal places, the precision money is stored at. */
const round = (value) => Math.round((Number(value) || 0) * 100) / 100;

/** Converts major units to the smallest currency unit the gateway expects. */
const toMinorUnits = (value) => Math.round((Number(value) || 0) * 100);

/** Converts the smallest currency unit back to major units. */
const fromMinorUnits = (value) => round((Number(value) || 0) / 100);

/** Tax-inclusive unit price derived from list price, discount and GST. */
const deriveTotalPrice = (price = 0, discountPercent = 0, gstPercent = 0) => {
  const discounted = price - (price * discountPercent) / 100;
  const withTax = discounted + (discounted * gstPercent) / 100;
  return round(withTax);
};

/** Applies a percentage to an amount. */
const percentOf = (amount, percent) => round((amount * (percent || 0)) / 100);

module.exports = { round, toMinorUnits, fromMinorUnits, deriveTotalPrice, percentOf };
