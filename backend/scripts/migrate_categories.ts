import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateCategories() {
  console.log("Starting Category Migration from Supabase...");
  try {
    const { data: categories, error } = await supabase.from('categories').select('*');

    if (error) {
      throw error;
    }

    if (!categories || categories.length === 0) {
      console.log("No categories found in Supabase.");
      return;
    }

    console.log(`Found ${categories.length} categories in Supabase. Upserting into PostgreSQL...`);

    let successCount = 0;
    for (const cat of categories) {
      await prisma.category.upsert({
        where: { id: String(cat.id) },
        create: {
          id: String(cat.id),
          tenantId: cat.tenant_id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || null,
          imageUrl: cat.image_url || null, // Assuming Supabase already has S3 URL or we only store URL
          displayOrder: cat.sort_order || 0,
          isActive: cat.is_active !== undefined ? cat.is_active : true,
          createdAt: cat.created_at ? new Date(cat.created_at) : new Date(),
          updatedAt: cat.updated_at ? new Date(cat.updated_at) : new Date(),
          // New fields initialized
          parentCategoryId: cat.parent_id || null, // Wait, Supabase might not have parent_id or it's parent_id
          isFeatured: false,
          seoTitle: null,
          seoDescription: null,
          deletedAt: null
        },
        update: {
          tenantId: cat.tenant_id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || null,
          imageUrl: cat.image_url || null,
          displayOrder: cat.sort_order || 0,
          isActive: cat.is_active !== undefined ? cat.is_active : true,
          createdAt: cat.created_at ? new Date(cat.created_at) : undefined,
          updatedAt: cat.updated_at ? new Date(cat.updated_at) : new Date()
        }
      });
      successCount++;
    }

    console.log(`Migration Complete! Successfully upserted ${successCount} categories.`);
  } catch (err) {
    console.error("Error migrating categories:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCategories();
