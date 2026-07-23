import { BaseRepository } from "../../repositories/base.repository";
import { Order, Prisma, OrderStatus, DeliveryStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super("order");
  }

  async getOrderById(id: string) {
    return await this.model.findUnique({
      where: { id },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
        invoices: true,
        shipments: true,
        payment: true,
        customer: { select: { id: true, fullName: true, email: true } }
      }
    });
  }

  async getOrderByNumber(tenantId: string, orderNumber: string) {
    return await this.model.findFirst({
      where: { tenantId, orderNumber },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
        invoices: true,
        shipments: true,
        payment: true,
        customer: { select: { id: true, fullName: true, email: true } }
      }
    });
  }

  async getOrdersByUser(tenantId: string, customerId: string) {
    return await this.model.findMany({
      where: { tenantId, customerId },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        shipments: true
      }
    });
  }

  async getAllTenantOrders(tenantId: string) {
    return await this.model.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        customer: { select: { id: true, fullName: true, email: true } }
      }
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, remarks?: string, changedBy?: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: { status }
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          tenantId: order.tenantId,
          status,
          remarks,
          changedBy
        }
      });

      return order;
    });
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
    return await this.model.update({
      where: { id: orderId },
      data: { paymentStatus }
    });
  }

  async updateDeliveryStatus(orderId: string, deliveryStatus: DeliveryStatus) {
    return await this.model.update({
      where: { id: orderId },
      data: { deliveryStatus }
    });
  }

  async createShipment(orderId: string, data: any) {
    return await prisma.shipment.create({
      data: {
        ...data,
        orderId
      }
    });
  }
}

export const orderRepository = new OrderRepository();
