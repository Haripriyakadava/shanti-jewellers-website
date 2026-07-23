import { fetchApi } from '@/lib/api-client';

export type BackendCartItem = {
  id: string;
  cartId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  makingCharge: number;
  gstAmount: number;
  stoneAmount: number;
  discountAmount: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
};

export type BackendCart = {
  id: string;
  cartCode: string | null;
  tenantId: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  items: BackendCartItem[];
};

export const cartService = {
  async getCart(): Promise<BackendCart> {
    const response = await fetchApi('/cart');
    return response.data;
  },

  async addToCart(productId: string | number, quantity: number, selection?: string): Promise<BackendCartItem> {
    const response = await fetchApi('/cart/add', {
      method: 'POST',
      body: JSON.stringify({
        productId: String(productId),
        quantity,
        selection
      }),
    });
    return response.data;
  },

  async updateCartItem(cartItemId: string, quantity: number): Promise<BackendCartItem> {
    const response = await fetchApi(`/cart/update/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({
        quantity,
      }),
    });
    return response.data;
  },

  async removeCartItem(cartItemId: string): Promise<void> {
    await fetchApi(`/cart/remove/${cartItemId}`, {
      method: 'DELETE',
    });
  },

  async clearCart(): Promise<void> {
    await fetchApi('/cart/clear', {
      method: 'DELETE',
    });
  }
};
