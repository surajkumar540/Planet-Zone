const { Prisma } = require("@prisma/client");
const prisma = require("../../db/client");
const { toInventory, toStockMovement } = require("../../db/mappers");
const AppError = require("../../core/AppError");
const logger = require("../../core/logger");
const { withTransaction, inTransaction } = require("../../core/transaction");
const { MOVEMENT_REASONS } = require("../../constants/inventory");
const { escapeLike } = require("../../utils/schemas");

/**
 * Returns the default warehouse, creating one on first use.
 *
 * A store that has never configured locations still needs somewhere to book
 * stock against, so the first call establishes a "Main Warehouse". The insert
 * tolerates a concurrent first call instead of aborting its transaction.
 */
const getDefaultWarehouse = async (tx) => {
  const client = tx || prisma;

  const existing =
    (await client.warehouse.findFirst({ where: { isDefault: true, isActive: true } })) ||
    (await client.warehouse.findFirst({ where: { isActive: true } }));
  if (existing) return existing;

  logger.info("No warehouse configured; creating the default location");
  await client.warehouse.createMany({
    data: [{ name: "Main Warehouse", code: "MAIN", isDefault: true }],
    skipDuplicates: true,
  });
  return client.warehouse.findUnique({ where: { code: "MAIN" } });
};

/** Finds or creates the inventory row for a sellable unit at a location. */
const ensureRecord = async ({ productId, variantSku = "", warehouseId, tx }) => {
  const client = tx || prisma;
  const warehouse = warehouseId || (await getDefaultWarehouse(tx)).id;
  const unit = { productId, variantSku: variantSku || "", warehouseId: warehouse };

  // skipDuplicates keeps a concurrent first reservation from aborting the transaction.
  await client.inventory.createMany({ data: [unit], skipDuplicates: true });

  return client.inventory.findUnique({
    where: { productId_variantSku_warehouseId: unit },
  });
};

/**
 * Writes a ledger entry.
 *
 * Inside a transaction a failed insert aborts everything, so the error has to
 * propagate there. Outside one, a ledger failure must not undo a completed change.
 */
const recordMovement = async ({
  productId,
  variantSku = "",
  warehouseId,
  quantity,
  balanceAfter,
  reason,
  note,
  referenceType,
  referenceId,
  performedBy,
  tx,
}) => {
  const data = {
    productId,
    variantSku,
    warehouseId,
    quantity,
    balanceAfter,
    reason,
    note: note || "",
    referenceType: referenceType || "",
    referenceId: referenceId ? String(referenceId) : "",
    performedById: performedBy,
  };

  if (tx) {
    await tx.stockMovement.create({ data });
    return;
  }

  try {
    await prisma.stockMovement.create({ data });
  } catch (error) {
    logger.error(`Failed to write stock movement: ${error.message}`, { productId, reason });
  }
};

/**
 * Mirrors the inventory totals back onto the product row.
 *
 * The product's `countInStock` is what the storefront and existing clients
 * read, so it is kept as a cached sum of the inventory rows behind it.
 */
const syncProductStock = async (productId, tx) => {
  const client = tx || prisma;

  const rows = await client.inventory.groupBy({
    by: ["variantSku"],
    where: { productId },
    _sum: { onHand: true, reserved: true },
  });
  if (!rows.length) return;

  const product = await client.product.findUnique({
    where: { id: productId },
    select: { hasVariants: true, variants: { select: { id: true, sku: true, isActive: true, countInStock: true } } },
  });
  if (!product) return;

  const available = new Map(
    rows.map((row) => [row.variantSku, Math.max(0, row._sum.onHand - row._sum.reserved)])
  );

  if (!product.hasVariants) {
    if (available.has("")) {
      await client.product.update({
        where: { id: productId },
        data: { countInStock: available.get("") },
      });
    }
    return;
  }

  let total = 0;
  for (const variant of product.variants) {
    const count = available.has(variant.sku) ? available.get(variant.sku) : variant.countInStock;
    if (available.has(variant.sku)) {
      await client.productVariant.update({
        where: { id: variant.id },
        data: { countInStock: count },
      });
    }
    if (variant.isActive) total += count;
  }
  await client.product.update({ where: { id: productId }, data: { countInStock: total } });
};

/**
 * Applies a signed change to on-hand stock.
 *
 * A decrement is conditional on sufficient stock remaining, expressed in the
 * filter so two concurrent callers cannot both pass the check.
 */
