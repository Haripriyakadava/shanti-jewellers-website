import { orderRepository } from "./order.repository";
import { UpdateOrderStatusInput, UpdatePaymentStatusInput, UpdateDeliveryStatusInput, CreateShipmentInput } from "./order.types";
import { AppError } from "../../utils/AppError";
import { OrderStatus, PaymentStatus, DeliveryStatus } from "@prisma/client";

export class OrderService {
  async getMyOrders(tenantId: string, customerId: string) {
    return await orderRepository.getOrdersByUser(tenantId, customerId);
  }

  async getMyOrderById(tenantId: string, customerId: string, orderId: string) {
    const order = await orderRepository.getOrderById(orderId);
    if (!order || order.tenantId !== tenantId || order.customerId !== customerId) {
      throw new AppError("Order not found", 404);
    }
    return order;
  }

  async getOrderById(tenantId: string, orderId: string) {
    const order = await orderRepository.getOrderById(orderId);
    if (!order || order.tenantId !== tenantId) {
      throw new AppError("Order not found", 404);
    }
    return order;
  }

  async getOrderByNumber(tenantId: string, orderNumber: string) {
    const order = await orderRepository.getOrderByNumber(tenantId, orderNumber);
    if (!order) {
      throw new AppError("Order not found", 404);
    }
    return order;
  }

  async getAllTenantOrders(tenantId: string) {
    return await orderRepository.getAllTenantOrders(tenantId);
  }

  async updateOrderStatus(tenantId: string, orderId: string, data: UpdateOrderStatusInput, changedBy: string) {
    await this.getOrderById(tenantId, orderId); // Verify it exists and belongs to tenant
    return await orderRepository.updateOrderStatus(orderId, data.status as OrderStatus, data.remarks, changedBy);
  }

  async updatePaymentStatus(tenantId: string, orderId: string, data: UpdatePaymentStatusInput) {
    await this.getOrderById(tenantId, orderId);
    return await orderRepository.updatePaymentStatus(orderId, data.paymentStatus as PaymentStatus);
  }

  async updateDeliveryStatus(tenantId: string, orderId: string, data: UpdateDeliveryStatusInput) {
    await this.getOrderById(tenantId, orderId);
    return await orderRepository.updateDeliveryStatus(orderId, data.deliveryStatus as DeliveryStatus);
  }

  async createShipment(tenantId: string, orderId: string, data: CreateShipmentInput, changedBy: string) {
    const order = await this.getOrderById(tenantId, orderId);

    if (order.status === "CANCELLED" || order.status === "RETURNED" || order.status === "REFUNDED") {
      throw new AppError(`Cannot create shipment for order in ${order.status} state.`, 400);
    }

    const shipment = await orderRepository.createShipment(orderId, data);
    
    // Auto-update order statuses
    await orderRepository.updateDeliveryStatus(orderId, "DISPATCHED");
    await orderRepository.updateOrderStatus(orderId, "SHIPPED", `Shipment created via ${data.courierName}. Tracking: ${data.trackingNumber}`, changedBy);

    return shipment;
  }
}

export const orderService = new OrderService();
