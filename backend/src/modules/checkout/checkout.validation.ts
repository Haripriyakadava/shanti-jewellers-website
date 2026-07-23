import { z } from "zod";

export const applyCouponSchema = z.object({
  code: z.string().min(2),
});

export const checkoutSchema = z.object({
  addressId: z.string().optional(),
  address: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
    postalCode: z.string().min(1),
    landmark: z.string().optional(),
    isDefault: z.boolean().optional(),
  }).optional(),
  couponCode: z.string().optional(),
}).refine(data => data.addressId || data.address, {
  message: "Either addressId or address details must be provided",
});
