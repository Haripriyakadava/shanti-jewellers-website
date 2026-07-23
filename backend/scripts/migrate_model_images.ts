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

async function migrateModelImages() {
  console.log("Starting ModelImage Migration from Supabase...");
  try {
    const { data: images, error } = await supabase.from('model_images').select('*');

    if (error && error.code !== '42P01') {
      throw error;
    }

    if (!images || images.length === 0) {
      console.log("No model images found in Supabase (or table doesn't exist).");
      return;
    }

    console.log(`Found ${images.length} model images in Supabase. Upserting into PostgreSQL...`);

    let successCount = 0;
    let failedCount = 0;
    for (const img of images) {
      try {
        await prisma.modelImage.upsert({
          where: { id: String(img.id) },
          create: {
            id: String(img.id),
            title: img.title || 'Untitled',
            categoryId: String(img.category_id),
            imageUrl: img.image_url || '',
            isActive: img.is_active !== undefined ? img.is_active : true,
            displayOrder: img.sort_order || 0,
            tenantId: img.tenant_id,
            createdAt: img.created_at ? new Date(img.created_at) : new Date(),
            updatedAt: img.updated_at ? new Date(img.updated_at) : new Date(),
          },
          update: {
            title: img.title || 'Untitled',
            categoryId: String(img.category_id),
            imageUrl: img.image_url || '',
            isActive: img.is_active !== undefined ? img.is_active : true,
            displayOrder: img.sort_order || 0,
            tenantId: img.tenant_id,
            createdAt: img.created_at ? new Date(img.created_at) : undefined,
            updatedAt: img.updated_at ? new Date(img.updated_at) : new Date(),
          }
        });
        successCount++;
      } catch (e) {
        console.error(`Failed to migrate model image ${img.id}:`, e);
        failedCount++;
      }
    }

    console.log(`Migration Complete! Successfully upserted ${successCount} model images. Failed: ${failedCount}`);
  } catch (err) {
    console.error("Error migrating model images:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrateModelImages();
