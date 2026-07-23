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

async function migrateProductMetals() {
  console.log("Starting ProductMetal Migration from Supabase...");
  try {
    const { data: metals, error } = await supabase.from('product_metals').select('*');

    if (error && error.code !== '42P01') {
      throw error;
    }

    if (!metals || metals.length === 0) {
      console.log("No product metals found in Supabase (or table doesn't exist).");
      return;
    }

    console.log(`Found ${metals.length} product metals in Supabase. Upserting into PostgreSQL...`);

    let successCount = 0;
    let failedCount = 0;
    for (const pm of metals) {
      try {
        await prisma.productMetal.upsert({
          where: { id: String(pm.id) },
          create: {
            id: String(pm.id),
            productId: String(pm.product_id),
            tenantId: pm.tenant_id,
            metalType: pm.metal_type,
            purity: pm.purity || null,
            isAvailable: pm.is_available !== undefined ? pm.is_available : true,
            createdAt: pm.created_at ? new Date(pm.created_at) : new Date(),
            updatedAt: pm.updated_at ? new Date(pm.updated_at) : new Date(),
          },
          update: {
            productId: String(pm.product_id),
            tenantId: pm.tenant_id,
            metalType: pm.metal_type,
            purity: pm.purity || null,
            isAvailable: pm.is_available !== undefined ? pm.is_available : true,
            createdAt: pm.created_at ? new Date(pm.created_at) : undefined,
            updatedAt: pm.updated_at ? new Date(pm.updated_at) : new Date(),
          }
        });
        successCount++;
      } catch (e) {
        console.error(`Failed to migrate product metal ${pm.id}:`, e);
        failedCount++;
      }
    }

    console.log(`Migration Complete! Successfully upserted ${successCount} product metals. Failed: ${failedCount}`);
  } catch (err) {
    console.error("Error migrating product metals:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrateProductMetals();
