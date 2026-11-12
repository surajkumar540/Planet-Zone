const { Prisma } = require("@prisma/client");
const prisma = require("../../db/client");
const cache = require("../../core/cache");
const { toProduct, toOrder, num } = require("../../db/mappers");
const { WITH_VARIANTS } = require("../product/product.repository");
const { ORDER_STATUS, CUSTOMER_CANCELLABLE } = require("../../constants/orderStatus");
const { SETTINGS_DEFAULTS } = require("../settings/settings.defaults");
const env = require("../../config/env");
const AppError = require("../../core/AppError");
const aiModels = require("../../services/ai/models");
const productIndex = require("../../services/ai/productIndex");

/**
 * "Smart" shopping features, all rule-based and computed from the store's own
 * data: no external AI service, no API keys, no cost.
 *
 * - assistant: turns a plain-English question into catalogue filters, or
 *   answers a store-policy question from live Settings.
 * - recommendations: similar items, cheaper alternatives, items bought in the
 *   same orders, and a personal mix built from wishlist, purchases and the
 *   recently viewed ids the browser sends (never stored server-side).
 */

const ACTIVE = { isActive: true };
const IN_STOCK = { countInStock: { gt: 0 } };
const LOST_STATUSES = [ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED, ORDER_STATUS.RETURNED];

const findProducts = async (where, { take = 12, orderBy } = {}) =>
  (await prisma.product.findMany({ where, take, orderBy, include: WITH_VARIANTS })).map(toProduct);

/* ================================ AI (local) ================================ */

const aiEnabled = () => env.AI_FEATURES !== "off";

/**
 * Search by meaning with the local text model: the query and every product
 * become meaning vectors, and the closest products win, even with no words in
 * common ("stuff for cooking dinner" → wok, oil, spatula). Returns null while
 * the model is still warming up, so callers fall back to keyword search.
 */
const searchByMeaning = async (text, { where = {}, limit = 12, minScore = 0.22 } = {}) => {
  if (!aiEnabled() || !productIndex.isReady("text")) return null;
  const [vector] = await aiModels.embedTexts([text]);
  const ranked = productIndex.rank(vector, "text", { limit: 60, minScore });
  if (!ranked.length) return { products: [], best: 0 };
  const rows = await findProducts({ ...ACTIVE, ...where, id: { in: ranked.map((row) => row.id) } }, { take: 60 });
  const byId = new Map(rows.map((row) => [row._id, row]));
  const products = ranked
    .map((row) => byId.get(row.id) && { ...byId.get(row.id), match: Math.round(row.score * 100) / 100 })
    .filter(Boolean)
    .slice(0, limit);
  return { products, best: products[0]?.match || 0 };
};

const IMAGE_TYPES = /^data:image\/(jpeg|png|webp);base64,/;

/**
 * Search by photo with the local CLIP model. The image is analysed in memory
 * and never stored. Scores are cosine similarity between the shopper's photo
 * and each product photo.
 */
const searchByPhoto = async (dataUrl, { limit = 12 } = {}) => {
  if (!aiEnabled()) throw AppError.badRequest("Photo search is switched off on this store");
  if (!IMAGE_TYPES.test(dataUrl)) throw AppError.badRequest("Upload a JPG, PNG or WebP photo");
  const buffer = Buffer.from(dataUrl.replace(IMAGE_TYPES, ""), "base64");
  if (buffer.length > 800 * 1024) throw AppError.badRequest("That photo is too large");
  if (!productIndex.isReady("image")) {
    return { ready: false, products: [], message: "Photo search is still warming up. Please try again in a minute." };
  }
  const vector = await aiModels.embedImage(buffer);
  const ranked = productIndex.rank(vector, "image", { limit: 24, minScore: 0.5 });
  const products = await getProductsByIds(ranked.map((row) => row.id));
  const scores = new Map(ranked.map((row) => [row.id, row.score]));
  return {
    ready: true,
    products: products.slice(0, limit).map((product) => ({ ...product, match: Math.round(scores.get(product._id) * 100) / 100 })),
  };
};

const aiStatus = () => ({ enabled: aiEnabled(), ...productIndex.getStatus() });

