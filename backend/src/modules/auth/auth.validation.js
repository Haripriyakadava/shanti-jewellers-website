"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
/**
 * Register Validation
 */
exports.registerSchema = zod_1.z.object({
    tenantId: zod_1.z.string().min(1, "Tenant ID is required"),
    fullName: zod_1.z
        .string()
        .min(3, "Full name must be at least 3 characters")
        .max(100),
    email: zod_1.z
        .string()
        .email("Invalid email address")
        .toLowerCase(),
    phone: zod_1.z
        .string()
        .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number")
        .optional(),
    password: zod_1.z
        .string()
        .min(8, "Password must contain at least 8 characters")
        .regex(/[A-Z]/, "Password must contain one uppercase letter")
        .regex(/[a-z]/, "Password must contain one lowercase letter")
        .regex(/[0-9]/, "Password must contain one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain one special character"),
});
/**
 * Login Validation
 */
exports.loginSchema = zod_1.z.object({
    tenantId: zod_1.z.string().min(1),
    email: zod_1.z
        .string()
        .email("Invalid email address")
        .toLowerCase(),
    password: zod_1.z.string().min(1, "Password is required"),
});
/**
 * Forgot Password Validation
 */
exports.forgotPasswordSchema = zod_1.z.object({
    tenantId: zod_1.z.string().min(1),
    email: zod_1.z
        .string()
        .email("Invalid email address")
        .toLowerCase(),
});
/**
 * Reset Password Validation
 */
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    password: zod_1.z
        .string()
        .min(8)
        .regex(/[A-Z]/)
        .regex(/[a-z]/)
        .regex(/[0-9]/)
        .regex(/[^A-Za-z0-9]/),
});
