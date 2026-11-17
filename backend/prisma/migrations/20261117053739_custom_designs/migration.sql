-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "customization" JSONB,
ADD COLUMN     "designId" UUID;

-- CreateTable
CREATE TABLE "custom_designs" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My design',
    "color" TEXT NOT NULL,
    "layers" JSONB NOT NULL,
    "sides" TEXT[],
    "printFee" DECIMAL(12,2) NOT NULL,
    "previewFront" TEXT NOT NULL,
    "previewBack" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_designs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "custom_designs_userId_createdAt_idx" ON "custom_designs"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_designId_fkey" FOREIGN KEY ("designId") REFERENCES "custom_designs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_designs" ADD CONSTRAINT "custom_designs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_designs" ADD CONSTRAINT "custom_designs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
