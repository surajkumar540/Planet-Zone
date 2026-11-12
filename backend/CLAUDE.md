# Planet-Zone backend

REST API for Planet, a general-merchandise e-commerce store priced in INR. It serves the storefront and the admin dashboard in `../frontend`.

Stack: Node, Express 4, PostgreSQL via Prisma 6, Zod 4, JWT, Razorpay, Nodemailer, Winston. CommonJS.

## Commands

`backend/` has no `package.json`. The manifest, `node_modules` and `.env` all live at the **repo root**, so run these from there:

```bash
npm install                # also runs prisma generate, and provides axios to the frontend
npm run dev                # nodemon backend/src/server.js
npm start                  # node backend/src/server.js

npm run db:migrate         # apply pending migrations (prisma migrate deploy)
npm run db:migrate:dev     # after editing schema.prisma: create and apply a migration
npm run db:studio          # browse the data in Prisma Studio

npm run data:import        # DESTRUCTIVE: empties every table, then seeds users and products
npm run data:destroy       # DESTRUCTIVE: empties every table
```

There are no backend tests or lint config. To check a change, run the server and call the endpoint. `GET /health` reports database connectivity (it sits outside `/api`).

The seeder refuses to run only when `NODE_ENV=production`. It does not look at `DATABASE_URL`, so confirm which database that points to before running either data script.

## Configuration

Every env var must be declared in the Zod schema in `src/config/env.js`, and the process exits at boot if validation fails. Read config through that module, not `process.env`. Template: `../.env.example`.

- `DATABASE_URL` is required. On Neon, use the direct URL (host without `-pooler`), because migrations can't run through the pooler.
- `PORT` defaults to 4000 in code, but the frontend proxy defaults to 8000. `.env.example` sets 8000, so keep it set.
- Without `MAIL_USERNAME` and `MAIL_PASSWORD`, mail is skipped with a warning. OTPs are stored hashed and never logged, so **local signup and password reset cannot be completed without SMTP**. Seeded accounts are already verified.
- Without the `RAZORPAY_*` keys, online payment endpoints return an error. Cash on delivery still works.
- Rate limiters only run in production.

## Layout

```
prisma/
  schema.prisma    all tables, with comments on why each is shaped as it is
  migrations/      generated SQL; commit these and never edit an applied one
src/
  server.js        boot and graceful shutdown
  app.js           middleware chain; mounts /api
  routes/index.js  registry of module routers
  db/client.js     the single Prisma client
  db/mappers.js    database row -> API JSON shape
  config/          validated env, connect/disconnect
  core/            AppError, ApiResponse, asyncHandler, BaseRepository, transaction, cache, logger
  middlewares/     auth, rbac, validate, rateLimit, errorHandler
  constants/       roles, order status + transitions, inventory, refund, otp, discount
  modules/<name>/  features (see below)
  services/        cross-module: pricing, payment, shipping, otp, audit, mail
  utils/           money, schemas (shared Zod + query helpers), slug
data/              seed users and products
```

Modules take one of two shapes:

- **Layered:** `*.routes` → `*.controller` → `*.service` → `*.repository`, plus `*.validation`. Used by `auth`, `user`, `product`, `order`, and partly by `category` and `review`.
- **Compact:** `*.routes` + `*.service`, or a single `*.module.js`. Used by `coupon`, `refund`, `inventory`, `analytics`, `attribute`, `settings`, `wishlist`, `address`, `contact`.

Follow the shape of the module you're editing. Use the layered shape for substantial new features.

## Conventions

**The API shape is a contract.** The app moved from MongoDB, and the frontend still reads the original JSON: `_id`, `User`, `pricing.grandTotal`, a nested `shippingAddress`. Tables use `id`, `userId` and flat columns. `db/mappers.js` translates between them.
- Return mapped objects from services, never raw rows. A raw row exposes `password` and returns money as `Decimal` objects.
- When you add a column, check whether its mapper needs updating.

**Routing and auth**
- Routers mount **without a path prefix**, so each route declares its full path after `/api`. Paths are inconsistent for compatibility with existing clients (`/createOrder`, `/order/:id`, `/admin/orders`); don't rename them.
- **Never use `router.use(authenticate)`**: it would also guard other modules' public routes. Attach guards per route. The usual pattern is `const staffOnly = [authenticate, requireStaff]`.
- Role order is `customer < staff < manager < admin`. Read identity from `req.auth` (`userId`, `role`, `isAdmin`), never from the request body. `req.userId` is a legacy alias.
- The role is stored in the JWT, so a role change takes effect only on the user's next login. `isAdmin` is derived from `role` and is not a column.

**Requests and responses**
- Validate with `validate({ params, query, body })`. It replaces those request segments with the parsed Zod output. IDs use `uuid` from `utils/schemas.js`.
- **Build update bodies with `patchSchema(schema)`, never `.partial()`.** In Zod 4, `.partial()` still applies `.default()` values, so omitted fields would be overwritten with defaults.
- The database doesn't trim or change case for you, as Mongoose did. Normalise in Zod or the service (coupon, warehouse and tax codes are uppercased; attribute codes are lowercased).
- Respond through `core/ApiResponse` (`ok`, `created`, `paginated`), which produces `{ status, message, data, meta }`. A few handlers add top-level keys the frontend reads, such as `token`, `isAdmin`, `orderId` and `KEY_ID`; keep them.
- Throw `AppError.badRequest()`, `.notFound()` and so on from services, and wrap async handlers in `asyncHandler`. Anything else thrown becomes a generic 500. `errorHandler` maps Prisma's unique, foreign key and not-found errors.
- List endpoints use `listQuery`, `searchFilter` and `parseSort` from `utils/schemas.js`. `parseSort` takes an allow-list; **add a field to it** to make it sortable, otherwise the sort silently falls back to the default.
- Hash passwords with `hashPassword` from `auth.service.js`. There is no model hook to do it for you.
- Record privileged actions with `audit.record({ req, action, entityType, entityId, changes })`.

