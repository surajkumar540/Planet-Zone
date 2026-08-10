const mongoose = require("mongoose");
const AppError = require("../../core/AppError");
const logger = require("../../core/logger");
const Inventory = require("../../models/InventoryModel");
const StockMovement = require("../../models/StockMovementModel");
const Warehouse = require("../../models/WarehouseModel");
const Product = require("../../models/ProductModel");
const { MOVEMENT_REASONS } = require("../../constants/inventory");
const { parseSort, searchFilter } = require("../../utils/schemas");

/**
 * Returns the default warehouse, creating one on first use.
 *
 * A store that has never configured locations still needs somewhere to book
 * stock against, so the first call establishes a "Main Warehouse".
 */
const getDefaultWarehouse = async () => {
  let warehouse = await Warehouse.findOne({ isDefault: true, isActive: true });
  if (warehouse) return warehouse;

  warehouse = await Warehouse.findOne({ isActive: true });
  if (warehouse) return warehouse;

  logger.info("No warehouse configured; creating the default location");
  return Warehouse.create({ name: "Main Warehouse", code: "MAIN", isDefault: true });
};

/** Finds or creates the inventory row for a sellable unit at a location. */
const ensureRecord = async ({ productId, variantSku = "", warehouseId, session }) => {
  const warehouse = warehouseId || (await getDefaultWarehouse())._id;

  const existing = await Inventory.findOneAndUpdate(
    { product: productId, variantSku: variantSku || "", warehouse },
    { $setOnInsert: { onHand: 0, reserved: 0 } },
    { upsert: true, new: true, setDefaultsOnInsert: true, session }
  );
  return existing;
};

/** Writes a ledger entry. Never throws into the caller's transaction. */
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
  session,
}) => {
  try {
    await StockMovement.create(
      [
        {
          product: productId,
          variantSku,
          warehouse: warehouseId,
          quantity,
          balanceAfter,
          reason,
          note: note || "",
          referenceType: referenceType || "",
          referenceId: referenceId ? String(referenceId) : "",
          performedBy,
        },
      ],
      session ? { session } : {}
    );
  } catch (error) {
    logger.error(`Failed to write stock movement: ${error.message}`, { productId, reason });
  }
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
  session,
}) => {
  const record = await ensureRecord({ productId, variantSku, warehouseId, session });

  const filter = { _id: record._id };
  // Guard only on the way down; adding stock has no lower bound to violate.
  if (quantity < 0) filter.onHand = { $gte: Math.abs(quantity) };

  const updated = await Inventory.findOneAndUpdate(
    filter,
    { $inc: { onHand: quantity } },
    { new: true, session }
  );

  if (!updated) {
    throw AppError.conflict("Insufficient stock at this location");
  }

  await recordMovement({
    productId,
    variantSku,
    warehouseId: updated.warehouse,
    quantity,
    balanceAfter: updated.onHand,
    reason,
    note,
    referenceType,
    referenceId,
    performedBy,
    session,
  });

  await syncProductStock(productId, session);
  return updated;
};

/**
 * Mirrors the inventory totals back onto the product document.
 *
 * The product's `countInStock` is what the storefront and existing clients
 * read, so it is kept as a cached sum of the inventory rows behind it.
 */
const syncProductStock = async (productId, session) => {
  // Aggregation does not cast automatically, so the id is converted explicitly.
  const productObjectId = new mongoose.Types.ObjectId(String(productId));

  const rows = await Inventory.aggregate([
    { $match: { product: productObjectId } },
    {
      $group: {
        _id: "$variantSku",
        onHand: { $sum: "$onHand" },
        reserved: { $sum: "$reserved" },
      },
    },
  ]).session(session || null);

  if (!rows.length) return;

  const product = await Product.findById(productId).session(session || null);
  if (!product) return;

  const totals = new Map(rows.map((row) => [row._id || "", row]));

  if (product.hasVariants) {
    for (const variant of product.variants) {
      const row = totals.get(variant.sku);
      if (row) variant.countInStock = Math.max(0, row.onHand - row.reserved);
    }
  } else {
    const row = totals.get("");
    if (row) product.countInStock = Math.max(0, row.onHand - row.reserved);
  }

  await product.save({ session });
};

/**
 * Promises stock to an order without removing it from the shelf.
 *
 * Reservation is conditional on enough unreserved stock existing, so the same
 * unit cannot be sold twice while an order is being paid for.
 */
const reserve = async ({ productId, variantSku = "", warehouseId, qty, referenceId, session }) => {
  const record = await ensureRecord({ productId, variantSku, warehouseId, session });

  const updated = await Inventory.findOneAndUpdate(
    { _id: record._id, $expr: { $gte: [{ $subtract: ["$onHand", "$reserved"] }, qty] } },
    { $inc: { reserved: qty } },
    { new: true, session }
  );

  if (!updated) throw AppError.conflict("Insufficient stock available");

  await recordMovement({
    productId,
    variantSku,
    warehouseId: updated.warehouse,
    quantity: -qty,
    balanceAfter: updated.onHand - updated.reserved,
    reason: MOVEMENT_REASONS.RESERVATION,
    referenceType: "Order",
    referenceId,
    session,
  });

  return updated;
};

