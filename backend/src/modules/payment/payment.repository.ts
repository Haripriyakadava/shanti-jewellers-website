import { prisma } from "../../lib/prisma";
import { Prisma, Payment, PaymentAttempt, PaymentTransaction, PaymentStatus } from "@prisma/client";

export class PaymentRepository {
  async getPaymentById(id: string) {
    return await prisma.payment.findUnique({
      where: { id },
      include: { order: true }
    });
  }

  async getPaymentByOrderId(orderId: string) {
    return await prisma.payment.findUnique({
      where: { orderId },
      include: { order: true }
    });
  }

  async findByRazorpayOrderId(razorpayOrderId: string) {
    return await prisma.payment.findFirst({
      where: { razorpayOrderId },
    });
  }

  async getPaymentGateway(tenantId: string, provider: string = "RAZORPAY") {
    return {
      id: "env-gateway",
      tenantId,
      provider,
      keyId: process.env.RAZORPAY_KEY_ID || "",
      keySecret: process.env.RAZORPAY_KEY_SECRET || "",
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
      isActive: true
    };
  }

  async updatePayment(id: string, data: Prisma.PaymentUpdateInput) {
    return await prisma.payment.update({
      where: { id },
      data,
    });
  }

  async createPayment(data: Prisma.PaymentCreateInput) {
    return await prisma.payment.create({
      data,
      include: { order: true }
    });
  }

  async updatePaymentStatus(id: string, status: PaymentStatus, transactionId?: string) {
    const updateData: Prisma.PaymentUpdateInput = { status };
    if (transactionId) {
      updateData.razorpayPaymentId = transactionId;
    }
    return await prisma.payment.update({
      where: { id },
      data: updateData
    });
  }

  async logWebhookEvent(tenantId: string, eventId: string, eventType: string, payload: any, signature: string) {
    return null;
  }

  async checkWebhookExists(tenantId: string, eventId: string) {
    return null;
  }

  async logPaymentAttempt(tenantId: string, paymentId: string, attemptNumber: number, status: string, failureReason?: string) {
    return null;
  }

  async getPaymentAttemptsCount(paymentId: string) {
    return await prisma.paymentAttempt.count({
      where: { paymentId }
    });
  }

  async logTransaction(paymentId: string, tenantId: string, transactionId: string, amount: Prisma.Decimal, status: PaymentStatus, gatewayResponse: any) {
    return await prisma.paymentTransaction.create({
      data: {
        paymentId,
        tenantId,
        transactionId,
        amount,
        status,
        gatewayResponse
      }
    });
  }
}

export const paymentRepository = new PaymentRepository();
