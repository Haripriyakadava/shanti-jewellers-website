import { z } from "zod";
import { OrderStatus, PaymentStatus, DeliveryStatus } from "@prisma/client";

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  remarks: z.string().optional(),
  location: z.string().optional()
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.nativeEnum(PaymentStatus)
});

export const updateDeliveryStatusSchema = z.object({
  deliveryStatus: z.nativeEnum(DeliveryStatus)
});

export const createShipmentSchema = z.object({
  courierName: z.string().min(2),
  trackingNumber: z.string().min(5),
  trackingUrl: z.string().url().optional(),
  estimatedDelivery: z.string().datetime().optional()
});
