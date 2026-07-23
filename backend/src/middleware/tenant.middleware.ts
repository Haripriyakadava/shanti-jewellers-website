import { Request, Response, NextFunction } from "express";

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers["x-tenant-id"] as string;
  if (tenantId) {
    req.tenantId = tenantId;
  }
  next();
};

export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers["x-tenant-id"] as string;
  if (!tenantId) {
    return res.status(400).json({ success: false, message: "x-tenant-id header is required" });
  }
  req.tenantId = tenantId;
  next();
};
