/**
 * Turns any failed request into one sentence a customer can act on.
 *
 * Every screen shows errors through this, so they all read the same way:
 * - a validation failure names the field that is wrong, not just "Validation failed";
 * - a server that cannot be reached says so, instead of axios' "Network Error";
 * - a server-side crash gets a calm, generic message rather than a stack trace.
 *
 * @param {unknown} error what the request rejected with
 * @param {string} [fallback] used when nothing more specific is known
 */
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (!error) return fallback;

  const response = error.response;
  if (response) {
    const data = typeof response.data === "object" && response.data ? response.data : {};

    // The API lists each invalid field as { field: "body.price", message }.
    const firstField = Array.isArray(data.errors) ? data.errors[0] : null;
    if (firstField?.message && (!data.message || data.message === "Validation failed")) {
      const label = String(firstField.field || "").split(".").pop();
      return label ? `${humanise(label)}: ${firstField.message}` : firstField.message;
    }

    if (data.message) return data.message;
    if (response.status >= 500) {
      return "The server ran into a problem. Please try again in a moment.";
    }
    return fallback;
  }

  if (error.code === "ECONNABORTED") {
    return "The server is taking too long to respond. Please try again.";
  }
  if (error.isAxiosError || error.message === "Network Error") {
    return "Can't reach the server. Check your connection and try again.";
  }

  // A plain Error thrown by our own code, e.g. "Payment was cancelled".
  return error.message || fallback;
};

/** "pinCode" -> "Pin code", "phoneNo" -> "Phone no". */
const humanise = (key) => {
  const spaced = key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

export default getErrorMessage;
