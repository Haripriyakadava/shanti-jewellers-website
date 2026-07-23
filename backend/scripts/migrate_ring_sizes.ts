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

function safeDecimalNullable(val: any): number | null {
  if (val === null || val === undefined) return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
}

async function migrateRingSizes() {
  console.log("Starting RingSize Migration from Supabase...");
  try {
    const { data: sizes, error } = await supabase.from('ring_sizes').select('*');

    if (error && error.code !== '42P01') {
      throw error;
    }

    if (!sizes || sizes.length === 0) {
      console.log("No ring sizes found in Supabase (or table doesn't exist).");
      return;
    }

    console.log(`Found ${sizes.length} ring sizes in Supabase. Upserting into PostgreSQL...`);

    let successCount = 0;
    let failedCount = 0;
    for (const size of sizes) {
      try {
        const payload = {
          id: String(size.id),
          tenantId: size.tenant_id,
          productId: String(size.product_id),
          sizeLabel: size.size_label || 'N/A',
          sizeNumber: safeDecimalNullable(size.size_number),
          isAvailable: size.is_available !== undefined ? size.is_available : true,
          createdAt: size.created_at ? new Date(size.created_at) : new Date(),
        };

        await prisma.ringSize.upsert({
          where: { id: payload.id },
          create: payload,
          update: payload,
        });

        successCount++;
      } catch (e) {
        console.error(`Failed to migrate ring size ${size.id}:`, e);
        failedCount++;
      }
    }

    console.log(`Migration Complete! Successfully upserted ${successCount} ring sizes. Failed: ${failedCount}`);
  } catch (err) {
    console.error("Error migrating ring sizes:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrateRingSizes();
