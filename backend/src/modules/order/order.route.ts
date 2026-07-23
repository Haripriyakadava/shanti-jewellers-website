import { Router } from "express";
import { orderController } from "./order.controller";
import {  } from "../../middleware/tenant.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { asyncHandler } from "../../middleware/async-handler";

const router = Router();

// All routes require tenant context and customer authentication
router.use(authMiddleware);

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
router.get("/my-orders", asyncHandler(orderController.getMyOrders.bind(orderController)));
router.get("/my-orders/:id", asyncHandler(orderController.getMyOrderById.bind(orderController)));

// =====================
// ADMIN / STAFF APIs
// =====================

router.use(authorize("ADMIN", "SUPER_ADMIN", "MANAGER"));

router.get("/", asyncHandler(orderController.getAllTenantOrders.bind(orderController)));
router.get("/:id", asyncHandler(orderController.getOrderById.bind(orderController)));
router.get("/order-number/:orderNumber", asyncHandler(orderController.getOrderByNumber.bind(orderController)));

router.patch("/:id/status", asyncHandler(orderController.updateOrderStatus.bind(orderController)));
router.patch("/:id/payment-status", asyncHandler(orderController.updatePaymentStatus.bind(orderController)));
router.patch("/:id/delivery-status", asyncHandler(orderController.updateDeliveryStatus.bind(orderController)));
router.post("/:id/shipment", asyncHandler(orderController.createShipment.bind(orderController)));

export default router;
