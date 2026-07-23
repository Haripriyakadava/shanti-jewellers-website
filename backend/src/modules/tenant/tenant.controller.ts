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
