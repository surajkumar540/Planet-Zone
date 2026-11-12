const prisma = require("../../db/client");
const AppError = require("../../core/AppError");
const logger = require("../../core/logger");
const { withTransaction } = require("../../core/transaction");
const productRepository = require("./product.repository");
const inventoryService = require("../inventory/inventory.service");
const { parseSort, searchFilter, sortable, escapeLike } = require("../../utils/schemas");
const { slugify } = require("../../utils/slug");
const { deriveTotalPrice } = require("../../utils/money");

const { lowStockFilter, WITH_VARIANTS } = productRepository;

const SORTABLE = sortable(
  "createdAt",
  "updatedAt",
  "name",
  "price",
  "totalPrice",
  "countInStock",
  "rating",
  "numReviews",
  "brand",
  "category"
);

/** "A,B" -> ["A","B"]; a single value stays a one-item list. */
const splitList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

/** Equality for one value, IN for several. */
const oneOrMany = (values) => (values.length === 1 ? values[0] : { in: values });

/** A department id plus every category beneath it. */
const departmentIds = async (dept) => {
  const descendants = await prisma.category.findMany({
    where: { ancestors: { has: dept } },
    select: { id: true },
  });
  return [dept, ...descendants.map((category) => category.id)];
};

/** Translates the validated list query into a Prisma filter. */
const buildFilter = ({
  search,
  category,
  categoryRef,
  deptIds,
  onSale,
  brand,
  minPrice,
  maxPrice,
  inStock,
  lowStock,
  minRating,
  isFeatured,
  hasVariants,
  includeInactive,
}) => {
  const where = {};

  // Inactive products are hidden from the storefront; the dashboard opts in.
  if (!includeInactive) where.isActive = true;

  if (search) Object.assign(where, searchFilter(search, ["name", "brand", "category", "sku"]));
  if (splitList(category).length) where.category = oneOrMany(splitList(category));
  if (categoryRef) where.categoryRefId = categoryRef;
  if (deptIds?.length) where.categoryRefId = { in: deptIds };
  if (splitList(brand).length) where.brand = oneOrMany(splitList(brand));
  if (onSale) where.discount = { gt: 0 };
  if (isFeatured !== undefined) where.isFeatured = isFeatured;
  if (hasVariants !== undefined) where.hasVariants = hasVariants;
  if (minRating !== undefined) where.rating = { gte: minRating };

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.totalPrice = {};
    if (minPrice !== undefined) where.totalPrice.gte = minPrice;
    if (maxPrice !== undefined) where.totalPrice.lte = maxPrice;
  }

  // Held in AND because both of these constrain countInStock.
  const stock = [];
  if (inStock === true) stock.push({ countInStock: { gt: 0 } });
  if (inStock === false) stock.push({ countInStock: { lte: 0 } });
  if (lowStock) stock.push(lowStockFilter());
  if (stock.length) where.AND = stock;

  return where;
};

/** Resolves the async parts of a list query (department subtree) before filtering. */
const resolveQuery = async (query) => ({
  ...query,
  deptIds: query.dept ? await departmentIds(query.dept) : undefined,
});

const listProducts = async (rawQuery) => {
  const query = await resolveQuery(rawQuery);
  const where = buildFilter(query);
  return productRepository.paginate(where, {
    page: query.page,
    limit: query.limit,
    orderBy: parseSort(query.sort, SORTABLE),
  });
};

const getProductById = async (id) => {
  const product = await productRepository.findById(id, {
    include: {
      ...WITH_VARIANTS,
      reviews: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      },
    },
  });
  if (!product) throw AppError.notFound("Product not found");
  return product;
};

/**
 * Keeps the denormalised `category` name aligned with `categoryRef`.
 *
 * The string field is what the storefront filters on and what order snapshots
 * copy, so it must never disagree with the linked category.
 */
const syncCategoryName = async (payload) => {
  if (!payload.categoryRef) return payload;

  const category = await prisma.category.findUnique({
    where: { id: payload.categoryRef },
    select: { name: true },
  });
  if (!category) throw AppError.badRequest("Category not found");
  return { ...payload, category: category.name };
};

