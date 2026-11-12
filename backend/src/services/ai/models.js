const path = require("path");
const logger = require("../../core/logger");

/**
 * Local AI models, run on this server with Transformers.js (ONNX runtime).
 * Free and open source: no API key, no per-request cost, and no customer data
 * leaves the server. Each model downloads once from Hugging Face into
 * backend/.cache/models (or run `npm run ai:download` ahead of time).
 *
 * - all-MiniLM-L6-v2 (~23 MB): turns text into a 384-number "meaning"
 *   vector, so "something warm for winter" lands near jackets and sweaters.
 * - CLIP ViT-B/32 (~150 MB): puts images and text in the same space, so a
 *   shopper's photo can be matched against product photos.
 *
 * Models load lazily and only once; until a model is ready, callers fall back
 * to the rule-based search, so the shop never waits on AI.
 */

const CACHE_DIR = path.resolve(__dirname, "../../../.cache/models");
const TEXT_MODEL = "Xenova/all-MiniLM-L6-v2";
const CLIP_MODEL = "Xenova/clip-vit-base-patch32";

let library;
const loadLibrary = async () => {
  if (!library) {
    library = await import("@huggingface/transformers");
    library.env.cacheDir = CACHE_DIR;
    library.env.allowLocalModels = true;
  }
  return library;
};

const once = (label, factory) => {
  let promise = null;
  return () => {
    if (!promise) {
      const started = Date.now();
      promise = factory()
        .then((value) => {
          logger.info(`AI model ready: ${label} (${Math.round((Date.now() - started) / 100) / 10}s)`);
          return value;
        })
        .catch((error) => {
          promise = null; // allow a retry later (e.g. offline at boot)
          logger.error(`AI model failed to load (${label}): ${error.message}`);
          throw error;
        });
    }
    return promise;
  };
};

const textModel = once("text meaning (all-MiniLM-L6-v2)", async () => {
  const { pipeline } = await loadLibrary();
  return pipeline("feature-extraction", TEXT_MODEL, { dtype: "q8" });
});

const clipModel = once("image matching (CLIP ViT-B/32)", async () => {
  const lib = await loadLibrary();
  const [processor, vision, tokenizer, text] = await Promise.all([
    lib.AutoProcessor.from_pretrained(CLIP_MODEL),
    lib.CLIPVisionModelWithProjection.from_pretrained(CLIP_MODEL, { dtype: "q8" }),
    lib.AutoTokenizer.from_pretrained(CLIP_MODEL),
    lib.CLIPTextModelWithProjection.from_pretrained(CLIP_MODEL, { dtype: "q8" }),
  ]);
  return { processor, vision, tokenizer, text, RawImage: lib.RawImage };
});

const normalise = (vector) => {
  const length = Math.hypot(...vector) || 1;
  return vector.map((value) => value / length);
};

/** Meaning vectors for one or more texts (unit length, so dot product = cosine). */
const embedTexts = async (texts) => {
  const model = await textModel();
  const output = await model(texts, { pooling: "mean", normalize: true });
  return output.tolist();
};

/** CLIP vector for an image, from a URL or a Buffer. */
const embedImage = async (source) => {
  const clip = await clipModel();
  const image = Buffer.isBuffer(source)
    ? await clip.RawImage.fromBlob(new Blob([source]))
    : await clip.RawImage.read(source);
  const inputs = await clip.processor(image);
  const { image_embeds: embeds } = await clip.vision(inputs);
  return normalise(Array.from(embeds.data));
};

/** CLIP vector for a short text (used to match words against product photos). */
const embedClipText = async (text) => {
  const clip = await clipModel();
  const inputs = clip.tokenizer([text], { padding: true, truncation: true });
  const { text_embeds: embeds } = await clip.text(inputs);
  return normalise(Array.from(embeds.data));
};

const dot = (a, b) => {
  let sum = 0;
  for (let index = 0; index < a.length; index += 1) sum += a[index] * b[index];
  return sum;
};

module.exports = { textModel, clipModel, embedTexts, embedImage, embedClipText, dot, CACHE_DIR, TEXT_MODEL, CLIP_MODEL };