/** Products by id, returned in the order asked for (inactive ones dropped). */
const getProductsByIds = async (ids) => {
  if (!ids.length) return [];
  const rows = await findProducts({ id: { in: ids }, ...ACTIVE }, { take: ids.length });
  const byId = new Map(rows.map((row) => [row._id, row]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
};

/* ================================== Assistant ================================== */

/** Words that point at a category even when its name isn't used. */
const SYNONYMS = [
  [/\b(phones?|mobiles?|smartphones?|iphones?|android)\b/, ["Smartphones"]],
  [/\b(laptops?|notebooks?|macbooks?|computers?)\b/, ["Laptops"]],
  [/\b(tablets?|ipads?)\b/, ["Tablets"]],
  [/\b(headphones?|earphones?|earbuds?|speakers?|chargers?|airpods?|gadgets?|accessor(y|ies))\b/, ["Mobile Accessories"]],
  [/\b(watch|watches|smartwatch)\b/, ["Mens Watches", "Womens Watches"]],
  [/\b(shoes?|sneakers?|footwear|trainers?|heels|sandals?|slippers?)\b/, ["Mens Shoes", "Womens Shoes"]],
  [/\b(shirts?|t-?shirts?|tees?)\b/, ["Mens Shirts", "Tops"]],
  [/\b(tops?|blouses?)\b/, ["Tops"]],
  [/\b(dress|dresses|frocks?|gowns?|skirts?)\b/, ["Womens Dresses"]],
  [/\b(bags?|handbags?|purses?|backpacks?)\b/, ["Womens Bags"]],
  [/\b(jewel(le)?ry|earrings?|necklaces?|rings?|bracelets?)\b/, ["Womens Jewellery"]],
  [/\b(sunglasses|glasses|shades|eyewear)\b/, ["Sunglasses"]],
  [/\b(perfumes?|fragrances?|scents?|deodorants?|colognes?)\b/, ["Fragrances"]],
  [/\b(makeup|make-up|lipsticks?|mascara|eyeshadow|nail polish|cosmetics?|beauty)\b/, ["Beauty"]],
  [/\b(skin ?care|lotions?|creams?|moisturi[sz]ers?|serums?|face wash)\b/, ["Skin Care"]],
  [/\b(furniture|sofas?|beds?|chairs?|tables?|wardrobes?)\b/, ["Furniture"]],
  [/\b(decor|decorations?|lamps?|vases?|showpieces?|plants?)\b/, ["Home Decoration"]],
  [/\b(kitchen|cookware|pans?|knives|knife|spatulas?|utensils?|whisks?)\b/, ["Kitchen Accessories"]],
  [/\b(groceries|grocery|food|fruits?|vegetables?|meat|oil|snacks?)\b/, ["Groceries"]],
  [/\b(sports?|balls?|fitness|gym|cricket|football|basketball|tennis|outdoors?)\b/, ["Sports Accessories"]],
  [/\b(clothes|clothing|fashion|apparel|outfits?)\b/, ["Mens Shirts", "Tops", "Womens Dresses"]],
];

const STOPWORDS = new Set(
  ("a an the i im i'm me my we you your show find get give want need looking look for search some any any? of in on with " +
    "and or to is are be can could would please pls plz under below above over less more than within upto up between " +
    "from around about budget price priced cost costs rs inr rupees cheap cheapest best top rated good nice new latest " +
    "buy something thing things items item products product stock available in-stock deal deals sale offer offers discount " +
    "men mens man male women womens woman ladies female what which who how much many like that this those these")
    .split(/\s+/)
);

/** "2k" → 2000, "1.5 lakh" → 150000, "1,299" → 1299. */
const toAmount = (text) => {
  const match = String(text).match(/(\d+(?:[.,]\d+)*)\s*(k|thousand|l|lakh|lac)?/i);
  if (!match) return null;
  let value = Number(match[1].replace(/,/g, ""));
  const unit = (match[2] || "").toLowerCase();
  if (unit === "k" || unit === "thousand") value *= 1000;
  if (unit === "l" || unit === "lakh" || unit === "lac") value *= 100000;
  return Number.isFinite(value) ? value : null;
};

const AMOUNT = "(?:₹|rs\\.?|inr)?\\s*(\\d+(?:[.,]\\d+)*\\s*(?:k|thousand|lakh|lac|l)?)\\b";

/** Pulls a price range out of the question, if there is one. */
const parseBudget = (q) => {
  let match = q.match(new RegExp(`(?:between|from)\\s*${AMOUNT}\\s*(?:and|to|-|–)\\s*${AMOUNT}`, "i"));
  if (match) return { min: toAmount(match[1]), max: toAmount(match[2]) };
  match = q.match(new RegExp(`${AMOUNT}\\s*(?:-|–|to)\\s*${AMOUNT}`, "i"));
  if (match && /\d/.test(match[1]) && /\d/.test(match[2])) return { min: toAmount(match[1]), max: toAmount(match[2]) };
  match = q.match(new RegExp(`(?:under|below|less than|within|upto|up to|max(?:imum)?|budget(?: of| is)?|not more than|<=?)\\s*${AMOUNT}`, "i"));
  if (match) return { max: toAmount(match[1]) };
  match = q.match(new RegExp(`(?:above|over|more than|at least|min(?:imum)?|>=?)\\s*${AMOUNT}`, "i"));
  if (match) return { min: toAmount(match[1]) };
  match = q.match(new RegExp(`(?:around|about|near|approx(?:imately)?)\\s*${AMOUNT}`, "i"));
  if (match) {
    const value = toAmount(match[1]);
    return { min: Math.round(value * 0.8), max: Math.round(value * 1.2) };
  }
  return null;
};

const parseSort = (q) => {
  if (/\b(cheapest|lowest price|least expensive|affordable|budget friendly|low cost)\b/.test(q)) return { key: "cheapest", orderBy: { totalPrice: "asc" }, label: "Cheapest first" };
  if (/\b(most expensive|premium|luxury|high end|costliest)\b/.test(q)) return { key: "premium", orderBy: { totalPrice: "desc" }, label: "Premium first" };
  if (/\b(best|top rated|highest rated|well rated|popular|recommended|good)\b/.test(q)) return { key: "rated", orderBy: [{ rating: "desc" }, { numReviews: "desc" }], label: "Best rated" };
  if (/\b(new|newest|latest|recent)\b/.test(q)) return { key: "new", orderBy: { createdAt: "desc" }, label: "Newest" };
  return null;
};

/** Category and brand vocabulary, cached for five minutes. */
const vocabulary = () =>
  cache.remember("smart:vocabulary", 5 * 60 * 1000, async () => {
    const [categories, brands] = await Promise.all([
      prisma.category.findMany({ where: { isActive: true }, select: { id: true, name: true, parentId: true } }),
      prisma.product.findMany({ where: ACTIVE, distinct: ["brand"], select: { brand: true } }),
    ]);
    return {
      categories,
      brands: brands.map((row) => row.brand).filter((brand) => brand && brand.length > 1),
    };
  });

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordMatch = (q, phrase) => new RegExp(`(^|[^a-z0-9])${escapeRegex(phrase.toLowerCase())}s?([^a-z0-9]|$)`).test(q);

/* --------------------------------- FAQ answers -------------------------------- */

const FAQ_RULES = [
  { topic: "cod", test: /\b(cod|cash on delivery|pay (on|at) delivery|cash)\b/ },
  { topic: "payment", test: /\b(payment|pay|upi|card|credit|debit|net ?banking|razorpay|wallet)\b/ },
  { topic: "cancel", test: /\b(cancel|cancellation)\b/ },
  { topic: "returns", test: /\b(return|returns|refund|refunds|exchange|replace|replacement|warranty|guarantee)\b/ },
  { topic: "track", test: /\b(track|tracking|where is my order|order status|my order)\b/ },
  { topic: "shipping", test: /\b(shipping|delivery|deliver|ship|courier|how long|when will|arrive|charges?)\b/ },
  { topic: "contact", test: /\b(contact|support|help ?desk|customer care|phone number|email|talk to)\b/ },
  { topic: "minimum", test: /\b(minimum order|min order)\b/ },
];

const loadSettings = async () => {
  const row = await prisma.settings.findUnique({ where: { key: "default" } });
  return {
    store: { ...SETTINGS_DEFAULTS.store, ...(row?.store || {}) },
    orders: { ...SETTINGS_DEFAULTS.orders, ...(row?.orders || {}) },
  };
};

const formatRupees = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

/** Answers from live settings and shipping rules; every answer says where it came from. */
const answerFaq = async (topic) => {
  const settings = await loadSettings();
  const { orders, store } = settings;
  switch (topic) {
    // These describe what checkout actually does. The Settings switches for
    // payment methods aren't enforced yet, so they are deliberately not quoted.
    case "cod":
      return {
        answer: "Yes. Cash on delivery is available: choose it at checkout and pay the delivery person in cash or UPI when your order arrives.",
        source: "Checkout",
      };
    case "payment": {
      const online = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_SECRET);
      return {
        answer: online
          ? "You can pay online through Razorpay (cards, UPI, net banking and wallets) or choose cash on delivery."
          : "Cash on delivery is available at checkout: pay in cash or UPI when the order arrives. Online card/UPI payment isn't switched on right now.",
        source: "Checkout",
      };
    }
    case "cancel":
      return {
        answer: `You can cancel an order yourself from its page in "Your orders" until it has been packed (while it is ${CUSTOMER_CANCELLABLE.join(", ")}). After that it is already on its way, so please contact us instead.`,
        source: "Order rules",
        link: { to: "/orders", label: "Your orders" },
      };
    case "returns":
      return {
        answer: "Return and warranty terms are set per product, so they can differ. Open the product and check the Returns and Warranty lines under its details. For a problem with a delivered order, send us a message and we'll sort it out.",
        source: "Product details",
        link: { to: "/contact", label: "Contact us" },
      };
    case "track":
      return {
        answer: "Open \"Your orders\" and pick the order: its page shows a live tracker (confirmed → packed → shipped → out for delivery → delivered) with dates, and tracking numbers once it ships. We also email you at each step.",
        source: "Order tracking",
        link: { to: "/orders", label: "Your orders" },
      };
    case "shipping": {
      const zones = await prisma.shippingZone.findMany({
        where: { isActive: true },
        include: { rates: { where: { isActive: true } } },
      });
      if (!zones.length) {
        return {
          answer: "Delivery is currently free on every order: no shipping charges are set up. Each order's page shows its expected arrival date once it's placed.",
          source: "Shipping rules",
        };
      }
      const lines = zones.flatMap((zone) =>
        zone.rates.map((rate) => {
          const days = rate.minDeliveryDays && rate.maxDeliveryDays ? `, ${rate.minDeliveryDays}–${rate.maxDeliveryDays} days` : "";
          const free = Number(rate.freeAboveAmount) > 0 ? ` (free above ${formatRupees(rate.freeAboveAmount)})` : "";
          return `${zone.name}: ${rate.name} ${formatRupees(rate.price)}${free}${days}`;
        })
      );
      return { answer: `Delivery options: ${lines.join("; ")}.`, source: "Shipping rules" };
    }
    case "contact": {
      const ways = [store.email && `email ${store.email}`, store.phone && `call ${store.phone}`].filter(Boolean);
      return {
        answer: ways.length ? `You can ${ways.join(" or ")}, or send a message from the Contact page.` : "Send us a message from the Contact page and we'll reply by email.",
        source: "Store settings",
        link: { to: "/contact", label: "Contact us" },
      };
    }
    case "minimum":
      return {
        answer: Number(orders.minOrderAmount) > 0 ? `The minimum order value is ${formatRupees(orders.minOrderAmount)}.` : "There's no minimum order value.",
        source: "Store settings",
      };
    default:
      return null;
  }
};

/* ------------------------------- Order help -------------------------------- */

const ORDER_STEPS = [
  { status: "confirmed", label: "Confirmed" },
  { status: "packed", label: "Packed" },
  { status: "shipped", label: "Shipped" },
  { status: "out_for_delivery", label: "Out for delivery" },
  { status: "delivered", label: "Delivered" },
];
const STATUS_ORDER = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"];
const FINISHED = ["delivered", "cancelled", "refunded", "returned"];
const STATUS_WORDS = {
  pending: "is waiting to be confirmed",
  confirmed: "is confirmed and will be packed soon",
  processing: "is being packed",
  packed: "is packed and ready to ship",
  shipped: "has shipped",
  out_for_delivery: "is out for delivery today",
  delivered: "was delivered",
  cancelled: "was cancelled",
  refunded: "was refunded",
  returned: "was returned",
};

/** A compact, chat-friendly view of one order, built only from its real record. */
const orderSummary = (order) => {
  const history = order.statusHistory || [];
  const at = (status) => history.find((event) => event.status === status)?.changedAt || null;
  const position = STATUS_ORDER.indexOf(order.status);
  const steps = ORDER_STEPS.map((step) => ({
    ...step,
    done: position >= 0 && STATUS_ORDER.indexOf(step.status) <= position,
    at: at(step.status),
  }));
  const maxDays = order.shipping?.maxDeliveryDays || 7;
  const expectedBy = FINISHED.includes(order.status)
    ? null
    : new Date(new Date(order.createdAt).getTime() + maxDays * 86400000);
  const latest = history[history.length - 1];
  return {
    _id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    statusText: STATUS_WORDS[order.status] || order.status,
    paymentStatus: order.paymentStatus,
    payment: order.onlinePayment ? "Paid online" : "Cash on delivery",
    total: order.pricing?.grandTotal || 0,
    createdAt: order.createdAt,
    itemCount: (order.orderItems || []).reduce((sum, item) => sum + (item.qty || 0), 0),
    items: (order.orderItems || []).slice(0, 3).map((item) => ({ name: item.name, image: item.image, qty: item.qty })),
    tracking: order.shipping?.trackingNumber ? { number: order.shipping.trackingNumber, carrier: order.shipping.carrier || "" } : null,
    expectedBy,
    deliveredAt: at("delivered"),
    steps,
    lastUpdate: latest ? { status: latest.status, at: latest.changedAt, note: latest.note || "" } : null,
    cancellable: CUSTOMER_CANCELLABLE.includes(order.status),
    city: order.shippingAddress?.city || "",
  };
};

const ORDER_INCLUDE = {
  items: { orderBy: { position: "asc" } },
  history: { orderBy: { changedAt: "asc" } },
};

const findMyOrders = async (userId, where = {}, take = 5) =>
  (
    await prisma.order.findMany({
      where: { userId, ...where },
      orderBy: { createdAt: "desc" },
      take,
      include: ORDER_INCLUDE,
    })
  ).map((row) => orderSummary(toOrder(row)));

const SIGN_IN = (what) => ({
  type: "signin",
  answer: `Sign in and I'll ${what}. Your orders are private to your account.`,
  link: { to: "/login", label: "Sign in" },
});

const ORDER_INTENTS = [
  { mode: "cancel", test: /\bcancel\b.*\b(order|it|ord-)|\b(order|ord-[a-z0-9]+)\b.*\bcancel/ },
  { mode: "track", test: /\b(track|tracking|where('?s| is) my|order status|delivery status|status of my|when will (it|my|the order)|arriv|shipped yet|out for delivery|delivered yet|my (parcel|package|delivery))\b/ },
  { mode: "list", test: /\b(my orders?|order history|past orders?|previous orders?|recent orders?|orders i (placed|made)|what did i (buy|order))\b/ },
  { mode: "wishlist", test: /\b(my wishlist|wish list|saved items|my favou?rites)\b/ },
];

/** Order and wishlist questions, answered from the signed-in shopper's own data. */
const accountAnswer = async (q, userId) => {
  const number = q.match(/\bord-[a-z0-9]{4,}\b/i)?.[0];
  const intent = ORDER_INTENTS.find((rule) => rule.test.test(q)) || (number ? { mode: "track" } : null);
  if (!intent) return null;

  if (intent.mode === "wishlist") {
    if (!userId) return SIGN_IN("show your wishlist");
    const saved = await prisma.wishlistItem.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 6, select: { productId: true } });
    const products = await getProductsByIds(saved.map((row) => row.productId));
    return {
      type: "products",
      products,
      answer: products.length ? `Here's what's on your wishlist (${products.length}).` : "Your wishlist is empty. Tap the heart on any product to save it.",
      link: { to: "/wishlist", label: "Open wishlist" },
    };
  }

  if (!userId) return SIGN_IN(intent.mode === "cancel" ? "help you cancel an order" : "show your orders and where they are");

  if (number) {
    const orders = await findMyOrders(userId, { orderNumber: number.toUpperCase() }, 1);
    if (!orders.length) {
      return { type: "text", answer: `I couldn't find order ${number.toUpperCase()} on your account. Check the number, or see all your orders.`, link: { to: "/orders", label: "Your orders" } };
    }
    const [order] = orders;
    return { type: "orders", mode: intent.mode, orders, answer: `Order ${order.orderNumber} ${order.statusText}.` };
  }

  if (intent.mode === "cancel") {
    const open = await findMyOrders(userId, { status: { in: [...CUSTOMER_CANCELLABLE] } }, 5);
    if (!open.length) {
      return {
        type: "text",
        answer: "None of your orders can be cancelled right now: orders can only be cancelled until they're packed. For one that's already on its way, please contact us.",
        link: { to: "/contact", label: "Contact us" },
      };
    }
    return { type: "orders", mode: "cancel", orders: open, answer: open.length === 1 ? "This order can still be cancelled:" : "These orders can still be cancelled. Pick one:" };
  }

  if (intent.mode === "track") {
    const active = await findMyOrders(userId, { status: { notIn: FINISHED } }, 3);
    if (active.length) {
      return {
        type: "orders",
        mode: "track",
        orders: active,
        answer: active.length === 1 ? `Your order ${active[0].orderNumber} ${active[0].statusText}.` : `You have ${active.length} orders on the way:`,
      };
    }
    const last = await findMyOrders(userId, {}, 1);
    return last.length
      ? { type: "orders", mode: "track", orders: last, answer: `Nothing is on the way right now. Your latest order ${last[0].orderNumber} ${last[0].statusText}.` }
      : { type: "text", answer: "You haven't placed any orders yet. Want me to help you find something?", suggestions: ["Best rated products", "Deals on sale"] };
  }

  const recent = await findMyOrders(userId, {}, 5);
  return recent.length
    ? { type: "orders", mode: "list", orders: recent, answer: `Your ${recent.length === 1 ? "order" : `last ${recent.length} orders`}:`, link: { to: "/orders", label: "See all orders" } }
    : { type: "text", answer: "You haven't placed any orders yet.", suggestions: ["Best rated products", "Deals on sale"] };
};

const HELP = {
  type: "help",
  answer:
    "I can find products, track your orders and answer questions about delivery and payment. Try \"headphones under 2000\", \"best rated laptops\", \"Apple phones between 50k and 1 lakh\" or \"cheapest dress in stock\". I can also answer questions about delivery, cash on delivery, payments, cancelling and tracking orders.",
  suggestions: ["Track my order", "Watches under 5000", "Best rated laptops", "Is cash on delivery available?"],
};

/**
 * Understands a shopping question with plain rules and answers it from the
 * catalogue or the store's settings. Returns what it understood, so the UI can
 * show it and the shopper can see why these results came back.
 */
const assistant = async (rawQuery, { userId } = {}) => {
  const q = ` ${String(rawQuery || "").toLowerCase().replace(/\s+/g, " ").trim()} `;
  if (q.trim().length < 2 || /^\s*(hi|hello|hey|help|namaste|hii+)\b/.test(q)) return HELP;

  // "Where is my order", "cancel ORD-…", "my wishlist": the shopper's own data.
  const account = await accountAnswer(q, userId);
  if (account) return account;

  const { categories, brands } = await vocabulary();

  // Categories: exact names first, then synonyms; gender narrows Mens/Womens.
  const named = categories.filter((category) => category.name.length > 2 && wordMatch(q, category.name));
  const synonymNames = SYNONYMS.filter(([pattern]) => pattern.test(q)).flatMap(([, names]) => names);
  let matchedCategories = [
    ...named,
    ...categories.filter((category) => synonymNames.includes(category.name) && !named.some((item) => item.id === category.id)),
  ];
  const wantsMen = /\b(men|mens|man|male|boys?|gents)\b/.test(q);
  const wantsWomen = /\b(women|womens|woman|ladies|female|girls?)\b/.test(q);
  if (wantsMen !== wantsWomen) {
    const narrowed = matchedCategories.filter((category) => !(wantsMen ? /^womens/i : /^mens/i).test(category.name));
    if (narrowed.length) matchedCategories = narrowed;
  }
  // "for men" with nothing more specific: all of that gender's categories.
  if (!matchedCategories.length && wantsMen !== wantsWomen) {
    matchedCategories = categories.filter((category) => (wantsMen ? /^mens\b/i : /^womens\b/i).test(category.name));
  }
  // A department means everything beneath it.
  const categoryIds = new Set();
  matchedCategories.forEach((category) => {
    categoryIds.add(category.id);
    categories.filter((child) => child.parentId === category.id).forEach((child) => categoryIds.add(child.id));
  });

  const matchedBrands = brands.filter((brand) => wordMatch(q, brand));
  const budget = parseBudget(q);
  const sort = parseSort(q);
  const onSale = /\b(sale|deals?|discount(ed)?|offers?|on offer)\b/.test(q);
  const inStockOnly = /\b(in stock|available|in-stock)\b/.test(q);

  // A policy question with nothing product-like in it gets a policy answer.
  const faq = FAQ_RULES.find((rule) => rule.test.test(q));
  const productish = categoryIds.size || matchedBrands.length || budget;
  if (faq && !productish) {
    const answer = await answerFaq(faq.topic);
    if (answer) return { type: "faq", topic: faq.topic, ...answer };
  }

  // Whatever is left over becomes free-text keywords.
  const covered = [...matchedCategories.map((c) => c.name), ...matchedBrands].join(" ").toLowerCase();
  const keywords = q
    .replace(/[₹,]/g, " ")
    .split(/[^a-z0-9'-]+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word) && !/^\d/.test(word) && !covered.includes(word))
    .filter((word) => !SYNONYMS.some(([pattern]) => pattern.test(` ${word} `)))
    .slice(0, 5);

  const priceFilter = budget
    ? { totalPrice: { ...(budget.min ? { gte: budget.min } : {}), ...(budget.max ? { lte: budget.max } : {}) } }
    : {};
  const keywordFilter = keywords.length
    ? {
        OR: keywords.flatMap((word) => [
          { name: { contains: word, mode: "insensitive" } },
          { brand: { contains: word, mode: "insensitive" } },
          { category: { contains: word, mode: "insensitive" } },
          { shortDescription: { contains: word, mode: "insensitive" } },
        ]),
      }
    : {};

  const base = {
    ...ACTIVE,
    ...(categoryIds.size ? { categoryRefId: { in: [...categoryIds] } } : {}),
    ...(matchedBrands.length ? { brand: { in: matchedBrands } } : {}),
    ...(onSale ? { discount: { gt: 0 } } : {}),
    ...(inStockOnly ? IN_STOCK : {}),
  };
  const orderBy = sort?.orderBy || (onSale ? { discount: "desc" } : [{ rating: "desc" }, { numReviews: "desc" }]);

  // Free text only narrows when nothing more specific was understood, so
  // "nice red laptop" still finds laptops rather than nothing.
  const strict = !categoryIds.size && !matchedBrands.length;
  // Words from the question that should float a product up when they appear
  // in its name ("mascara" within Beauty, "airpods" within accessories).
  const focus = q
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word) && !/^\d/.test(word));
  const rank = (list) =>
    list
      .map((product, index) => ({
        product,
        index,
        hits: focus.filter((word) => product.name.toLowerCase().includes(word.replace(/s$/, ""))).length,
      }))
      .sort((a, b) => b.hits - a.hits || a.index - b.index)
      .map((entry) => entry.product)
      .slice(0, 6);

  let note = null;
  let products = null;
  let aiUsed = false;

  // Nothing specific understood but there are describing words ("something
  // warm", "healthy breakfast"): let the local AI match by meaning.
  if (strict && keywords.length) {
    const meaning = await searchByMeaning(q.trim(), { where: { ...base, ...priceFilter }, limit: 6 });
    if (meaning?.products.length) {
      products = meaning.products;
      aiUsed = true;
      if (sort?.key === "cheapest") products.sort((a, b) => a.totalPrice - b.totalPrice);
      if (sort?.key === "premium") products.sort((a, b) => b.totalPrice - a.totalPrice);
      if (sort?.key === "rated") products.sort((a, b) => b.rating - a.rating);
      if (meaning.best < 0.3) note = "Nothing in the shop matches that closely, so these are the closest by meaning.";
    }
  }
  if (!products) {
    products = rank(await findProducts({ ...base, ...priceFilter, ...(strict ? keywordFilter : {}) }, { take: 24, orderBy }));
  }

  // Leftover words matched nothing ("gift"): try again without them, and say so.
  if (!products.length && strict && keywords.length && (budget || onSale || sort || inStockOnly)) {
    products = rank(await findProducts({ ...base, ...priceFilter }, { take: 24, orderBy }));
    if (products.length) note = `Nothing is described as "${keywords.join(" ")}", so here are the best matches for the rest of your request.`;
  }

  if (!products.length && budget) {
    // Be honest: nothing in budget, so show the closest prices instead.
    const nearest = await findProducts({ ...base, ...(strict ? keywordFilter : {}) }, {
      take: 6,
      orderBy: { totalPrice: budget.max ? "asc" : "desc" },
    });
    if (nearest.length) {
      products = nearest;
      note = budget.max
        ? `Nothing matches under ${formatRupees(budget.max)}. The most affordable options start at ${formatRupees(nearest[0].totalPrice)}.`
        : `Nothing matches above ${formatRupees(budget.min)}. These are the closest.`;
    }
  }

  const understood = {
    categories: [...new Set(matchedCategories.map((category) => category.name))],
    brands: matchedBrands,
    budget,
    sort: sort?.label || null,
    onSale,
    inStockOnly,
    keywords: strict && !aiUsed ? keywords : [],
    ai: aiUsed,
  };

  if (!products.length) {
    return {
      type: "products",
      products: [],
      understood,
      answer: "I couldn't find anything matching that in our catalogue. Try a broader word (like \"shoes\" or \"watch\") or a different budget.",
      suggestions: HELP.suggestions,
    };
  }

  const inStock = products.filter((product) => product.hasVariants || product.countInStock > 0).length;
  return {
    type: "products",
    products,
    understood,
    note,
    answer: `Here ${products.length === 1 ? "is 1 product" : `are ${products.length} products`}${inStock < products.length ? ` (${inStock} in stock)` : ""}.`,
  };
};

/* =============================== Recommendations =============================== */

/** Department (parent category) id for a category id. */
const departmentOf = async (categoryRefId) => {
  if (!categoryRefId) return null;
  const { categories } = await vocabulary();
  const node = categories.find((category) => category.id === categoryRefId);
  return node?.parentId || node?.id || null;
};

const priceCloseness = (a, b) => {
  const high = Math.max(a, b, 1);
  return Math.max(0, 1 - Math.abs(a - b) / high);
};

/** Same sub-category first, then the rest of the department; scored, not random. */
const similar = async (productId, limit = 8) => {
  const base = await prisma.product.findUnique({ where: { id: productId } });
  if (!base) return [];
  const dept = await departmentOf(base.categoryRefId);
  const { categories } = await vocabulary();
  const deptIds = categories.filter((category) => category.parentId === dept || category.id === dept).map((category) => category.id);

  const candidates = await findProducts(
    {
      ...ACTIVE,
      id: { not: productId },
      OR: [
        { categoryRefId: base.categoryRefId || undefined },
        ...(deptIds.length ? [{ categoryRefId: { in: deptIds } }] : []),
        { category: base.category },
      ],
    },
    { take: 40 }
  );
  const price = num(base.totalPrice);
  // When the AI index is ready, products that look alike (photo) and are
  // described alike (text) rank higher.
  const baseText = productIndex.vectorFor(productId, "text");
  const baseImage = productIndex.vectorFor(productId, "image");
  return candidates
    .map((product) => {
      const text = baseText && productIndex.vectorFor(product._id, "text");
      const image = baseImage && productIndex.vectorFor(product._id, "image");
      const score =
        (text ? 3 * aiModels.dot(baseText, text) : 0) +
        (image ? 2 * aiModels.dot(baseImage, image) : 0) +
        (product.categoryRef === base.categoryRefId ? 3 : 1) +
        (product.brand === base.brand ? 1 : 0) +
        2 * priceCloseness(product.totalPrice, price) +
        (product.rating / 5) * 0.8 +
        (product.countInStock > 0 ? 0.5 : 0);
      return { ...product, score: Math.round(score * 100) / 100 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

/** Cheaper items in the same category, best rated first, with the saving. */
const alternatives = async (productId, limit = 4) => {
  const base = await prisma.product.findUnique({ where: { id: productId } });
  if (!base) return [];
  const price = num(base.totalPrice);
  const rows = await findProducts(
    {
      ...ACTIVE,
      ...IN_STOCK,
      id: { not: productId },
      totalPrice: { lt: price * 0.95 },
      ...(base.categoryRefId ? { categoryRefId: base.categoryRefId } : { category: base.category }),
    },
    { take: limit, orderBy: [{ rating: "desc" }, { totalPrice: "asc" }] }
  );
  return rows.map((product) => ({ ...product, saving: Math.round((price - product.totalPrice) * 100) / 100 }));
};

/** Items that appear in the same real orders as this one (cancelled orders excluded). */
const boughtTogether = async (productId, limit = 4) => {
  const rows = await prisma.$queryRaw`
    SELECT i2."productId"::text AS id, COUNT(DISTINCT i2."orderId")::int AS orders
    FROM order_items i1
    JOIN order_items i2 ON i2."orderId" = i1."orderId" AND i2."productId" <> i1."productId"
    JOIN orders o ON o.id = i1."orderId"
    WHERE i1."productId" = ${productId}::uuid
      AND i2."productId" IS NOT NULL
      AND o.status::text <> ALL(${LOST_STATUSES})
    GROUP BY i2."productId"
    ORDER BY orders DESC
    LIMIT ${limit}::int`;
  const products = await getProductsByIds(rows.map((row) => row.id));
  const counts = new Map(rows.map((row) => [row.id, row.orders]));
  return products.map((product) => ({ ...product, boughtTogetherCount: counts.get(product._id) || 0 }));
};

/** Best sellers by units in real orders, topped up with the best rated. */
const popular = async (limit, exclude = []) => {
  const sold = await prisma.$queryRaw`
    SELECT i."productId"::text AS id, SUM(i.qty)::int AS units
    FROM order_items i JOIN orders o ON o.id = i."orderId"
    WHERE i."productId" IS NOT NULL AND o.status::text <> ALL(${LOST_STATUSES})
    GROUP BY i."productId" ORDER BY units DESC LIMIT ${limit}::int`;
  const bestSellers = (await getProductsByIds(sold.map((row) => row.id))).filter((product) => !exclude.includes(product._id));
  const topRated = await findProducts(
    { ...ACTIVE, ...IN_STOCK, id: { notIn: [...exclude, ...bestSellers.map((product) => product._id)] } },
    { take: limit, orderBy: [{ rating: "desc" }, { numReviews: "desc" }] }
  );
  return [
    ...bestSellers.map((product) => ({ ...product, reason: "Popular with shoppers" })),
    ...topRated.map((product) => ({ ...product, reason: "Top rated" })),
  ].slice(0, limit);
};

/**
 * A personal mix. Signals, strongest first: things bought (4), wishlisted (3)
 * and recently viewed on this device (2, fading with age). They weight
 * categories and brands, and a typical price; candidates are scored on those.
 * With no signals at all, it falls back to what's popular, and says so.
 */
const forYou = async ({ userId, seen = [], limit = 8 }) => {
  const [wishlist, purchased] = userId
    ? await Promise.all([
        prisma.wishlistItem.findMany({ where: { userId }, select: { productId: true } }),
        prisma.$queryRaw`
          SELECT DISTINCT i."productId"::text AS id
          FROM order_items i JOIN orders o ON o.id = i."orderId"
          WHERE o."userId" = ${userId}::uuid AND i."productId" IS NOT NULL
            AND o.status::text <> ALL(${LOST_STATUSES})`,
      ])
    : [[], []];

  const signals = [
    ...purchased.map((row) => ({ id: row.id, weight: 4, why: "you bought" })),
    ...wishlist.map((row) => ({ id: row.productId, weight: 3, why: "your wishlist" })),
    ...seen.map((id, index) => ({ id, weight: 2 * Math.max(0.4, 1 - index * 0.08), why: "you viewed" })),
  ];
  if (!signals.length) return { personalised: false, products: await popular(limit) };

  const signalProducts = await prisma.product.findMany({
    where: { id: { in: [...new Set(signals.map((signal) => signal.id))] } },
    select: { id: true, categoryRefId: true, category: true, brand: true, totalPrice: true },
  });
  const byId = new Map(signalProducts.map((product) => [product.id, product]));
  const categoryWeight = new Map();
  const brandWeight = new Map();
  const categoryReason = new Map();
  const prices = [];
  signals.forEach((signal) => {
    const product = byId.get(signal.id);
    if (!product) return;
    const key = product.categoryRefId || product.category;
    categoryWeight.set(key, (categoryWeight.get(key) || 0) + signal.weight);
    brandWeight.set(product.brand, (brandWeight.get(product.brand) || 0) + signal.weight);
    if (!categoryReason.has(key) || signal.weight > categoryReason.get(key).weight) {
      categoryReason.set(key, { weight: signal.weight, text: `Because ${signal.why} ${product.category}` });
    }
    prices.push(num(product.totalPrice));
  });
  prices.sort((a, b) => a - b);
  const typicalPrice = prices[Math.floor(prices.length / 2)] || 0;
  const maxCategory = Math.max(...categoryWeight.values(), 1);
  const maxBrand = Math.max(...brandWeight.values(), 1);

  const exclude = [...new Set([...purchased.map((row) => row.id), ...seen])];
  const topCategories = [...categoryWeight.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([key]) => key);
  const candidates = await findProducts(
    {
      ...ACTIVE,
      ...IN_STOCK,
      id: { notIn: exclude },
      OR: [{ categoryRefId: { in: topCategories } }, { category: { in: topCategories } }, { brand: { in: [...brandWeight.keys()] } }],
    },
    { take: 60 }
  );

  const scored = candidates
    .map((product) => {
      const key = product.categoryRef || product.category;
      const score =
        3 * ((categoryWeight.get(key) || 0) / maxCategory) +
        1.2 * ((brandWeight.get(product.brand) || 0) / maxBrand) +
        1.5 * priceCloseness(product.totalPrice, typicalPrice) +
        product.rating / 5;
      const reason =
        categoryReason.get(key)?.text || (brandWeight.has(product.brand) ? `More from ${product.brand}` : "Picked for you");
      return { ...product, reason, score: Math.round(score * 100) / 100 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Too few matches: top up with popular items rather than show a near-empty row.
  if (scored.length < limit) {
    const fill = await popular(limit - scored.length, [...exclude, ...scored.map((product) => product._id)]);
    scored.push(...fill);
  }
  return { personalised: true, products: scored };
};

module.exports = { searchByMeaning, searchByPhoto, aiStatus, assistant, similar, alternatives, boughtTogether, forYou, getProductsByIds, _parse: { parseBudget, parseSort, toAmount } };
