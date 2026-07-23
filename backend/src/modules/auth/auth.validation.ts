import { z } from "zod";

/**
 * Register Validation
 */
export const registerSchema = z.object({
  tenantId: z.string().min(1, "Tenant ID is required"),

  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(100),

  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase(),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number")
    .optional(),

  password: z
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
export const loginSchema = z.object({
  tenantId: z.string().min(1),

  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase(),

  password: z.string().min(1, "Password is required"),
});

/**
 * Forgot Password Validation
 */
export const forgotPasswordSchema = z.object({
  tenantId: z.string().min(1),

  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase(),
});

/**
 * Reset Password Validation
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1),

  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});

/**
 * Export Types
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;