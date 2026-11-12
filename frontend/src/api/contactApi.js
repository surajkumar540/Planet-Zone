import axios from "./axios";

/** Public contact form. The dashboard reads messages through adminApi. */
export const contactUsApi = (body) =>
  axios.post("/api/contactUs", body).then((response) => response.data);
