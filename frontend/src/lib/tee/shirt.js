/**
 * The T-shirt mockup: outline, shading and where the print area sits.
 *
 * Everything is in one 600 x 600 SVG space. The print area is a 3:4 box on
 * the chest (front) or upper back, matching the 300 x 400 design units the
 * layers are positioned in, so 1 design unit = PRINT_BOX[side].width / 300.
 */
export const SHIRT_W = 600;
export const SHIRT_H = 600;
export const DESIGN_W = 300;
export const DESIGN_H = 400;

export const PRINT_BOX = {
  front: { x: 190, y: 138, width: 220, height: 220 * (4 / 3) },
  back: { x: 190, y: 112, width: 220, height: 220 * (4 / 3) },
};

const BODY =
  "M245 50 L146 80 Q84 114 24 202 L104 270 L152 228 Q158 400 152 556 Q300 578 448 556 Q442 400 448 228 L496 270 L576 202 Q516 114 454 80 L355 50";

/** Neckline: deeper at the front, shallow at the back. */
const NECK = {
  front: "C338 98 262 98 245 50",
  back: "C334 70 266 70 245 50",
};

export const shirtPath = (side) => `${BODY} ${NECK[side]} Z`;

/** Perceived brightness 0–1, to pick light or dark details for a fabric colour. */
export const luminance = (hex) => {
  const value = parseInt(String(hex).replace("#", ""), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

/**
 * The shirt as an SVG string (also used to draw the mockup on a canvas).
 * `uid` keeps gradient ids unique when several shirts are on one page.
 */
export const shirtSvg = (hex, side = "front", uid = "t") => {
  const dark = luminance(hex) < 0.35;
  const path = shirtPath(side);
  const collar = side === "front" ? "M245 50 C262 98 338 98 355 50" : "M245 50 C266 70 334 70 355 50";
  const label =
    side === "back"
      ? `<rect x="286" y="64" width="28" height="12" rx="2" fill="${dark ? "#ffffff" : "#000000"}" opacity="0.10"/>`
      : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SHIRT_W} ${SHIRT_H}" width="${SHIRT_W}" height="${SHIRT_H}">
  <defs>
    <linearGradient id="${uid}-side" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.16"/>
      <stop offset="0.18" stop-color="#000" stop-opacity="0"/>
      <stop offset="0.82" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.16"/>
    </linearGradient>
    <radialGradient id="${uid}-light" cx="0.5" cy="0.3" r="0.65">
      <stop offset="0" stop-color="#fff" stop-opacity="${dark ? 0.1 : 0.22}"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${uid}-hem" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0.8" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.12"/>
    </linearGradient>
  </defs>
  <path d="${path}" fill="#000" opacity="0.10" transform="translate(0 10)" style="filter:blur(6px)"/>
  <path d="${path}" fill="${hex}"/>
  <path d="${path}" fill="url(#${uid}-side)"/>
  <path d="${path}" fill="url(#${uid}-light)"/>
  <path d="${path}" fill="url(#${uid}-hem)"/>
  <g fill="none" stroke="#000" stroke-linecap="round" opacity="${dark ? 0.32 : 0.1}">
    <path d="M152 228 Q170 290 166 360" stroke-width="3"/>
    <path d="M448 228 Q430 290 434 360" stroke-width="3"/>
    <path d="M104 270 L152 228" stroke-width="2"/>
    <path d="M496 270 L448 228" stroke-width="2"/>
    <path d="M200 548 Q238 510 230 456" stroke-width="2"/>
    <path d="M404 550 Q372 514 380 464" stroke-width="2"/>
    <path d="M154 546 Q300 566 446 546" stroke-width="2"/>
  </g>
  <path d="${collar}" fill="none" stroke="#000" stroke-opacity="${dark ? 0.35 : 0.14}" stroke-width="12" stroke-linecap="round"/>
  <path d="${collar}" fill="none" stroke="#fff" stroke-opacity="${dark ? 0.08 : 0.35}" stroke-width="2" transform="translate(0 7)"/>
  ${label}
  <path d="${path}" fill="none" stroke="#000" stroke-opacity="${dark ? 0.5 : 0.16}" stroke-width="1.5"/>
</svg>`;
};

const imageCache = new Map();

/** Loads an SVG string as an image, for drawing on a canvas. */
export const svgImage = (svg) => {
  if (imageCache.has(svg)) return imageCache.get(svg);
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
  imageCache.set(svg, promise);
  return promise;
};
