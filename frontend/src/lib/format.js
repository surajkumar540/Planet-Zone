/**
 * Formatting helpers shared across the dashboard.
 *
 * Centralised so currency, dates and large numbers read identically on every
 * screen instead of each component inventing its own format.
 */

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const currencyPreciseFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCurrency = (value, { precise = false } = {}) => {
  const amount = Number(value) || 0;
  return precise ? currencyPreciseFormatter.format(amount) : currencyFormatter.format(amount);
};

/** Abbreviates large figures for axis ticks and stat tiles: 12500 → "12.5K". */
export const formatCompact = (value) => {
  const amount = Number(value) || 0;
  if (Math.abs(amount) >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
  if (Math.abs(amount) >= 100000) return `${(amount / 100000).toFixed(1)}L`;
  if (Math.abs(amount) >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return String(Math.round(amount));
};

export const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(Number(value) || 0);

export const formatPercent = (value, { withSign = true } = {}) => {
  const amount = Number(value) || 0;
  const sign = withSign && amount > 0 ? "+" : "";
  return `${sign}${amount.toFixed(1)}%`;
};

export const formatDate = (value, options = {}) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Coarse relative time, accurate enough for activity lists. */
export const formatRelativeTime = (value) => {
  if (!value) return "—";
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;

  return formatDate(value);
};

/** "out_for_delivery" → "Out for delivery". */
export const humanise = (value) => {
  if (!value) return "";
  const text = String(value).replace(/[_-]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const initialsOf = (...parts) =>
  parts
    .filter(Boolean)
    .map((part) => String(part).trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
