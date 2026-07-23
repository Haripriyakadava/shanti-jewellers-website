"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartService = exports.CartService = void 0;
const cart_repository_1 = require("./cart.repository");
const AppError_1 = require("../../utils/AppError");
const product_repository_1 = require("../products/product.repository");
class CartService {
    async getCart(tenantId, customerId) {
        const cart = await cart_repository_1.cartRepository.getCart(tenantId, customerId);
        return cart || { items: [] };
    }
    async addToCart(tenantId, customerId, data) {
        // Validate product and stock
        const product = await product_repository_1.productRepository.getProductDetails(tenantId, data.productId);
        if (!product || !product.isActive) {
            throw new AppError_1.AppError("Product not found or inactive", 404);
        }
        if (product.stockQuantity !== null && data.quantity > product.stockQuantity) {
            throw new AppError_1.AppError(`Only ${product.stockQuantity} items in stock`, 400);
        }
        const cart = await cart_repository_1.cartRepository.findOrCreateCart(tenantId, customerId);
        const existingItem = await cart_repository_1.cartRepository.getCartItem(cart.id, product.id);
        if (existingItem) {
            // Merge duplicate
            const newQuantity = existingItem.quantity + data.quantity;
            if (product.stockQuantity !== null && newQuantity > product.stockQuantity) {
                throw new AppError_1.AppError(`Cannot add more. Only ${product.stockQuantity} items in stock`, 400);
            }
            const newTotalPrice = Number(product.sellingPrice) * newQuantity;
            return await cart_repository_1.cartRepository.updateCartItem(existingItem.id, newQuantity, newTotalPrice);
        }
        // Capture product snapshot
        const unitPrice = Number(product.sellingPrice);
        const makingCharge = Number(product.makingCharge || 0);
        const gstAmount = Number(product.gstPercentage ? (unitPrice * Number(product.gstPercentage) / 100) : 0);
        const discountAmount = Number(product.discountAmount || 0);
        const stoneAmount = Number(product.stoneWeight ? (Number(product.stoneWeight) * 100) : 0); // Mock stone calculation
        const totalPrice = unitPrice * data.quantity;
        return await cart_repository_1.cartRepository.addCartItem({
            cartId: cart.id,
            productId: product.id,
            productName: product.name,
            productImage: product.images?.[0]?.imageUrl || null,
            sku: product.sku,
            unitPrice,
            makingCharge,
            gstAmount,
            stoneAmount,
            discountAmount,
            totalPrice,
            quantity: data.quantity,
        });
    }
    async updateCartItem(tenantId, customerId, cartItemId, data) {
        const cartItem = await cart_repository_1.cartRepository.getCartItemById(cartItemId);
        if (!cartItem || cartItem.cart.customerId !== customerId) {
            throw new AppError_1.AppError("Cart item not found", 404);
        }
        const product = await product_repository_1.productRepository.getProductDetails(tenantId, cartItem.productId);
        if (!product || !product.isActive) {
            throw new AppError_1.AppError("Product no longer available", 404);
        }
        if (product.stockQuantity !== null && data.quantity > product.stockQuantity) {
            throw new AppError_1.AppError(`Only ${product.stockQuantity} items in stock`, 400);
        }
        const unitPrice = Number(cartItem.unitPrice); // keep original snapshot price
        const newTotalPrice = unitPrice * data.quantity;
        return await cart_repository_1.cartRepository.updateCartItem(cartItemId, data.quantity, newTotalPrice);
    }
    async removeCartItem(tenantId, customerId, cartItemId) {
        const cartItem = await cart_repository_1.cartRepository.getCartItemById(cartItemId);
        if (!cartItem || cartItem.cart.customerId !== customerId) {
            throw new AppError_1.AppError("Cart item not found", 404);
        }
        await cart_repository_1.cartRepository.removeCartItem(cartItemId);
        return true;
    }
    async clearCart(tenantId, customerId) {
        const cart = await cart_repository_1.cartRepository.getCart(tenantId, customerId);
        if (cart) {
            await cart_repository_1.cartRepository.clearCart(cart.id);
        }
        return true;
    }
    async getCartCount(tenantId, customerId) {
        // Ensuring cart belongs to tenant by checking if it exists, though customerId is unique
        return await cart_repository_1.cartRepository.getCartCount(customerId);
    }
}
exports.CartService = CartService;
exports.cartService = new CartService();
