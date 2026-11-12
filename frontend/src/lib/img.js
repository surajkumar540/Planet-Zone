/**
 * Optimised product photos.
 *
 * `img(src, width)` points a product photo at our image optimiser
 * (/api/img), which shrinks it to `width` pixels, converts it to WebP and
 * caches it, often 90%+ smaller than the original. Anything that isn't an
 * https URL (data URLs, local files) is returned unchanged.
 *
 * Pick the width the image is shown at: ~96 for tiny thumbnails, 160–320 for
 * small cards, 480 for product cards, 1200 for the zoomable main photo.
 */
const API_BASE = import.meta.env.VITE_PUBLIC_URL || "";

export const img = (src, width = 480) =>
  typeof src === "string" && src.startsWith("https://")
    ? `${API_BASE}/api/img?w=${width}&src=${encodeURIComponent(src)}`
    : src;

/** `srcSet` for sharp images on high-density screens (1x and 2x). */
export const imgSet = (src, width = 480) =>
  typeof src === "string" && src.startsWith("https://") ? `${img(src, width)} 1x, ${img(src, Math.min(1200, width * 2))} 2x` : undefined;

export default img;
