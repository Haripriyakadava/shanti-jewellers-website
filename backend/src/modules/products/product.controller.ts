import { Request, Response, NextFunction } from "express";
import { getProducts, getProductDetails } from "./product.service";

export const fetchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = String(req.headers["x-tenant-id"]);
    const products = await getProducts(tenantId, req.query);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const fetchProductDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers["x-tenant-id"] as string;
    const id = req.params.id as string;
    const product = await getProductDetails(tenantId, id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};
