import { Router } from "express";
import { addressController } from "./address.controller";
import { tenantMiddleware } from "../../middleware/tenant.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/async-handler";

const router = Router();

// All address routes require tenant context and customer authentication
router.use(tenantMiddleware, authMiddleware);

/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Get all addresses for the logged-in customer
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", asyncHandler(addressController.getUserAddresses.bind(addressController)));

router.get("/:id", asyncHandler(addressController.getAddressById.bind(addressController)));

router.post("/", asyncHandler(addressController.createAddress.bind(addressController)));

router.put("/:id", asyncHandler(addressController.updateAddress.bind(addressController)));

router.delete("/:id", asyncHandler(addressController.deleteAddress.bind(addressController)));

export default router;
