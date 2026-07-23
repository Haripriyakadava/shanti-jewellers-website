"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRepository = exports.AuthRepository = void 0;
const prisma_1 = require("../../lib/prisma");
class AuthRepository {
    /**
     * Find customer by email + tenant
     */
    async findUserByEmail(tenantId, email) {
        return prisma_1.prisma.customer.findFirst({
            where: {
                tenantId,
                email,
                isActive: true,
            },
        });
    }
    /**
     * Find customer by ID
     */
    async findUserById(id) {
        return prisma_1.prisma.customer.findUnique({
            where: {
                id,
            },
        });
    }
    /**
   * Update Last Login
   */
    async updateLastLogin(customerId) {
        return prisma_1.prisma.customer.update({
            where: {
                id: customerId,
            },
            data: {
                lastLoginAt: new Date(),
            },
        });
    }
    /**
     * Create new customer
     */
    async createUser(data) {
        return prisma_1.prisma.customer.create({
            data: {
                tenantId: data.tenantId,
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                passwordHash: data.passwordHash,
            },
        });
    }
    /**
     * Save Refresh Token
     */
    async saveRefreshToken(customerId, token, expiresAt) {
        return prisma_1.prisma.refreshToken.create({
            data: {
                customerId,
                token,
                expiresAt,
            },
        });
    }
    /**
     * Delete Refresh Token
     */
    async deleteRefreshToken(token) {
        return prisma_1.prisma.refreshToken.deleteMany({
            where: {
                token,
            },
        });
    }
    /**
     * Find Refresh Token
     */
    async findRefreshToken(token) {
        return prisma_1.prisma.refreshToken.findFirst({
            where: {
                token,
                revoked: false,
            },
        });
    }
    /**
   * Revoke Refresh Token
   */
    async revokeRefreshToken(token) {
        return prisma_1.prisma.refreshToken.updateMany({
            where: {
                token,
            },
            data: {
                revoked: true,
            },
        });
    }
}
exports.AuthRepository = AuthRepository;
exports.authRepository = new AuthRepository();
