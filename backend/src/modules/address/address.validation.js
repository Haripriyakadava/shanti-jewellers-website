"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressSchema = exports.createAddressSchema = void 0;
const zod_1 = require("zod");
exports.createAddressSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(10),
    addressLine1: zod_1.z.string().min(5),
    addressLine2: zod_1.z.string().optional(),
    city: zod_1.z.string().min(2),
    state: zod_1.z.string().min(2),
    country: zod_1.z.string().min(2),
    postalCode: zod_1.z.string().min(4),
    landmark: zod_1.z.string().optional(),
    isDefault: zod_1.z.boolean().optional(),
});
exports.updateAddressSchema = exports.createAddressSchema.partial();
