-- DropForeignKey
ALTER TABLE "ProductMetal" DROP CONSTRAINT "ProductMetal_metalId_fkey";

-- DropIndex
DROP INDEX "Metal_tenantId_idx";

-- DropIndex
DROP INDEX "ProductMetal_metalId_idx";

-- DropIndex
DROP INDEX "ProductMetal_productId_metalId_key";

-- AlterTable
ALTER TABLE "ProductMetal" DROP COLUMN "metalId",
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "metalType" TEXT NOT NULL,
ADD COLUMN     "purity" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Metal_tenantId_name_purity_key" ON "Metal"("tenantId", "name", "purity");

-- CreateIndex
CREATE UNIQUE INDEX "ProductMetal_productId_metalType_key" ON "ProductMetal"("productId", "metalType");

