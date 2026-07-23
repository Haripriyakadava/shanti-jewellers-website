const fs = require('fs');
let sql = fs.readFileSync('prisma/migrations/20260722000000_add_business_tables/migration.sql', 'utf8');

const insertSql = `
-- Seed missing Tenants from existing data
INSERT INTO "Tenant" ("id", "name", "updatedAt")
SELECT DISTINCT "tenantId", 'Auto Migrated Tenant', NOW() FROM "Customer" ON CONFLICT DO NOTHING;

INSERT INTO "Tenant" ("id", "name", "updatedAt")
SELECT DISTINCT "tenantId", 'Auto Migrated Tenant', NOW() FROM "Order" ON CONFLICT DO NOTHING;

INSERT INTO "Tenant" ("id", "name", "updatedAt")
SELECT DISTINCT "tenantId", 'Auto Migrated Tenant', NOW() FROM "Cart" ON CONFLICT DO NOTHING;

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

// Since the original sql file might have my first insert, let's load from the temp.sql or just replace it.
// Actually, let's just write a script that drops the old AddForeignKey and appends everything properly.
// A better way is to recreate the migration file from the dump or just run it via replace.
// Let me just check if the string exists.
let baseSql = fs.readFileSync('prisma/migrations/20260722000000_add_business_tables/migration.sql', 'utf8');

// If we already appended the first block, let's strip it by splitting at the first `-- AddForeignKey`
const parts = baseSql.split('-- AddForeignKey');
// The first part is the schema creation. The rest are foreign keys.
// We reconstruct it.
const schemaCreation = parts[0];
const foreignKeys = '-- AddForeignKey' + parts.slice(1).join('-- AddForeignKey');

const finalSql = schemaCreation + insertSql + foreignKeys;
fs.writeFileSync('prisma/migrations/20260722000000_add_business_tables/migration.sql', finalSql, 'utf8');
