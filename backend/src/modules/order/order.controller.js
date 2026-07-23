"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderController = exports.OrderController = void 0;
const order_service_1 = require("./order.service");
const order_validation_1 = require("./order.validation");
const ResponseFormatter_1 = require("../../utils/ResponseFormatter");
class OrderController {
    // =====================
    // CUSTOMER APIs
    // =====================
    async getMyOrders(req, res) {
        const tenantId = req.tenant.id;
        const customerId = req.customer.customerId;
        const orders = await order_service_1.orderService.getMyOrders(tenantId, customerId);
        return ResponseFormatter_1.ResponseFormatter.success(res, orders, "Orders retrieved successfully");
    }
    async getMyOrderById(req, res) {
        const tenantId = req.tenant.id;
        const customerId = req.customer.customerId;
        const orderId = req.params.id;
        const order = await order_service_1.orderService.getMyOrderById(tenantId, customerId, orderId);
        return ResponseFormatter_1.ResponseFormatter.success(res, order, "Order retrieved successfully");
    }
    // =====================
    // ADMIN APIs
    // =====================
    async getAllTenantOrders(req, res) {
        const tenantId = req.tenant.id;
        const orders = await order_service_1.orderService.getAllTenantOrders(tenantId);
        return ResponseFormatter_1.ResponseFormatter.success(res, orders, "All orders retrieved successfully");
    }
    async getOrderById(req, res) {
        const tenantId = req.tenant.id;
        const orderId = req.params.id;
        const order = await order_service_1.orderService.getOrderById(tenantId, orderId);
        return ResponseFormatter_1.ResponseFormatter.success(res, order, "Order retrieved successfully");
    }
    async getOrderByNumber(req, res) {
        const tenantId = req.tenant.id;
        const orderNumber = req.params.orderNumber;
        const order = await order_service_1.orderService.getOrderByNumber(tenantId, orderNumber);
        return ResponseFormatter_1.ResponseFormatter.success(res, order, "Order retrieved successfully");
    }
    async updateOrderStatus(req, res) {
        const tenantId = req.tenant.id;
        const orderId = req.params.id;
        const changedBy = req.customer.customerId;
        const validatedData = order_validation_1.updateOrderStatusSchema.parse(req.body);
        const order = await order_service_1.orderService.updateOrderStatus(tenantId, orderId, validatedData, changedBy);
        return ResponseFormatter_1.ResponseFormatter.success(res, order, "Order status updated successfully");
    }
    async updatePaymentStatus(req, res) {
        const tenantId = req.tenant.id;
        const orderId = req.params.id;
        const validatedData = order_validation_1.updatePaymentStatusSchema.parse(req.body);
        const order = await order_service_1.orderService.updatePaymentStatus(tenantId, orderId, validatedData);
        return ResponseFormatter_1.ResponseFormatter.success(res, order, "Payment status updated successfully");
    }
    async updateDeliveryStatus(req, res) {
        const tenantId = req.tenant.id;
        const orderId = req.params.id;
        const validatedData = order_validation_1.updateDeliveryStatusSchema.parse(req.body);
        const order = await order_service_1.orderService.updateDeliveryStatus(tenantId, orderId, validatedData);
        return ResponseFormatter_1.ResponseFormatter.success(res, order, "Delivery status updated successfully");
    }
    async createShipment(req, res) {
        const tenantId = req.tenant.id;
        const orderId = req.params.id;
        const changedBy = req.customer.customerId;
        const validatedData = order_validation_1.createShipmentSchema.parse(req.body);
        const shipment = await order_service_1.orderService.createShipment(tenantId, orderId, validatedData, changedBy);
        return ResponseFormatter_1.ResponseFormatter.success(res, shipment, "Shipment created successfully", 201);
    }
}
exports.OrderController = OrderController;
exports.orderController = new OrderController();
