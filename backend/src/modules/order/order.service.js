"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = exports.OrderService = void 0;
const order_repository_1 = require("./order.repository");
const AppError_1 = require("../../utils/AppError");
class OrderService {
    async getMyOrders(tenantId, customerId) {
        return await order_repository_1.orderRepository.getOrdersByUser(tenantId, customerId);
    }
    async getMyOrderById(tenantId, customerId, orderId) {
        const order = await order_repository_1.orderRepository.getOrderById(orderId);
        if (!order || order.tenantId !== tenantId || order.customerId !== customerId) {
            throw new AppError_1.AppError("Order not found", 404);
        }
        return order;
    }
    async getOrderById(tenantId, orderId) {
        const order = await order_repository_1.orderRepository.getOrderById(orderId);
        if (!order || order.tenantId !== tenantId) {
            throw new AppError_1.AppError("Order not found", 404);
        }
        return order;
    }
    async getOrderByNumber(tenantId, orderNumber) {
        const order = await order_repository_1.orderRepository.getOrderByNumber(tenantId, orderNumber);
        if (!order) {
            throw new AppError_1.AppError("Order not found", 404);
        }
        return order;
    }
    async getAllTenantOrders(tenantId) {
        return await order_repository_1.orderRepository.getAllTenantOrders(tenantId);
    }
    async updateOrderStatus(tenantId, orderId, data, changedBy) {
        await this.getOrderById(tenantId, orderId); // Verify it exists and belongs to tenant
        return await order_repository_1.orderRepository.updateOrderStatus(orderId, data.status, data.remarks, changedBy);
    }
    async updatePaymentStatus(tenantId, orderId, data) {
        await this.getOrderById(tenantId, orderId);
        return await order_repository_1.orderRepository.updatePaymentStatus(orderId, data.paymentStatus);
    }
    async updateDeliveryStatus(tenantId, orderId, data) {
        await this.getOrderById(tenantId, orderId);
        return await order_repository_1.orderRepository.updateDeliveryStatus(orderId, data.deliveryStatus);
    }
    async createShipment(tenantId, orderId, data, changedBy) {
        const order = await this.getOrderById(tenantId, orderId);
        if (order.status === "CANCELLED" || order.status === "RETURNED" || order.status === "REFUNDED") {
            throw new AppError_1.AppError(`Cannot create shipment for order in ${order.status} state.`, 400);
        }
        const shipment = await order_repository_1.orderRepository.createShipment(orderId, data);
        // Auto-update order statuses
        await order_repository_1.orderRepository.updateDeliveryStatus(orderId, "DISPATCHED");
        await order_repository_1.orderRepository.updateOrderStatus(orderId, "SHIPPED", `Shipment created via ${data.courierName}. Tracking: ${data.trackingNumber}`, changedBy);
        return shipment;
    }
}
exports.OrderService = OrderService;
exports.orderService = new OrderService();
