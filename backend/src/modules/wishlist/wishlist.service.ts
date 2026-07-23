import { wishlistRepository } from "./wishlist.repository";
import { productValidationService } from "../../services/product-validation.service";

export class WishlistService {
  async getWishlist(tenantId: string, customerId: string) {
    // 1. Fetch wishlist from PostgreSQL
    const wishlistItems = await wishlistRepository.getWishlist(tenantId, customerId);

    if (!wishlistItems || wishlistItems.length === 0) {
      return [];
    }

    // 2. Extract unique product IDs
    const productIds = [...new Set(wishlistItems.map((item: any) => item.productId))];

    // 3. Bulk fetch from Prisma
    const supabaseProducts = await productValidationService.getBulkProducts(tenantId, productIds as string[]);
    
    // Create a map for quick lookup
    const productMap = new Map(supabaseProducts.map(p => [String(p.id), p]));

    // 4. Merge results
    const mergedWishlist = wishlistItems.map((item: any) => {
      const productData = productMap.get(item.productId) || null;
      return {
        id: item.id,
        productId: item.productId,
        productVariantId: item.productVariantId,
        createdAt: item.createdAt,
        product: productData,
      };
    });

    return mergedWishlist;
  }

  async addProduct(tenantId: string, customerId: string, productId: string, productVariantId?: string) {
    // 1. Validate product exists in Prisma
    await productValidationService.getValidProduct(tenantId, productId);

    // 2. Add to PostgreSQL
    const result = await wishlistRepository.addProduct(tenantId, customerId, productId, productVariantId);
    return result;
  }

  async removeProduct(tenantId: string, customerId: string, productId: string, productVariantId?: string) {
    return await wishlistRepository.removeProduct(tenantId, customerId, productId, productVariantId);
  }
}

export const wishlistService = new WishlistService();
