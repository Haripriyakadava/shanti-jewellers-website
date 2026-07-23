export interface ApplyCouponInput {
  code: string;
}

export interface CheckoutInput {
  addressId?: string;
  address?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    landmark?: string;
    isDefault?: boolean;
  };
  couponCode?: string;
}

export interface CheckoutSummary {
  subtotal: number;
  makingCharges: number;
  gstAmount: number;
  stoneAmount: number;
  discount: number;
  shipping: number;
  grandTotal: number;
  itemsCount: number;
  appliedCoupon?: string;
}
