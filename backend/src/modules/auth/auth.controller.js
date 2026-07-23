"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const auth_validation_1 = require("./auth.validation");
class AuthController {
    /**
     * Register Customer
     */
    async register(req, res, next) {
        try {
            // Validate Request
            const data = auth_validation_1.registerSchema.parse(req.body);
            // Call Service
            const result = await auth_service_1.authService.register(data);
            // Send Response
            return res.status(201).json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Login Customer
     */
    async login(req, res, next) {
        try {
            // Validate Request
            const data = auth_validation_1.loginSchema.parse(req.body);
            // Call Service
            const result = await auth_service_1.authService.login(data.tenantId, data.email, data.password);
            // Response
            return res.status(200).json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
   * Current Logged-in Customer
   */
    async me(req, res, next) {
        try {
            return res.status(200).json({
                success: true,
                customer: req.customer,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Refresh Access Token
     */
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await auth_service_1.authService.refreshToken(refreshToken);
            return res.status(200).json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
