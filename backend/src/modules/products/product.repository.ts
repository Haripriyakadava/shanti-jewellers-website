import { prisma } from "../../lib/prisma";

export const productRepository = {
  async getProducts(tenantId: string, query: any) {
    const { category, collection, isNew, isBestSeller, minPrice, maxPrice, search } = query;
    
    let where: any = { tenantId, isActive: true };

    if (category) where.categorySlug = category;
    if (collection) where.collectionSlug = collection;
    if (isNew) where.isNew = isNew === 'true';
    if (isBestSeller) where.isBestSeller = isBestSeller === 'true';
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    // Using the ProductListView!
    return await (prisma as any).productListView.findMany({
      where,
    });
  },

  async getProductDetails(tenantId: string, productId: string) {
    return await prisma.product.findFirst({
      where: { id: productId, tenantId },
      include: {
        images: true,
        variants: true,
        options: true,
        metals: true,
        category: true,
        collection: true
      }
    });
  }
};
