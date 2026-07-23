import { Request, Response } from "express";
import { wishlistService } from "./wishlist.service";

export class WishlistController {
  async getWishlist(req: Request, res: Response) {
    try {
      const customerId = (req as any).customer.customerId;
      const tenantId = (req as any).customer.tenantId;

      const wishlist = await wishlistService.getWishlist(tenantId, customerId);

      res.status(200).json({
        success: true,
        data: wishlist,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async addProduct(req: Request, res: Response) {
    try {
      const customerId = (req as any).customer.customerId;
      const tenantId = (req as any).customer.tenantId;
      const { productId, productVariantId } = req.body;

      if (!productId) {
        return res.status(400).json({ success: false, message: "Product ID is required" });
      }

      const item = await wishlistService.addProduct(tenantId, customerId, productId, productVariantId);

      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async removeProduct(req: Request, res: Response) {
    try {
      const customerId = (req as any).customer.customerId;
      const tenantId = (req as any).customer.tenantId;
      const { productId, productVariantId } = (req.params as any);

      await wishlistService.removeProduct(tenantId, customerId, productId, productVariantId);

      res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const wishlistController = new WishlistController();
