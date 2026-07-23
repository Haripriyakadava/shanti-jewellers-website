-- AlterTable
ALTER TABLE "Stone" RENAME COLUMN "name" TO "stoneName";

-- AlterTable
ALTER TABLE "Stone" DROP COLUMN "color",
DROP COLUMN "type",
ADD COLUMN     "ratePerGram" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'Carat';

-- AlterTable
ALTER TABLE "Stone" ALTER COLUMN "ratePerGram" DROP DEFAULT,
ALTER COLUMN "unit" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Stone_tenantId_stoneName_key" ON "Stone"("tenantId", "stoneName");
