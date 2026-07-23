"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantMiddleware = tenantMiddleware;
const tenant_repository_1 = require("../modules/tenant/tenant.repository");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../utils/AppError");
async function tenantMiddleware(req, res, next) {
    try {
        let tenantId = req.headers["x-tenant-id"];
        // Priority 2: JWT tenantId
        if (!tenantId && req.headers.authorization?.startsWith("Bearer ")) {
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jsonwebtoken_1.default.decode(token);
            if (decoded && decoded.tenantId) {
                tenantId = decoded.tenantId;
            }
        }
        // Since SUPER_ADMIN might create tenants, there are routes that don't need a specific tenant context
        // But usually for customer-facing APIs, tenant is required. 
        // We will throw error if tenantId is missing, except if they are accessing SUPER_ADMIN routes.
        // However, as per prompt, we just try to resolve it. If it fails, we return error.
        if (!tenantId) {
            // Allow passing through if it's super admin trying to login or create tenant? 
            // Actually, standard SaaS logic: if tenant ID is missing on non-admin routes, it fails.
            // We will let the route handle it if they want to bypass it, but usually this middleware applies to tenant routes.
            // The prompt says: "Store tenant information inside req.tenant"
            // If we strictly require it here, Super Admins hitting `/api/tenants` (which doesn't have a specific tenant) might fail.
            // But they'll pass their own tenant ID or a system tenant ID.
            // Let's make it throw an error.
            throw new AppError_1.AppError("Tenant ID is required. Provide x-tenant-id header or valid JWT.", 400);
        }
        const tenant = await tenant_repository_1.tenantRepository.findById(tenantId);
        if (!tenant) {
            throw new AppError_1.AppError("Tenant not found.", 404);
        }
        if (!tenant.isActive) {
            throw new AppError_1.AppError("Tenant is inactive. Access forbidden.", 403);
        }
        req.tenant = tenant;
        next();
    }
    catch (error) {
        next(error);
    }
}
