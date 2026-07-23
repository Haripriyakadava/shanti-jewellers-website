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

function safeDecimalString(val: any): string {
  if (val === null || val === undefined) return "0";
  const num = parseFloat(val);
  return isNaN(num) ? "0" : num.toString();
}

async function migrateStones() {
  console.log("Starting Stone Migration from Supabase...");
  try {
    const { data: stones, error } = await supabase.from('stones').select('*');

    if (error && error.code !== '42P01') {
      throw error;
    }

    if (!stones || stones.length === 0) {
      console.log("No stones found in Supabase (or table doesn't exist).");
      return;
    }

    console.log(`Found ${stones.length} stones in Supabase. Upserting into PostgreSQL...`);

    let successCount = 0;
    let failedCount = 0;
    for (const stone of stones) {
      try {
        const payload = {
          id: String(stone.id),
          tenantId: stone.tenant_id,
          stoneName: stone.stone_name,
          ratePerGram: safeDecimalString(stone.rate_per_gram),
          unit: stone.unit || 'Carat',
          createdAt: stone.created_at ? new Date(stone.created_at) : new Date(),
          updatedAt: stone.updated_at ? new Date(stone.updated_at) : new Date(),
        };

        await prisma.stone.upsert({
          where: { 
            tenantId_stoneName: {
              tenantId: payload.tenantId,
              stoneName: payload.stoneName,
            }
          },
          create: payload,
          update: payload,
        });

        successCount++;
      } catch (e) {
        console.error(`Failed to migrate stone ${stone.id}:`, e);
        failedCount++;
      }
    }

    console.log(`Migration Complete! Successfully upserted ${successCount} stones. Failed: ${failedCount}`);
  } catch (err) {
    console.error("Error migrating stones:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrateStones();
