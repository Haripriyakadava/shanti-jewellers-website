import { Router } from "express";
import { fetchCollections, fetchCollectionBySlug } from "./collection.controller";

const router = Router();
router.get("/", fetchCollections);
router.get("/:slug", fetchCollectionBySlug);
export default router;
