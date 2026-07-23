import { Router } from "express";
import express from "express";
import { paymentController } from "./payment.controller";
import {  } from "../../middleware/tenant.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/async-handler";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Razorpay Webhook Endpoint
 *     tags: [Payments]
 */
router.post(
  "/webhook",
  asyncHandler(paymentController.handleWebhook.bind(paymentController))
);

// All subsequent routes require tenant context and customer authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/payments/create-order:
 *   post:
 *     summary: Create a Razorpay Order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.post("/create-order", asyncHandler(paymentController.createOrder.bind(paymentController)));

router.post("/verify", asyncHandler(paymentController.verifyPayment.bind(paymentController)));

// Admin only for refunds
router.post("/refund", authorize("ADMIN", "MANAGER"), asyncHandler(paymentController.refundPayment.bind(paymentController)));

router.get("/:id", asyncHandler(paymentController.getPaymentById.bind(paymentController)));
router.get("/order/:orderId", asyncHandler(paymentController.getPaymentByOrderId.bind(paymentController)));

export default router;
