import { Router } from "express";
import { fetchCategories, fetchCategoryBySlug } from "./category.controller";

const router = Router();
router.get("/", fetchCategories);
router.get("/:slug", fetchCategoryBySlug);
export default router;
