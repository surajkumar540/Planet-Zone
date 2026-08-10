import axios from "./axios";

/**
 * Dashboard API surface.
 *
 * One module per concern would fragment a small, uniform set of calls, so the
 * admin endpoints live together and share the same request shape: every list
 * takes the standard `{ page, limit, search, sort, ... }` query contract and
 * returns `{ data, meta }`.
 */

const get = (url, params) => axios.get(url, { params }).then((response) => response.data);
const post = (url, body) => axios.post(url, body).then((response) => response.data);
const patch = (url, body) => axios.patch(url, body).then((response) => response.data);
const remove = (url, params) => axios.delete(url, { params }).then((response) => response.data);

/* -------------------------------- Analytics -------------------------------- */

export const getDashboard = (params) => get("/api/analytics/dashboard", params);
export const getSalesTrend = (params) => get("/api/analytics/sales-trend", params);
export const getTopProducts = (params) => get("/api/analytics/top-products", params);
export const getRevenueByCategory = (params) => get("/api/analytics/revenue-by-category", params);
export const getStatusDistribution = (params) => get("/api/analytics/status-distribution", params);
export const getLowStock = (params) => get("/api/analytics/low-stock", params);

/* ---------------------------------- Orders --------------------------------- */

export const getAdminOrders = (params) => get("/api/admin/orders", params);
export const getOrder = (id) => get(`/api/order/${id}`);
export const updateOrderStatus = (id, body) => patch(`/api/order/${id}/status`, body);

/* --------------------------------- Products -------------------------------- */

export const getProducts = (params) => get("/api/products", params);
export const getProduct = (id) => get(`/api/product/${id}`);
export const createProduct = (body) => post("/api/product", body);
export const updateProduct = (id, body) => patch(`/api/product/${id}`, body);
export const deleteProduct = (id) => remove(`/api/product/${id}`);
export const getProductFilters = () => get("/api/products/filters");

/* -------------------------------- Categories ------------------------------- */

export const getCategories = (params) => get("/api/categories", params);
export const getCategoryTree = (params) => get("/api/categories/tree", params);
export const createCategory = (body) => post("/api/categories", body);
export const updateCategory = (id, body) => patch(`/api/categories/${id}`, body);
export const deleteCategory = (id, params) => remove(`/api/categories/${id}`, params);

/* -------------------------------- Inventory -------------------------------- */

export const getInventory = (params) => get("/api/inventory", params);
export const getStockMovements = (params) => get("/api/inventory/movements", params);
export const adjustStock = (body) => post("/api/inventory/adjust", body);
export const setStockLevel = (body) => post("/api/inventory/set", body);
export const getWarehouses = () => get("/api/warehouses");

/* -------------------------------- Customers -------------------------------- */

export const getCustomers = (params) => get("/api/users", params);
export const getCustomer = (id) => get(`/api/users/${id}`);
export const updateCustomer = (id, body) => patch(`/api/users/${id}`, body);

/* --------------------------------- Coupons --------------------------------- */

export const getCoupons = (params) => get("/api/coupons", params);
export const getCoupon = (id) => get(`/api/coupons/${id}`);
export const createCoupon = (body) => post("/api/coupons", body);
export const updateCoupon = (id, body) => patch(`/api/coupons/${id}`, body);
export const deleteCoupon = (id) => remove(`/api/coupons/${id}`);

/* --------------------------------- Refunds --------------------------------- */

export const getRefunds = (params) => get("/api/refunds", params);
export const reviewRefund = (id, body) => patch(`/api/refunds/${id}/review`, body);
export const processRefund = (id, body) => post(`/api/refunds/${id}/process`, body);

/* -------------------------------- Messages --------------------------------- */

export const getContactMessages = (params) => get("/api/contactUs", params);
export const markMessageRead = (id) => patch(`/api/contactUs/${id}/read`);
export const deleteMessage = (id) => remove(`/api/contactUs/${id}`);

/* -------------------------------- Settings --------------------------------- */

export const getSettings = () => get("/api/settings");
export const updateSettings = (body) => patch("/api/settings", body);
export const getTaxRates = () => get("/api/tax-rates");
export const createTaxRate = (body) => post("/api/tax-rates", body);
export const updateTaxRate = (id, body) => patch(`/api/tax-rates/${id}`, body);
export const deleteTaxRate = (id) => remove(`/api/tax-rates/${id}`);
export const getShippingZones = () => get("/api/shipping-zones");
export const createShippingZone = (body) => post("/api/shipping-zones", body);
export const updateShippingZone = (id, body) => patch(`/api/shipping-zones/${id}`, body);
export const deleteShippingZone = (id) => remove(`/api/shipping-zones/${id}`);