/**
 * Computes the derived fields, so a stored total can never drift from the
 * values it came from: the slug follows the name, every tax-inclusive price is
 * recomputed, and a product with variants reports their summed stock.
 */
const deriveFields = (merged, { nameChanged }) => {
  const variants = (merged.variants || []).map((variant, position) => {
    // Variants inherit the product's tax rate unless they set their own.
    const gst = variant.gst === undefined || variant.gst === null ? merged.gst || 0 : variant.gst;
    return {
      position,
      sku: String(variant.sku).trim().toUpperCase(),
      options: variant.options,
      price: variant.price,
      discount: variant.discount || 0,
      gst,
      totalPrice: deriveTotalPrice(variant.price, variant.discount, gst),
      countInStock: variant.countInStock || 0,
      lowStockThreshold: variant.lowStockThreshold ?? 5,
      image: variant.image || "",
      barcode: variant.barcode || "",
      weightGrams: variant.weightGrams || 0,
      isActive: variant.isActive !== false,
    };
  });

  const hasVariants = variants.length > 0;

  return {
    variants,
    columns: {
      slug: nameChanged || !merged.slug ? slugify(merged.name) : merged.slug,
      totalPrice: deriveTotalPrice(merged.price, merged.discount, merged.gst),
      hasVariants,
      // With variants, product-level stock is the sum of its active children.
      countInStock: hasVariants
        ? variants.filter((v) => v.isActive).reduce((sum, v) => sum + v.countInStock, 0)
        : merged.countInStock,
    },
  };
};

/** Splits a validated payload into plain column values. */
const toColumns = ({ categoryRef, variants, ...rest }) => ({
  ...rest,
  ...(categoryRef !== undefined ? { categoryRefId: categoryRef } : {}),
});

const createProduct = async (userId, payload) => {
  // totalPrice is derived here, never accepted from the client.
  const body = await syncCategoryName(payload);
  const { variants, columns } = deriveFields(body, { nameChanged: true });

  const product = await productRepository.create({
    ...toColumns(body),
    ...columns,
    userId,
    variants: { create: variants },
  });

  // Give the new product an inventory row so it is immediately sellable.
  await inventoryService
    .syncInventoryFromProduct(product)
    .catch((error) => logger.error(`Failed to seed inventory: ${error.message}`));

  return product;
};

/**
 * Applies a partial update, recomputing derived fields from the merged result.
 *
 * Variants are matched by SKU so a kept variant retains its id, while any SKU
 * missing from the payload is removed.
 */
const updateProduct = async (id, payload) => {
  const existing = await productRepository.findById(id);
  if (!existing) throw AppError.notFound("Product not found");

  const body = await syncCategoryName(payload);
  const { variants, columns } = deriveFields(
    { ...existing, ...body },
    { nameChanged: body.name !== undefined && body.name !== existing.name }
  );

  const product = await withTransaction(async (tx) => {
    if (body.variants !== undefined) {
      await tx.productVariant.deleteMany({
        where: { productId: id, sku: { notIn: variants.map((variant) => variant.sku) } },
      });
      for (const variant of variants) {
        await tx.productVariant.upsert({
          where: { productId_sku: { productId: id, sku: variant.sku } },
          create: { ...variant, productId: id },
          update: variant,
        });
      }
    }
    return productRepository.updateById(id, { ...toColumns(body), ...columns }, { tx });
  });

  await inventoryService
    .syncInventoryFromProduct(product)
    .catch((error) => logger.error(`Failed to sync inventory: ${error.message}`));

  return product;
};

const deleteProduct = async (id) => {
  const product = await productRepository.deleteById(id);
  if (!product) throw AppError.notFound("Product not found");
  return product;
};

/** Orders that have not reached the customer yet, but are on their way. */
const IN_PROGRESS = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery"];

/**
 * Whether a customer may review a product: only after an order containing it
 * has been delivered to them. Reviews from people who never owned the product
 * are what make store ratings untrustworthy.
 *
 * @returns {{ canReview: boolean, reason: "delivered"|"in_transit"|"not_purchased", review: object|null }}
 */
