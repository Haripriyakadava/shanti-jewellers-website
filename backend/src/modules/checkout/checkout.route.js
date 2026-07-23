"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkout_controller_1 = require("./checkout.controller");
const tenant_middleware_1 = require("../../middleware/tenant.middleware");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const async_handler_1 = require("../../middleware/async-handler");
const router = (0, express_1.Router)();
// All checkout routes require tenant context and customer authentication
router.use(tenant_middleware_1.tenantMiddleware, auth_middleware_1.authMiddleware);
/**
 * @swagger
 * /api/checkout/summary:
 *   get:
 *     summary: Get checkout summary with calculations
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 */
router.get("/summary", (0, async_handler_1.asyncHandler)(checkout_controller_1.checkoutController.getSummary.bind(checkout_controller_1.checkoutController)));
router.post("/apply-coupon", (0, async_handler_1.asyncHandler)(checkout_controller_1.checkoutController.applyCoupon.bind(checkout_controller_1.checkoutController)));
router.post("/remove-coupon", (0, async_handler_1.asyncHandler)(checkout_controller_1.checkoutController.removeCoupon.bind(checkout_controller_1.checkoutController)));
router.post("/", (0, async_handler_1.asyncHandler)(checkout_controller_1.checkoutController.processCheckout.bind(checkout_controller_1.checkoutController)));
exports.default = router;
