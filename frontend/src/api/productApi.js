import axios from "./axios";

/**
 * `params` maps directly onto the API's list contract:
 * page, limit, search, sort, category, brand, minPrice, maxPrice,
 * inStock, lowStock, minRating, includeInactive.
 */
export const getAllProducts = async (params = {}) => {
  const response = await axios.get("/api/products", { params });
  return response.data;
};

/** Live option counts for the shop filters, given the current filters. */
export const getProductFacets = async (params = {}) => {
  const response = await axios.get("/api/products/facets", { params });
  return response.data;
};

/** Search-as-you-type: products, categories and brands matching `q`. */
export const suggestProducts = async (q) => {
  const response = await axios.get("/api/products/suggest", { params: { q } });
  return response.data;
};

export const getProductFilters = async () => {
  const response = await axios.get("/api/products/filters");
  return response.data;
};

export const fetchSingleProductApi = async (pid) => {
  const response = await axios.get(`/api/product/${pid}`);
  return response.data;
};

export const addSingleProduct = async (body) => {
  const response = await axios.post("/api/product", body);
  return response.data;
};

export const updateSingleProduct = async (body) => {
  const response = await axios.put("/api/product", body);
  return response.data;
};

export const deleteSingleProduct = async (pid) => {
  const response = await axios.delete(`/api/product/${pid}`);
  return response.data;
};

export const saveProductReview = async (pid, body) => {
  const response = await axios.post(`/api/product/${pid}/reviews`, body);
  return response.data;
};
