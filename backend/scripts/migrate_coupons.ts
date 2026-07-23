import { PrismaClient, DiscountType } from '@prisma/client';
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

function safeDecimalNullable(val: any): number | null {
  if (val === null || val === undefined) return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
}

function parseDiscountType(type: string): DiscountType {
  const upper = type?.toUpperCase();
  if (upper === 'FIXED') return DiscountType.FIXED;
  return DiscountType.PERCENTAGE;
}

async function migrateCoupons() {
  console.log("Starting Coupons Migration from Supabase...");
  try {
    const { data: coupons, error } = await supabase.from('coupons').select('*');

    if (error && error.code !== '42P01') {
      throw error;
    }

    if (!coupons || coupons.length === 0) {
      console.log("No coupons found in Supabase (or table doesn't exist).");
      return;
    }

    console.log(`Found ${coupons.length} coupons in Supabase. Upserting into PostgreSQL...`);

    let successCount = 0;
    let failedCount = 0;
    for (const c of coupons) {
      try {
        const payload = {
          code: c.code,
          description: c.description,
          discountType: parseDiscountType(c.discount_type),
          discountValue: safeDecimal(c.discount_value),
          minPurchaseAmount: safeDecimalNullable(c.min_purchase_amount),
          maxDiscount: safeDecimalNullable(c.max_discount),
          maxUsageCount: c.max_usage_count,
          usageCount: c.usage_count || 0,
          isActive: c.is_active !== undefined ? c.is_active : true,
          validFrom: c.valid_from ? new Date(c.valid_from) : new Date(),
          validUntil: c.valid_until ? new Date(c.valid_until) : new Date(),
          tenantId: c.tenant_id,
          createdAt: c.created_at ? new Date(c.created_at) : new Date(),
          updatedAt: c.updated_at ? new Date(c.updated_at) : new Date(),
        };

        // We can't use upsert by UUID if Supabase uses integer IDs. We will find by code and tenantId.
        const existing = await prisma.coupon.findUnique({
          where: { tenantId_code: { tenantId: c.tenant_id, code: c.code } }
        });

        if (existing) {
          await prisma.coupon.update({
            where: { tenantId_code: { tenantId: c.tenant_id, code: c.code } },
            data: payload
          });
        } else {
          await prisma.coupon.create({
            data: payload
          });
        }
        successCount++;
      } catch (e) {
        console.error(`Failed to migrate coupon ${c.code}:`, e);
        failedCount++;
      }
    }

    console.log(`Migration Complete! Successfully upserted ${successCount} coupons. Failed: ${failedCount}`);
  } catch (err) {
    console.error("Error migrating coupons:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCoupons();
