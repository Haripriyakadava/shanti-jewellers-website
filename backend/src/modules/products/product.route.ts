import { Router } from "express";
import { fetchProducts, fetchProductDetails } from "./product.controller";

const router = Router();
router.get("/", fetchProducts);
router.get("/:id", fetchProductDetails);
export default router;
