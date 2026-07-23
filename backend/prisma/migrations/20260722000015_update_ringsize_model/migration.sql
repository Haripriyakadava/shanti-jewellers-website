-- Delete legacy rows to prevent FK violations
DELETE FROM "RingSize";

-- AlterTable
ALTER TABLE "RingSize" DROP COLUMN "circumference",
DROP COLUMN "diameter",
DROP COLUMN "indianSize",
DROP COLUMN "usSize",
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "sizeLabel" TEXT NOT NULL,
ADD COLUMN     "sizeNumber" DECIMAL(5,2);

-- AddForeignKey
ALTER TABLE "RingSize" ADD CONSTRAINT "RingSize_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
