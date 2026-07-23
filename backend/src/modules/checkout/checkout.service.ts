import { checkoutRepository } from "./checkout.repository";
import { cartRepository } from "../cart/cart.repository";
import { addressRepository } from "../address/address.repository";
import { ProductValidationService } from "../../services/product-validation.service";

const productValidationService = new ProductValidationService();
import { CheckoutInput, CheckoutSummary } from "./checkout.types";
import { AppError } from "../../utils/AppError";

export class CheckoutService {
  
  async getCheckoutSummary(tenantId: string, customerId: string, couponCode?: string): Promise<CheckoutSummary> {
    const cart = await cartRepository.getCart(tenantId, customerId);
    
    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400);
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
    let appliedCoupon: string | undefined;

    if (couponCode) {
      const coupon = await checkoutRepository.getCouponByCode(tenantId, couponCode);
      if (coupon && coupon.isActive) {
        const now = new Date();
        if ((!coupon.startDate || now >= coupon.startDate) && (!coupon.endDate || now <= coupon.endDate)) {
          if (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit) {
            if (subtotal >= Number(coupon.minimumOrderAmount)) {
              if (coupon.discountType === "FIXED") {
                couponDiscount = Number(coupon.discountValue);
              } else if (coupon.discountType === "PERCENTAGE") {
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

  async validateStock(tenantId: string, cartItems: any[]) {
    for (const item of cartItems) {
      const product = await productValidationService.getValidProduct(tenantId, item.productId).catch(() => null);
      if (!product || !(product as any).is_active) {
        throw new AppError(`Product ${item.productName} is no longer available`, 400);
      }
      if ((product as any).stock_quantity !== undefined && (product as any).stock_quantity !== null && item.quantity > (product as any).stock_quantity) {
        throw new AppError(`Only ${(product as any).stock_quantity} items in stock`, 400);
      }
    }
  }

  async processCheckout(tenantId: string, customerId: string, data: CheckoutInput) {
    const cart = await cartRepository.getCart(tenantId, customerId);
    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    let addressId = data.addressId;
    if (!addressId && data.address) {
      // Create new address
      const newAddress = await addressRepository.create({
        tenantId,
        customerId,
        ...data.address,
      });
      addressId = newAddress.id;
    } else if (addressId) {
      // Validate existing address
      const address = await addressRepository.findById(addressId);
      if (!address || address.customerId !== customerId || address.tenantId !== tenantId) {
        throw new AppError("Invalid delivery address", 400);
      }
    } else {
      throw new AppError("Address is required", 400);
    }

    // 1. Validate real-time stock
    await this.validateStock(tenantId, cart.items);

    // 2. Calculate final summary
    const summary = await this.getCheckoutSummary(tenantId, customerId, data.couponCode);

    // 3. Resolve coupon
    let couponId: string | undefined;
    if (summary.appliedCoupon) {
      const coupon = await checkoutRepository.getCouponByCode(tenantId, summary.appliedCoupon);
      if (coupon) couponId = coupon.id;
    }

    // 4. Generate Checkout Session
    const session = await checkoutRepository.createSession({
      tenantId,
      customerId,
      cartId: cart.id,
      addressId: addressId,
      
      subtotal: summary.subtotal,
      makingCharges: summary.makingCharges,
      gstAmount: summary.gstAmount,
      stoneAmount: summary.stoneAmount,
      discountAmount: summary.discount,
      shippingAmount: summary.shipping,
      grandTotal: summary.grandTotal,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // Expires in 30 mins
      status: "ADDRESS_SELECTED",
    });

    return session;
  }
}

export const checkoutService = new CheckoutService();
