$tenantService = @"
import { prisma } from "../../lib/prisma";

export const getTenant = async (domain: string) => {
  return await prisma.tenant.findFirst({
    where: { domain },
  });
};
"@

$tenantController = @"
import { Request, Response, NextFunction } from "express";
import { getTenant } from "./tenant.service";

export const getTenantByDomain = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { domain } = req.params;
    const tenant = await getTenant(domain);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }
    res.json({ success: true, data: tenant });
  } catch (error) {
    next(error);
  }
};
"@

$tenantRoute = @"
import { Router } from "express";
import { getTenantByDomain } from "./tenant.controller";

const router = Router();
router.get("/:domain", getTenantByDomain);
export default router;
"@

$categoryService = @"
import { prisma } from "../../lib/prisma";

export const getCategories = async (tenantId: string) => {
  return await prisma.category.findMany({
    where: { tenantId, isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
};

export const getCategoryBySlug = async (tenantId: string, slug: string) => {
  return await prisma.category.findFirst({
    where: { tenantId, slug, isActive: true },
  });
};
"@

$categoryController = @"
import { Request, Response, NextFunction } from "express";
import { getCategories, getCategoryBySlug } from "./category.service";

export const fetchCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers["x-tenant-id"] as string;
    const categories = await getCategories(tenantId);
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const fetchCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers["x-tenant-id"] as string;
    const { slug } = req.params;
    const category = await getCategoryBySlug(tenantId, slug);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};
"@

$categoryRoute = @"
import { Router } from "express";
import { fetchCategories, fetchCategoryBySlug } from "./category.controller";

const router = Router();
router.get("/", fetchCategories);
router.get("/:slug", fetchCategoryBySlug);
export default router;
"@

$collectionService = @"
import { prisma } from "../../lib/prisma";

export const getCollections = async (tenantId: string) => {
  return await prisma.collection.findMany({
    where: { tenantId, isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
};

export const getCollectionBySlug = async (tenantId: string, slug: string) => {
  return await prisma.collection.findFirst({
    where: { tenantId, slug, isActive: true },
  });
};
"@

$collectionController = @"
import { Request, Response, NextFunction } from "express";
import { getCollections, getCollectionBySlug } from "./collection.service";

export const fetchCollections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers["x-tenant-id"] as string;
    const collections = await getCollections(tenantId);
    res.json({ success: true, data: collections });
  } catch (error) {
    next(error);
  }
};

export const fetchCollectionBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers["x-tenant-id"] as string;
    const { slug } = req.params;
    const collection = await getCollectionBySlug(tenantId, slug);
    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" });
    }
    res.json({ success: true, data: collection });
  } catch (error) {
    next(error);
  }
};
"@

$collectionRoute = @"
import { Router } from "express";
import { fetchCollections, fetchCollectionBySlug } from "./collection.controller";

const router = Router();
router.get("/", fetchCollections);
router.get("/:slug", fetchCollectionBySlug);
export default router;
"@


Set-Content -Path "backend/src/modules/tenant/tenant.service.ts" -Value $tenantService
Set-Content -Path "backend/src/modules/tenant/tenant.controller.ts" -Value $tenantController
Set-Content -Path "backend/src/modules/tenant/tenant.route.ts" -Value $tenantRoute

Set-Content -Path "backend/src/modules/category/category.service.ts" -Value $categoryService
Set-Content -Path "backend/src/modules/category/category.controller.ts" -Value $categoryController
Set-Content -Path "backend/src/modules/category/category.route.ts" -Value $categoryRoute

Set-Content -Path "backend/src/modules/collection/collection.service.ts" -Value $collectionService
Set-Content -Path "backend/src/modules/collection/collection.controller.ts" -Value $collectionController
Set-Content -Path "backend/src/modules/collection/collection.route.ts" -Value $collectionRoute
