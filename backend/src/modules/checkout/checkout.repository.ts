import { BaseRepository } from "../../repositories/base.repository";
import { CheckoutSession, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export class CheckoutRepository extends BaseRepository<CheckoutSession> {
  constructor() {
    super("checkoutSession");
  }
  async getCouponByCode(tenantId: string, code: string) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        tenantId: tenantId,
        code: code,
      },
    });
    
    if (!coupon) return null;
    return {
      id: coupon.id,
      code: coupon.code,
      isActive: coupon.isActive,
      startDate: coupon.validFrom ? new Date(coupon.validFrom) : null,
      endDate: coupon.validUntil ? new Date(coupon.validUntil) : null,
      usageLimit: coupon.maxUsageCount,
      usedCount: coupon.usageCount,
      minimumOrderAmount: coupon.minPurchaseAmount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maximumDiscount: coupon.maxDiscount,
    };
  }

  async createSession(data: Prisma.CheckoutSessionUncheckedCreateInput) {
    return await this.model.upsert({
      where: { cartId: data.cartId },
      update: data,
      create: data,
    });
  }

  async getSessionById(tenantId: string, customerId: string, sessionId: string) {
    return await this.model.findUnique({
      where: { id: sessionId },
      include: {
        address: true,
        cart: {
          include: { items: true }
        }
      }
    });
  }
}

export const checkoutRepository = new CheckoutRepository();
