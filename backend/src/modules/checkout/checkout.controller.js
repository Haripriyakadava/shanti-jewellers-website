"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutController = exports.CheckoutController = void 0;
const checkout_service_1 = require("./checkout.service");
const checkout_validation_1 = require("./checkout.validation");
const ResponseFormatter_1 = require("../../utils/ResponseFormatter");
class CheckoutController {
    async getSummary(req, res) {
        const tenantId = req.tenant.id;
        const customerId = req.customer.customerId;
        const couponCode = req.query.couponCode;
        const summary = await checkout_service_1.checkoutService.getCheckoutSummary(tenantId, customerId, couponCode);
        return ResponseFormatter_1.ResponseFormatter.success(res, summary, "Checkout summary retrieved successfully");
    }
    async applyCoupon(req, res) {
        const tenantId = req.tenant.id;
        const customerId = req.customer.customerId;
        const validatedData = checkout_validation_1.applyCouponSchema.parse(req.body);
        const summary = await checkout_service_1.checkoutService.getCheckoutSummary(tenantId, customerId, validatedData.code);
        if (!summary.appliedCoupon) {
            return ResponseFormatter_1.ResponseFormatter.error(res, "Invalid or expired coupon", 400);
        }
        return ResponseFormatter_1.ResponseFormatter.success(res, summary, "Coupon applied successfully");
    }
    async removeCoupon(req, res) {
        const tenantId = req.tenant.id;
        const customerId = req.customer.customerId;
        // Calculate summary without coupon
        const summary = await checkout_service_1.checkoutService.getCheckoutSummary(tenantId, customerId);
        return ResponseFormatter_1.ResponseFormatter.success(res, summary, "Coupon removed successfully");
    }
    async processCheckout(req, res) {
        const tenantId = req.tenant.id;
        const customerId = req.customer.customerId;
        const validatedData = checkout_validation_1.checkoutSchema.parse(req.body);
        const session = await checkout_service_1.checkoutService.processCheckout(tenantId, customerId, validatedData);
        return ResponseFormatter_1.ResponseFormatter.success(res, session, "Checkout session created successfully", 201);
    }
}
exports.CheckoutController = CheckoutController;
exports.checkoutController = new CheckoutController();