const getReviewEligibility = async ({ productId, userId }) => {
  const [delivered, inTransit, review] = await Promise.all([
    prisma.orderItem.count({
      where: { productId, order: { userId, status: "delivered" } },
    }),
    prisma.orderItem.count({
      where: { productId, order: { userId, status: { in: IN_PROGRESS } } },
    }),
    prisma.review.findUnique({
      where: { productId_userId: { productId, userId } },
      select: { id: true, rating: true, comment: true, isApproved: true },
    }),
  ]);

  const reason = delivered ? "delivered" : inTransit ? "in_transit" : "not_purchased";
  return {
    canReview: delivered > 0,
    reason,
    review: review ? { _id: review.id, rating: review.rating, comment: review.comment, isApproved: review.isApproved } : null,
  };
};

/** Adds or replaces the caller's review and refreshes the rating summary. */
const upsertReview = async ({ productId, user, rating, comment }) => {
  const product = await productRepository.count({ id: productId });
  if (!product) throw AppError.notFound("Product not found");

  const { canReview, reason } = await getReviewEligibility({ productId, userId: user._id });
  if (!canReview) {
    throw AppError.forbidden(
      reason === "in_transit"
        ? "You can review this product once your order is delivered."
        : "Only customers who bought this product can review it."
    );
  }

  return withTransaction(async (tx) => {
    await tx.review.upsert({
      where: { productId_userId: { productId, userId: user._id } },
      create: {
        productId,
        userId: user._id,
        name: [user.firstName, user.lastName].filter(Boolean).join(" "),
        rating,
        comment,
      },
      update: { rating, comment },
    });
    return productRepository.refreshRating(productId, tx);
  });
};

const deleteReview = async ({ productId, reviewUserId }) => {
  const product = await productRepository.count({ id: productId });
  if (!product) throw AppError.notFound("Product not found");

  return withTransaction(async (tx) => {
    const { count } = await tx.review.deleteMany({ where: { productId, userId: reviewUserId } });
    if (count === 0) throw AppError.notFound("Review not found");
    return productRepository.refreshRating(productId, tx);
  });
};

const PRICE_BUCKETS = 18;

/**
 * Live counts for every filter option.
 *
 * Each dimension is counted with every *other* filter applied but not its
 * own, which is how faceted search works on large shops: ticking one brand
 * still shows how many products the other brands would add, and an option
 * that would leave nothing can be shown as such.
 */
const getFacets = async (rawQuery) => {
  const query = await resolveQuery(rawQuery);
  const without = (...keys) => {
    const copy = { ...query };
    for (const key of keys) delete copy[key];
    return buildFilter(copy);
  };

  const [categories, brands, prices, ratings, onSale, inStock, departments] = await Promise.all([
    prisma.product.groupBy({ by: ["category"], where: without("category"), _count: { _all: true } }),
    prisma.product.groupBy({ by: ["brand"], where: without("brand"), _count: { _all: true } }),
    prisma.product.findMany({ where: without("minPrice", "maxPrice"), select: { totalPrice: true } }),
    Promise.all(
      [4, 3, 2].map((stars) =>
        prisma.product.count({ where: { ...without("minRating"), rating: { gte: stars } } })
      )
    ),
    prisma.product.count({ where: { ...without("onSale"), discount: { gt: 0 } } }),
    prisma.product.count({ where: { ...without("inStock"), countInStock: { gt: 0 } } }),
    prisma.product.groupBy({ by: ["categoryRefId"], where: without("dept", "deptIds", "category"), _count: { _all: true } }),
  ]);

  // Price histogram over the matching products.
  const values = prices.map((row) => Number(row.totalPrice));
  const min = values.length ? Math.floor(Math.min(...values)) : 0;
  const max = values.length ? Math.ceil(Math.max(...values)) : 0;
  // Shop prices span orders of magnitude (₹50 spices to ₹10 lakh watches). On a
  // linear axis nearly every product lands in the first bar, so a wide spread
  // switches to a logarithmic axis, where each bar covers the same ratio.
  const scale = min > 0 && max / min >= 20 ? "log" : "linear";
  const edgeAt = (step) =>
    scale === "log"
      ? min * (max / min) ** (step / PRICE_BUCKETS)
      : min + ((max - min) * step) / PRICE_BUCKETS;
  const histogram = Array.from({ length: PRICE_BUCKETS }, (_, index) => ({
    from: Math.round(edgeAt(index)),
    to: Math.round(edgeAt(index + 1)),
    count: 0,
  }));
  for (const value of values) {
    const position =
      scale === "log" ? Math.log(value / min) / Math.log(max / min) : (value - min) / Math.max(1, max - min);
    const index = Math.min(PRICE_BUCKETS - 1, Math.max(0, Math.floor(position * PRICE_BUCKETS)));
    histogram[index].count += 1;
  }

  // Department counts roll leaf categories up to their top-level ancestor.
  const tree = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true, parentId: true, ancestors: true, position: true },
  });
  const rootOf = new Map(tree.map((node) => [node.id, node.ancestors[0] || node.id]));
  const deptCounts = new Map();
  for (const row of departments) {
    const root = row.categoryRefId && rootOf.get(row.categoryRefId);
    if (root) deptCounts.set(root, (deptCounts.get(root) || 0) + row._count._all);
  }

  const byCount = (a, b) => b.count - a.count || a.name.localeCompare(b.name);

  return {
    departments: tree
      .filter((node) => !node.parentId)
      .sort((a, b) => a.position - b.position)
      .map((node) => ({ _id: node.id, name: node.name, count: deptCounts.get(node.id) || 0 })),
    categories: categories
      .map((row) => ({ name: row.category, count: row._count._all }))
      .filter((row) => row.name)
      .sort(byCount),
    brands: brands
      .map((row) => ({ name: row.brand, count: row._count._all }))
      .filter((row) => row.name)
      .sort(byCount),
    price: { min, max, scale, histogram },
    ratings: [4, 3, 2].map((stars, index) => ({ stars, count: ratings[index] })),
    onSale,
    inStock,
  };
};

