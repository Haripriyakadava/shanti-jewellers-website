const fs = require('fs');
let code = fs.readFileSync('scripts/migrate_supabase_to_prisma.ts', 'utf8');

// For productMetals
code = code.replace(
  'const data = { productId: safeStr(pm.product_id)!, metalId: safeStr(pm.metal_id)!, createdAt: safeDate(pm.created_at), updatedAt: safeDate(pm.updated_at) };',
  'if (!pm.product_id || !pm.metal_id) continue;\n      const data = { productId: safeStr(pm.product_id)!, metalId: safeStr(pm.metal_id)!, createdAt: safeDate(pm.created_at), updatedAt: safeDate(pm.updated_at) };'
);

// For productImages
code = code.replace(
  'const data = { productId: safeStr(pi.product_id)!, url: pi.url || pi.image_url || \'\', altText: pi.alt_text || null, displayOrder: pi.display_order ?? 0, isPrimary: pi.is_primary ?? false, createdAt: safeDate(pi.created_at), updatedAt: safeDate(pi.updated_at) };',
  'if (!pi.product_id) continue;\n      const data = { productId: safeStr(pi.product_id)!, url: pi.url || pi.image_url || \'\', altText: pi.alt_text || null, displayOrder: pi.display_order ?? 0, isPrimary: pi.is_primary ?? false, createdAt: safeDate(pi.created_at), updatedAt: safeDate(pi.updated_at) };'
);

// For productVariants
code = code.replace(
  'const data = { productId: safeStr(v.product_id)!, size: v.size || null, color: v.color || null, weight: v.weight || null, price: v.price || 0, stock: v.stock ?? 0, sku: v.sku || null, createdAt: safeDate(v.created_at), updatedAt: safeDate(v.updated_at), deletedAt: v.deleted_at ? safeDate(v.deleted_at) : null };',
  'if (!v.product_id) continue;\n      const data = { productId: safeStr(v.product_id)!, size: v.size || null, color: v.color || null, weight: v.weight || null, price: v.price || 0, stock: v.stock ?? 0, sku: v.sku || null, createdAt: safeDate(v.created_at), updatedAt: safeDate(v.updated_at), deletedAt: v.deleted_at ? safeDate(v.deleted_at) : null };'
);

// For productOptions
code = code.replace(
  'const data = { productId: safeStr(po.product_id)!, name: po.name || \'Option\', value: po.value || \'\', createdAt: safeDate(po.created_at), updatedAt: safeDate(po.updated_at) };',
  'if (!po.product_id) continue;\n      const data = { productId: safeStr(po.product_id)!, name: po.name || \'Option\', value: po.value || \'\', createdAt: safeDate(po.created_at), updatedAt: safeDate(po.updated_at) };'
);

// For metalPrices
code = code.replace(
  'const data = { metalId: safeStr(mp.metal_id)!, price: mp.price || 0, currency: mp.currency || \'INR\', timestamp: safeDate(mp.timestamp), createdAt: safeDate(mp.created_at), updatedAt: safeDate(mp.updated_at) };',
  'if (!mp.metal_id) continue;\n      const data = { metalId: safeStr(mp.metal_id)!, price: mp.price || 0, currency: mp.currency || \'INR\', timestamp: safeDate(mp.timestamp), createdAt: safeDate(mp.created_at), updatedAt: safeDate(mp.updated_at) };'
);

// For reviews
code = code.replace(
  'const data = { tenantId: safeStr(r.tenant_id)!, productId: safeStr(r.product_id)!, customerId: safeStr(r.customer_id)!, rating: r.rating || 5, title: r.title || null, comment: r.comment || null, isApproved: r.is_approved ?? false, createdAt: safeDate(r.created_at), updatedAt: safeDate(r.updated_at) };',
  'if (!r.product_id || !r.customer_id) continue;\n      const data = { tenantId: safeStr(r.tenant_id)!, productId: safeStr(r.product_id)!, customerId: safeStr(r.customer_id)!, rating: r.rating || 5, title: r.title || null, comment: r.comment || null, isApproved: r.is_approved ?? false, createdAt: safeDate(r.created_at), updatedAt: safeDate(r.updated_at) };'
);

fs.writeFileSync('scripts/migrate_supabase_to_prisma.ts', code);
