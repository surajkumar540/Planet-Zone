import axios from "./axios";

/** Creates the Razorpay order; the response carries the publishable KEY_ID. */
export const paymentInit = (body) =>
  axios.post("/api/paymentInit", body).then((response) => response.data);

/** Sends the gateway's signed callback to the server for verification. */
export const paymentSuccess = (body) =>
  axios.post("/api/paymentSuccess", body).then((response) => response.data);
