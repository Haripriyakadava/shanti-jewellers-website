import { Router } from "express";
import { cartController } from "./cart.controller";
import {  } from "../../middleware/tenant.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/async-handler";

const router = Router();

// All cart routes require tenant context and customer authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get the current customer's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", asyncHandler(cartController.getCart.bind(cartController)));
router.get("/count", asyncHandler(cartController.getCartCount.bind(cartController)));

router.post("/add", asyncHandler(cartController.addToCart.bind(cartController)));
router.put("/update/:itemId", asyncHandler(cartController.updateCartItem.bind(cartController)));
router.delete("/remove/:itemId", asyncHandler(cartController.removeCartItem.bind(cartController)));
router.delete("/clear", asyncHandler(cartController.clearCart.bind(cartController)));

export default router;