import { Router } from "express";
import { wishlistController } from "./wishlist.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// All wishlist routes require authentication
router.use(authMiddleware);

router.get("/", wishlistController.getWishlist);
router.post("/", wishlistController.addProduct);
router.delete("/:productId", wishlistController.removeProduct);
router.delete("/:productId/:productVariantId", wishlistController.removeProduct);

export default router;
