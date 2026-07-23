"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRepository = exports.CartRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const prisma_1 = require("../../lib/prisma");
class CartRepository extends base_repository_1.BaseRepository {
    constructor() {
        super("cart");
    }
    async findOrCreateCart(tenantId, customerId) {
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
    async getCart(tenantId, customerId) {
        return await this.model.findUnique({
            where: { customerId },
            include: { items: { orderBy: { createdAt: "asc" } } },
        });
    }
    async getCartItem(cartId, productId) {
        return await prisma_1.prisma.cartItem.findUnique({
            where: {
                cartId_productId: { cartId, productId },
            },
        });
    }
    async getCartItemById(cartItemId) {
        return await prisma_1.prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: { cart: true },
        });
    }
    async addCartItem(data) {
        return await prisma_1.prisma.cartItem.create({ data });
    }
    async updateCartItem(cartItemId, quantity, totalPrice) {
        return await prisma_1.prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity, totalPrice },
        });
    }
    async removeCartItem(cartItemId) {
        return await prisma_1.prisma.cartItem.delete({
            where: { id: cartItemId },
        });
    }
    async clearCart(cartId) {
        return await prisma_1.prisma.cartItem.deleteMany({
            where: { cartId },
        });
    }
    async getCartCount(customerId) {
        const cart = await this.model.findUnique({ where: { customerId } });
        if (!cart)
            return 0;
        const count = await prisma_1.prisma.cartItem.aggregate({
            where: { cartId: cart.id },
            _sum: { quantity: true }
        });
        return count._sum.quantity || 0;
    }
}
exports.CartRepository = CartRepository;
exports.cartRepository = new CartRepository();
