-- AlterTable
ALTER TABLE "ProductOption" RENAME COLUMN "name" TO "optionName";
ALTER TABLE "ProductOption" RENAME COLUMN "value" TO "optionValue";
ALTER TABLE "ProductOption" ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProductOption" ADD COLUMN "isAvailable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ProductOption" ADD COLUMN "optionType" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "ProductOption" ADD COLUMN "priceModifier" DECIMAL(12,2);
