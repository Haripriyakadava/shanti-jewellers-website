"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutSchema = exports.applyCouponSchema = void 0;
const zod_1 = require("zod");
exports.applyCouponSchema = zod_1.z.object({
    code: zod_1.z.string().min(2),
});
exports.checkoutSchema = zod_1.z.object({
    addressId: zod_1.z.string(),
    couponCode: zod_1.z.string().optional(),
});
