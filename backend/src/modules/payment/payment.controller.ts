import { Request, Response } from "express";
import { paymentService } from "./payment.service";
import { createPaymentSchema, verifyPaymentSchema, refundSchema } from "./payment.validation";
import { ResponseFormatter } from "../../utils/ResponseFormatter";
import { prisma } from "../../lib/prisma";

export class PaymentController {
  async createOrder(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    const validatedData = createPaymentSchema.parse(req.body);
    
    const result = await paymentService.createPayment(tenantId, customerId, validatedData);
    return ResponseFormatter.success(res, result, "Razorpay order created successfully", 201);
  }

  async verifyPayment(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    const validatedData = verifyPaymentSchema.parse(req.body);

    const result = await paymentService.verifyPayment(tenantId, customerId, validatedData);
    return res.status(200).json(result);
  }

  async handleWebhook(req: Request, res: Response) {
    // The webhook might not have tenant middleware context easily available depending on how Razorpay sends it.
    // Usually, we encode tenantId in a query param or header when setting up the webhook URL.
    // e.g. /api/payments/webhook?tenantId=abc
    const tenantId = req.query.tenantId as string;
    if (!tenantId) {
      return ResponseFormatter.error(res, "Missing tenantId", 400);
    }

    // signature
    const signature = req.headers["x-razorpay-signature"] as string;
    if (!signature) {
      return ResponseFormatter.error(res, "Missing signature", 400);
    }

    const payload = req.body;
    const rawBody = (req as any).rawBody;

    if (!rawBody) {
      return ResponseFormatter.error(res, "Missing raw body", 400);
    }

    const result = await paymentService.handleWebhook(tenantId, payload, rawBody, signature);
    return ResponseFormatter.success(res, result, "Webhook processed");
  }

  async refundPayment(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const validatedData = refundSchema.parse(req.body);

    const result = await paymentService.refundPayment(tenantId, validatedData);
    return ResponseFormatter.success(res, result, "Refund initiated successfully");
  }

  async getPaymentById(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const paymentId = req.params.id as string;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true, attempts: true, refunds: true }
    });

    if (!payment || payment.tenantId !== tenantId) {
      return ResponseFormatter.error(res, "Payment not found", 404);
    }

    return ResponseFormatter.success(res, payment, "Payment retrieved successfully");
  }

  async getPaymentByOrderId(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const orderId = req.params.orderId as string;

    const payment = await prisma.payment.findFirst({
      where: { orderId, tenantId },
      include: { 
        attempts: true, 
        refunds: true,
        order: {
          include: {
            items: true,
            customer: true
          }
        }
      }
    });

    if (!payment) {
      return ResponseFormatter.error(res, "Payment not found for order", 404);
    }

    return ResponseFormatter.success(res, payment, "Payment retrieved successfully");
  }
}

export const paymentController = new PaymentController();
