const STORAGE_KEYS = Object.freeze({
  TOKEN: "token",
  USER_ID: "userId",
  ADMIN: "admin",
  CART: "cart",
});

export function getUserId() {
  return localStorage.getItem(STORAGE_KEYS.USER_ID);
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

/** Stored as a string by localStorage, so compare explicitly. */
export function getAdmin() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN) === "true";
}

export function setSession({ token, userId, isAdmin }) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  localStorage.setItem(STORAGE_KEYS.ADMIN, String(Boolean(isAdmin)));
}

/**
 * Clears credentials while leaving the cart intact, so a customer whose
 * session expires does not also lose what they were about to buy.
 */
export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_ID);
  localStorage.removeItem(STORAGE_KEYS.ADMIN);
}

export function loadScript() {
  return new Promise((resolve) => {
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
    return undefined;
  });
}

/** Returns up to `limit` products from the given category. */
export function getProductsByCategory(products, category, limit = 4) {
  if (!Array.isArray(products)) return [];
  return products.filter((item) => item.category === category).slice(0, limit);
}

export { STORAGE_KEYS };
