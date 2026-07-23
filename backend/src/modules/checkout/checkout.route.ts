import { Router } from "express";
import { checkoutController } from "./checkout.controller";
import {  } from "../../middleware/tenant.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/async-handler";

const router = Router();

// All checkout routes require tenant context and customer authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/checkout/summary:
 *   get:
 *     summary: Get checkout summary with calculations
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 */
router.get("/summary", asyncHandler(checkoutController.getSummary.bind(checkoutController)));

router.post("/apply-coupon", asyncHandler(checkoutController.applyCoupon.bind(checkoutController)));
router.post("/remove-coupon", asyncHandler(checkoutController.removeCoupon.bind(checkoutController)));
router.post("/", asyncHandler(checkoutController.processCheckout.bind(checkoutController)));

export default router;
