import { OrderStatus, PaymentStatus, DeliveryStatus } from "@prisma/client";

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  remarks?: string;
}

export interface UpdatePaymentStatusInput {
  paymentStatus: PaymentStatus;
}

export interface UpdateDeliveryStatusInput {
  deliveryStatus: DeliveryStatus;
}

export interface CreateShipmentInput {
  courierName: string;
  trackingNumber: string;
  trackingUrl?: string;
  estimatedDelivery?: string | Date;
}
