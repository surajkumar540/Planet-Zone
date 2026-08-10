/**
 * Establishes the inventory records that stock reservation now depends on.
 *
 * Before this, product stock lived only in `Product.countInStock`. Checkout
 * now reserves against `Inventory`, so every existing product needs a row
 * carrying its current stock, or every order would fail as out of stock.
 *
 * Safe to run repeatedly: existing inventory rows are left untouched.
 *
 *   npm run db:migrate:inventory
 */
const logger = require("../core/logger");
const { connectDatabase, disconnectDatabase } = require("../config/database");
const Product = require("../models/ProductModel");
const Inventory = require("../models/InventoryModel");
const Warehouse = require("../models/WarehouseModel");
const StockMovement = require("../models/StockMovementModel");
const { MOVEMENT_REASONS } = require("../constants/inventory");

const ensureDefaultWarehouse = async () => {
  const existing = await Warehouse.findOne({ isDefault: true });
  if (existing) return existing;

  const warehouse = await Warehouse.create({
    name: "Main Warehouse",
    code: "MAIN",
    isDefault: true,
  });
  logger.info("Created the default warehouse");
  return warehouse;
};

const seedInventory = async (warehouse) => {
  const products = await Product.find({}).select("name countInStock variants hasVariants").lean();

  let created = 0;
  let skipped = 0;

  for (const product of products) {
    // A product with variants stocks each variant separately.
    const units = product.hasVariants && product.variants?.length
      ? product.variants.map((variant) => ({
          variantSku: variant.sku,
          onHand: variant.countInStock || 0,
        }))
      : [{ variantSku: "", onHand: product.countInStock || 0 }];

    for (const unit of units) {
      const exists = await Inventory.findOne({
        product: product._id,
        variantSku: unit.variantSku,
        warehouse: warehouse._id,
      });

      if (exists) {
        skipped += 1;
        continue;
      }

      await Inventory.create({
        product: product._id,
        variantSku: unit.variantSku,
        warehouse: warehouse._id,
        onHand: unit.onHand,
        reserved: 0,
      });

      // An opening balance is recorded so the ledger explains where the
      // starting figure came from.
      await StockMovement.create({
        product: product._id,
        variantSku: unit.variantSku,
        warehouse: warehouse._id,
        quantity: unit.onHand,
        balanceAfter: unit.onHand,
        reason: MOVEMENT_REASONS.STOCKTAKE,
        note: "Opening balance migrated from product stock",
      });

      created += 1;
    }
  }

  logger.info(`Inventory: ${created} records created, ${skipped} already present`);
};

const run = async () => {
  await connectDatabase();
  try {
    const warehouse = await ensureDefaultWarehouse();
    await seedInventory(warehouse);
    logger.info("Inventory migration complete");
    process.exitCode = 0;
  } catch (error) {
    logger.error(`Inventory migration failed: ${error.message}`, { stack: error.stack });
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
};

run();
