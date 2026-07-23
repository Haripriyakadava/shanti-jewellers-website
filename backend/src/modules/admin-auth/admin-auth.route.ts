import { Router } from "express";
import { adminAuthController } from "./admin-auth.controller";
import { asyncHandler } from "../../middleware/async-handler";

const router = Router();

router.post("/register", asyncHandler(adminAuthController.register.bind(adminAuthController)));
router.post("/login", asyncHandler(adminAuthController.login.bind(adminAuthController)));
router.post("/logout", asyncHandler(adminAuthController.logout.bind(adminAuthController)));
router.post("/refresh-token", asyncHandler(adminAuthController.refreshToken.bind(adminAuthController)));
router.post("/forgot-password", asyncHandler(adminAuthController.forgotPassword.bind(adminAuthController)));
router.post("/reset-password", asyncHandler(adminAuthController.resetPassword.bind(adminAuthController)));

export { router as adminAuthRoutes };
