-- 1. ADD COLUMNS AS NULLABLE
ALTER TABLE "CartItem" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "MetalPrice" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "OrderStatusHistory" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "PaymentTransaction" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "ProductImage" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "ProductMetal" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "ProductOption" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "ProductVariant" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "RefreshToken" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Shipment" ADD COLUMN "tenantId" TEXT;

-- 2. BACKFILL DATA
UPDATE "CartItem" SET "tenantId" = "Cart"."tenantId" FROM "Cart" WHERE "CartItem"."cartId" = "Cart"."id";
UPDATE "MetalPrice" SET "tenantId" = "Metal"."tenantId" FROM "Metal" WHERE "MetalPrice"."metalId" = "Metal"."id";
UPDATE "OrderItem" SET "tenantId" = "Order"."tenantId" FROM "Order" WHERE "OrderItem"."orderId" = "Order"."id";
UPDATE "OrderStatusHistory" SET "tenantId" = "Order"."tenantId" FROM "Order" WHERE "OrderStatusHistory"."orderId" = "Order"."id";
UPDATE "PaymentTransaction" SET "tenantId" = "Payment"."tenantId" FROM "Payment" WHERE "PaymentTransaction"."paymentId" = "Payment"."id";
UPDATE "ProductImage" SET "tenantId" = "Product"."tenantId" FROM "Product" WHERE "ProductImage"."productId" = "Product"."id";
UPDATE "ProductMetal" SET "tenantId" = "Product"."tenantId" FROM "Product" WHERE "ProductMetal"."productId" = "Product"."id";
UPDATE "ProductOption" SET "tenantId" = "Product"."tenantId" FROM "Product" WHERE "ProductOption"."productId" = "Product"."id";
UPDATE "ProductVariant" SET "tenantId" = "Product"."tenantId" FROM "Product" WHERE "ProductVariant"."productId" = "Product"."id";

-- For RefreshToken, it maps to Customer or AdminUser
UPDATE "RefreshToken" SET "tenantId" = "Customer"."tenantId" FROM "Customer" WHERE "RefreshToken"."customerId" = "Customer"."id";
UPDATE "RefreshToken" SET "tenantId" = "AdminUser"."tenantId" FROM "AdminUser" WHERE "RefreshToken"."adminId" = "AdminUser"."id";

UPDATE "Shipment" SET "tenantId" = "Order"."tenantId" FROM "Order" WHERE "Shipment"."orderId" = "Order"."id";

-- 3. DELETE ORPHANS AND ENFORCE NOT NULL
DELETE FROM "CartItem" WHERE "tenantId" IS NULL;
DELETE FROM "MetalPrice" WHERE "tenantId" IS NULL;
DELETE FROM "OrderItem" WHERE "tenantId" IS NULL;
DELETE FROM "OrderStatusHistory" WHERE "tenantId" IS NULL;
DELETE FROM "PaymentTransaction" WHERE "tenantId" IS NULL;
DELETE FROM "ProductImage" WHERE "tenantId" IS NULL;
DELETE FROM "ProductMetal" WHERE "tenantId" IS NULL;
DELETE FROM "ProductOption" WHERE "tenantId" IS NULL;
DELETE FROM "ProductVariant" WHERE "tenantId" IS NULL;
DELETE FROM "RefreshToken" WHERE "tenantId" IS NULL;
DELETE FROM "Shipment" WHERE "tenantId" IS NULL;

ALTER TABLE "CartItem" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "MetalPrice" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "OrderStatusHistory" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "PaymentTransaction" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "ProductImage" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "ProductMetal" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "ProductOption" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "ProductVariant" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "RefreshToken" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Shipment" ALTER COLUMN "tenantId" SET NOT NULL;

-- 4. ADD INDEXES & CONSTRAINTS
CREATE INDEX "CartItem_tenantId_idx" ON "CartItem"("tenantId");
CREATE INDEX "MetalPrice_tenantId_idx" ON "MetalPrice"("tenantId");
CREATE INDEX "OrderItem_tenantId_idx" ON "OrderItem"("tenantId");
CREATE INDEX "OrderStatusHistory_tenantId_idx" ON "OrderStatusHistory"("tenantId");
CREATE INDEX "PaymentTransaction_tenantId_idx" ON "PaymentTransaction"("tenantId");
CREATE INDEX "ProductImage_tenantId_idx" ON "ProductImage"("tenantId");
CREATE INDEX "ProductMetal_tenantId_idx" ON "ProductMetal"("tenantId");
CREATE INDEX "ProductOption_tenantId_idx" ON "ProductOption"("tenantId");
CREATE INDEX "ProductVariant_tenantId_idx" ON "ProductVariant"("tenantId");
CREATE INDEX "RefreshToken_tenantId_idx" ON "RefreshToken"("tenantId");
CREATE INDEX "Shipment_tenantId_idx" ON "Shipment"("tenantId");

ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductMetal" ADD CONSTRAINT "ProductMetal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MetalPrice" ADD CONSTRAINT "MetalPrice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
