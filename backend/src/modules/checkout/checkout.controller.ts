import { Request, Response } from "express";
import { checkoutService } from "./checkout.service";
import { applyCouponSchema, checkoutSchema } from "./checkout.validation";
import { ResponseFormatter } from "../../utils/ResponseFormatter";

export class CheckoutController {
  async getSummary(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    
    const couponCode = req.query.couponCode as string | undefined;
    const summary = await checkoutService.getCheckoutSummary(tenantId, customerId, couponCode);
    
    return ResponseFormatter.success(res, summary, "Checkout summary retrieved successfully");
  }

  async applyCoupon(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    
    const validatedData = applyCouponSchema.parse(req.body);
    const summary = await checkoutService.getCheckoutSummary(tenantId, customerId, validatedData.code);
    
    if (!summary.appliedCoupon) {
      return ResponseFormatter.error(res, "Invalid or expired coupon", 400);
    }

    return ResponseFormatter.success(res, summary, "Coupon applied successfully");
  }

  async removeCoupon(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    
    // Calculate summary without coupon
    const summary = await checkoutService.getCheckoutSummary(tenantId, customerId);
    
    return ResponseFormatter.success(res, summary, "Coupon removed successfully");
  }

  async processCheckout(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    
    const validatedData = checkoutSchema.parse(req.body);
    const session = await checkoutService.processCheckout(tenantId, customerId, validatedData);
    
    return ResponseFormatter.success(res, session, "Checkout session created successfully", 201);
  }
}

export const checkoutController = new CheckoutController();
