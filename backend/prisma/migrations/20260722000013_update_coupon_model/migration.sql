-- DropIndex
DROP INDEX "Coupon_code_key";

-- AlterTable (Renames)
ALTER TABLE "Coupon" RENAME COLUMN "active" TO "isActive";
ALTER TABLE "Coupon" RENAME COLUMN "minOrderValue" TO "minPurchaseAmount";
ALTER TABLE "Coupon" RENAME COLUMN "usageLimit" TO "maxUsageCount";
ALTER TABLE "Coupon" RENAME COLUMN "usedCount" TO "usageCount";

-- Handle Dates (Rename and coerce to NOT NULL safely)
ALTER TABLE "Coupon" RENAME COLUMN "startDate" TO "validFrom";
ALTER TABLE "Coupon" RENAME COLUMN "expiryDate" TO "validUntil";

UPDATE "Coupon" SET "validFrom" = CURRENT_TIMESTAMP WHERE "validFrom" IS NULL;
UPDATE "Coupon" SET "validUntil" = CURRENT_TIMESTAMP WHERE "validUntil" IS NULL;

ALTER TABLE "Coupon" ALTER COLUMN "validFrom" SET NOT NULL;
ALTER TABLE "Coupon" ALTER COLUMN "validFrom" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Coupon" ALTER COLUMN "validUntil" SET NOT NULL;
ALTER TABLE "Coupon" ALTER COLUMN "validUntil" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_tenantId_code_key" ON "Coupon"("tenantId", "code");
