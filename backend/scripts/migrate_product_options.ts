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

async function migrateProductOptions() {
  console.log("Starting ProductOption Migration from Supabase...");
  try {
    const { data: options, error } = await supabase.from('product_options').select('*');

    if (error && error.code !== '42P01') {
      throw error;
    }

    if (!options || options.length === 0) {
      console.log("No product options found in Supabase (or table doesn't exist).");
      return;
    }

    console.log(`Found ${options.length} product options in Supabase. Upserting into PostgreSQL...`);

    let successCount = 0;
    let failedCount = 0;
    for (const opt of options) {
      try {
        await prisma.productOption.upsert({
          where: { id: String(opt.id) },
          create: {
            id: String(opt.id),
            productId: String(opt.product_id),
            tenantId: opt.tenant_id,
            optionType: opt.option_type || 'default',
            optionName: opt.option_name || 'Option',
            optionValue: opt.option_value || '',
            priceModifier: safeDecimal(opt.price_modifier),
            isAvailable: opt.is_available !== undefined ? opt.is_available : true,
            displayOrder: opt.sort_order || 0,
            createdAt: opt.created_at ? new Date(opt.created_at) : new Date(),
            updatedAt: opt.updated_at ? new Date(opt.updated_at) : new Date(),
          },
          update: {
            productId: String(opt.product_id),
            tenantId: opt.tenant_id,
            optionType: opt.option_type || 'default',
            optionName: opt.option_name || 'Option',
            optionValue: opt.option_value || '',
            priceModifier: safeDecimal(opt.price_modifier),
            isAvailable: opt.is_available !== undefined ? opt.is_available : true,
            displayOrder: opt.sort_order || 0,
            createdAt: opt.created_at ? new Date(opt.created_at) : undefined,
            updatedAt: opt.updated_at ? new Date(opt.updated_at) : new Date(),
          }
        });
        successCount++;
      } catch (e) {
        console.error(`Failed to migrate product option ${opt.id}:`, e);
        failedCount++;
      }
    }

    console.log(`Migration Complete! Successfully upserted ${successCount} product options. Failed: ${failedCount}`);
  } catch (err) {
    console.error("Error migrating product options:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrateProductOptions();
