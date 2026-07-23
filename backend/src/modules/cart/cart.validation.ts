import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().min(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive().min(1),
});