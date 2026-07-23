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

async function migrateMetals() {
  console.log("Starting Metal Migration from Supabase...");
  try {
    const { data: metals, error } = await supabase.from('metals').select('*');

    if (error && error.code !== '42P01') {
      throw error;
    }

    if (!metals || metals.length === 0) {
      console.log("No metals found in Supabase (or table doesn't exist).");
      return;
    }

    console.log(`Found ${metals.length} metals in Supabase. Upserting into PostgreSQL...`);

    let successCount = 0;
    let failedCount = 0;
    for (const m of metals) {
      try {
        await prisma.metal.upsert({
          where: { id: String(m.id) },
          create: {
            id: String(m.id),
            tenantId: m.tenant_id,
            name: m.name,
            unit: m.unit || '',
            createdAt: m.created_at ? new Date(m.created_at) : new Date(),
            updatedAt: m.updated_at ? new Date(m.updated_at) : new Date(),
          },
          update: {
            tenantId: m.tenant_id,
            name: m.name,
            unit: m.unit || '',
            createdAt: m.created_at ? new Date(m.created_at) : undefined,
            updatedAt: m.updated_at ? new Date(m.updated_at) : new Date(),
          }
        });
        successCount++;
      } catch (e) {
        console.error(`Failed to migrate metal ${m.id}:`, e);
        failedCount++;
      }
    }

    console.log(`Migration Complete! Successfully upserted ${successCount} metals. Failed: ${failedCount}`);
  } catch (err) {
    console.error("Error migrating metals:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrateMetals();
