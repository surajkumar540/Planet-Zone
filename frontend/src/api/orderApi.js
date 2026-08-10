import axios from "./axios";

export const createOrderApi = async (body) => {
  const response = await axios.post("/api/createOrder", body);
  return response.data;
};

/** The signed-in customer's own orders. */
export const getAllOrders = async (params = {}) => {
  const response = await axios.get("/api/orders", { params });
  return response.data;
};

export const getSingleOrder = async (orderId) => {
  const response = await axios.get(`/api/order/${orderId}`);
  return response.data;
};

export const cancelOrder = async (orderId, reason) => {
  const response = await axios.post(`/api/order/${orderId}/cancel`, { reason });
  return response.data;
};

/* ------------------------------- Management -------------------------------- */

export const getAdminOrders = async (params = {}) => {
  const response = await axios.get("/api/admin/orders", { params });
  return response.data;
};

export const updateOrderStatus = async (orderId, body) => {
  const response = await axios.patch(`/api/order/${orderId}/status`, body);
  return response.data;
};
