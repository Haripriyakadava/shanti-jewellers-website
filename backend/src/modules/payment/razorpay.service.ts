import Razorpay from "razorpay";
import crypto from "crypto";
import { AppError } from "../../utils/AppError";

export class RazorpayService {
  async initialize(tenantId: string) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret) {
      throw new AppError("Razorpay credentials not configured.", 400);
    }
    
    return new Razorpay({
      key_id,
      key_secret,
    });
  }

  async getWebhookSecret(tenantId: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      throw new AppError("Razorpay webhook secret not configured.", 500);
    }
    return secret;
  }

  async createOrder(tenantId: string, amountInPaise: number, currency: string, receiptId: string) {
    const razorpay = await this.initialize(tenantId);
    return await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: receiptId,
    });
  }

  verifySignature(orderId: string, paymentId: string, signature: string, secret: string) {
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    return generatedSignature === signature;
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string) {
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    return generatedSignature === signature;
  }

  async issueRefund(tenantId: string, paymentId: string, amountInPaise?: number) {
    const razorpay = await this.initialize(tenantId);
    const options: any = {};
    if (amountInPaise) {
      options.amount = amountInPaise;
    }
    return await razorpay.payments.refund(paymentId, options);
  }

  async fetchPayment(tenantId: string, paymentId: string) {
    const razorpay = await this.initialize(tenantId);
    return await razorpay.payments.fetch(paymentId);
  }
}

export const razorpayService = new RazorpayService();
