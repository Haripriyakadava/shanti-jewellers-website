import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  tenantId: z.string().uuid("Invalid tenant ID").optional(),
});

export const adminRegisterSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
  role: z.enum(["OWNER", "SUPER_ADMIN", "ADMIN", "MANAGER", "SALES", "ACCOUNTANT", "INVENTORY_MANAGER", "STAFF"]).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});
