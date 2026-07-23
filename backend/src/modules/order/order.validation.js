"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShipmentSchema = exports.updateDeliveryStatusSchema = exports.updatePaymentStatusSchema = exports.updateOrderStatusSchema = void 0;
const zod_1 = require("zod");
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "PACKED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "RETURNED",
        "REFUNDED"
    ]),
    remarks: zod_1.z.string().optional()
});
exports.updatePaymentStatusSchema = zod_1.z.object({
    paymentStatus: zod_1.z.enum([
        "PENDING",
        "AUTHORIZED",
        "CAPTURED",
        "COMPLETED",
        "SUCCESS",
        "FAILED",
        "CANCELLED",
        "REFUNDED"
    ])
});
exports.updateDeliveryStatusSchema = zod_1.z.object({
    deliveryStatus: zod_1.z.enum([
        "PENDING",
        "DISPATCHED",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "FAILED"
    ])
});
exports.createShipmentSchema = zod_1.z.object({
    courierName: zod_1.z.string().min(2),
    trackingNumber: zod_1.z.string().min(5),
    trackingUrl: zod_1.z.string().url().optional(),
    estimatedDelivery: zod_1.z.string().datetime().optional()
});
