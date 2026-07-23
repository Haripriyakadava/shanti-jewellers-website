-- DropIndex
DROP INDEX "ProductVariant_sku_key";

-- AlterTable (Reset previous column)
ALTER TABLE "ProductOption" ALTER COLUMN "optionType" DROP DEFAULT;

-- AlterTable (Safe Renames)
ALTER TABLE "ProductVariant" RENAME COLUMN "price" TO "priceAdjustment";
ALTER TABLE "ProductVariant" RENAME COLUMN "size" TO "ringSize";
ALTER TABLE "ProductVariant" RENAME COLUMN "stock" TO "stockQuantity";

-- AlterTable (Drops & Adds)
ALTER TABLE "ProductVariant" DROP COLUMN "color",
DROP COLUMN "weight",
ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "carat" DECIMAL(12,3),
ADD COLUMN     "diamondType" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "metal" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_tenantId_sku_key" ON "ProductVariant"("tenantId", "sku");
