"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const address_controller_1 = require("./address.controller");
const tenant_middleware_1 = require("../../middleware/tenant.middleware");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const async_handler_1 = require("../../middleware/async-handler");
const router = (0, express_1.Router)();
// All address routes require tenant context and customer authentication
router.use(tenant_middleware_1.tenantMiddleware, auth_middleware_1.authMiddleware);
/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Get all addresses for the logged-in customer
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", (0, async_handler_1.asyncHandler)(address_controller_1.addressController.getUserAddresses.bind(address_controller_1.addressController)));
router.get("/:id", (0, async_handler_1.asyncHandler)(address_controller_1.addressController.getAddressById.bind(address_controller_1.addressController)));
router.post("/", (0, async_handler_1.asyncHandler)(address_controller_1.addressController.createAddress.bind(address_controller_1.addressController)));
router.put("/:id", (0, async_handler_1.asyncHandler)(address_controller_1.addressController.updateAddress.bind(address_controller_1.addressController)));
router.delete("/:id", (0, async_handler_1.asyncHandler)(address_controller_1.addressController.deleteAddress.bind(address_controller_1.addressController)));
exports.default = router;
