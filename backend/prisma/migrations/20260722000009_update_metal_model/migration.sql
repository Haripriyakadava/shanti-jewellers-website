-- DropIndex
DROP INDEX "Metal_tenantId_name_purity_key";

-- AlterTable
ALTER TABLE "Metal" RENAME COLUMN "purity" TO "unit";

-- AlterTable
ALTER TABLE "ProductVariant" ALTER COLUMN "priceAdjustment" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Metal_tenantId_name_key" ON "Metal"("tenantId", "name");
