const AppError = require("../core/AppError");
const productRepository = require("../modules/product/product.repository");

const round = (value) => Math.round(value * 100) / 100;

/**
 * Rebuilds a cart from the catalogue.
 *
 * The client supplies only product ids and quantities. Every price, discount
 * and tax figure is read from the database, so a tampered cart payload cannot
 * change what the customer is charged.
 *
 * @param {Array<{_id?: string, product?: string, qty: number}>} cart
 * @returns {Promise<{items: Array, pricing: object}>}
 */
const priceCart = async (cart) => {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw AppError.badRequest("Your cart is empty");
  }

  // Collapse duplicate lines so the same product cannot be submitted twice to
  // slip past the stock check.
  const quantities = new Map();
  for (const line of cart) {
    const id = String(line.product || line._id || "");
    if (!id) throw AppError.badRequest("Cart contains an invalid product");
    quantities.set(id, (quantities.get(id) || 0) + Number(line.qty || 0));
  }

  const ids = [...quantities.keys()];
  const products = await productRepository.find({ _id: { $in: ids } });

  if (products.length !== ids.length) {
    throw AppError.badRequest("One or more products in your cart are no longer available");
  }

  const items = [];
  let itemsTotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  for (const product of products) {
    const qty = quantities.get(String(product._id));

    if (!Number.isInteger(qty) || qty < 1) {
      throw AppError.badRequest(`Invalid quantity for ${product.name}`);
    }
    if (!product.isActive) {
      throw AppError.conflict(`${product.name} is no longer available`);
    }
    if (product.countInStock < qty) {
      throw AppError.conflict(
        product.countInStock === 0
          ? `${product.name} is out of stock`
          : `Only ${product.countInStock} units of ${product.name} remain`
      );
    }

    const gross = product.price * qty;
    const discount = (gross * (product.discount || 0)) / 100;
    const net = gross - discount;
    const tax = (net * (product.gst || 0)) / 100;

    itemsTotal += gross;
    discountTotal += discount;
    taxTotal += tax;

    items.push({
      product: product._id,
      name: product.name,
      qty,
      image: product.image,
      price: product.price,
      gst: product.gst,
      discount: product.discount,
      totalPrice: product.totalPrice,
      lineTotal: round(net + tax),
      brand: product.brand,
      category: product.category,
    });
  }

  // Flat-rate shipping for now; replaced by shipping zones in a later phase.
  const shippingTotal = 0;
  const grandTotal = round(itemsTotal - discountTotal + taxTotal + shippingTotal);

  return {
    items,
    pricing: {
      itemsTotal: round(itemsTotal),
      discountTotal: round(discountTotal),
      taxTotal: round(taxTotal),
      shippingTotal,
      grandTotal,
      currency: "INR",
    },
  };
};

module.exports = { priceCart, round };