const adjustStock = async ({
  productId,
  variantSku = "",
  warehouseId,
  quantity,
  reason = MOVEMENT_REASONS.ADJUSTMENT,
  note,
  referenceType,
  referenceId,
  performedBy,
  tx,
}) =>
  inTransaction(tx, async (client) => {
    const record = await ensureRecord({ productId, variantSku, warehouseId, tx: client });

    // Guard only on the way down; adding stock has no lower bound to violate.
    const { count } = await client.inventory.updateMany({
      where: { id: record.id, ...(quantity < 0 ? { onHand: { gte: Math.abs(quantity) } } : {}) },
      data: { onHand: { increment: quantity } },
    });
    if (count === 0) throw AppError.conflict("Insufficient stock at this location");

    const updated = await client.inventory.findUnique({ where: { id: record.id } });

    await recordMovement({
      productId,
      variantSku,
      warehouseId: updated.warehouseId,
      quantity,
      balanceAfter: updated.onHand,
      reason,
      note,
      referenceType,
      referenceId,
      performedBy,
      tx: client,
    });

    await syncProductStock(productId, client);
    return toInventory(updated);
  });

/**
 * Promises stock to an order without removing it from the shelf.
 *
 * The reservation is conditional on enough unreserved stock existing, checked
 * by the UPDATE itself, so the same unit cannot be sold twice while an order
 * is being paid for. Comparing two columns with an expression needs raw SQL.
 */
const reserve = async ({ productId, variantSku = "", warehouseId, qty, referenceId, tx }) =>
  inTransaction(tx, async (client) => {
    const record = await ensureRecord({ productId, variantSku, warehouseId, tx: client });

    const [updated] = await client.$queryRaw`
      UPDATE inventory
      SET reserved = reserved + ${qty}::int, "updatedAt" = NOW()
      WHERE id = ${record.id}::uuid AND "onHand" - reserved >= ${qty}::int
      RETURNING "onHand", reserved, "warehouseId"::text AS "warehouseId"`;

    if (!updated) throw AppError.conflict("Insufficient stock available");

    await recordMovement({
      productId,
      variantSku,
      warehouseId: updated.warehouseId,
      quantity: -qty,
      balanceAfter: updated.onHand - updated.reserved,
      reason: MOVEMENT_REASONS.RESERVATION,
      referenceType: "Order",
      referenceId,
      tx: client,
    });

    return updated;
  });

/** Releases a reservation, e.g. when an order is cancelled. */
const release = async ({ productId, variantSku = "", warehouseId, qty, referenceId, tx }) =>
  inTransaction(tx, async (client) => {
    const record = await ensureRecord({ productId, variantSku, warehouseId, tx: client });

    // Clamped so a double release cannot drive the counter negative.
    const [updated] = await client.$queryRaw`
      UPDATE inventory
      SET reserved = GREATEST(reserved - ${qty}::int, 0), "updatedAt" = NOW()
      WHERE id = ${record.id}::uuid
      RETURNING "onHand", reserved, "warehouseId"::text AS "warehouseId"`;

    await recordMovement({
      productId,
      variantSku,
      warehouseId: updated.warehouseId,
      quantity: qty,
      balanceAfter: updated.onHand - updated.reserved,
      reason: MOVEMENT_REASONS.RELEASE,
      referenceType: "Order",
      referenceId,
      tx: client,
    });

    return updated;
  });

/**
 * Converts a reservation into a dispatch: the units leave the shelf and the
 * reservation that held them is discharged.
 */
const fulfil = async ({ productId, variantSku = "", warehouseId, qty, referenceId, tx }) =>
  inTransaction(tx, async (client) => {
    const record = await ensureRecord({ productId, variantSku, warehouseId, tx: client });

    const [updated] = await client.$queryRaw`
      UPDATE inventory
      SET "onHand" = "onHand" - ${qty}::int,
          reserved = GREATEST(reserved - ${qty}::int, 0),
          "updatedAt" = NOW()
      WHERE id = ${record.id}::uuid AND "onHand" >= ${qty}::int
      RETURNING "onHand", reserved, "warehouseId"::text AS "warehouseId"`;

    if (!updated) throw AppError.conflict("Insufficient stock to fulfil");

    await recordMovement({
      productId,
      variantSku,
      warehouseId: updated.warehouseId,
      quantity: -qty,
      balanceAfter: updated.onHand,
      reason: MOVEMENT_REASONS.SALE,
      referenceType: "Order",
      referenceId,
      tx: client,
    });

    await syncProductStock(productId, client);
    return updated;
  });

/* --------------------------------- Queries --------------------------------- */

/** Allow-list of sort keys; these are spliced into SQL, so never pass client text. */
const INVENTORY_SORT = {
  available: `"onHand" - reserved`,
  onHand: `i."onHand"`,
  reserved: `i.reserved`,
  variantSku: `i."variantSku"`,
  name: `p.name`,
  category: `p.category`,
  warehouseName: `w.name`,
  createdAt: `i."createdAt"`,
  updatedAt: `i."updatedAt"`,
};

/**
 * Stock rows joined to their product and warehouse.
 *
 * Raw SQL because search, the low-stock filter and the default sort all work on
 * joined or computed columns that the query builder cannot order by.
 */
