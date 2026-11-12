/**
 * `npm run ai:download`: fetches the free AI models into backend/.cache/models
 * and builds the product index, so the first shopper doesn't wait for it.
 * Safe to run again; already-downloaded files are reused.
 */
const productIndex = require("../services/ai/productIndex");
const models = require("../services/ai/models");
const prisma = require("../db/client");

(async () => {
  const started = Date.now();
  console.log("Downloading the text model (all-MiniLM-L6-v2, ~23 MB)…");
  await models.textModel();
  console.log("Downloading the image model (CLIP ViT-B/32, ~150 MB)…");
  await models.clipModel();
  console.log("Indexing the catalogue (text, then product photos)…");
  productIndex.warmUp();
  await productIndex.refresh({ force: true });
  const status = productIndex.getStatus();
  console.log(
    `Done in ${Math.round((Date.now() - started) / 1000)}s: ${status.textReady}/${status.products} products by meaning, ${status.imageReady}/${status.products} by photo.`
  );
  await prisma.$disconnect();
  process.exit(0);
})().catch((error) => {
  console.error("AI setup failed:", error.message);
  process.exit(1);
});
