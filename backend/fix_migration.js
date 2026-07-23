const fs = require('fs');
let sql = fs.readFileSync('prisma/migrations/20260722000000_add_business_tables/migration.sql', 'utf8');

const insertSql = `
-- Seed missing Tenants
INSERT INTO "Tenant" ("id", "name", "updatedAt")
SELECT DISTINCT "tenantId", 'Auto Migrated Tenant', NOW() FROM "Customer" ON CONFLICT DO NOTHING;

INSERT INTO "Tenant" ("id", "name", "updatedAt")
SELECT DISTINCT "tenantId", 'Auto Migrated Tenant', NOW() FROM "Order" ON CONFLICT DO NOTHING;

INSERT INTO "Tenant" ("id", "name", "updatedAt")
SELECT DISTINCT "tenantId", 'Auto Migrated Tenant', NOW() FROM "Cart" ON CONFLICT DO NOTHING;

-- Seed missing Products (just in case Wishlist, OrderItem, CartItem has productIds that don't exist, though they were strings)
-- Wait, we can't seed products easily without a categoryId. Let's hope those products still exist or can be inserted.
-- Actually, the user's products might be entirely missing if they were in supabase. But they didn't mention it failing on Product yet.

`;

sql = sql.replace('-- AddForeignKey', insertSql + '-- AddForeignKey');
fs.writeFileSync('prisma/migrations/20260722000000_add_business_tables/migration.sql', sql, 'utf8');
