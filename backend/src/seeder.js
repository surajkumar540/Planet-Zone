/**
 * Development data seeder.
 *
 *   npm run data:import    wipe every table, then seed users and products
 *   npm run data:destroy   wipe every table
 *
 * Refuses to run against a production database, since both paths delete data.
 */
const env = require("./config/env");
const logger = require("./core/logger");
const prisma = require("./db/client");
const { connectDatabase, disconnectDatabase } = require("./config/database");
const { hashPassword } = require("./modules/auth/auth.service");
const productService = require("./modules/product/product.service");
const users = require("../data/users");
const products = require("../data/product");
const { ROLES } = require("./constants/roles");

const guardEnvironment = () => {
  if (env.isProduction) {
    logger.error("Refusing to run the seeder against a production database");
    process.exit(1);
  }
};

/** Empties every application table, leaving Prisma's migration history alone. */
const wipeAllTables = async () => {
  const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables
    WHERE schemaname = current_schema() AND tablename <> '_prisma_migrations'`;
  const names = tables.map(({ tablename }) => `"${tablename}"`).join(", ");
  if (names) await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${names} CASCADE`);
};

const importData = async () => {
  await wipeAllTables();

  const created = [];
  for (const { isAdmin, password, ...user } of users) {
    created.push(
      await prisma.user.create({
        data: {
          ...user,
          password: await hashPassword(password),
          role: isAdmin ? ROLES.ADMIN : ROLES.CUSTOMER,
        },
      })
    );
  }

  const adminUserId = created[0].id;
  for (const { rating, numReviews, ...product } of products) {
    // The service also creates each product's inventory row, which checkout needs.
    const { _id } = await productService.createProduct(adminUserId, product);
    await prisma.product.update({ where: { id: _id }, data: { rating, numReviews } });
  }

  logger.info(`Imported ${created.length} users and ${products.length} products`);
};

const destroyData = async () => {
  await wipeAllTables();
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
