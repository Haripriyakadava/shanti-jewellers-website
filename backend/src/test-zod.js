"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_validation_1 = require("./modules/auth/auth.validation");
const result = auth_validation_1.registerSchema.safeParse({
    tenantId: "tenant_001",
    fullName: "Haripriya Kadava",
    email: "haripriya@gmail.com",
    phone: "9876543210",
    password: "Shanti@123",
});
console.log(result);
