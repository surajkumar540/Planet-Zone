/**
 * Builds backend/data/natural-products.json: ~200 real natural / organic
 * products (no meat) with genuine photos, from the free, open Open Food Facts
 * and Open Beauty Facts databases. Run once with `npm run data:natural:fetch`;
 * `npm run data:natural` then imports the saved file, so importing never
 * depends on those sites.
 *
 * Only English-named products with a front photo are kept, and every product
 * is unique by name and by photo. Data: ODbL; photos: CC BY-SA (credited on
 * each product).
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const OUT = path.resolve(__dirname, "../../data/natural-products.json");
const USER_AGENT = "PlanetZoneSampleImporter/1.0 (open-source demo catalogue)";
const PER_SHELF = 20;

/** Our shelves → the source categories that fill them. */
const SHELVES = [
  { shelf: "Honey & Spreads", site: "food", tags: ["honeys", "peanut-butters", "jams"] },
  { shelf: "Herbal & Green Tea", site: "food", tags: ["herbal-teas", "green-teas"] },
  { shelf: "Nuts & Seeds", site: "food", tags: ["nuts", "seeds"] },
  { shelf: "Dried Fruits", site: "food", tags: ["dried-fruits"] },
  { shelf: "Spices & Herbs", site: "food", tags: ["spices", "herbs"] },
  { shelf: "Oats & Granola", site: "food", tags: ["rolled-oats", "granolas", "mueslis"] },
  { shelf: "Natural Oils", site: "food", tags: ["olive-oils", "coconut-oils"] },
  { shelf: "Soaps & Cleansers", site: "beauty", tags: ["soaps", "bar-soaps"] },
  { shelf: "Hair Care", site: "beauty", tags: ["shampoos", "conditioners"] },
  { shelf: "Body & Lip Care", site: "beauty", tags: ["moisturizers", "body-lotions", "lip-balms", "deodorants"] },
];

const HOSTS = { food: "https://world.openfoodfacts.org", beauty: "https://world.openbeautyfacts.org" };
const COUNTRIES = ["united-kingdom", "united-states", "india", "ireland", "australia", "canada"];
const FIELDS = "code,product_name_en,product_name,brands,image_front_url,quantity,labels_tags,origins,generic_name_en,ingredients_text_en";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Food uses Open Food Facts' newer search service (the classic search API is
 * often overloaded); beauty uses Open Beauty Facts' API. Both are paced and
 * retried politely.
 */
const searchUrl = (site, tag, country, page) =>
  site === "food"
    ? `https://search.openfoodfacts.org/search?q=${encodeURIComponent(`categories_tags:"en:${tag}" AND countries_tags:"en:${country}"`)}&page_size=50&page=${page}&fields=${FIELDS}`
    : `${HOSTS[site]}/api/v2/search?categories_tags_en=${tag}&countries_tags_en=${country}&fields=${FIELDS}&page_size=50&page=${page}&sort_by=unique_scans_n`;

const search = async (site, tag, country, page) => {
  const url = searchUrl(site, tag, country, page);
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await wait(site === "food" ? 1200 : 6500);
    try {
      const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      const text = await response.text();
      if (text.startsWith("{")) {
        const json = JSON.parse(text);
        return json.hits || json.products || [];
      }
    } catch {
      // network blip
    }
    process.stdout.write(` (busy, retry ${attempt})`);
    await wait(10000 * attempt);
  }
  return [];
};

/** Brands arrive as "A, B" from one API and ["A", "B"] from the other. */
const firstBrand = (brands) => (Array.isArray(brands) ? brands[0] : String(brands || "").split(",")[0]) || "";

const MEAT = /\b(meat|beef|pork|chicken|turkey|ham|bacon|salami|sausage|lamb|fish|tuna|salmon|anchov|gelatin)\b/i;
// The product must carry an English name of its own (no French or German
// names that happen to use plain letters).
const cleanName = (product) => (product.product_name_en || "").replace(/\s+/g, " ").trim();
const FOREIGN = /\b(de|du|des|et|au|aux|le|la|les|avec|con|und|mit|del|della|integrales|aceite|huile|miel|poivre|sel|moulin|haferflocken|flocons|copos|avena|olio|olijfolie|tee|thé|steak)\b/i;

