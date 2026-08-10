const AppError = require("../core/AppError");
const productRepository = require("../modules/product/product.repository");
const couponService = require("../modules/coupon/coupon.service");
const shippingService = require("./shipping.service");
const { round } = require("../utils/money");

/**
 * Collapses the client's cart into `{ productId|variant → qty }`.
 *
 * Duplicate lines are merged so the same product cannot be submitted twice to
 * slip past a stock check, and only identity and quantity are read — every
 * money field is looked up from the catalogue.
 */
const normaliseCart = (cart) => {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw AppError.badRequest("Your cart is empty");
  }

  const lines = new Map();
  for (const line of cart) {
    const productId = String(line.product || line._id || "");
    if (!productId) throw AppError.badRequest("Cart contains an invalid product");

    // A variant selection is part of the line's identity.
    const variantKey = String(line.variantSku || line.variantId || "");
    const key = `${productId}::${variantKey}`;

    const existing = lines.get(key);
    const qty = Number(line.qty || 0);
    if (existing) existing.qty += qty;
    else lines.set(key, { productId, variantKey, qty });
  }
  return [...lines.values()];
};

/** Resolves the priced unit a line refers to: a variant, or the product itself. */
const resolveSellableUnit = (product, variantKey) => {
  if (!variantKey) {
    if (product.hasVariants) {
      throw AppError.badRequest(`Choose an option for ${product.name}`);
    }
    return {
      variantSku: "",
      price: product.price,
      discount: product.discount,
      gst: product.gst,
      totalPrice: product.totalPrice,
      countInStock: product.countInStock,
      image: product.image,
      label: "",
    };
  }

  const variant = (product.variants || []).find(
    (candidate) =>
      String(candidate._id) === variantKey || candidate.sku === variantKey.toUpperCase()
  );

  if (!variant) throw AppError.badRequest(`The selected option for ${product.name} is unavailable`);
  if (!variant.isActive) throw AppError.conflict(`${product.name} (${variant.sku}) is unavailable`);

  return {
    variantSku: variant.sku,
    price: variant.price,
    discount: variant.discount,
    gst: variant.gst,
    totalPrice: variant.totalPrice,
    countInStock: variant.countInStock,
    image: variant.image || product.image,
    label: [...(variant.options?.entries?.() || [])].map(([, value]) => value).join(" / "),
  };
};

/**
 * Rebuilds and prices a cart from the catalogue.
 *
 * The client supplies only identity and quantity; every price, discount and
 * tax figure is read from the database, so a tampered payload cannot change
 * what the customer is charged.
 */
const priceCart = async (cart) => {
  const lines = normaliseCart(cart);
  const productIds = [...new Set(lines.map((line) => line.productId))];

  const products = await productRepository.find({ _id: { $in: productIds } });
  if (products.length !== productIds.length) {
    throw AppError.badRequest("One or more products in your cart are no longer available");
  }

  const byId = new Map(products.map((product) => [String(product._id), product]));

  const items = [];
  let itemsTotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  for (const line of lines) {
    const product = byId.get(line.productId);

    if (!Number.isInteger(line.qty) || line.qty < 1) {
      throw AppError.badRequest(`Invalid quantity for ${product.name}`);
    }
    if (product.isActive === false) {
      throw AppError.conflict(`${product.name} is no longer available`);
    }

    const unit = resolveSellableUnit(product, line.variantKey);

    if (unit.countInStock < line.qty) {
      throw AppError.conflict(
        unit.countInStock === 0
          ? `${product.name} is out of stock`
          : `Only ${unit.countInStock} units of ${product.name} remain`
      );
    }

    const gross = unit.price * line.qty;
    const discount = (gross * (unit.discount || 0)) / 100;
    const net = gross - discount;
    const tax = (net * (unit.gst || 0)) / 100;

    itemsTotal += gross;
    discountTotal += discount;
    taxTotal += tax;

    items.push({
      product: product._id,
      variantSku: unit.variantSku,
      variantLabel: unit.label,
      name: product.name,
      qty: line.qty,
      image: unit.image,
      price: unit.price,
      gst: unit.gst,
      discount: unit.discount,
      totalPrice: unit.totalPrice,
      lineTotal: round(net + tax),
      brand: product.brand,
      category: product.category,
      categoryRef: product.categoryRef,
    });
  }

  return {
    items,
    itemsTotal: round(itemsTotal),
    productDiscountTotal: round(discountTotal),
    taxTotal: round(taxTotal),
    // Value the coupon and free-shipping thresholds are measured against.
    subtotal: round(itemsTotal - discountTotal + taxTotal),
  };
};

/**
 * Produces the full order quote: priced lines, coupon discount, shipping and
 * the grand total.
 *
 * Used by both the cart preview and checkout, so what the customer is shown
 * is computed by exactly the same code that charges them.
 */
const quoteOrder = async ({ cart, userId, couponCode, shippingAddress, shippingRateId }) => {
  const priced = await priceCart(cart);

  let couponDiscount = 0;
  let appliedCoupon = null;
  let freeShipping = false;

  if (couponCode) {
    const result = await couponService.validateForCart({
      code: couponCode,
      userId,
      items: priced.items,
      itemsSubtotal: priced.subtotal,
    });
    couponDiscount = result.discountAmount;
    freeShipping = result.freeShipping;
    appliedCoupon = {
      _id: result.coupon._id,
      code: result.coupon.code,
      type: result.coupon.type,
      value: result.coupon.value,
      usageLimit: result.coupon.usageLimit,
      discountAmount: couponDiscount,
    };
  }

  let shippingTotal = 0;
  let shippingSelection = null;

  if (shippingAddress) {
    const resolved = await shippingService.resolveShippingCost({
      address: shippingAddress,
      orderAmount: priced.subtotal - couponDiscount,
      rateId: shippingRateId,
    });
    shippingTotal = freeShipping ? 0 : resolved.cost;
    shippingSelection = { ...resolved, cost: shippingTotal };
  }

  const grandTotal = Math.max(0, round(priced.subtotal - couponDiscount + shippingTotal));

  return {
    items: priced.items,
    coupon: appliedCoupon,
    shipping: shippingSelection,
    pricing: {
      itemsTotal: priced.itemsTotal,
      // Product-level markdowns and coupon savings, reported together.
      discountTotal: round(priced.productDiscountTotal + couponDiscount),
      productDiscountTotal: priced.productDiscountTotal,
      couponDiscountTotal: couponDiscount,
      taxTotal: priced.taxTotal,
      shippingTotal,
      grandTotal,
      currency: "INR",
    },
  };
};

module.exports = { priceCart, quoteOrder, normaliseCart, round };
