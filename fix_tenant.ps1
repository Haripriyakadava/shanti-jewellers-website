$tenantService = @"
import { prisma } from "../../lib/prisma";

export const getAllTenants = async () => {
  return await prisma.tenant.findMany({
    orderBy: {
      // Prisma doesn't have created_at mapped directly to createdAt if not defined, wait, I need to check Tenant model. Let's just not order or order by id.
      id: 'asc'
    }
  });
};
"@

$tenantController = @"
import { Request, Response, NextFunction } from "express";
import { getAllTenants } from "./tenant.service";

export const fetchAllTenants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenants = await getAllTenants();
    res.json({ success: true, data: tenants });
  } catch (error) {
    next(error);
  }
};
"@

$tenantRoute = @"
import { Router } from "express";
import { fetchAllTenants } from "./tenant.controller";

const router = Router();
router.get("/", fetchAllTenants);
export default router;
"@

Set-Content -Path "backend/src/modules/tenant/tenant.service.ts" -Value $tenantService
Set-Content -Path "backend/src/modules/tenant/tenant.controller.ts" -Value $tenantController
Set-Content -Path "backend/src/modules/tenant/tenant.route.ts" -Value $tenantRoute
