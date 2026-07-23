$productRepo = @"
import { prisma } from "../../lib/prisma";

export const productRepository = {
  async getProducts(tenantId: string, query: any) {
    const { category, collection, isNew, isBestSeller, minPrice, maxPrice, search } = query;
    
    let where: any = { tenantId, isActive: true };

    if (category) where.categorySlug = category;
    if (collection) where.collectionSlug = collection;
    if (isNew) where.isNew = isNew === 'true';
    if (isBestSeller) where.isBestSeller = isBestSeller === 'true';
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    // Using the ProductListView!
    return await (prisma as any).productListView.findMany({
      where,
    });
  },

  async getProductDetails(tenantId: string, productId: string) {
    return await prisma.product.findFirst({
      where: { id: productId, tenantId },
      include: {
        images: true,
        variants: true,
        options: true,
        metals: true,
        category: true,
        collection: true
      }
    });
  }
};
"@

$productService = @"
import { productRepository } from "./product.repository";

export const getProducts = async (tenantId: string, query: any) => {
  return await productRepository.getProducts(tenantId, query);
};

export const getProductDetails = async (tenantId: string, productId: string) => {
  return await productRepository.getProductDetails(tenantId, productId);
};
"@

$productController = @"
import { Request, Response, NextFunction } from "express";
import { getProducts, getProductDetails } from "./product.service";

export const fetchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers["x-tenant-id"] as string;
    const products = await getProducts(tenantId, req.query);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const fetchProductDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers["x-tenant-id"] as string;
    const { id } = req.params;
    const product = await getProductDetails(tenantId, id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};
"@

$productRoute = @"
import { Router } from "express";
import { fetchProducts, fetchProductDetails } from "./product.controller";

const router = Router();
router.get("/", fetchProducts);
router.get("/:id", fetchProductDetails);
export default router;
"@

Set-Content -Path "backend/src/modules/products/product.repository.ts" -Value $productRepo
Set-Content -Path "backend/src/modules/products/product.service.ts" -Value $productService
Set-Content -Path "backend/src/modules/products/product.controller.ts" -Value $productController
Set-Content -Path "backend/src/modules/products/product.route.ts" -Value $productRoute
