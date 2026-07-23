import { Request, Response } from "express";
import { orderService } from "./order.service";
import { updateOrderStatusSchema, updatePaymentStatusSchema, updateDeliveryStatusSchema, createShipmentSchema } from "./order.validation";
import { ResponseFormatter } from "../../utils/ResponseFormatter";

export class OrderController {
  
  // =====================
  // CUSTOMER APIs
  // =====================

  async getMyOrders(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    const orders = await orderService.getMyOrders(tenantId, customerId);
    return ResponseFormatter.success(res, orders, "Orders retrieved successfully");
  }

  async getMyOrderById(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const customerId = req.customer!.customerId;
    const orderId = req.params.id as string;
    const order = await orderService.getMyOrderById(tenantId, customerId, orderId);
    return ResponseFormatter.success(res, order, "Order retrieved successfully");
  }

  // =====================
  // ADMIN APIs
  // =====================

  async getAllTenantOrders(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const orders = await orderService.getAllTenantOrders(tenantId);
    return ResponseFormatter.success(res, orders, "All orders retrieved successfully");
  }

  async getOrderById(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const orderId = req.params.id as string;
    const order = await orderService.getOrderById(tenantId, orderId);
    return ResponseFormatter.success(res, order, "Order retrieved successfully");
  }

  async getOrderByNumber(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const orderNumber = req.params.orderNumber as string;
    const order = await orderService.getOrderByNumber(tenantId, orderNumber);
    return ResponseFormatter.success(res, order, "Order retrieved successfully");
  }

  async updateOrderStatus(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const orderId = req.params.id as string;
    const changedBy = req.customer!.customerId;
    
    const validatedData = updateOrderStatusSchema.parse(req.body);
    const order = await orderService.updateOrderStatus(tenantId, orderId, validatedData, changedBy);
    return ResponseFormatter.success(res, order, "Order status updated successfully");
  }

  async updatePaymentStatus(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const orderId = req.params.id as string;
    
    const validatedData = updatePaymentStatusSchema.parse(req.body);
    const order = await orderService.updatePaymentStatus(tenantId, orderId, validatedData);
    return ResponseFormatter.success(res, order, "Payment status updated successfully");
  }

  async updateDeliveryStatus(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const orderId = req.params.id as string;
    
    const validatedData = updateDeliveryStatusSchema.parse(req.body);
    const order = await orderService.updateDeliveryStatus(tenantId, orderId, validatedData);
    return ResponseFormatter.success(res, order, "Delivery status updated successfully");
  }

  async createShipment(req: Request, res: Response) {
    const tenantId = req.customer!.tenantId;
    const orderId = req.params.id as string;
    const changedBy = req.customer!.customerId;
    
    const validatedData = createShipmentSchema.parse(req.body);
    const shipment = await orderService.createShipment(tenantId, orderId, validatedData, changedBy);
    return ResponseFormatter.success(res, shipment, "Shipment created successfully", 201);
  }
}

export const orderController = new OrderController();
