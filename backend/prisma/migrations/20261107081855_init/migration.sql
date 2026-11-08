-- CreateEnum
CREATE TYPE "Role" AS ENUM ('customer', 'staff', 'manager', 'admin');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('requested', 'approved', 'rejected', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "RefundMethod" AS ENUM ('original', 'manual', 'store_credit');

-- CreateEnum
CREATE TYPE "MovementReason" AS ENUM ('purchase', 'sale', 'return', 'adjustment', 'transfer_in', 'transfer_out', 'damage', 'stocktake', 'reservation', 'release');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('percentage', 'fixed', 'free_shipping');

-- CreateEnum
CREATE TYPE "AddressLabel" AS ENUM ('home', 'work', 'other');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('register', 'reset');

-- CreateEnum
CREATE TYPE "AttributeInputType" AS ENUM ('select', 'multiselect', 'text', 'number', 'boolean', 'color');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('success', 'failure');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "avatar" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'customer',
    "emailVerify" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "label" "AddressLabel" NOT NULL DEFAULT 'home',
    "fullName" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "pinCode" INTEGER NOT NULL,
    "landMark" TEXT NOT NULL DEFAULT '',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "parentId" UUID,
    "ancestors" UUID[],
    "path" TEXT NOT NULL,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "seo" JSONB NOT NULL DEFAULT '{"title":"","description":"","keywords":[]}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attributes" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "inputType" "AttributeInputType" NOT NULL DEFAULT 'select',
    "values" JSONB NOT NULL DEFAULT '[]',
    "isVariantAttribute" BOOLEAN NOT NULL DEFAULT false,
    "isFilterable" BOOLEAN NOT NULL DEFAULT true,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "sku" TEXT NOT NULL DEFAULT '',
    "brand" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "categoryRefId" UUID,
    "countInStock" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "price" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "gst" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "image" TEXT NOT NULL,
    "images" TEXT[],
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL DEFAULT '',
    "attributes" JSONB NOT NULL DEFAULT '[]',
    "hasVariants" BOOLEAN NOT NULL DEFAULT false,
    "weightGrams" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dimensions" JSONB NOT NULL DEFAULT '{"length":0,"width":0,"height":0}',
    "numReviews" INTEGER NOT NULL DEFAULT 0,
    "rating" DECIMAL(2,1) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "seo" JSONB NOT NULL DEFAULT '{"title":"","description":""}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "options" JSON NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "gst" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "totalPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "countInStock" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "image" TEXT NOT NULL DEFAULT '',
    "barcode" TEXT NOT NULL DEFAULT '',
    "weightGrams" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "userId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("userId","productId")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" JSONB NOT NULL DEFAULT '{}',
    "contactName" TEXT NOT NULL DEFAULT '',
    "contactPhone" TEXT NOT NULL DEFAULT '',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "fulfilsOnlineOrders" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "variantSku" TEXT NOT NULL DEFAULT '',
    "warehouseId" UUID NOT NULL,
    "onHand" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "incoming" INTEGER NOT NULL DEFAULT 0,
    "reorderPoint" INTEGER NOT NULL DEFAULT 5,
    "reorderQuantity" INTEGER NOT NULL DEFAULT 0,
    "binLocation" TEXT NOT NULL DEFAULT '',
    "lastCountedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" UUID NOT NULL,
    "productId" UUID,
    "variantSku" TEXT NOT NULL DEFAULT '',
    "warehouseId" UUID,
    "quantity" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "reason" "MovementReason" NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "referenceType" TEXT NOT NULL DEFAULT '',
    "referenceId" TEXT NOT NULL DEFAULT '',
    "performedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "shippingAddress" JSONB NOT NULL,
    "itemsTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "productDiscountTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "couponDiscountTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "shippingTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "coupon" JSONB,
    "shipping" JSONB,
    "payment" JSONB,
    "stockFulfilled" BOOLEAN NOT NULL DEFAULT false,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "onlinePayment" BOOLEAN NOT NULL DEFAULT false,
    "paymentRef" TEXT,
    "paidAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "productId" UUID,
    "variantSku" TEXT NOT NULL DEFAULT '',
    "variantLabel" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "gst" DECIMAL(5,2) NOT NULL,
    "discount" DECIMAL(5,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "lineTotal" DECIMAL(12,2) NOT NULL,
    "brand" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "categoryRefId" UUID,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_events" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "changedById" UUID,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" UUID,
    "provider" TEXT NOT NULL DEFAULT 'razorpay',
    "entity" TEXT,
    "amount" INTEGER,
    "amount_paid" INTEGER NOT NULL DEFAULT 0,
    "amount_due" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "receipt" TEXT,
    "offer_id" TEXT,
    "status" TEXT,
    "created_at" INTEGER,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "failureReason" TEXT NOT NULL DEFAULT '',
    "refundedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "summary" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "orderNumber" TEXT NOT NULL DEFAULT '',
    "userId" UUID NOT NULL,
    "items" JSONB NOT NULL DEFAULT '[]',
    "amount" DECIMAL(12,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "customerNote" TEXT NOT NULL DEFAULT '',
    "staffNote" TEXT NOT NULL DEFAULT '',
    "status" "RefundStatus" NOT NULL DEFAULT 'requested',
    "restock" BOOLEAN NOT NULL DEFAULT true,
    "method" "RefundMethod" NOT NULL DEFAULT 'original',
    "gatewayRefundId" TEXT NOT NULL DEFAULT '',
    "reviewedById" UUID,
    "reviewedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" "DiscountType" NOT NULL DEFAULT 'percentage',
    "value" DECIMAL(12,2) NOT NULL,
    "maxDiscountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "minOrderAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "usageLimit" INTEGER NOT NULL DEFAULT 0,
    "usageLimitPerUser" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "appliesToProducts" UUID[],
    "appliesToCategories" UUID[],
    "excludedProducts" UUID[],
    "restrictedToUsers" UUID[],
    "firstOrderOnly" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_redemptions" (
    "id" UUID NOT NULL,
    "couponId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "orderId" UUID,
    "discountAmount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "otpHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "sendCount" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "handledById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'default',
    "store" JSONB NOT NULL,
    "localisation" JSONB NOT NULL,
    "orders" JSONB NOT NULL,
    "tax" JSONB NOT NULL,
    "inventory" JSONB NOT NULL,
    "notifications" JSONB NOT NULL,
    "appearance" JSONB NOT NULL,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rates" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "states" TEXT[],
    "isInclusive" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_zones" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT 'India',
    "states" TEXT[],
    "pinCodePrefixes" TEXT[],
    "isFallback" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_rates" (
    "id" UUID NOT NULL,
    "zoneId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "price" DECIMAL(12,2) NOT NULL,
    "minOrderAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "maxOrderAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "freeAboveAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "minDeliveryDays" INTEGER NOT NULL DEFAULT 2,
    "maxDeliveryDays" INTEGER NOT NULL DEFAULT 7,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "shipping_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "actorEmail" TEXT NOT NULL DEFAULT '',
    "actorRole" TEXT NOT NULL DEFAULT '',
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" JSONB,
    "ip" TEXT NOT NULL DEFAULT '',
    "userAgent" TEXT NOT NULL DEFAULT '',
    "status" "AuditStatus" NOT NULL DEFAULT 'success',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_createdAt_idx" ON "users"("role", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "addresses_userId_isDefault_updatedAt_idx" ON "addresses"("userId", "isDefault" DESC, "updatedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_path_key" ON "categories"("path");

-- CreateIndex
CREATE INDEX "categories_parentId_position_name_idx" ON "categories"("parentId", "position", "name");

-- CreateIndex
CREATE INDEX "categories_ancestors_idx" ON "categories" USING GIN ("ancestors");

-- CreateIndex
CREATE INDEX "categories_isActive_isFeatured_idx" ON "categories"("isActive", "isFeatured" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "attributes_code_key" ON "attributes"("code");

-- CreateIndex
CREATE INDEX "attributes_position_name_idx" ON "attributes"("position", "name");

-- CreateIndex
CREATE INDEX "products_brand_idx" ON "products"("brand");

-- CreateIndex
CREATE INDEX "products_category_price_idx" ON "products"("category", "price");

-- CreateIndex
CREATE INDEX "products_categoryRefId_isActive_idx" ON "products"("categoryRefId", "isActive");

-- CreateIndex
CREATE INDEX "products_isActive_createdAt_idx" ON "products"("isActive", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "products_isFeatured_idx" ON "products"("isFeatured");

-- CreateIndex
CREATE INDEX "products_countInStock_idx" ON "products"("countInStock");

-- CreateIndex
CREATE INDEX "products_slug_idx" ON "products"("slug");

-- CreateIndex
CREATE INDEX "product_variants_productId_position_idx" ON "product_variants"("productId", "position");

-- CreateIndex
CREATE INDEX "product_variants_sku_idx" ON "product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_productId_sku_key" ON "product_variants"("productId", "sku");

-- CreateIndex
CREATE INDEX "reviews_productId_isApproved_createdAt_idx" ON "reviews"("productId", "isApproved", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "reviews_createdAt_idx" ON "reviews"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_productId_userId_key" ON "reviews"("productId", "userId");

-- CreateIndex
CREATE INDEX "wishlist_items_productId_idx" ON "wishlist_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE INDEX "warehouses_isDefault_name_idx" ON "warehouses"("isDefault" DESC, "name");

-- CreateIndex
CREATE INDEX "inventory_warehouseId_onHand_idx" ON "inventory"("warehouseId", "onHand");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_productId_variantSku_warehouseId_key" ON "inventory"("productId", "variantSku", "warehouseId");

-- CreateIndex
CREATE INDEX "stock_movements_productId_createdAt_idx" ON "stock_movements"("productId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "stock_movements_warehouseId_idx" ON "stock_movements"("warehouseId");

-- CreateIndex
CREATE INDEX "stock_movements_reason_idx" ON "stock_movements"("reason");

-- CreateIndex
CREATE INDEX "stock_movements_referenceId_idx" ON "stock_movements"("referenceId");

-- CreateIndex
CREATE INDEX "stock_movements_createdAt_idx" ON "stock_movements"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_userId_createdAt_idx" ON "orders"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "orders_status_createdAt_idx" ON "orders"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "orders_paymentStatus_createdAt_idx" ON "orders"("paymentStatus", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "orders_paymentRef_idx" ON "orders"("paymentRef");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "order_items_orderId_position_idx" ON "order_items"("orderId", "position");

-- CreateIndex
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");

-- CreateIndex
CREATE INDEX "order_items_category_idx" ON "order_items"("category");

-- CreateIndex
CREATE INDEX "order_status_events_orderId_sequence_idx" ON "order_status_events"("orderId", "sequence");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_verified_idx" ON "payments"("verified");

-- CreateIndex
CREATE INDEX "payments_paymentStatus_idx" ON "payments"("paymentStatus");

-- CreateIndex
CREATE INDEX "payments_createdAt_idx" ON "payments"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "refunds_orderId_idx" ON "refunds"("orderId");

-- CreateIndex
CREATE INDEX "refunds_userId_idx" ON "refunds"("userId");

-- CreateIndex
CREATE INDEX "refunds_status_createdAt_idx" ON "refunds"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "refunds_createdAt_idx" ON "refunds"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_isActive_expiresAt_idx" ON "coupons"("isActive", "expiresAt");

-- CreateIndex
CREATE INDEX "coupon_redemptions_couponId_userId_idx" ON "coupon_redemptions"("couponId", "userId");

-- CreateIndex
CREATE INDEX "coupon_redemptions_userId_idx" ON "coupon_redemptions"("userId");

-- CreateIndex
CREATE INDEX "coupon_redemptions_orderId_idx" ON "coupon_redemptions"("orderId");

-- CreateIndex
CREATE INDEX "otps_expiresAt_idx" ON "otps"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "otps_email_purpose_key" ON "otps"("email", "purpose");

-- CreateIndex
CREATE INDEX "contact_messages_email_createdAt_idx" ON "contact_messages"("email", "createdAt");

-- CreateIndex
CREATE INDEX "contact_messages_isRead_idx" ON "contact_messages"("isRead");

-- CreateIndex
CREATE INDEX "contact_messages_createdAt_idx" ON "contact_messages"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "tax_rates_code_key" ON "tax_rates"("code");

-- CreateIndex
CREATE INDEX "tax_rates_isDefault_name_idx" ON "tax_rates"("isDefault" DESC, "name");

-- CreateIndex
CREATE INDEX "shipping_zones_isActive_position_idx" ON "shipping_zones"("isActive", "position");

-- CreateIndex
CREATE INDEX "shipping_rates_zoneId_position_idx" ON "shipping_rates"("zoneId", "position");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_createdAt_idx" ON "audit_logs"("entityType", "entityId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryRefId_fkey" FOREIGN KEY ("categoryRefId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_categoryRefId_fkey" FOREIGN KEY ("categoryRefId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_events" ADD CONSTRAINT "order_status_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_events" ADD CONSTRAINT "order_status_events_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "shipping_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Last line of defence behind the conditional updates in inventory.service.js.
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_on_hand_non_negative" CHECK ("onHand" >= 0);
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_reserved_non_negative" CHECK ("reserved" >= 0);
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_used_count_non_negative" CHECK ("usedCount" >= 0);
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rating_range" CHECK ("rating" BETWEEN 1 AND 5);
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_qty_positive" CHECK ("qty" >= 1);