**Data**
- Queried data gets real columns and tables. JSONB is only for values always read whole: order snapshots, settings sections, product attributes.
- IDs are UUIDs, except `Payment.id`, which is the Razorpay **order** id.
- Raw SQL must quote camelCase columns (`"onHand"`), use `${value}` placeholders, and cast IDs (`${id}::uuid`). Never interpolate client text; sort columns go through an allow-list.
- `LIKE` wildcards aren't escaped automatically, so use `searchFilter` or `escapeLike` for user search text.
- `ProductVariant.options` is `json`, not `jsonb`, because labels depend on key order. Cast to `::jsonb` to use JSON operators on it.
- Change the schema with `npm run db:migrate:dev`. Don't edit an applied migration. CHECK constraints are hand-written in the migration SQL.

**Transactions**
- Use `withTransaction`, and pass `tx` to everything inside it. A call made without `tx` runs outside the transaction and won't roll back.
- **In Postgres a failed SQL statement aborts the whole transaction**, so you can't catch a database error inside one and continue. Catching `AppError` is fine, because it's raised after a zero-row update, not by a failed statement.
- Use conditional writes rather than read-then-write when values can race: `updateMany` with a guard in `where`, or `UPDATE ... WHERE ... RETURNING`.

## Core flows

**Money.** The server prices everything. `services/pricing.service.js` rebuilds the cart from the catalogue, reading only identity and quantity from the client. `quoteOrder` backs both `/orders/quote` and `/createOrder`, so route any pricing change through it. Amounts are major units (rupees, `DECIMAL(12,2)`) via `utils/money.js`, except `Payment`, which holds paise. Tax comes from each product's or variant's `gst`.

**Orders.** Legal status changes are in `ORDER_STATUS_TRANSITIONS` in `constants/orderStatus.js`, enforced by `updateOrderStatus`, which locks the row. New orders start as `confirmed`. `createOrder` runs in one transaction: if reservation, order creation or coupon redemption fails, all of it rolls back.

**Stock.** `Inventory` (`onHand`, `reserved`, per product, variant and warehouse) is the source of truth, and `StockMovement` is the ledger. `Product.countInStock` and variant `countInStock` are a cached `onHand - reserved`.

| Order event | Inventory call | Effect |
|---|---|---|
| Placed | `reserve` | `reserved` up; fails if unreserved stock is short |
| Cancelled before dispatch | `release` | `reserved` down |
| Shipped | `fulfil` | `onHand` and `reserved` down |
| Returned | `adjustStock` | `onHand` up |

Change stock only through `inventory.service.js`. `reserve` and `release` do not sync the product cache, so displayed stock can run high until the next `fulfil` or `adjustStock`. The check in `pricing.service.js` reads that cache; the atomic check in `reserve` is what actually prevents overselling. Cart lines are reserved in sorted order so concurrent carts can't deadlock.

**Auth.** Signup creates an unverified user and emails a 6-digit OTP (10-minute expiry, 5 attempts, 5 sends). `/otpVerify` returns the token. Clients send `Authorization: Bearer <jwt>`; cookies aren't used for auth. Expired OTP rows are removed whenever a new code is issued, because Postgres has no TTL index.

**Order emails.** `services/orderNotifications.js` sends an order confirmation after `createOrder` commits, and an update on shipped, out_for_delivery, delivered, cancelled and refunded. Both run in the background (a mail failure is logged, never fails the order) and honour Settings → notifications `orderConfirmationEmail` / `orderStatusEmail`. Links use `APP_URL`.

**Payment.** `/paymentInit` creates the Razorpay order and a `Payment` row. `/paymentSuccess` verifies the HMAC signature. `/createOrder` then checks that the verified payment matches the computed total. See the first known issue below.

## Known issues

Found by reading and testing the code on 2026-11-07 and not yet fixed. Remove an entry when it's fixed.

1. **Online checkout is fixed in code but untested with real Razorpay.** `Checkout.jsx` now sends the gateway order id (`gatewayOrder.id`) as `paymentId`, which is the key `getVerifiedPayment` uses. Run one sandbox payment with test keys, then remove this entry.
2. **Only the default warehouse can sell.** Checkout reserves stock from the default warehouse alone, so making a new or empty warehouse the default leaves every product out of stock, even though the old warehouse still holds the stock.
3. **Most settings aren't enforced.** `autoConfirmOrders`, `orderPrefix`, `allowCashOnDelivery`, `allowOnlinePayment`, `cancellationWindowHours`, `hideOutOfStockProducts`, `trackInventory` and `allowBackorders` are referenced only by the settings code. `TaxRate` records are likewise not used in pricing.
4. **Refunds don't move money.** `refund.service.js` updates records but never calls Razorpay.
6. **`/paymentInit` trusts the client's `amount`.** `createOrder` catches a mismatch, but only after the customer has paid.
7. **`AuditLog.actorEmail` is always empty**, because `req.auth` has no `email`.
