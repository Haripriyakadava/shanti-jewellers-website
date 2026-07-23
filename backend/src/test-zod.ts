import { registerSchema } from "./modules/auth/auth.validation";

const result = registerSchema.safeParse({
  tenantId: "tenant_001",
  fullName: "Haripriya Kadava",
  email: "haripriya@gmail.com",
  phone: "9876543210",
  password: "Shanti@123",
});

console.log(result);