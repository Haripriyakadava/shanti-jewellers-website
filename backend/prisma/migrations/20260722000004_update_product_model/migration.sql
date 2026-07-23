-- DropIndex
DROP INDEX "Product_sku_key";

-- DropIndex
DROP INDEX "Product_slug_key";

-- AlterTable (Rename safe columns)
ALTER TABLE "Product" RENAME COLUMN "active" TO "isActive";
ALTER TABLE "Product" RENAME COLUMN "bestseller" TO "isBestSeller";
ALTER TABLE "Product" RENAME COLUMN "makingCharges" TO "makingCharge";
ALTER TABLE "Product" RENAME COLUMN "newArrival" TO "isNew";
ALTER TABLE "Product" RENAME COLUMN "stock" TO "stockQuantity";
ALTER TABLE "Product" RENAME COLUMN "weight" TO "grossWeight";

-- AlterTable (Drop obsolete columns)
ALTER TABLE "Product" DROP COLUMN "certification",
DROP COLUMN "featured",
DROP COLUMN "gender",
DROP COLUMN "occasion",
DROP COLUMN "purity",
DROP COLUMN "shortDescription";

-- AlterTable (Add new columns and alter types)
ALTER TABLE "Product" ADD COLUMN     "amountWithoutGst" DECIMAL(12,2),
ADD COLUMN     "amountWithoutStones" DECIMAL(12,2),
ADD COLUMN     "basePrice" DECIMAL(12,2),
ADD COLUMN     "gstAmount" DECIMAL(12,2),
ADD COLUMN     "gstPercentage" DECIMAL(5,2),
ADD COLUMN     "hoverImageUrl" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isEngravable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "longDescription" TEXT,
ADD COLUMN     "metalType" TEXT,
ADD COLUMN     "netWeight" DECIMAL(12,3),
ADD COLUMN     "originalPrice" DECIMAL(12,2),
ADD COLUMN     "rating" DECIMAL(3,2),
ADD COLUMN     "stoneAmount" DECIMAL(12,2),
ADD COLUMN     "totalAmount" DECIMAL(12,2),
ALTER COLUMN "wastage" SET DATA TYPE DECIMAL(12,3);

-- CreateIndex
CREATE UNIQUE INDEX "Product_tenantId_slug_key" ON "Product"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_tenantId_sku_key" ON "Product"("tenantId", "sku");
