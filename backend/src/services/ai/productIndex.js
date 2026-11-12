const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const prisma = require("../../db/client");
const logger = require("../../core/logger");
const models = require("./models");

/**
 * The AI view of the catalogue: for every active product, a text "meaning"
 * vector (name, brand, category, description) and a CLIP vector of its main
 * photo.
 *
 * Vectors are kept in memory and saved to backend/.cache/ai-index.json, keyed
 * by a hash of the text / image URL, so a restart reuses them and only new or
 * edited products are re-embedded. `refresh()` is cheap to call: it looks at
 * the catalogue at most once a minute.
 */

const INDEX_FILE = path.resolve(models.CACHE_DIR, "../ai-index.json");
const REFRESH_EVERY_MS = 60 * 1000;

/** id → { textHash, text, imageUrl, image } */
let entries = new Map();
let lastRefresh = 0;
let refreshing = null;
let status = { text: "idle", image: "idle", products: 0, textReady: 0, imageReady: 0 };

const hash = (value) => crypto.createHash("sha1").update(value).digest("hex").slice(0, 16);

const describe = (product) =>
  [product.name, product.brand, product.category, product.shortDescription, product.description]
    .filter(Boolean)
    .join(". ")
    .slice(0, 1000);

const loadFromDisk = () => {
  try {
    const saved = JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));
    if (saved.textModel === models.TEXT_MODEL && saved.clipModel === models.CLIP_MODEL) {
      entries = new Map(Object.entries(saved.entries || {}));
    }
  } catch {
    // No cache yet.
  }
};

const saveToDisk = () => {
  try {
    fs.mkdirSync(path.dirname(INDEX_FILE), { recursive: true });
    fs.writeFileSync(
      INDEX_FILE,
      JSON.stringify({ textModel: models.TEXT_MODEL, clipModel: models.CLIP_MODEL, entries: Object.fromEntries(entries) })
    );
  } catch (error) {
    logger.warn(`AI index not saved: ${error.message}`);
  }
};

const updateStatus = () => {
  const values = [...entries.values()];
  status = {
    ...status,
    products: values.length,
    textReady: values.filter((entry) => entry.text).length,
    imageReady: values.filter((entry) => entry.image).length,
  };
};

/** Brings the index in line with the catalogue, embedding only what changed. */
const doRefresh = async () => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, brand: true, category: true, shortDescription: true, description: true, image: true },
  });
  const live = new Set(products.map((product) => product.id));
  [...entries.keys()].forEach((id) => !live.has(id) && entries.delete(id));

  // Text first: fast, and powers search by meaning.
  const needText = products.filter((product) => entries.get(product.id)?.textHash !== hash(describe(product)));
  if (needText.length) {
    status.text = "indexing";
    for (let start = 0; start < needText.length; start += 16) {
      const batch = needText.slice(start, start + 16);
      const vectors = await models.embedTexts(batch.map(describe));
      batch.forEach((product, index) => {
        const entry = entries.get(product.id) || {};
        entries.set(product.id, { ...entry, textHash: hash(describe(product)), text: vectors[index] });
      });
    }
    saveToDisk();
  }
  status.text = "ready";
  updateStatus();

  // Then photos: slower (download + CLIP), done one by one in the background.
  const needImage = products.filter((product) => product.image && entries.get(product.id)?.imageUrl !== product.image);
  if (needImage.length) {
    status.image = "indexing";
    let done = 0;
    for (const product of needImage) {
      try {
        const vector = await models.embedImage(product.image);
        entries.set(product.id, { ...entries.get(product.id), imageUrl: product.image, image: vector });
      } catch (error) {
        logger.warn(`AI: couldn't read the photo of "${product.name}": ${error.message}`);
      }
      done += 1;
      if (done % 20 === 0) {
        saveToDisk();
        updateStatus();
      }
    }
    saveToDisk();
  }
  status.image = "ready";
  updateStatus();
};

const refresh = ({ force = false } = {}) => {
  if (refreshing) return refreshing;
  if (!force && Date.now() - lastRefresh < REFRESH_EVERY_MS) return Promise.resolve();
  lastRefresh = Date.now();
  refreshing = doRefresh()
    .catch((error) => {
      logger.error(`AI index refresh failed: ${error.message}`);
      if (status.text !== "ready") status.text = "error";
      if (status.image !== "ready") status.image = "error";
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
};

/** Starts loading models and indexing in the background (never blocks boot). */
const warmUp = () => {
  loadFromDisk();
  updateStatus();
  if (entries.size) status = { ...status, text: status.textReady ? "ready" : "idle", image: status.imageReady ? "ready" : "idle" };
  setTimeout(() => refresh({ force: true }), 2000);
};

/**
 * Products ranked by cosine similarity to a query vector.
 * `kind` is "text" (meaning vectors) or "image" (CLIP vectors).
 */
const rank = (vector, kind, { limit = 12, exclude = [], minScore = 0 } = {}) => {
  refresh();
  const skip = new Set(exclude);
  const scored = [];
  entries.forEach((entry, id) => {
    const target = entry[kind];
    if (!target || skip.has(id)) return;
    const score = models.dot(vector, target);
    if (score >= minScore) scored.push({ id, score });
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
};

const vectorFor = (id, kind) => entries.get(id)?.[kind] || null;
const isReady = (kind) => (kind === "text" ? status.textReady > 0 : status.imageReady > 0);
const getStatus = () => ({ ...status });

module.exports = { warmUp, refresh, rank, vectorFor, isReady, getStatus };
