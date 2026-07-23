import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const prisma = new PrismaClient();

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function safeDecimal(val: any): number | null {
  if (val === null || val === undefined) return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
}

async function migrateProductVariants() {
  console.log("Starting ProductVariant Migration from Supabase...");
  try {
    const { data: variants, error } = await supabase.from('product_variants').select('*');

    if (error && error.code !== '42P01') {
      throw error;
    }

    if (!variants || variants.length === 0) {
      console.log("No product variants found in Supabase (or table doesn't exist).");
      return;
    }

    console.log(`Found ${variants.length} product variants in Supabase. Upserting into PostgreSQL...`);

    let successCount = 0;
    let failedCount = 0;
    for (const v of variants) {
      try {
        await prisma.productVariant.upsert({
          where: { id: String(v.id) },
          create: {
            id: String(v.id),
            productId: String(v.product_id),
            tenantId: v.tenant_id,
            sku: v.sku || null,
            metal: v.metal || null,
            carat: safeDecimal(v.carat),
            diamondType: v.diamond_type || null,
            ringSize: v.ring_size || null,
            stockQuantity: v.stock_quantity || 0,
            priceAdjustment: safeDecimal(v.price_adjustment),
            barcode: v.barcode || null,
            isActive: v.is_active !== undefined ? v.is_active : true,
            createdAt: v.created_at ? new Date(v.created_at) : new Date(),
            updatedAt: v.updated_at ? new Date(v.updated_at) : new Date(),
          },
          update: {
            productId: String(v.product_id),
            tenantId: v.tenant_id,
            sku: v.sku || null,
            metal: v.metal || null,
            carat: safeDecimal(v.carat),
            diamondType: v.diamond_type || null,
            ringSize: v.ring_size || null,
            stockQuantity: v.stock_quantity || 0,
            priceAdjustment: safeDecimal(v.price_adjustment),
            barcode: v.barcode || null,
            isActive: v.is_active !== undefined ? v.is_active : true,
            createdAt: v.created_at ? new Date(v.created_at) : undefined,
            updatedAt: v.updated_at ? new Date(v.updated_at) : new Date(),
          }
        });
        successCount++;
      } catch (e) {
        console.error(`Failed to migrate product variant ${v.id}:`, e);
        failedCount++;
      }
    }

    console.log(`Migration Complete! Successfully upserted ${successCount} product variants. Failed: ${failedCount}`);
  } catch (err) {
    console.error("Error migrating product variants:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrateProductVariants();