/** Each shelf's products must actually say what they are (no coriander in the tea aisle). */
const SHELF_WORDS = {
  "Honey & Spreads": /honey|butter|spread|jam|marmalade|preserve|conserve|curd/i,
  "Herbal & Green Tea": /tea|infusion|chai|rooibos|redbush|camomile|chamomile|matcha|peppermint|mint|ginger|herbal/i,
  "Nuts & Seeds": /nut|almond|cashew|pistachio|peanut|walnut|pecan|hazelnut|macadamia|seed|chia|flax|pumpkin|sunflower|mix/i,
  "Dried Fruits": /dried|raisin|sultana|apricot|fig|date|prune|cranberr|mango|banana|apple|fruit|currant/i,
  "Spices & Herbs": /spice|herb|pepper|turmeric|cumin|curry|chilli|chili|paprika|cinnamon|ginger|garam|masala|oregano|basil|thyme|coriander|seasoning|nutmeg|clove|cardamom/i,
  "Oats & Granola": /oat|granola|muesli|porridge|flake|bran/i,
  "Natural Oils": /oil/i,
  "Soaps & Cleansers": /soap|wash|cleanser|cleansing|bar/i,
  "Hair Care": /shampoo|conditioner|hair/i,
  "Body & Lip Care": /cream|lotion|moistur|balm|butter|deodorant|body|lip|skin/i,
};

/** "tesco hazelnut" → "Tesco Hazelnut"; already-cased names are left alone. */
const tidyCase = (name) => (name === name.toLowerCase() ? name.replace(/\b[a-z]/g, (letter) => letter.toUpperCase()) : name);
const isEnglish = (name) => !FOREIGN.test(name) && /^[A-Za-z0-9 &'’,.()%+\-/!:]+$/.test(name) && /[a-z]/.test(name) && name.length >= 4 && name.length <= 70;
const titleCase = (name) =>
  name === name.toUpperCase() ? name.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : name;

const LABELS = {
  "en:organic": "Organic",
  "en:eu-organic": "EU Organic",
  "en:usda-organic": "USDA Organic",
  "en:vegan": "Vegan",
  "en:vegetarian": "Vegetarian",
  "en:fair-trade": "Fair trade",
  "en:gluten-free": "Gluten free",
  "en:no-preservatives": "No preservatives",
  "en:no-added-sugar": "No added sugar",
  "en:cruelty-free": "Cruelty free",
  "en:palm-oil-free": "Palm oil free",
  "en:natural": "Natural",
};

const run = async () => {
  const seenNames = new Set();
  const seenImages = new Set();
  const out = [];

  for (const { shelf, site, tags } of SHELVES) {
    const picked = [];
    process.stdout.write(`\n${shelf}:`);
    for (const tag of tags) {
      for (const country of COUNTRIES) {
        if (picked.length >= PER_SHELF) break;
        for (let page = 1; page <= 2 && picked.length < PER_SHELF; page += 1) {
          const rows = await search(site, tag, country, page);
          for (const row of rows) {
            // A bare "Honey" or "Moisturizer" gets its brand in front ("Rowse Honey").
            const brandName = firstBrand(row.brands).trim();
            const bare = tidyCase(titleCase(cleanName(row)));
            if (bare.length < 3 || !SHELF_WORDS[shelf].test(bare)) continue;
            const name =
              bare.split(" ").length <= 2 && brandName && !bare.toLowerCase().includes(brandName.toLowerCase())
                ? `${tidyCase(brandName)} ${bare}`
                : bare;
            const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (!row.image_front_url || !isEnglish(name) || MEAT.test(name)) continue;
            if (seenNames.has(key) || seenImages.has(row.image_front_url)) continue;
            seenNames.add(key);
            seenImages.add(row.image_front_url);
            picked.push({
              code: row.code,
              site,
              shelf,
              sourceTag: tag,
              name,
              brand: firstBrand(row.brands).trim() || "Nature's Pick",
              quantity: (row.quantity || "").trim(),
              labels: [...new Set((row.labels_tags || []).map((label) => LABELS[label]).filter(Boolean))],
              origin: (Array.isArray(row.origins) ? row.origins[0] || "" : String(row.origins || "").split(",")[0]).trim(),
              generic: (row.generic_name_en || "").trim(),
              ingredients: (row.ingredients_text_en || "").replace(/\s+/g, " ").trim().slice(0, 300),
              // The ".400" thumbnail is soft on large screens; ".full" is the original upload.
              image: row.image_front_url.replace(/\.\d+\.jpg$/, ".full.jpg"),
              thumb: row.image_front_url,
            });
            if (picked.length >= PER_SHELF) break;
          }
          if (rows.length < 50) break;
        }
        process.stdout.write(` ${tag}/${country}:${picked.length}`);
      }
    }
    out.push(...picked);
  }

  fs.writeFileSync(OUT, JSON.stringify({ source: "Open Food Facts & Open Beauty Facts", license: "Data ODbL, images CC BY-SA", fetchedAt: new Date().toISOString(), products: out }, null, 2));
  console.log(`\n\nSaved ${out.length} products to ${path.relative(process.cwd(), OUT)}`);
  const byShelf = out.reduce((map, item) => ({ ...map, [item.shelf]: (map[item.shelf] || 0) + 1 }), {});
  console.log(byShelf);
  console.log("checksum", crypto.createHash("sha1").update(JSON.stringify(out)).digest("hex").slice(0, 10));
};

run().catch((error) => {
  console.error("Fetch failed:", error.message);
  process.exit(1);
});
