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

async function migrateCollections() {
  console.log("Starting Collection Migration from Supabase...");
  try {
    const { data: collections, error } = await supabase.from('collections').select('*');

    if (error && error.code !== '42P01') {
      throw error;
    }

    if (!collections || collections.length === 0) {
      console.log("No collections found in Supabase (or table doesn't exist).");
      return;
    }

    console.log(`Found ${collections.length} collections in Supabase. Upserting into PostgreSQL...`);

    let successCount = 0;
    for (const col of collections) {
      await prisma.collection.upsert({
        where: { id: String(col.id) },
        create: {
          id: String(col.id),
          tenantId: col.tenant_id,
          name: col.name,
          slug: col.slug,
          subtitle: col.subtitle || null,
          description: col.description || null,
          image: col.image_url || null, // Mapping from image_url
          banner: col.banner_image_url || null, // Mapping from banner_image_url
          displayOrder: col.sort_order || 0,
          isActive: col.is_active !== undefined ? col.is_active : true,
          createdAt: col.created_at ? new Date(col.created_at) : new Date(),
          updatedAt: col.updated_at ? new Date(col.updated_at) : new Date(),
          // Initializing new fields
          isFeatured: false,
          seoTitle: null,
          seoDescription: null,
          deletedAt: null
        },
        update: {
          tenantId: col.tenant_id,
          name: col.name,
          slug: col.slug,
          subtitle: col.subtitle || null,
          description: col.description || null,
          image: col.image_url || null,
          banner: col.banner_image_url || null,
          displayOrder: col.sort_order || 0,
          isActive: col.is_active !== undefined ? col.is_active : true,
          createdAt: col.created_at ? new Date(col.created_at) : undefined,
          updatedAt: col.updated_at ? new Date(col.updated_at) : new Date()
        }
      });
      successCount++;
    }

    console.log(`Migration Complete! Successfully upserted ${successCount} collections.`);
  } catch (err) {
    console.error("Error migrating collections:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCollections();
