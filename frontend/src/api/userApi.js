import axios from "./axios";

/**
 * Account and profile endpoints. Failures reject with the axios error, which
 * screens turn into a message with `getErrorMessage`.
 */

const get = (url) => axios.get(url).then((response) => response.data);
const post = (url, body) => axios.post(url, body).then((response) => response.data);

/* ---------------------------------- Auth ----------------------------------- */

export const signup = (data) => post("/api/signup", data);
export const login = (data) => post("/api/login", data);
export const otpVerify = (data) => post("/api/otpVerify", data);
export const forgetOtp = (data) => post("/api/forgetOtp", data);
export const changePassword = (data) => post("/api/changePassword", data);

/**
 * Confirms the stored token is still valid. The caller's role comes back in
 * the response; nothing about identity is sent from the client.
 */
export const tokenVerify = () => post("/api/tokenVerification");

/* --------------------------------- Profile --------------------------------- */

export const getProfile = () => get("/api/profile");
export const setProfile = (data) => post("/api/profile", data);

/** Changes the signed-in user's password; needs the current one. */
export const changeAccountPassword = (data) => post("/api/account/password", data);
