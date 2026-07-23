import { paymentRepository } from "./payment.repository";
import { razorpayService } from "./razorpay.service";
import { CreatePaymentInput, VerifyPaymentInput, RefundInput } from "./payment.types";
import { AppError } from "../../utils/AppError";
import { checkoutRepository } from "../checkout/checkout.repository";
import { prisma } from "../../lib/prisma";
import { BusinessCodeGenerator } from "../../utils/BusinessCodeGenerator";
import { productValidationService } from "../../services/product-validation.service";

export class PaymentService {
  async createPayment(tenantId: string, customerId: string, data: CreatePaymentInput) {
    const gateway = await paymentRepository.getPaymentGateway(tenantId);
    if (!gateway) {
      throw new AppError("Payment gateway not configured for this tenant", 400);
    }

    const amountInPaise = Math.round(Number(data.amount) * 100);
    const orderRef = `receipt_${Date.now()}`;
    const razorpayOrder = await razorpayService.createOrder(
      tenantId,
      amountInPaise,
      "INR",
      orderRef
    );

    // Fetch cart to get product IDs and then fetch GST from Supabase
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      include: { items: true }
    });

    let calculatedGstAmount = 0;
    let calculatedMakingCharges = 0;

    if (cart && cart.items.length > 0) {
      const productIds = cart.items.map(i => i.productId);
      const productsFromSupabase = await productValidationService.getBulkProducts(tenantId, productIds);
      
      cart.items.forEach(item => {
        const product = (productsFromSupabase as any[]).find(p => String(p.id) === String(item.productId));
        if (product) {
          calculatedGstAmount += Number(product.gst_amount || 0) * item.quantity;
          calculatedMakingCharges += Number(product.making_charge || 0) * item.quantity;
        }
      });
    }

    const payment = await prisma.$transaction(async (tx) => {
      const prefix = 'TEN';
      
      const paymentCode = await BusinessCodeGenerator.generateCode(tx, tenantId, "PAYMENT", prefix, "PAY", 6);

      return await tx.payment.create({
        data: {
          tenantId,
          customerId,
          paymentCode,
          paymentGatewayId: gateway.id,
          checkoutSessionId: null, // Bypassed for direct frontend integration
          razorpayOrderId: razorpayOrder.id,
          subtotal: data.amount - calculatedGstAmount, // Derive subtotal if not passed
          makingCharges: calculatedMakingCharges,
          gstAmount: calculatedGstAmount,
          discountAmount: 0,
          shippingAmount: 0,
          grandTotal: data.amount,
          currency: "INR",
          status: "PENDING",
        }
      });
    });

    return {
      paymentId: payment.id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: gateway.keyId,
    };
  }

  async verifyPayment(tenantId: string, customerId: string, data: VerifyPaymentInput) {
    try {
      console.log(`[PAYMENT VERIFICATION] Starting for Razorpay Order: ${data.razorpayOrderId}`);

      const payment = await paymentRepository.findByRazorpayOrderId(data.razorpayOrderId);
      if (!payment || payment.tenantId !== tenantId || payment.customerId !== customerId) {
        throw new AppError("Payment record not found", 404);
      }

      if (payment.status === "CAPTURED") {
        console.log(`[PAYMENT VERIFICATION] Payment already verified. ID: ${payment.id}`);
        return { success: true, message: "Payment already verified", orderId: payment.orderId };
      }

      const gateway = await paymentRepository.getPaymentGateway(tenantId);
      if (!gateway) {
        throw new AppError("Payment gateway not configured", 400);
      }

      // 1. Verify Razorpay Signature
      const isValid = razorpayService.verifySignature(
        data.razorpayOrderId,
        data.razorpayPaymentId,
        data.razorpaySignature,
        gateway.keySecret
      );

      if (!isValid) {
        console.error(`[PAYMENT VERIFICATION] Invalid signature for Razorpay Order: ${data.razorpayOrderId}`);
        const attemptCount = await paymentRepository.getPaymentAttemptsCount(payment.id);
        await paymentRepository.logPaymentAttempt(tenantId, payment.id, attemptCount + 1, "FAILED", "Invalid Signature");
        throw new AppError("Payment verification failed due to invalid signature", 400);
      }

      console.log(`[PAYMENT VERIFICATION] Signature verified successfully. Fetching payment method...`);

      let paymentMethod = "UNKNOWN";
      try {
        const rzpPayment = await razorpayService.fetchPayment(tenantId, data.razorpayPaymentId);
        paymentMethod = rzpPayment.method?.toUpperCase() || "UNKNOWN";
      } catch (err: any) {
        console.warn(`[PAYMENT VERIFICATION] Failed to fetch payment details: ${err.message}`);
      }

      // Generate payment code
      const paymentCode = await BusinessCodeGenerator.generateCode(null, tenantId, "PAYMENT", "TEN", "PAY", 6);

      // 2. Wrap the whole persistence logic in a Prisma Transaction
      const result = await prisma.$transaction(async (tx) => {
        
        // Payment Update will be done at the end of the transaction with all fields
        // Create Payment Attempt
        console.log(`[PAYMENT VERIFICATION] Creating PaymentAttempt...`);
        const attemptCount = await tx.paymentAttempt.count({ where: { paymentId: payment.id } });
        await tx.paymentAttempt.create({
          data: {
            tenantId,
            paymentId: payment.id,
            amount: payment.grandTotal,
            gateway: "Razorpay",
            gatewayOrderId: data.razorpayOrderId,
            status: "PAID",
          }
        });

        // Create Payment Transaction
        console.log(`[PAYMENT VERIFICATION] Creating PaymentTransaction...`);
        await tx.paymentTransaction.create({
          data: {
            paymentId: payment.id,
            tenantId: payment.tenantId,
            transactionId: data.razorpayPaymentId,
            amount: payment.grandTotal,
            status: "PAID",
            gatewayResponse: { 
              razorpayOrderId: data.razorpayOrderId, 
              razorpayPaymentId: data.razorpayPaymentId, 
              razorpaySignature: data.razorpaySignature 
            },
          }
        });

        // Fetch Cart and Cart Items
        console.log(`[PAYMENT VERIFICATION] Skipping customer cart validation for prototype...`);
        // const cart = await tx.cart.findUnique({
        //   where: { customerId },
        //   include: { items: true }
        // });

        // if (!cart || cart.items.length === 0) {
        //   throw new AppError("Cart is empty or not found", 400);
        // }

        // Create Order
        console.log(`[PAYMENT VERIFICATION] Creating Order...`);
        const prefix = 'TEN';
        
        const orderNumber = await BusinessCodeGenerator.generateCode(tx, tenantId, "ORDER", prefix, "ORD", 6);
        const invoiceNumber = await BusinessCodeGenerator.generateCode(tx, tenantId, "INVOICE", prefix, "INV", 6);
        
        const order = await tx.order.create({
          data: {
            tenantId: tenantId,
            customerId: customerId,
            orderNumber,
            subtotal: payment.subtotal,
            makingCharges: payment.makingCharges,
            gstAmount: payment.gstAmount,
            discountAmount: payment.discountAmount,
            shippingAmount: payment.shippingAmount,
            grandTotal: payment.grandTotal, // Using payment.grandTotal instead of data.amount
            currency: payment.currency,
            status: "PROCESSING",
            paymentStatus: "COMPLETED",
            deliveryStatus: "PENDING",
            statusHistory: {
              create: [{
                tenantId: tenantId,
                status: "PROCESSING",
                remarks: "Order created successfully after payment verification.",
                changedBy: "SYSTEM"
              }]
            },
            invoices: {
              create: [{
                tenantId: tenantId,
                invoiceNumber: invoiceNumber,
                invoiceDate: new Date(),
                amount: payment.grandTotal
              }]
            },
            shipments: {
              create: [{
                tenantId: tenantId,
                courierName: "Pending",
                trackingNumber: "TBD",
                status: "PENDING"
              }]
            }
          }
        });
        console.log(`[PAYMENT VERIFICATION] Order Created: ${order.id}`);

        // Copy Cart Items to Order Items
        console.log(`[PAYMENT VERIFICATION] Copying CartItems to OrderItems...`);
        const itemsToCopy = data.cartItems || [];
        const productIds = itemsToCopy.map((i: any) => String(i.productId || i.id));
        let productsFromSupabase: any[] = [];
        if (productIds.length > 0) {
          productsFromSupabase = await productValidationService.getBulkProducts(tenantId, productIds);
        }

        const orderItemsData = itemsToCopy.map((item: any) => {
          const prod = productsFromSupabase.find((p: any) => String(p.id) === String(item.productId || item.id));
          const prodGst = prod ? Number(prod.gst_amount || 0) : 0;
          
          return {
            orderId: order.id,
            tenantId: tenantId,
            productId: String(item.productId || item.id || 'unknown'),
            productName: item.productName || item.name || 'Product',
            sku: item.sku || 'SKU-000',
            imageUrl: item.productImage || item.imageUrl || item.image || '',
            metal: item.selection?.metal || item.metalType || item.metal || 'Gold',
            size: item.selection?.size || item.size || 'N/A',
            grossWeight: item.grossWeight || 10,
            netWeight: item.netWeight || 10,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || item.price || 0,
            makingCharge: item.makingCharge || 0,
            gstAmount: prodGst * (item.quantity || 1),
            discountAmount: item.discountAmount || 0,
            stoneAmount: item.stoneAmount || 0,
            totalPrice: item.totalPrice || (item.unitPrice ? item.unitPrice * (item.quantity || 1) : 0) || item.price || 0
          };
        });

        if (orderItemsData.length > 0) {
          await tx.orderItem.createMany({
            data: orderItemsData
          });
        }

        // Final Update to Payment Record
        console.log(`[PAYMENT VERIFICATION] Updating Payment with orderId and Razorpay details...`);
        await tx.payment.update({
          where: { id: payment.id },
          data: { 
            orderId: order.id,
            status: "PAID",
            razorpayPaymentId: data.razorpayPaymentId,
            razorpaySignature: data.razorpaySignature,
            paymentMethod: paymentMethod,
            paymentCode: paymentCode,
            paidAt: new Date()
          }
        });

        // Clear the Cart (skipped for prototype as cart is managed in frontend)
        console.log(`[PAYMENT VERIFICATION] Skipping customer cart clearing...`);

        return { 
          success: true, 
          message: "Payment verified successfully", 
          orderId: order.id,
          paymentId: payment.id,
          status: "PAID"
        };
      });

      console.log(`[PAYMENT VERIFICATION] Transaction completed successfully!`);
      return result;

    } catch (error: any) {
      console.error("[VERIFY PAYMENT ERROR] Exception occurred during verification:");
      console.error(error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(`Verification Crash: ${error.message || 'Unknown error'}`, 500);
    }
  }

  async handleWebhook(tenantId: string, payload: any, rawBody: string, signature: string) {
    const secret = await razorpayService.getWebhookSecret(tenantId);
    
    const isValid = razorpayService.verifyWebhookSignature(rawBody, signature, secret);
    if (!isValid) {
      throw new AppError("Invalid webhook signature", 400);
    }

    const eventId = payload.id;
    const eventType = payload.event;

    // Prevent duplicate processing
    const existing = await paymentRepository.checkWebhookExists(tenantId, eventId);
    if (existing) {
      return { success: true, message: "Event already processed" };
    }

    await paymentRepository.logWebhookEvent(tenantId, eventId, eventType, payload, signature);

    if (eventType === "payment.captured") {
      const razorpayOrderId = payload.payload.payment.entity.order_id;
      const razorpayPaymentId = payload.payload.payment.entity.id;
      
      const payment = await paymentRepository.findByRazorpayOrderId(razorpayOrderId);
      if (payment && payment.status === "PENDING") {
        // Here we could trigger verifyPayment logic internally if it wasn't triggered by frontend
        await paymentRepository.updatePayment(payment.id, {
          status: "CAPTURED",
          razorpayPaymentId,
          paidAt: new Date()
        });
      }
    } else if (eventType === "payment.failed") {
      const razorpayOrderId = payload.payload.payment.entity.order_id;
      const payment = await paymentRepository.findByRazorpayOrderId(razorpayOrderId);
      if (payment) {
        await paymentRepository.updatePayment(payment.id, {
          status: "FAILED"
        });
      }
    }

    return { success: true, message: "Webhook processed" };
  }

  async refundPayment(tenantId: string, data: RefundInput) {
    const payment = await prisma.payment.findUnique({
      where: { id: data.paymentId }
    });

    if (!payment || payment.tenantId !== tenantId) {
      throw new AppError("Payment not found", 404);
    }

    if (payment.status !== "CAPTURED") {
      throw new AppError("Cannot refund an incomplete payment", 400);
    }

    const tenant: any = null; //({ where: { id: tenantId } });
    const prefix = tenant && tenant.tenantCode ? tenant.tenantCode.replace(/\d+$/, '') : 'TEN';

    let amountInPaise;
    if (data.amount) {
      if (Number(payment.grandTotal) < data.amount) {
        throw new AppError("Refund amount cannot exceed payment amount", 400);
      }
      amountInPaise = Math.round(data.amount * 100);
    }

    const refund = await razorpayService.issueRefund(tenantId, payment.razorpayPaymentId!, amountInPaise);

    const refundData = await prisma.$transaction(async (tx) => {
      const refundCode = await BusinessCodeGenerator.generateCode(tx, tenantId, "REFUND", prefix, "REF", 6);
      return await tx.refund.create({
        data: {
          tenantId,
          paymentId: payment.id,
          refundCode,
          refundId: refund.id,
          amount: data.amount || Number(payment.grandTotal),
          reason: data.reason
        }
      });
    });

    // Update payment status if full refund
    if (!data.amount || data.amount === Number(payment.grandTotal)) {
      await paymentRepository.updatePayment(payment.id, { status: "REFUNDED" });
    }

    return { success: true, message: "Refund initiated", refundId: refund.id };
  }
}

export const paymentService = new PaymentService();
