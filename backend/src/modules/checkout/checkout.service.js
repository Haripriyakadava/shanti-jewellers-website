"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutService = exports.CheckoutService = void 0;
const checkout_repository_1 = require("./checkout.repository");
const cart_repository_1 = require("../cart/cart.repository");
const address_repository_1 = require("../address/address.repository");
const product_repository_1 = require("../products/product.repository");
const AppError_1 = require("../../utils/AppError");
class CheckoutService {
    async getCheckoutSummary(tenantId, customerId, couponCode) {
        const cart = await cart_repository_1.cartRepository.getCart(tenantId, customerId);
        if (!cart || cart.items.length === 0) {
            throw new AppError_1.AppError("Cart is empty", 400);
        }
        let subtotal = 0;
        let makingCharges = 0;
        let gstAmount = 0;
        let stoneAmount = 0;
        let discountAmount = 0; // Product level discount from snapshot
        let itemsCount = 0;
        for (const item of cart.items) {
            const qty = item.quantity;
            // The cart item stores per-unit snapshots or total snapshots.
            // We stored per-unit snapshot values (unitPrice, makingCharge, gstAmount, stoneAmount, discountAmount).
            subtotal += Number(item.unitPrice) * qty;
            makingCharges += Number(item.makingCharge) * qty;
            gstAmount += Number(item.gstAmount) * qty;
            stoneAmount += Number(item.stoneAmount) * qty;
            discountAmount += Number(item.discountAmount) * qty;
            itemsCount += qty;
        }
        // Default shipping logic
        const shipping = subtotal > 10000 ? 0 : 500; // Free shipping over 10000
        let couponDiscount = 0;
        let appliedCoupon;
        if (couponCode) {
            const coupon = await checkout_repository_1.checkoutRepository.getCouponByCode(tenantId, couponCode);
            if (coupon && coupon.isActive) {
                const now = new Date();
                if (now >= coupon.startDate && now <= coupon.endDate) {
                    if (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit) {
                        if (subtotal >= Number(coupon.minimumOrderAmount)) {
                            if (coupon.discountType === "FLAT") {
                                couponDiscount = Number(coupon.discountValue);
                            }
                            else if (coupon.discountType === "PERCENTAGE") {
                                couponDiscount = (subtotal * Number(coupon.discountValue)) / 100;
                            }
                            if (coupon.maximumDiscount && couponDiscount > Number(coupon.maximumDiscount)) {
                                couponDiscount = Number(coupon.maximumDiscount);
                            }
                            appliedCoupon = coupon.code;
                        }
                    }
                }
            }
        }
        const totalDiscount = discountAmount + couponDiscount;
        // Grand total formula: Subtotal + Making Charges + Stone Charges + GST + Shipping - Discount
        const grandTotal = subtotal + makingCharges + stoneAmount + gstAmount + shipping - totalDiscount;
        return {
            subtotal,
            makingCharges,
            gstAmount,
            stoneAmount,
            discount: totalDiscount,
            shipping,
            grandTotal: grandTotal > 0 ? grandTotal : 0,
            itemsCount,
            appliedCoupon
        };
    }
    async validateStock(tenantId, cartItems) {
        for (const item of cartItems) {
            const product = await product_repository_1.productRepository.getProductDetails(tenantId, item.productId);
            if (!product || !product.isActive) {
                throw new AppError_1.AppError(`Product ${item.productName} is no longer available`, 400);
            }
            if (product.stockQuantity !== null && item.quantity > product.stockQuantity) {
                throw new AppError_1.AppError(`Insufficient stock for ${item.productName}. Available: ${product.stockQuantity}`, 400);
            }
        }
    }
    async processCheckout(tenantId, customerId, data) {
        const cart = await cart_repository_1.cartRepository.getCart(tenantId, customerId);
        if (!cart || cart.items.length === 0) {
            throw new AppError_1.AppError("Cart is empty", 400);
        }
        const address = await address_repository_1.addressRepository.findById(data.addressId);
        if (!address || address.customerId !== customerId || address.tenantId !== tenantId) {
            throw new AppError_1.AppError("Invalid delivery address", 400);
        }
        // 1. Validate real-time stock
        await this.validateStock(tenantId, cart.items);
        // 2. Calculate final summary
        const summary = await this.getCheckoutSummary(tenantId, customerId, data.couponCode);
        // 3. Resolve coupon
        let couponId;
        if (summary.appliedCoupon) {
            const coupon = await checkout_repository_1.checkoutRepository.getCouponByCode(tenantId, summary.appliedCoupon);
            if (coupon)
                couponId = coupon.id;
        }
        // 4. Generate Checkout Session
        const session = await checkout_repository_1.checkoutRepository.createSession({
            tenantId,
            customerId,
            cartId: cart.id,
            addressId: address.id,
            couponId,
            subtotal: summary.subtotal,
            makingCharges: summary.makingCharges,
            gstAmount: summary.gstAmount,
            stoneAmount: summary.stoneAmount,
            discount: summary.discount,
            shipping: summary.shipping,
            grandTotal: summary.grandTotal,
            status: "PENDING",
        });
        return session;
    }
}
exports.CheckoutService = CheckoutService;
exports.checkoutService = new CheckoutService();
