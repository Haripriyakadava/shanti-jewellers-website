"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("./order.controller");
const tenant_middleware_1 = require("../../middleware/tenant.middleware");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const async_handler_1 = require("../../middleware/async-handler");
const router = (0, express_1.Router)();
// All routes require tenant context and customer authentication
router.use(tenant_middleware_1.tenantMiddleware, auth_middleware_1.authMiddleware);
// =====================
// CUSTOMER APIs
// =====================
/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Get all orders for logged-in customer
 *     tags: [Orders]
 */
router.get("/my-orders", (0, async_handler_1.asyncHandler)(order_controller_1.orderController.getMyOrders.bind(order_controller_1.orderController)));
router.get("/my-orders/:id", (0, async_handler_1.asyncHandler)(order_controller_1.orderController.getMyOrderById.bind(order_controller_1.orderController)));
// =====================
// ADMIN / STAFF APIs
// =====================
router.use((0, role_middleware_1.authorize)("ADMIN", "SUPER_ADMIN", "MANAGER"));
router.get("/", (0, async_handler_1.asyncHandler)(order_controller_1.orderController.getAllTenantOrders.bind(order_controller_1.orderController)));
router.get("/:id", (0, async_handler_1.asyncHandler)(order_controller_1.orderController.getOrderById.bind(order_controller_1.orderController)));
router.get("/order-number/:orderNumber", (0, async_handler_1.asyncHandler)(order_controller_1.orderController.getOrderByNumber.bind(order_controller_1.orderController)));
router.patch("/:id/status", (0, async_handler_1.asyncHandler)(order_controller_1.orderController.updateOrderStatus.bind(order_controller_1.orderController)));
router.patch("/:id/payment-status", (0, async_handler_1.asyncHandler)(order_controller_1.orderController.updatePaymentStatus.bind(order_controller_1.orderController)));
router.patch("/:id/delivery-status", (0, async_handler_1.asyncHandler)(order_controller_1.orderController.updateDeliveryStatus.bind(order_controller_1.orderController)));
router.post("/:id/shipment", (0, async_handler_1.asyncHandler)(order_controller_1.orderController.createShipment.bind(order_controller_1.orderController)));
exports.default = router;
