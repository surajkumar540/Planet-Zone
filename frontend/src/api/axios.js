import axios from "axios";
import { clearSession, getToken } from "../utils/functions";

// Empty in development so requests go through the Vite dev proxy.
const baseURL = import.meta.env.VITE_PUBLIC_URL || "";

const instance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

instance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/** Gateway errors that usually mean "try again", e.g. the database waking up. */
const RETRYABLE_STATUS = [502, 503, 504];
const RETRY_DELAY_MS = 800;

/**
 * A read that failed because the connection dropped, or the server briefly
 * could not answer, is retried once before the screen shows an error. Writes
 * are never retried: repeating a POST could place an order twice.
 */
const shouldRetry = (error) => {
  const config = error?.config;
  if (!config || config.__retried) return false;
  if ((config.method || "get").toLowerCase() !== "get") return false;
  if (error.code === "ERR_CANCELED" || error.code === "ECONNABORTED") return false;
  return !error.response || RETRYABLE_STATUS.includes(error.response.status);
};

/** Paths where a 401 is an expected outcome rather than an expired session. */
const AUTH_PATHS = ["/api/login", "/api/signup", "/api/otpVerify", "/api/tokenVerification"];

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (shouldRetry(error)) {
      error.config.__retried = true;
      return new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS)).then(() =>
        instance(error.config)
      );
    }

    const status = error?.response?.status;
    const url = error?.config?.url || "";

    /*
     * A 401 outside the auth endpoints means the stored token is no longer
     * accepted, so the local session is cleared and the user is sent to login.
     *
     * The previous implementation returned `undefined` here, which left the
     * caller's promise permanently pending and hung every screen that hit an
     * expired token.
     */
    if (status === 401 && !AUTH_PATHS.some((path) => url.includes(path))) {
      clearSession();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
