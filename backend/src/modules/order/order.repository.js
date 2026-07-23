"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRepository = exports.OrderRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const prisma_1 = require("../../lib/prisma");
class OrderRepository extends base_repository_1.BaseRepository {
    constructor() {
        super("order");
    }
    async getOrderById(id) {
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
    async getOrderByNumber(tenantId, orderNumber) {
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
    async getOrdersByUser(tenantId, customerId) {
        return await this.model.findMany({
            where: { tenantId, customerId },
            orderBy: { createdAt: "desc" },
            include: {
                items: true,
                shipments: true
            }
        });
    }
    async getAllTenantOrders(tenantId) {
        return await this.model.findMany({
            where: { tenantId },
            orderBy: { createdAt: "desc" },
            include: {
                items: true,
                customer: { select: { id: true, fullName: true, email: true } }
            }
        });
    }
    async updateOrderStatus(orderId, status, remarks, changedBy) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            const order = await tx.order.update({
                where: { id: orderId },
                data: { status }
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    status,
                    remarks,
                    changedBy
                }
            });
            return order;
        });
    }
    async updatePaymentStatus(orderId, paymentStatus) {
        return await this.model.update({
            where: { id: orderId },
            data: { paymentStatus }
        });
    }
    async updateDeliveryStatus(orderId, deliveryStatus) {
        return await this.model.update({
            where: { id: orderId },
            data: { deliveryStatus }
        });
    }
    async createShipment(orderId, data) {
        return await prisma_1.prisma.shipment.create({
            data: {
                ...data,
                orderId
            }
        });
    }
}
exports.OrderRepository = OrderRepository;
exports.orderRepository = new OrderRepository();
