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

function safeDecimal(val: any): number {
  if (val === null || val === undefined) return 0;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
}

async function migrateMetalPrices() {
  console.log("Starting MetalPrice Migration from Supabase...");
  try {
    const { data: prices, error } = await supabase.from('metal_prices').select('*');

    if (error && error.code !== '42P01') {
      throw error;
    }

    if (!prices || prices.length === 0) {
      console.log("No metal prices found in Supabase (or table doesn't exist).");
      return;
    }

    console.log(`Found ${prices.length} metal prices in Supabase. Upserting into PostgreSQL...`);

    let successCount = 0;
    let failedCount = 0;
    for (const p of prices) {
      try {
        await prisma.metalPrice.upsert({
          where: { id: String(p.id) },
          create: {
            id: String(p.id),
            metalId: String(p.metal_id),
            tenantId: p.tenant_id,
            price: safeDecimal(p.price),
            priceDate: p.price_date ? new Date(p.price_date) : new Date(),
            createdAt: p.created_at ? new Date(p.created_at) : new Date(),
            updatedAt: p.updated_at ? new Date(p.updated_at) : new Date(),
          },
          update: {
            metalId: String(p.metal_id),
            tenantId: p.tenant_id,
            price: safeDecimal(p.price),
            priceDate: p.price_date ? new Date(p.price_date) : new Date(),
            createdAt: p.created_at ? new Date(p.created_at) : undefined,
            updatedAt: p.updated_at ? new Date(p.updated_at) : new Date(),
          }
        });
        successCount++;
      } catch (e) {
        console.error(`Failed to migrate metal price ${p.id}:`, e);
        failedCount++;
      }
    }

    console.log(`Migration Complete! Successfully upserted ${successCount} metal prices. Failed: ${failedCount}`);
  } catch (err) {
    console.error("Error migrating metal prices:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrateMetalPrices();
