import { chromium } from "playwright";
import { readFileSync } from "fs";

const BASE = "http://localhost:5173";
const OUT = process.argv[2] || ".";
const token = readFileSync(`${OUT}/admtok.txt`, "utf8").trim();

const consoleErrors = [];
const failedRequests = [];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

// Seed the session the dashboard expects before any script runs.
await context.addInitScript(
  ([jwt, appearance]) => {
    localStorage.setItem("token", jwt);
    localStorage.setItem("admin", "true");
    localStorage.setItem("planet.appearance", appearance);
  },
  [token, JSON.stringify({ themeMode: "light", accentColor: "emerald", fontSize: "md", density: "comfortable" })]
);

const page = await context.newPage();
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("requestfailed", (req) => failedRequests.push(`${req.method()} ${req.url()}`));
page.on("response", (res) => {
  if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
});

const shoot = async (name, path = "/admin", waitFor = null) => {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 45000 });
  if (waitFor) await page.waitForSelector(waitFor, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`shot: ${name}`);
};

// Light mode overview
await shoot("01-overview-light", "/admin", "text=Dashboard");

// Read what actually rendered, to prove data arrived rather than a skeleton.
const heading = await page.textContent("h1").catch(() => null);
const statValues = await page.$$eval(".type-display", (nodes) =>
  nodes.slice(0, 4).map((n) => n.textContent.trim())
);
console.log("heading:", heading);
console.log("stats:", JSON.stringify(statValues));

// Switch to dark via the header control, exercising the real toggle.
await page.click('button[aria-label="Dark theme"]').catch(() => {});
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/02-overview-dark.png` });
console.log("shot: 02-overview-dark");

const themeAttr = await page.getAttribute("html", "data-theme");
console.log("data-theme after toggle:", themeAttr);

await shoot("03-orders-dark", "/admin/orders", "table");
const orderRows = await page.$$eval("tbody tr", (rows) => rows.length);
console.log("order rows:", orderRows);

await shoot("04-products-dark", "/admin/products", "table");
await shoot("05-analytics-dark", "/admin/analytics");
await shoot("06-settings-appearance", "/admin/settings?tab=appearance");

// Back to light to confirm the toggle works both ways.
await page.click('button[aria-label="Light theme"]').catch(() => {});
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/07-settings-light.png` });
console.log("shot: 07-settings-light");

// Narrow viewport: the page must not scroll sideways.
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/08-mobile-light.png` });
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth
);
console.log("horizontal overflow px:", overflow);

console.log("\nCONSOLE ERRORS:", consoleErrors.length);
consoleErrors.slice(0, 10).forEach((e) => console.log("  ", e.slice(0, 200)));
console.log("FAILED REQUESTS:", failedRequests.length);
[...new Set(failedRequests)].slice(0, 10).forEach((r) => console.log("  ", r.slice(0, 160)));

await browser.close();
