import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const prisma = new PrismaClient();

const safeDate = (d: any) => d ? new Date(d) : new Date();
const safeStr = (s: any) => s != null ? String(s) : null;

async function migrateData() {
  console.log("Starting data migration from Supabase to Prisma PostgreSQL...");

  const report = {
    tables: {} as Record<string, { supabaseCount: number, prismaCount: number }>,
    failed: [] as any[]
  };

  try {
    console.log("Migrating tenants...");
    const { data: tenants, error: err1 } = await supabase.from("tenants").select("*");
    if (err1 && err1.code !== '42P01') throw err1;
    let tenantCount = 0;
    for (const t of tenants || []) {
      const data = { name: t.name || 'Tenant', domain: t.domain || null, logo: t.logo || null, isActive: t.is_active ?? true, createdAt: safeDate(t.created_at), updatedAt: safeDate(t.updated_at) };
      await prisma.tenant.upsert({ where: { id: safeStr(t.id)! }, update: data, create: { id: safeStr(t.id)!, ...data } });
      tenantCount++;
    }
    report.tables.Tenant = { supabaseCount: (tenants || []).length, prismaCount: tenantCount };

    console.log("Migrating admin_users...");
    const { data: admins, error: err2 } = await supabase.from("admin_users").select("*");
    if (err2 && err2.code !== '42P01') throw err2;
    let adminCount = 0;
    for (const a of admins || []) {
      const data = { tenantId: safeStr(a.tenant_id)!, email: a.email, passwordHash: a.password_hash || '', role: a.role || 'MANAGER', isActive: a.is_active ?? true, createdAt: safeDate(a.created_at), updatedAt: safeDate(a.updated_at) };
      await prisma.adminUser.upsert({ where: { id: safeStr(a.id)! }, update: data, create: { id: safeStr(a.id)!, ...data } });
      adminCount++;
    }
    report.tables.AdminUser = { supabaseCount: (admins || []).length, prismaCount: adminCount };

    console.log("Migrating categories...");
    const { data: categories, error: err3 } = await supabase.from("categories").select("*");
    if (err3 && err3.code !== '42P01') throw err3;
    let categoryCount = 0;
    const sortedCategories = (categories || []).sort((a, b) => (a.parent_id ? 1 : 0) - (b.parent_id ? 1 : 0));
    for (const c of sortedCategories) {
      const data = { tenantId: safeStr(c.tenant_id)!, parentId: safeStr(c.parent_id), name: c.name || 'Cat', slug: c.slug || c.id, image: c.image || null, icon: c.icon || null, createdAt: safeDate(c.created_at), updatedAt: safeDate(c.updated_at) };
      await prisma.category.upsert({ where: { id: safeStr(c.id)! }, update: data, create: { id: safeStr(c.id)!, ...data } });
      categoryCount++;
    }
    report.tables.Category = { supabaseCount: (categories || []).length, prismaCount: categoryCount };

    console.log("Migrating collections...");
    const { data: collections, error: err4 } = await supabase.from("collections").select("*");
    if (err4 && err4.code !== '42P01') throw err4;
    let collectionCount = 0;
    for (const c of collections || []) {
      const data = { tenantId: safeStr(c.tenant_id)!, name: c.name || 'Col', slug: c.slug || c.id, description: c.description || null, banner: c.banner || null, image: c.image || null, createdAt: safeDate(c.created_at), updatedAt: safeDate(c.updated_at) };
      await prisma.collection.upsert({ where: { id: safeStr(c.id)! }, update: data, create: { id: safeStr(c.id)!, ...data } });
      collectionCount++;
    }
    report.tables.Collection = { supabaseCount: (collections || []).length, prismaCount: collectionCount };

    console.log("Migrating products...");
    const { data: products, error: err5 } = await supabase.from("products").select("*");
    if (err5 && err5.code !== '42P01') throw err5;
    let productCount = 0;
    for (const p of products || []) {
      const data = {
        tenantId: safeStr(p.tenant_id)!, categoryId: safeStr(p.category_id)!, collectionId: safeStr(p.collection_id),
        name: p.name || 'Prod', slug: p.slug || p.id, sku: p.sku || p.id, description: p.description || null, shortDescription: p.short_description || null,
        purity: p.purity || null, makingCharges: p.making_charges || null, wastage: p.wastage || null, weight: p.weight || null,
        gender: p.gender || null, occasion: p.occasion || null, certification: p.certification || null, stock: p.stock ?? 0,
        featured: p.featured ?? false, bestseller: p.bestseller ?? false, newArrival: p.new_arrival ?? false, active: p.is_active ?? true,
        seoTitle: p.seo_title || null, seoDescription: p.seo_description || null,
        createdAt: safeDate(p.created_at), updatedAt: safeDate(p.updated_at), deletedAt: p.deleted_at ? safeDate(p.deleted_at) : null
      };
      await prisma.product.upsert({ where: { id: safeStr(p.id)! }, update: data, create: { id: safeStr(p.id)!, ...data } });
      productCount++;
    }
    report.tables.Product = { supabaseCount: (products || []).length, prismaCount: productCount };

    console.log("Migrating product_images...");
    const { data: productImages, error: err6 } = await supabase.from("product_images").select("*");
    if (err6 && err6.code !== '42P01') throw err6;
    let imageCount = 0;
    for (const pi of productImages || []) {
      if (!pi.product_id) continue;
      const data = { productId: safeStr(pi.product_id)!, url: pi.url || pi.image_url || '', altText: pi.alt_text || null, displayOrder: pi.display_order ?? 0, isPrimary: pi.is_primary ?? false, createdAt: safeDate(pi.created_at), updatedAt: safeDate(pi.updated_at) };
      await prisma.productImage.upsert({ where: { id: safeStr(pi.id)! }, update: data, create: { id: safeStr(pi.id)!, ...data } });
      imageCount++;
    }
    report.tables.ProductImage = { supabaseCount: (productImages || []).length, prismaCount: imageCount };

    console.log("Migrating product_variants...");
    const { data: variants, error: err7 } = await supabase.from("product_variants").select("*");
    if (err7 && err7.code !== '42P01') throw err7;
    let variantCount = 0;
    for (const v of variants || []) {
      if (!v.product_id) continue;
      const data = { productId: safeStr(v.product_id)!, size: v.size || null, color: v.color || null, weight: v.weight || null, price: v.price || 0, stock: v.stock ?? 0, sku: v.sku || null, createdAt: safeDate(v.created_at), updatedAt: safeDate(v.updated_at), deletedAt: v.deleted_at ? safeDate(v.deleted_at) : null };
      await prisma.productVariant.upsert({ where: { id: safeStr(v.id)! }, update: data, create: { id: safeStr(v.id)!, ...data } });
      variantCount++;
    }
    report.tables.ProductVariant = { supabaseCount: (variants || []).length, prismaCount: variantCount };

    console.log("Migrating metals...");
    const { data: metals, error: err10 } = await supabase.from("metals").select("*");
    if (err10 && err10.code !== '42P01') throw err10;
    let metalCount = 0;
    for (const m of metals || []) {
      const data = { tenantId: safeStr(m.tenant_id)!, name: m.name || 'Metal', purity: m.purity || '', createdAt: safeDate(m.created_at), updatedAt: safeDate(m.updated_at) };
      await prisma.metal.upsert({ where: { id: safeStr(m.id)! }, update: data, create: { id: safeStr(m.id)!, ...data } });
      metalCount++;
    }
    report.tables.Metal = { supabaseCount: (metals || []).length, prismaCount: metalCount };

    console.log("Migrating product_metals...");
    const { data: productMetals, error: err9 } = await supabase.from("product_metals").select("*");
    if (err9 && err9.code !== '42P01') throw err9;
    let pmCount = 0;
    for (const pm of productMetals || []) {
      if (!pm.product_id || !pm.metal_id) continue;
      const data = { productId: safeStr(pm.product_id)!, metalId: safeStr(pm.metal_id)!, createdAt: safeDate(pm.created_at), updatedAt: safeDate(pm.updated_at) };
      await prisma.productMetal.upsert({ where: { id: safeStr(pm.id)! }, update: data, create: { id: safeStr(pm.id)!, ...data } });
      pmCount++;
    }
    report.tables.ProductMetal = { supabaseCount: (productMetals || []).length, prismaCount: pmCount };

    console.log("Migrating product_options...");
    const { data: productOptions, error: err8 } = await supabase.from("product_options").select("*");
    if (err8 && err8.code !== '42P01') throw err8;
    let poCount = 0;
    for (const po of productOptions || []) {
      if (!po.product_id) continue;
      const data = { productId: safeStr(po.product_id)!, name: po.name || 'Option', value: po.value || '', createdAt: safeDate(po.created_at), updatedAt: safeDate(po.updated_at) };
      await prisma.productOption.upsert({ where: { id: safeStr(po.id)! }, update: data, create: { id: safeStr(po.id)!, ...data } });
      poCount++;
    }
    report.tables.ProductOption = { supabaseCount: (productOptions || []).length, prismaCount: poCount };

    console.log("Migrating metal_prices...");
    const { data: metalPrices, error: err11 } = await supabase.from("metal_prices").select("*");
    if (err11 && err11.code !== '42P01') throw err11;
    let mpCount = 0;
    for (const mp of metalPrices || []) {
      if (!mp.metal_id) continue;
      const data = { metalId: safeStr(mp.metal_id)!, price: mp.price || 0, currency: mp.currency || 'INR', timestamp: safeDate(mp.timestamp), createdAt: safeDate(mp.created_at), updatedAt: safeDate(mp.updated_at) };
      await prisma.metalPrice.upsert({ where: { id: safeStr(mp.id)! }, update: data, create: { id: safeStr(mp.id)!, ...data } });
      mpCount++;
    }
    report.tables.MetalPrice = { supabaseCount: (metalPrices || []).length, prismaCount: mpCount };

    console.log("Migrating stones...");
    const { data: stones, error: err12 } = await supabase.from("stones").select("*");
    if (err12 && err12.code !== '42P01') throw err12;
    let stoneCount = 0;
    for (const s of stones || []) {
      const data = { tenantId: safeStr(s.tenant_id)!, name: s.name || 'Stone', type: s.type || '', color: s.color || null, createdAt: safeDate(s.created_at), updatedAt: safeDate(s.updated_at) };
      await prisma.stone.upsert({ where: { id: safeStr(s.id)! }, update: data, create: { id: safeStr(s.id)!, ...data } });
      stoneCount++;
    }
    report.tables.Stone = { supabaseCount: (stones || []).length, prismaCount: stoneCount };

    console.log("Migrating ring_sizes...");
    const { data: ringSizes, error: err13 } = await supabase.from("ring_sizes").select("*");
    if (err13 && err13.code !== '42P01') throw err13;
    let rsCount = 0;
    for (const rs of ringSizes || []) {
      const data = { tenantId: safeStr(rs.tenant_id)!, indianSize: rs.indian_size || '', usSize: rs.us_size || null, diameter: rs.diameter || null, circumference: rs.circumference || null, createdAt: safeDate(rs.created_at), updatedAt: safeDate(rs.updated_at) };
      await prisma.ringSize.upsert({ where: { id: safeStr(rs.id)! }, update: data, create: { id: safeStr(rs.id)!, ...data } });
      rsCount++;
    }
    report.tables.RingSize = { supabaseCount: (ringSizes || []).length, prismaCount: rsCount };

    console.log("Migrating model_images...");
    const { data: modelImages, error: err14 } = await supabase.from("model_images").select("*");
    if (err14 && err14.code !== '42P01') throw err14;
    let miCount = 0;
    for (const mi of modelImages || []) {
      const data = { tenantId: safeStr(mi.tenant_id)!, url: mi.url || mi.image_url || '', gender: mi.gender || null, displayOrder: mi.display_order ?? 0, createdAt: safeDate(mi.created_at), updatedAt: safeDate(mi.updated_at) };
      await prisma.modelImage.upsert({ where: { id: safeStr(mi.id)! }, update: data, create: { id: safeStr(mi.id)!, ...data } });
      miCount++;
    }
    report.tables.ModelImage = { supabaseCount: (modelImages || []).length, prismaCount: miCount };

    console.log("Migrating coupons...");
    const { data: coupons, error: err15 } = await supabase.from("coupons").select("*");
    if (err15 && err15.code !== '42P01') throw err15;
    let couponCount = 0;
    for (const c of coupons || []) {
      const data = { tenantId: safeStr(c.tenant_id)!, code: c.code || '', description: c.description || null, discountType: c.discount_type || 'PERCENTAGE', discountValue: c.discount_value || 0, minOrderValue: c.minimum_order_amount || null, maxDiscount: c.maximum_discount || null, usageLimit: c.usage_limit || null, usedCount: c.used_count ?? 0, active: c.is_active ?? true, startDate: c.start_date ? safeDate(c.start_date) : null, expiryDate: c.end_date ? safeDate(c.end_date) : null, createdAt: safeDate(c.created_at), updatedAt: safeDate(c.updated_at) };
      await prisma.coupon.upsert({ where: { id: safeStr(c.id)! }, update: data, create: { id: safeStr(c.id)!, ...data } });
      couponCount++;
    }
    report.tables.Coupon = { supabaseCount: (coupons || []).length, prismaCount: couponCount };

    console.log("Migrating reviews...");
    const { data: reviews, error: err16 } = await supabase.from("reviews").select("*");
    if (err16 && err16.code !== '42P01') throw err16;
    let reviewCount = 0;
    for (const r of reviews || []) {
      if (!r.product_id || !r.customer_id) continue;
      const data = { tenantId: safeStr(r.tenant_id)!, productId: safeStr(r.product_id)!, customerId: safeStr(r.customer_id)!, rating: r.rating || 5, title: r.title || null, comment: r.comment || null, isApproved: r.is_approved ?? false, createdAt: safeDate(r.created_at), updatedAt: safeDate(r.updated_at) };
      await prisma.review.upsert({ where: { id: safeStr(r.id)! }, update: data, create: { id: safeStr(r.id)!, ...data } });
      reviewCount++;
    }
    report.tables.Review = { supabaseCount: (reviews || []).length, prismaCount: reviewCount };

  } catch (error) {
    console.error("Migration error:", error);
    report.failed.push(error);
  } finally {
    console.log("\n====== MIGRATION REPORT ======");
    console.table(report.tables);
    if (report.failed.length > 0) {
      console.error("\nFailed with errors:", report.failed);
    } else {
      console.log("\nMigration completed successfully without errors.");
    }
    await prisma.$disconnect();
  }
}

migrateData();
