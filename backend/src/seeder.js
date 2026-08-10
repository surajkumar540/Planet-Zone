/**
 * Development data seeder.
 *
 *   npm run data:import    populate users and products
 *   npm run data:destroy   remove seeded collections
 *
 * Refuses to run against a production database, since both paths delete data.
 */
const env = require("./config/env");
const logger = require("./core/logger");
const { connectDatabase, disconnectDatabase } = require("./config/database");
const User = require("./models/UserModel");
const Product = require("./models/ProductModel");
const Order = require("./models/OrderModel");
const users = require("../data/users");
const products = require("../data/product");
const { ROLES } = require("./constants/roles");

const guardEnvironment = () => {
  if (env.isProduction) {
    logger.error("Refusing to run the seeder against a production database");
    process.exit(1);
  }
};

const importData = async () => {
  await Product.deleteMany();
  await User.deleteMany();

  // `create` is used rather than `insertMany` so the model hooks run and each
  // user's `role` is derived from the legacy `isAdmin` flag.
  const created = await User.create(
    users.map((user) => ({
      ...user,
      role: user.isAdmin ? ROLES.ADMIN : ROLES.CUSTOMER,
    }))
  );

  const adminUserId = created[0]._id;
  await Product.create(products.map((product) => ({ ...product, User: adminUserId })));

  logger.info(`Imported ${created.length} users and ${products.length} products`);
};

const destroyData = async () => {
  await Order.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();
  logger.info("Data destroyed successfully");
};

const run = async () => {
  guardEnvironment();
  await connectDatabase();

  try {
    if (process.argv[2] === "-d") {
      await destroyData();
    } else {
      await importData();
    }
    process.exitCode = 0;
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
};

run();
