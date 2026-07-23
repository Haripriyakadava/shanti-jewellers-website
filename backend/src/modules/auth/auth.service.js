"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const auth_repository_1 = require("./auth.repository");
const bcrypt_1 = require("../../utils/bcrypt");
const jwt_1 = require("../../utils/jwt");
const auth_constants_1 = require("../../constants/auth.constants");
const AppError_1 = require("../../utils/AppError");
class AuthService {
    /**
     * Register Customer
     */
    async register(data) {
        // Check if customer already exists
        const existingUser = await auth_repository_1.authRepository.findUserByEmail(data.tenantId, data.email);
        if (existingUser) {
            throw new AppError_1.AppError(auth_constants_1.AUTH_MESSAGES.USER_ALREADY_EXISTS, 400);
        }
        // Hash Password
        const passwordHash = await (0, bcrypt_1.hashPassword)(data.password);
        // Create Customer
        const customer = await auth_repository_1.authRepository.createUser({
            tenantId: data.tenantId,
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            passwordHash,
        });
        // JWT Payload
        const payload = {
            customerId: customer.id,
            tenantId: customer.tenantId,
            role: customer.role,
        };
        // Generate Tokens
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        // Save Refresh Token
        await auth_repository_1.authRepository.saveRefreshToken(customer.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        return {
            message: auth_constants_1.AUTH_MESSAGES.REGISTER_SUCCESS,
            customer: {
                id: customer.id,
                fullName: customer.fullName,
                email: customer.email,
                role: customer.role,
            },
            accessToken,
            refreshToken,
        };
    }
    /**
     * Login Customer
     */
    async login(tenantId, email, password) {
        // Find Customer
        const customer = await auth_repository_1.authRepository.findUserByEmail(tenantId, email);
        if (!customer) {
            throw new AppError_1.AppError(auth_constants_1.AUTH_MESSAGES.INVALID_CREDENTIALS, 401);
        }
        // Compare Password
        const isValid = await (0, bcrypt_1.comparePassword)(password, customer.passwordHash);
        if (!isValid) {
            throw new AppError_1.AppError(auth_constants_1.AUTH_MESSAGES.INVALID_CREDENTIALS, 401);
        }
        // Update Last Login
        await auth_repository_1.authRepository.updateLastLogin(customer.id);
        const payload = {
            customerId: customer.id,
            tenantId: customer.tenantId,
            role: customer.role,
        };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        await auth_repository_1.authRepository.saveRefreshToken(customer.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        return {
            message: auth_constants_1.AUTH_MESSAGES.LOGIN_SUCCESS,
            customer: {
                id: customer.id,
                fullName: customer.fullName,
                email: customer.email,
                role: customer.role,
            },
            accessToken,
            refreshToken,
        };
    }
    /**
     * Refresh Access Token
     */
    async refreshToken(refreshToken) {
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const storedToken = await auth_repository_1.authRepository.findRefreshToken(refreshToken);
        if (!storedToken) {
            throw new AppError_1.AppError("Invalid refresh token.", 401);
        }
        const customer = await auth_repository_1.authRepository.findUserById(payload.customerId);
        if (!customer) {
            throw new AppError_1.AppError("Customer not found.", 404);
        }
        const accessToken = (0, jwt_1.generateAccessToken)({
            customerId: customer.id,
            tenantId: customer.tenantId,
            role: customer.role,
        });
        return {
            accessToken,
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
