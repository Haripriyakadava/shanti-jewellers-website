import { Router } from "express";
import { authController } from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
const router = Router();

/**
 * Register
 */
router.post("/register", (req, res, next) =>
  authController.register(req, res, next)
);

/**
 * Login
 */
router.post("/login", (req, res, next) =>
  authController.login(req, res, next)
);

router.get(
  "/me",
  authMiddleware,
  (req, res, next) =>
    authController.me(req, res, next)
);

router.post(
  "/refresh",
  (req, res, next) =>
    authController.refresh(req, res, next)
);

export default router;