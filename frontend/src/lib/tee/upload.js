/**
 * Prepares a customer's photo or logo for printing, entirely in the browser.
 *
 * - Large photos are scaled down to at most 1800 px (still ~150 dpi across
 *   the full 12-inch print width), then shrunk further if the file would be
 *   too big to save.
 * - Images with transparency stay PNG; everything else becomes JPEG.
 * - `removeBackground` makes a plain background transparent (useful for logos).
 */
const MAX_SIDE = 1800;
const MAX_DATA_URL = 1_500_000;

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("That file isn't an image we can read"));
    image.src = src;
  });

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Couldn't read that file"));
    reader.readAsDataURL(file);
  });

const hasTransparency = (ctx, width, height) => {
  const { data } = ctx.getImageData(0, 0, width, height);
  for (let i = 3; i < data.length; i += 16) if (data[i] < 250) return true;
  return false;
};

const encode = (image, maxSide, keepAlpha) => {
  const ratio = Math.min(1, maxSide / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
  const width = Math.max(1, Math.round((image.naturalWidth || image.width) * ratio));
  const height = Math.max(1, Math.round((image.naturalHeight || image.height) * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);
  const alpha = keepAlpha ?? hasTransparency(ctx, width, height);
  return { src: canvas.toDataURL(alpha ? "image/png" : "image/jpeg", 0.9), naturalWidth: width, naturalHeight: height, alpha };
};

/** Encodes an image, stepping the size down until the data fits the save limit. */
const encodeToFit = (image, keepAlpha) => {
  let side = MAX_SIDE;
  let result = encode(image, side, keepAlpha);
  while (result.src.length > MAX_DATA_URL && side > 500) {
    side = Math.round(side * 0.75);
    result = encode(image, side, result.alpha);
  }
  if (result.src.length > MAX_DATA_URL) throw new Error("That image is too detailed to print. Try a smaller one.");
  return result;
};

export const prepareUpload = async (file) => {
  if (!/^image\/(png|jpe?g|webp|gif|avif|bmp)$/.test(file.type)) {
    throw new Error("Please choose a PNG, JPG or WebP image");
  }
  if (file.size > 20 * 1024 * 1024) throw new Error("Please choose an image under 20 MB");
  const image = await loadImage(await readFile(file));
  return encodeToFit(image);
};

/**
 * Removes a plain background: starting from the edges, pixels close to the
 * edge colour are made transparent (a flood fill, so the same colour inside
 * the logo is kept), with a soft fringe.
 */
export const removeBackground = async (src, tolerance = 42) => {
  const image = await loadImage(src);
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, width, height);
  const { data } = pixels;

  // Background colour: the average of the four corners.
  const corners = [0, width - 1, (height - 1) * width, height * width - 1];
  const bg = [0, 1, 2].map((c) => corners.reduce((sum, p) => sum + data[p * 4 + c], 0) / 4);
  const distance = (p) => Math.hypot(data[p * 4] - bg[0], data[p * 4 + 1] - bg[1], data[p * 4 + 2] - bg[2]);

  const seen = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x++) stack.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) stack.push(y * width, y * width + width - 1);

  let cleared = 0;
  while (stack.length) {
    const p = stack.pop();
    if (seen[p]) continue;
    seen[p] = 1;
    const d = distance(p);
    if (d > tolerance * 1.6) continue;
    // Close to the background: transparent; near the edge of the tolerance: partly.
    const alpha = d <= tolerance ? 0 : Math.round(((d - tolerance) / (tolerance * 0.6)) * 255);
    data[p * 4 + 3] = Math.min(data[p * 4 + 3], alpha);
    cleared++;
    if (d > tolerance) continue;
    const x = p % width;
    if (x > 0) stack.push(p - 1);
    if (x < width - 1) stack.push(p + 1);
    if (p >= width) stack.push(p - width);
    if (p < width * (height - 1)) stack.push(p + width);
  }
  if (cleared < width * height * 0.02) throw new Error("We couldn't find a plain background to remove");
  ctx.putImageData(pixels, 0, 0);
  return encodeToFit(canvas, true);
};
