const ShippingZone = require("../models/ShippingZoneModel");
const AppError = require("../core/AppError");
const { round } = require("../utils/money");

/**
 * Finds the zone covering an address.
 *
 * Matching is most-specific-first — pin code prefix, then state, then country
 * — so a metro-specific zone wins over a nationwide one. A zone flagged
 * `isFallback` is used only when nothing else matches.
 */
const findZoneForAddress = async (address = {}) => {
  const zones = await ShippingZone.find({ isActive: true }).sort({ position: 1 }).lean();
  if (zones.length === 0) return null;

  const pinCode = String(address.pinCode || "");
  const state = String(address.state || "").toLowerCase();
  const country = String(address.country || "India").toLowerCase();

  const byPinCode = zones.find((zone) =>
    (zone.pinCodePrefixes || []).some((prefix) => pinCode.startsWith(prefix))
  );
  if (byPinCode) return byPinCode;

  const byState = zones.find((zone) =>
    (zone.states || []).some((candidate) => candidate.toLowerCase() === state)
  );
  if (byState) return byState;

  const byCountry = zones.find(
    (zone) =>
      String(zone.country || "").toLowerCase() === country &&
      (zone.states || []).length === 0 &&
      (zone.pinCodePrefixes || []).length === 0
  );
  if (byCountry) return byCountry;

  return zones.find((zone) => zone.isFallback) || null;
};

/** Rates within a zone that apply at the given order value. */
const eligibleRates = (zone, orderAmount) =>
  (zone?.rates || [])
    .filter((rate) => rate.isActive)
    .filter((rate) => orderAmount >= (rate.minOrderAmount || 0))
    .filter((rate) => !rate.maxOrderAmount || orderAmount <= rate.maxOrderAmount)
    .sort((a, b) => a.position - b.position || a.price - b.price);

/** Applies the free-delivery threshold to a rate's price. */
const priceForRate = (rate, orderAmount) => {
  if (rate.freeAboveAmount > 0 && orderAmount >= rate.freeAboveAmount) return 0;
  return round(rate.price);
};

/**
 * Delivery options for an address at a given order value.
 *
 * Returns an empty list when no zone covers the address, which the caller
 * treats as "we do not deliver here".
 */
const getShippingOptions = async ({ address, orderAmount }) => {
  const zone = await findZoneForAddress(address);
  if (!zone) return { zone: null, options: [] };

  const options = eligibleRates(zone, orderAmount).map((rate) => ({
    id: String(rate._id),
    name: rate.name,
    description: rate.description,
    price: priceForRate(rate, orderAmount),
    minDeliveryDays: rate.minDeliveryDays,
    maxDeliveryDays: rate.maxDeliveryDays,
  }));

  return { zone: { _id: zone._id, name: zone.name }, options };
};

/**
 * Resolves the shipping cost for a checkout.
 *
 * With no zones configured at all, delivery is free rather than blocking
 * checkout — a store that has not set up shipping can still take orders.
 */
const resolveShippingCost = async ({ address, orderAmount, rateId }) => {
  const zoneCount = await ShippingZone.countDocuments({ isActive: true });
  if (zoneCount === 0) {
    return { cost: 0, rate: null, zone: null };
  }

  const zone = await findZoneForAddress(address);
  if (!zone) {
    throw AppError.badRequest("We do not currently deliver to this address");
  }

  const rates = eligibleRates(zone, orderAmount);
  if (rates.length === 0) {
    throw AppError.badRequest("No delivery option is available for this order");
  }

  // An explicit choice must still be one of the eligible options.
  const chosen = rateId
    ? rates.find((rate) => String(rate._id) === String(rateId))
    : rates[0];

  if (!chosen) {
    throw AppError.badRequest("The selected delivery option is not available");
  }

  return {
    cost: priceForRate(chosen, orderAmount),
    rate: {
      _id: chosen._id,
      name: chosen.name,
      minDeliveryDays: chosen.minDeliveryDays,
      maxDeliveryDays: chosen.maxDeliveryDays,
    },
    zone: { _id: zone._id, name: zone.name },
  };
};

module.exports = { findZoneForAddress, getShippingOptions, resolveShippingCost, eligibleRates };
