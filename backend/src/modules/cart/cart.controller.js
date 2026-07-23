"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartController = exports.CartController = void 0;
const cart_service_1 = require("./cart.service");
const cart_validation_1 = require("./cart.validation");
const ResponseFormatter_1 = require("../../utils/ResponseFormatter");
class CartController {
    async getCart(req, res) {
        const tenantId = req.tenant.id;
        const customerId = req.customer.customerId;
        const cart = await cart_service_1.cartService.getCart(tenantId, customerId);
        return ResponseFormatter_1.ResponseFormatter.success(res, cart, "Cart retrieved successfully");
    }
    async addToCart(req, res) {
        const tenantId = req.tenant.id;
        const customerId = req.customer.customerId;
        const validatedData = cart_validation_1.addToCartSchema.parse(req.body);
        const cartItem = await cart_service_1.cartService.addToCart(tenantId, customerId, validatedData);
        return ResponseFormatter_1.ResponseFormatter.success(res, cartItem, "Item added to cart successfully", 201);
    }
    async updateCartItem(req, res) {
        const tenantId = req.tenant.id;
        const customerId = req.customer.customerId;
        const cartItemId = req.params.itemId;
        const validatedData = cart_validation_1.updateCartItemSchema.parse(req.body);
        const cartItem = await cart_service_1.cartService.updateCartItem(tenantId, customerId, cartItemId, validatedData);
        return ResponseFormatter_1.ResponseFormatter.success(res, cartItem, "Cart item updated successfully");
    }
    async removeCartItem(req, res) {
        const tenantId = req.tenant.id;
        const customerId = req.customer.customerId;
        const cartItemId = req.params.itemId;
        await cart_service_1.cartService.removeCartItem(tenantId, customerId, cartItemId);
        return ResponseFormatter_1.ResponseFormatter.success(res, null, "Cart item removed successfully");
    }
    async clearCart(req, res) {
        const tenantId = req.tenant.id;
        const customerId = req.customer.customerId;
        await cart_service_1.cartService.clearCart(tenantId, customerId);
        return ResponseFormatter_1.ResponseFormatter.success(res, null, "Cart cleared successfully");
    }
    async getCartCount(req, res) {
        const tenantId = req.tenant.id;
        const customerId = req.customer.customerId;
        const count = await cart_service_1.cartService.getCartCount(tenantId, customerId);
        return ResponseFormatter_1.ResponseFormatter.success(res, { count }, "Cart count retrieved successfully");
    }
}
exports.CartController = CartController;
exports.cartController = new CartController();