/** Releases a reservation, e.g. when an order is cancelled. */
const release = async ({ productId, variantSku = "", warehouseId, qty, referenceId, session }) => {
  const record = await ensureRecord({ productId, variantSku, warehouseId, session });

  const updated = await Inventory.findOneAndUpdate(
    { _id: record._id },
    // Clamped so a double release cannot drive the counter negative.
    { $inc: { reserved: -Math.min(qty, record.reserved) } },
    { new: true, session }
  );

  await recordMovement({
    productId,
    variantSku,
    warehouseId: updated.warehouse,
    quantity: qty,
    balanceAfter: updated.onHand - updated.reserved,
    reason: MOVEMENT_REASONS.RELEASE,
    referenceType: "Order",
    referenceId,
    session,
  });

  return updated;
};

/**
 * Converts a reservation into a dispatch: the units leave the shelf and the
 * reservation that held them is discharged.
 */
const fulfil = async ({ productId, variantSku = "", warehouseId, qty, referenceId, session }) => {
  const record = await ensureRecord({ productId, variantSku, warehouseId, session });

  const updated = await Inventory.findOneAndUpdate(
    { _id: record._id, onHand: { $gte: qty } },
    { $inc: { onHand: -qty, reserved: -Math.min(qty, record.reserved) } },
    { new: true, session }
  );

  if (!updated) throw AppError.conflict("Insufficient stock to fulfil");

  await recordMovement({
    productId,
    variantSku,
    warehouseId: updated.warehouse,
    quantity: -qty,
    balanceAfter: updated.onHand,
    reason: MOVEMENT_REASONS.SALE,
    referenceType: "Order",
    referenceId,
    session,
  });

  await syncProductStock(productId, session);
  return updated;
};

/* --------------------------------- Queries --------------------------------- */

const list = async ({ page, limit, sort, search, warehouse, lowStock }) => {
  const match = { ...(warehouse ? { warehouse } : {}) };
  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "productDoc",
      },
    },
    { $unwind: "$productDoc" },
    {
      $lookup: {
        from: "warehouses",
        localField: "warehouse",
        foreignField: "_id",
        as: "warehouseDoc",
      },
    },
    { $unwind: { path: "$warehouseDoc", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        available: { $subtract: ["$onHand", "$reserved"] },
        name: "$productDoc.name",
        image: "$productDoc.image",
        category: "$productDoc.category",
        warehouseName: "$warehouseDoc.name",
      },
    },
  ];

  if (search) {
    pipeline.push({ $match: searchFilter(search, ["name", "variantSku", "category"]) });
  }
  if (lowStock) {
    pipeline.push({ $match: { $expr: { $lte: ["$available", "$reorderPoint"] } } });
  }

  pipeline.push({
    $project: { productDoc: 0, warehouseDoc: 0 },
  });

  const [result] = await Inventory.aggregate([
    ...pipeline,
    {
      $facet: {
        items: [{ $sort: parseSort(sort, { available: 1 }) }, { $skip: skip }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    },
  ]);

  return {
    items: result?.items || [],
    total: result?.total?.[0]?.count || 0,
    page,
    limit,
  };
};

const movements = async ({ page, limit, product, warehouse, reason }) => {
  const filter = {
    ...(product ? { product } : {}),
    ...(warehouse ? { warehouse } : {}),
    ...(reason ? { reason } : {}),
  };
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    StockMovement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("product", "name image")
      .populate("warehouse", "name code")
      .populate("performedBy", "firstName lastName")
      .lean(),
    StockMovement.countDocuments(filter),
  ]);

  return { items, total, page, limit };
};

/** Sets stock to a counted figure, recording the difference as a stocktake. */
const setStockLevel = async ({
  productId,
  variantSku = "",
  warehouseId,
  onHand,
  note,
  performedBy,
}) => {
  const record = await ensureRecord({ productId, variantSku, warehouseId });
  const delta = onHand - record.onHand;

  record.onHand = onHand;
  record.lastCountedAt = new Date();
  await record.save();

  await recordMovement({
    productId,
    variantSku,
    warehouseId: record.warehouse,
    quantity: delta,
    balanceAfter: onHand,
    reason: MOVEMENT_REASONS.STOCKTAKE,
    note,
    performedBy,
  });

  await syncProductStock(productId);
  return record;
};

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
    const existing = await Inventory.findOne({
      product: product._id,
      variantSku: unit.variantSku,
      warehouse: warehouse._id,
    });
    if (existing) continue;

    await Inventory.create({
      product: product._id,
      variantSku: unit.variantSku,
      warehouse: warehouse._id,
      onHand: unit.openingStock,
      reserved: 0,
    });

    await recordMovement({
      productId: product._id,
      variantSku: unit.variantSku,
      warehouseId: warehouse._id,
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
