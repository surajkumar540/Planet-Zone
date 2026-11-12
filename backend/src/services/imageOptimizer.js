const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const prisma = require("../db/client");
const logger = require("../core/logger");

/**
 * GET /api/img?src=<product image url>&w=<width>
 *
 * Shrinks a product photo to the size it is shown at and converts it to WebP
 * (often 90%+ smaller than the original), keeps the result on disk, and lets
 * browsers cache it for a year. Free: uses sharp, already installed.
 *
 * Safety: it only fetches from hosts that the catalogue's own product images
 * use (looked up from the database), over https, with a size limit and a
 * timeout, so it can't be used to fetch arbitrary URLs. Widths come from a
 * fixed list so the cache can't be filled with endless variants.
 */

const CACHE_DIR = path.resolve(__dirname, "../../.cache/images");
const WIDTHS = [96, 160, 240, 320, 480, 640, 800, 1200];
const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10000;

fs.mkdirSync(CACHE_DIR, { recursive: true });

/** Hosts used by product photos, refreshed every five minutes. */
let allowed = { hosts: new Set(), at: 0 };
const allowedHosts = async () => {
  if (Date.now() - allowed.at < 5 * 60 * 1000 && allowed.hosts.size) return allowed.hosts;
  const rows = await prisma.$queryRaw`
    SELECT DISTINCT split_part(url, '/', 3) AS host
    FROM (SELECT image AS url FROM products UNION ALL SELECT unnest(images) FROM products) AS urls
    WHERE url LIKE 'https://%'`;
  allowed = { hosts: new Set(rows.map((row) => row.host).filter(Boolean)), at: Date.now() };
  return allowed.hosts;
};

const inFlight = new Map();

/** Fetches, resizes and caches one variant; concurrent requests share the work. */
const produce = (src, width, file) => {
  if (inFlight.has(file)) return inFlight.get(file);
  const job = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(src, { signal: controller.signal, headers: { "User-Agent": "PlanetZoneImageOptimizer/1.0" } });
      if (!response.ok) throw new Error(`source returned ${response.status}`);
      const length = Number(response.headers.get("content-length") || 0);
      if (length > MAX_SOURCE_BYTES) throw new Error("source image too large");
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > MAX_SOURCE_BYTES) throw new Error("source image too large");
      const output = await sharp(buffer, { failOn: "none" })
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 78, effort: 4 })
        .toBuffer();
      await fs.promises.writeFile(file, output);
      return output;
    } finally {
      clearTimeout(timer);
    }
  })();
  inFlight.set(file, job);
  job.finally(() => inFlight.delete(file)).catch(() => {});
  return job;
};

const router = express.Router();

router.get("/", async (req, res) => {
  const src = String(req.query.src || "");
  const requested = Number(req.query.w) || 480;
  const width = WIDTHS.find((option) => option >= requested) || WIDTHS[WIDTHS.length - 1];

  let url;
  try {
    url = new URL(src);
  } catch {
    return res.status(400).json({ status: false, message: "Invalid image address" });
  }
  if (url.protocol !== "https:" || !(await allowedHosts()).has(url.host)) {
    return res.status(400).json({ status: false, message: "Image host not allowed" });
  }

  const key = crypto.createHash("sha1").update(`${url.href}|${width}`).digest("hex");
  const file = path.join(CACHE_DIR, `${key}.webp`);
  res.set({ "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" });

  try {
    if (fs.existsSync(file)) return res.sendFile(file);
    return res.send(await produce(url.href, width, file));
  } catch (error) {
    // If optimising fails, send the browser to the original rather than a broken image.
    logger.warn(`Image optimiser fell back to the original (${url.host}): ${error.message}`);
    res.removeHeader("Content-Type");
    res.set("Cache-Control", "no-store");
    return res.redirect(302, url.href);
  }
});

module.exports = router;
