import { fetchApi } from '@/lib/api-client';

export type BackendWishlistItem = {
  id: string;
  productId: string;
  productVariantId: string | null;
  createdAt: string;
  product: any; // We can type this better later
};

export const wishlistService = {
  async getWishlist(): Promise<BackendWishlistItem[]> {
    const response = await fetchApi('/wishlist');
    return response.data;
  },

  async addProduct(productId: string | number, productVariantId?: string): Promise<BackendWishlistItem> {
    const response = await fetchApi('/wishlist', {
      method: 'POST',
      body: JSON.stringify({
        productId: String(productId),
        productVariantId,
      }),
    });
    return response.data;
  },

  async removeProduct(productId: string | number, productVariantId?: string): Promise<void> {
    const url = productVariantId 
      ? `/wishlist/${productId}/${productVariantId}`
      : `/wishlist/${productId}`;
      
    await fetchApi(url, {
      method: 'DELETE',
    });
  }
};
