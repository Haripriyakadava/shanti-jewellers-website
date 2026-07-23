import { Request, Response, NextFunction } from "express";
import { getCategories, getCategoryBySlug } from "./category.service";

export const fetchCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = String(req.headers["x-tenant-id"]);
    const categories = await getCategories(tenantId);
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const fetchCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers["x-tenant-id"] as string;
    const slug = req.params.slug as string;
    const category = await getCategoryBySlug(tenantId, slug);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};
