export interface CreatePaymentInput {
  amount: number;
  currency: string;
}

export interface VerifyPaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  amount: number;
  cartItems?: any[];
  deliveryAddress?: any;
}

export interface RefundInput {
  paymentId: string;
  amount?: number; // Optional, for partial refunds
  reason?: string;
}
