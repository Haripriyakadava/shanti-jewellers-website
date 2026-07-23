-- Create view
CREATE OR REPLACE VIEW "ProductListView" AS
SELECT 
  p.id,
  p."tenantId",
  p.name,
  p.slug,
  p.sku,
  p."basePrice",
  p."originalPrice",
  p."imageUrl" AS image,
  p."hoverImageUrl" AS "hoverImage",
  p."stockQuantity",
  p.rating,
  p."isNew",
  p."isBestSeller",
  p."isActive",
  cat.name AS "categoryName",
  cat.slug AS "categorySlug",
  col.name AS "collectionName",
  col.slug AS "collectionSlug",
  COALESCE(COUNT(r.id), 0)::integer AS "reviewCount",
  AVG(r.rating) AS "averageRating"
FROM "Product" p
LEFT JOIN "Category" cat ON p."categoryId" = cat.id
LEFT JOIN "Collection" col ON p."collectionId" = col.id
LEFT JOIN "Review" r ON p.id = r."productId"
GROUP BY 
  p.id, p."tenantId", p.name, p.slug, p.sku, p."basePrice", p."originalPrice",
  p."imageUrl", p."hoverImageUrl", p."stockQuantity", p.rating, p."isNew", p."isBestSeller", p."isActive",
  cat.name, cat.slug, col.name, col.slug;

-- Create Indexes if not exists
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Product_collectionId_idx" ON "Product"("collectionId");
CREATE INDEX IF NOT EXISTS "Product_isActive_isNew_isBestSeller_tenantId_idx" ON "Product"("isActive", "isNew", "isBestSeller", "tenantId");
CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId");
CREATE INDEX IF NOT EXISTS "Category_slug_idx" ON "Category"("slug");
CREATE INDEX IF NOT EXISTS "Collection_slug_idx" ON "Collection"("slug");
