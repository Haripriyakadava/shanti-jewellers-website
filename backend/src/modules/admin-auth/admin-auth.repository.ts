import { prisma } from "../../lib/prisma";
import { AdminRole, Prisma } from "@prisma/client";

export class AdminAuthRepository {
  /**
   * Find Admin User by Email within a specific Tenant
   */
  async findUserByEmail(tenantId: string | undefined, email: string) {
    const whereClause: Prisma.AdminUserWhereInput = { email };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    return prisma.adminUser.findFirst({
      where: whereClause,
    });
  }

  /**
   * Find Admin User by ID
   */
  async findUserById(id: string) {
    return prisma.adminUser.findUnique({
      where: { id },
    });
  }

  /**
   * Create Admin User
   */
  async createUser(data: {
    tenantId: string;
    email: string;
    passwordHash: string;
    fullName: string;
    role: AdminRole;
    employeeCode: string;
    isOwner?: boolean;
  }) {
    return prisma.adminUser.create({
      data: {
        tenantId: data.tenantId,
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        role: data.role,
        employeeCode: data.employeeCode,
        isOwner: data.isOwner || false,
      },
    });
  }

  /**
   * Update Last Login
   */
  async updateLastLogin(id: string) {
    return prisma.adminUser.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  /**
   * Update Password
   */
  async updatePassword(id: string, passwordHash: string) {
    return prisma.adminUser.update({
      where: { id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
      },
    });
  }

  /**
   * Save Refresh Token (using existing RefreshToken table but mapping to AdminUser)
   */
  async saveRefreshToken(adminId: string, tenantId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        adminId,
        tenantId,
        token,
        expiresAt,
      },
    });
  }

  /**
   * Find Refresh Token
   */
  async findRefreshToken(token: string) {
    return prisma.refreshToken.findFirst({
      where: { token, revoked: false },
    });
  }

  /**
   * Revoke Refresh Token
   */
  async revokeRefreshToken(token: string) {
    return prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true },
    });
  }
}

export const adminAuthRepository = new AdminAuthRepository();
