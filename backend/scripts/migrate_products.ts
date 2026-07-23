import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from "path";
import fs from "fs";

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

async function migrateProducts() {
  console.log("Starting Product Migration from Supabase...");
  try {
    const { data: products, error } = await supabase.from('products').select('*');

    if (error && error.code !== '42P01') {
      throw error;
    }

    if (!products || products.length === 0) {
      console.log("No products found in Supabase (or table doesn't exist).");
      return;
    }

    console.log(`Found ${products.length} products in Supabase. Upserting into PostgreSQL...`);

    let successCount = 0;
    let failedCount = 0;
    for (const prod of products) {
      try {
        await prisma.product.upsert({
          where: { id: String(prod.id) },
          create: {
            id: String(prod.id),
            tenantId: prod.tenant_id,
            categoryId: String(prod.category_id),
            collectionId: prod.collection_id ? String(prod.collection_id) : null,
            name: prod.name,
            slug: prod.slug,
            sku: prod.sku,
            description: prod.description || null,
            longDescription: prod.long_description || null,
            imageUrl: prod.image_url || null,
            hoverImageUrl: prod.hover_image_url || null,
            basePrice: safeDecimal(prod.base_price),
            originalPrice: safeDecimal(prod.original_price),
            makingCharge: safeDecimal(prod.making_charge),
            stoneAmount: safeDecimal(prod.stone_amount),
            amountWithoutGst: safeDecimal(prod.amount_without_gst),
            gstAmount: safeDecimal(prod.gst_amount),
            gstPercentage: safeDecimal(prod.gst_percentage),
            amountWithoutStones: safeDecimal(prod.amount_without_stones),
            totalAmount: safeDecimal(prod.total_amount),
            grossWeight: safeDecimal(prod.gross_weight),
            netWeight: safeDecimal(prod.net_weight),
            wastage: safeDecimal(prod.wastage),
            metalType: prod.metaltype || null,
            rating: safeDecimal(prod.rating),
            stockQuantity: prod.stock_quantity || 0,
            isNew: prod.is_new || false,
            isBestSeller: prod.is_best_seller || false,
            isEngravable: prod.is_engravable || false,
            isActive: prod.is_active !== undefined ? prod.is_active : true,
            createdAt: prod.created_at ? new Date(prod.created_at) : new Date(),
            updatedAt: prod.updated_at ? new Date(prod.updated_at) : new Date(),
          },
          update: {
            tenantId: prod.tenant_id,
            categoryId: String(prod.category_id),
            collectionId: prod.collection_id ? String(prod.collection_id) : null,
            name: prod.name,
            slug: prod.slug,
            sku: prod.sku,
            description: prod.description || null,
            longDescription: prod.long_description || null,
            imageUrl: prod.image_url || null,
            hoverImageUrl: prod.hover_image_url || null,
            basePrice: safeDecimal(prod.base_price),
            originalPrice: safeDecimal(prod.original_price),
            makingCharge: safeDecimal(prod.making_charge),
            stoneAmount: safeDecimal(prod.stone_amount),
            amountWithoutGst: safeDecimal(prod.amount_without_gst),
            gstAmount: safeDecimal(prod.gst_amount),
            gstPercentage: safeDecimal(prod.gst_percentage),
            amountWithoutStones: safeDecimal(prod.amount_without_stones),
            totalAmount: safeDecimal(prod.total_amount),
            grossWeight: safeDecimal(prod.gross_weight),
            netWeight: safeDecimal(prod.net_weight),
            wastage: safeDecimal(prod.wastage),
            metalType: prod.metaltype || null,
            rating: safeDecimal(prod.rating),
            stockQuantity: prod.stock_quantity || 0,
            isNew: prod.is_new || false,
            isBestSeller: prod.is_best_seller || false,
            isEngravable: prod.is_engravable || false,
            isActive: prod.is_active !== undefined ? prod.is_active : true,
            createdAt: prod.created_at ? new Date(prod.created_at) : undefined,
            updatedAt: prod.updated_at ? new Date(prod.updated_at) : new Date(),
          }
        });
        successCount++;
      } catch (e) {
        console.error(`Failed to migrate product ${prod.id}:`, e);
        failedCount++;
      }
    }

    console.log(`Migration Complete! Successfully upserted ${successCount} products. Failed: ${failedCount}`);
  } catch (err) {
    console.error("Error migrating products:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrateProducts();
