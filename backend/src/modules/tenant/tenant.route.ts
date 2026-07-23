import { Router } from "express";
import { fetchAllTenants } from "./tenant.controller";

const router = Router();
router.get("/", fetchAllTenants);
export default router;
