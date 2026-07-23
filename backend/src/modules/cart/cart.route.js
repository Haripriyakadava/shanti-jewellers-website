"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("./cart.controller");
const tenant_middleware_1 = require("../../middleware/tenant.middleware");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const async_handler_1 = require("../../middleware/async-handler");
const router = (0, express_1.Router)();
// All cart routes require tenant context and customer authentication
router.use(tenant_middleware_1.tenantMiddleware, auth_middleware_1.authMiddleware);
/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get the current customer's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", (0, async_handler_1.asyncHandler)(cart_controller_1.cartController.getCart.bind(cart_controller_1.cartController)));
router.get("/count", (0, async_handler_1.asyncHandler)(cart_controller_1.cartController.getCartCount.bind(cart_controller_1.cartController)));
router.post("/add", (0, async_handler_1.asyncHandler)(cart_controller_1.cartController.addToCart.bind(cart_controller_1.cartController)));
router.put("/update/:itemId", (0, async_handler_1.asyncHandler)(cart_controller_1.cartController.updateCartItem.bind(cart_controller_1.cartController)));
router.delete("/remove/:itemId", (0, async_handler_1.asyncHandler)(cart_controller_1.cartController.removeCartItem.bind(cart_controller_1.cartController)));
router.delete("/clear", (0, async_handler_1.asyncHandler)(cart_controller_1.cartController.clearCart.bind(cart_controller_1.cartController)));
exports.default = router;
