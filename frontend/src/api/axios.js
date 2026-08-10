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

/** Paths where a 401 is an expected outcome rather than an expired session. */
const AUTH_PATHS = ["/api/login", "/api/signup", "/api/otpVerify", "/api/tokenVerification"];

instance.interceptors.response.use(
  (response) => response,
  (error) => {
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
