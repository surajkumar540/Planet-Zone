import axios from "./axios";

/**
 * Storefront-only endpoints.
 *
 * The existing `productApi`/`orderApi`/`userApi` modules stay as they are;
 * this file adds the calls the shop screens need and the dashboard does not,
 * so neither side grows a dependency on the other's contract.
 */

/* -------------------------------- Catalogue -------------------------------- */

export const getCategoryTree = async () => {
  const response = await axios.get("/api/categories/tree");
  return response.data;
};

export const getPublicSettings = async () => {
  const response = await axios.get("/api/settings/public");
  return response.data;
};

/* --------------------------------- Reviews --------------------------------- */

export const getProductReviews = async (productId, params = {}) => {
  const response = await axios.get(`/api/product/${productId}/reviews`, { params });
  return response.data;
};

export const getProductReviewSummary = async (productId) => {
  const response = await axios.get(`/api/product/${productId}/reviews/summary`);
  return response.data;
};

export const deleteOwnReview = async (productId) => {
  const response = await axios.delete(`/api/product/${productId}/reviews`);
  return response.data;
};

/* -------------------------------- Wishlist --------------------------------- */

export const getWishlist = async () => {
  const response = await axios.get("/api/wishlist");
  return response.data;
};

export const addToWishlist = async (productId) => {
  const response = await axios.post("/api/wishlist", { productId });
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await axios.delete(`/api/wishlist/${productId}`);
  return response.data;
};

/* -------------------------------- Checkout --------------------------------- */

/**
 * Prices the cart server-side. The client never computes a total it then
 * sends back; this is the single source of truth for what checkout displays.
 */
export const quoteOrder = async (body) => {
  const response = await axios.post("/api/orders/quote", body);
  return response.data;
};

export const applyCoupon = async (body) => {
  const response = await axios.post("/api/coupons/apply", body);
  return response.data;
};

export const getShippingQuote = async (body) => {
  const response = await axios.post("/api/shipping/quote", body);
  return response.data;
};

/* -------------------------------- Addresses -------------------------------- */

export const getAddresses = async () => {
  const response = await axios.get("/api/addresses");
  return response.data;
};

export const createAddress = async (body) => {
  const response = await axios.post("/api/addresses", body);
  return response.data;
};

export const updateAddress = async (id, body) => {
  const response = await axios.put(`/api/addresses/${id}`, body);
  return response.data;
};

export const deleteAddress = async (id) => {
  const response = await axios.delete(`/api/addresses/${id}`);
  return response.data;
};
