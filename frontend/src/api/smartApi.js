import axios from "./axios";

/**
 * Smart shopping endpoints: the rule-based assistant and recommendations.
 * Everything is computed by our own API from the store's data; no external
 * AI service is involved.
 */

const get = (url, params) => axios.get(url, { params }).then((response) => response.data);

/** Ask the shopping assistant a question in plain words. */
export const askAssistant = (q) => get("/api/smart/assistant", { q });

/** Products by id, in the order given (for recently viewed and compare). */
export const getProductsByIds = ({ ids }) => get("/api/smart/products", { ids: (ids || []).join(",") });

export const getSimilar = ({ id, limit = 8 }) => get(`/api/smart/similar/${id}`, { limit });
export const getAlternatives = ({ id, limit = 4 }) => get(`/api/smart/alternatives/${id}`, { limit });
export const getBoughtTogether = ({ id, limit = 4 }) => get(`/api/smart/bought-together/${id}`, { limit });

/** Personal picks; `seen` is this device's recently viewed ids (not stored by the server). */
export const getForYou = ({ seen = [], limit = 8 }) =>
  get("/api/smart/for-you", { limit, ...(seen.length ? { seen: seen.join(",") } : {}) });
