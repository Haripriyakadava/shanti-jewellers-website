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

async function migrateReviews() {
  console.log("Starting Reviews Migration from Supabase...");
  try {
    const { data: reviews, error } = await supabase.from('reviews').select('*');

    if (error && error.code !== '42P01') {
      throw error;
    }

    if (!reviews || reviews.length === 0) {
      console.log("No reviews found in Supabase (or table doesn't exist).");
      return;
    }

    console.log(`Found ${reviews.length} reviews in Supabase. Upserting into PostgreSQL...`);

    let successCount = 0;
    let failedCount = 0;
    for (const r of reviews) {
      try {
        const payload = {
          id: String(r.id), // assuming ID could be number from supabase
          tenantId: r.tenant_id,
          productId: String(r.product_id),
          customerId: r.user_id ? String(r.user_id) : null,
          customerName: r.customer_name || 'Anonymous',
          customerEmail: r.customer_email || null,
          rating: r.rating || 5,
          title: r.review_title || null,
          text: r.review_text || null,
          verifiedPurchase: r.verified_purchase !== undefined ? r.verified_purchase : false,
          isApproved: r.is_approved !== undefined ? r.is_approved : false,
          helpfulCount: r.helpful_count || 0,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        };

        await prisma.review.upsert({
          where: { id: payload.id },
          create: payload,
          update: payload,
        });

        successCount++;
      } catch (e) {
        console.error(`Failed to migrate review ${r.id}:`, e);
        failedCount++;
      }
    }

    console.log(`Migration Complete! Successfully upserted ${successCount} reviews. Failed: ${failedCount}`);
  } catch (err) {
    console.error("Error migrating reviews:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrateReviews();
