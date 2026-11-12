/**
 * `npm run images:warm`: asks the image optimiser for every product photo at
 * the sizes the shop uses, so the first shopper doesn't wait while photos are
 * shrunk. Needs the API running. Safe to re-run; cached sizes return at once.
 */
const prisma = require("../db/client");

const API = process.env.WARM_API || "http://localhost:8000";
const WIDTHS = [480, 160, 96];
const CONCURRENCY = 6;

(async () => {
  const products = await prisma.product.findMany({ where: { isActive: true }, select: { image: true } });
  const jobs = products.flatMap((product) => (product.image?.startsWith("https://") ? WIDTHS.map((w) => ({ src: product.image, w })) : []));
  let done = 0;
  let failed = 0;
  const worker = async () => {
    while (jobs.length) {
      const { src, w } = jobs.shift();
      try {
        const response = await fetch(`${API}/api/img?w=${w}&src=${encodeURIComponent(src)}`, { redirect: "manual" });
        if (response.status !== 200) failed += 1;
        await response.arrayBuffer();
      } catch {
        failed += 1;
      }
      done += 1;
      if (done % 100 === 0) console.log(`${done} images ready…`);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`Done: ${done} image sizes prepared (${failed} could not be optimised and will load the original).`);
  await prisma.$disconnect();
})().catch((error) => {
  console.error("Warm-up failed:", error.message);
  process.exit(1);
});