const list = async ({ page, limit, sort, search, warehouse, lowStock }) => {
  const conditions = [];

  if (warehouse) conditions.push(Prisma.sql`i."warehouseId" = ${warehouse}::uuid`);
  if (search) {
    const pattern = `%${escapeLike(search)}%`;
    conditions.push(
      Prisma.sql`(p.name ILIKE ${pattern} OR i."variantSku" ILIKE ${pattern} OR p.category ILIKE ${pattern})`
    );
  }
  if (lowStock) conditions.push(Prisma.sql`i."onHand" - i.reserved <= i."reorderPoint"`);

  const where = conditions.length
    ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
    : Prisma.empty;

  const [field, direction] = (sort || "available:asc").split(":");
  const orderColumn = Object.hasOwn(INVENTORY_SORT, field)
    ? INVENTORY_SORT[field]
    : INVENTORY_SORT.available;
  const orderBy = Prisma.raw(`${orderColumn} ${direction === "desc" ? "DESC" : "ASC"}, i.id ASC`);

  const [rows, [{ total }]] = await Promise.all([
    prisma.$queryRaw`
      SELECT i.id::text AS "_id",
             i."productId"::text AS product,
             i."variantSku",
             i."warehouseId"::text AS warehouse,
             i."onHand", i.reserved, i.incoming, i."reorderPoint", i."reorderQuantity",
             i."binLocation", i."lastCountedAt", i."createdAt", i."updatedAt",
             i."onHand" - i.reserved AS available,
             p.name, p.image, p.category,
             w.name AS "warehouseName"
      FROM inventory i
      JOIN products p ON p.id = i."productId"
      LEFT JOIN warehouses w ON w.id = i."warehouseId"
      ${where}
      ORDER BY ${orderBy}
      OFFSET ${(page - 1) * limit}::int LIMIT ${limit}::int`,
    prisma.$queryRaw`
      SELECT COUNT(*)::int AS total
      FROM inventory i
      JOIN products p ON p.id = i."productId"
      LEFT JOIN warehouses w ON w.id = i."warehouseId"
      ${where}`,
  ]);

  return { items: rows, total, page, limit };
};

const movements = async ({ page, limit, product, warehouse, reason }) => {
  const where = {
    ...(product ? { productId: product } : {}),
    ...(warehouse ? { warehouseId: warehouse } : {}),
    ...(reason ? { reason } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        product: { select: { id: true, name: true, image: true } },
        warehouse: { select: { id: true, name: true, code: true } },
        performedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return { items: rows.map(toStockMovement), total, page, limit };
};

/** Sets stock to a counted figure, recording the difference as a stocktake. */
const setStockLevel = async ({
  productId,
  variantSku = "",
  warehouseId,
  onHand,
  note,
  performedBy,
}) =>
  withTransaction(async (tx) => {
    const record = await ensureRecord({ productId, variantSku, warehouseId, tx });

    // Locked so the recorded difference matches the balance it replaced.
    const [{ onHand: previous }] = await tx.$queryRaw`
      SELECT "onHand" FROM inventory WHERE id = ${record.id}::uuid FOR UPDATE`;

    const updated = await tx.inventory.update({
      where: { id: record.id },
      data: { onHand, lastCountedAt: new Date() },
    });

    await recordMovement({
      productId,
      variantSku,
      warehouseId: updated.warehouseId,
      quantity: onHand - previous,
      balanceAfter: onHand,
      reason: MOVEMENT_REASONS.STOCKTAKE,
      note,
      performedBy,
      tx,
    });

    await syncProductStock(productId, tx);
    return toInventory(updated);
  });

/**
 * Ensures every sellable unit of a product has an inventory row.
 *
 * Called after a product is created or its variants change, so a newly added
 * variant is immediately stockable rather than failing its first reservation.
 * Existing rows keep their balances; only the opening figure is seeded.
 */
const syncInventoryFromProduct = async (product) => {
  const warehouse = await getDefaultWarehouse();

  const units =
    product.hasVariants && product.variants?.length
      ? product.variants.map((variant) => ({
          variantSku: variant.sku,
          openingStock: variant.countInStock || 0,
        }))
      : [{ variantSku: "", openingStock: product.countInStock || 0 }];

  for (const unit of units) {
    const key = {
      productId: product._id,
      variantSku: unit.variantSku,
      warehouseId: warehouse.id,
    };
    const existing = await prisma.inventory.findUnique({
      where: { productId_variantSku_warehouseId: key },
    });
    if (existing) continue;

    await prisma.inventory.create({ data: { ...key, onHand: unit.openingStock, reserved: 0 } });

    await recordMovement({
      productId: product._id,
      variantSku: unit.variantSku,
      warehouseId: warehouse.id,
      quantity: unit.openingStock,
      balanceAfter: unit.openingStock,
      reason: MOVEMENT_REASONS.STOCKTAKE,
      note: "Opening balance",
    });
  }
};

module.exports = {
  getDefaultWarehouse,
  ensureRecord,
  syncInventoryFromProduct,
  adjustStock,
  setStockLevel,
  reserve,
  release,
  fulfil,
  syncProductStock,
  list,
  movements,
};
