import { Request, Response } from "express";
import { cartService } from "./cart.service";
import { addToCartSchema, updateCartItemSchema } from "./cart.validation";
import { ResponseFormatter } from "../../utils/ResponseFormatter";

export class CartController {
  async getCart(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    const cart = await cartService.getCart(tenantId, customerId);
    return ResponseFormatter.success(res, cart, "Cart retrieved successfully");
  }

  async addToCart(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    const validatedData = addToCartSchema.parse(req.body);
    const cartItem = await cartService.addToCart(tenantId, customerId, validatedData);
    return ResponseFormatter.success(res, cartItem, "Item added to cart successfully", 201);
  }

  async updateCartItem(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    const cartItemId = req.params.itemId as string;
    const validatedData = updateCartItemSchema.parse(req.body);
    const cartItem = await cartService.updateCartItem(tenantId, customerId, cartItemId, validatedData);
    return ResponseFormatter.success(res, cartItem, "Cart item updated successfully");
  }

  async removeCartItem(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    const cartItemId = req.params.itemId as string;
    await cartService.removeCartItem(tenantId, customerId, cartItemId);
    return ResponseFormatter.success(res, null, "Cart item removed successfully");
  }

  async clearCart(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    await cartService.clearCart(tenantId, customerId);
    return ResponseFormatter.success(res, null, "Cart cleared successfully");
  }

  async getCartCount(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    const count = await cartService.getCartCount(tenantId, customerId);
    return ResponseFormatter.success(res, { count }, "Cart count retrieved successfully");
  }
}

export const cartController = new CartController();