/** How well a name matches the typed text: starts with > word starts with > contains. */
const matchRank = (name, q) => {
  const text = name.toLowerCase();
  const term = q.toLowerCase();
  if (text.startsWith(term)) return 0;
  if (text.split(/[\s-]+/).some((word) => word.startsWith(term))) return 1;
  return 2;
};

/**
 * Search-as-you-type: a few products plus matching categories and brands.
 * Kept to three small indexed queries so it can run on every keystroke pause.
 */
const suggest = async ({ q, limit }) => {
  const contains = { contains: escapeLike(q), mode: "insensitive" };
  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, OR: [{ name: contains }, { brand: contains }, { category: contains }] },
      select: { id: true, name: true, image: true, totalPrice: true, price: true, discount: true, brand: true, category: true },
      take: 40,
    }),
    prisma.category.findMany({
      where: { isActive: true, name: contains },
      select: { id: true, name: true, parentId: true },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isActive: true, brand: contains },
      distinct: ["brand"],
      select: { brand: true },
      take: 8,
    }),
  ]);

  const ranked = products
    .map((product) => ({ product, rank: Math.min(matchRank(product.name, q), matchRank(product.brand, q) + 1) }))
    .sort((a, b) => a.rank - b.rank || a.product.name.localeCompare(b.product.name))
    .slice(0, limit)
    .map(({ product }) => ({
      _id: product.id,
      name: product.name,
      image: product.image,
      brand: product.brand,
      category: product.category,
      totalPrice: Number(product.totalPrice),
      price: Number(product.price),
      discount: Number(product.discount),
    }));

  return {
    products: ranked,
    categories: categories
      .sort((a, b) => matchRank(a.name, q) - matchRank(b.name, q))
      .slice(0, 4)
      .map((category) => ({ _id: category.id, name: category.name, isDepartment: !category.parentId })),
    brands: brands
      .map((row) => row.brand)
      .sort((a, b) => matchRank(a, q) - matchRank(b, q))
      .slice(0, 4),
  };
};

const getFilterOptions = async () => {
  const [categories, brands] = await Promise.all([
    productRepository.listCategories(),
    productRepository.listBrands(),
  ]);
  return { categories: categories.filter(Boolean).sort(), brands: brands.filter(Boolean).sort() };
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  upsertReview,
  deleteReview,
  getReviewEligibility,
  getFilterOptions,
  getFacets,
  suggest,
};
