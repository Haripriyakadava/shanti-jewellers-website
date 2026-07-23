import { prisma } from "../../lib/prisma";
import { Customer } from "@prisma/client";


export class AuthRepository {
  /**
   * Find customer by email + tenant
   */
  async findUserByEmail(
    tenantId: string,
    email: string
  ): Promise<Customer | null> {
    return prisma.customer.findFirst({
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
  async findUserById(id: string): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: {
        id,
      },
    });
  }

  /**
 * Update Last Login
 */
async updateLastLogin(customerId: string) {
  return prisma.customer.update({
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
  async createUser(data: {
    tenantId: string;
    fullName: string;
    email: string;
    phone?: string;
    passwordHash: string;
  }): Promise<Customer> {
    return prisma.$transaction(async (tx) => {
      const customerCode = `CUS-${Date.now()}`;

      return tx.customer.create({
        data: {
          tenantId: data.tenantId,
          customerCode,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          passwordHash: data.passwordHash,
        },
      });
    });
  }

  /**
   * Save Refresh Token
   */
  async saveRefreshToken(
    customerId: string,
    tenantId: string,
    token: string,
    expiresAt: Date
  ) {
    return prisma.refreshToken.create({
      data: {
        customerId,
        tenantId,
        token,
        expiresAt,
      },
    });
  }

  /**
   * Delete Refresh Token
   */
  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.deleteMany({
      where: {
        token,
      },
    });
  }

  /**
   * Find Refresh Token
   */
  async findRefreshToken(token: string) {
    return prisma.refreshToken.findFirst({
      where: {
        token,
        revoked: false,
      },
    });
  }

  /**
 * Revoke Refresh Token
 */
async revokeRefreshToken(token: string) {
  return prisma.refreshToken.updateMany({
    where: {
      token,
    },
    data: {
      revoked: true,
    },
  });
}
}

export const authRepository = new AuthRepository();