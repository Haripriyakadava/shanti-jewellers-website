const fs = require('fs');
let sql = fs.readFileSync('prisma/migrations/20260722000000_add_business_tables/migration.sql', 'utf8');

const insertSql = `
-- Seed missing dummy Tenant
INSERT INTO "Tenant" ("id", "name", "updatedAt")
VALUES ('dummy-tenant', 'Dummy Tenant', NOW())
ON CONFLICT ("id") DO NOTHING;

-- Seed missing dummy Category
INSERT INTO "Category" ("id", "tenantId", "name", "slug", "updatedAt")
VALUES ('dummy-category', 'dummy-tenant', 'Dummy Category', 'dummy-category', NOW())
ON CONFLICT ("id") DO NOTHING;

-- Seed missing Products for Wishlist, CartItem, OrderItem
INSERT INTO "Product" ("id", "tenantId", "categoryId", "name", "slug", "sku", "updatedAt")
SELECT DISTINCT "productId", 'dummy-tenant', 'dummy-category', 'Unknown Product', "productId", "productId", NOW() FROM "Wishlist"
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Product" ("id", "tenantId", "categoryId", "name", "slug", "sku", "updatedAt")
SELECT DISTINCT "productId", 'dummy-tenant', 'dummy-category', 'Unknown Product', "productId", "productId", NOW() FROM "CartItem"
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Product" ("id", "tenantId", "categoryId", "name", "slug", "sku", "updatedAt")
SELECT DISTINCT "productId", 'dummy-tenant', 'dummy-category', 'Unknown Product', "productId", "productId", NOW() FROM "OrderItem"
ON CONFLICT ("id") DO NOTHING;

-- Seed missing ProductVariants
INSERT INTO "ProductVariant" ("id", "productId", "price", "updatedAt")
SELECT DISTINCT "productVariantId", "productId", 0, NOW() FROM "Wishlist" WHERE "productVariantId" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ProductVariant" ("id", "productId", "price", "updatedAt")
SELECT DISTINCT "productVariantId", "productId", 0, NOW() FROM "CartItem" WHERE "productVariantId" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ProductVariant" ("id", "productId", "price", "updatedAt")
SELECT DISTINCT "productVariantId", "productId", 0, NOW() FROM "OrderItem" WHERE "productVariantId" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;

`;

// Replace the previous Seed missing Tenants if it's there
sql = sql.replace(/-- Seed missing Tenants[\s\S]*?-- AddForeignKey/m, '-- AddForeignKey');

sql = sql.replace('-- AddForeignKey', insertSql + '-- AddForeignKey');
fs.writeFileSync('prisma/migrations/20260722000000_add_business_tables/migration.sql', sql, 'utf8');
