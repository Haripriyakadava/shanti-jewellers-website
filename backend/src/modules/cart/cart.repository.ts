import { BaseRepository } from "../../repositories/base.repository";
import { Cart, CartItem, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export class CartRepository extends BaseRepository<Cart> {
  constructor() {
    super("cart");
  }

  async findOrCreateCart(tenantId: string, customerId: string): Promise<Cart & { items: CartItem[] }> {
    let cart = await this.model.findUnique({
      where: { customerId },
      include: { items: true },
    });

    if (!cart) {
      cart = await this.model.create({
        data: { tenantId, customerId },
        include: { items: true },
      });
    }

    return cart;
  }

  async getCart(tenantId: string, customerId: string) {
    return await this.model.findUnique({
      where: { customerId },
      include: { items: { orderBy: { createdAt: "asc" } } },
    });
  }

  async getCartItem(cartId: string, productId: string) {
    return await prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId, productId },
      },
    });
  }

  async getCartItemById(cartItemId: string) {
    return await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });
  }

  async addCartItem(data: Prisma.CartItemUncheckedCreateInput) {
    return await prisma.cartItem.create({ data });
  }

  async updateCartItem(cartItemId: string, quantity: number, totalPrice: number) {
    return await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity, totalPrice },
    });
  }

  async removeCartItem(cartItemId: string) {
    return await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  async clearCart(cartId: string) {
    return await prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }

  async getCartCount(customerId: string) {
    const cart = await this.model.findUnique({ where: { customerId } });
    if (!cart) return 0;
    
    const count = await prisma.cartItem.aggregate({
      where: { cartId: cart.id },
      _sum: { quantity: true }
    });
    return count._sum.quantity || 0;
  }
}

export const cartRepository = new CartRepository();