import { adminAuthRepository } from "./admin-auth.repository";
import { hashPassword, comparePassword } from "../../utils/bcrypt";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { AppError } from "../../utils/AppError";
import { AUTH_MESSAGES } from "../../constants/auth.constants";
import { AdminRole } from "@prisma/client";

export class AdminAuthService {
  /**
   * Register Admin User (Can be called by Super Admin or Owner)
   */
  async register(data: {
    tenantId: string;
    email: string;
    password?: string;
    fullName: string;
    role?: string;
  }) {
    // Check if user already exists
    const existingUser = await adminAuthRepository.findUserByEmail(undefined, data.email);
    if (existingUser) {
      throw new AppError(AUTH_MESSAGES.USER_ALREADY_EXISTS, 400);
    }

    // Auto-generate employee code (For simplicity, use timestamp or UUID in this example, or generate sequentially)
    const employeeCode = `EMP-${Date.now()}`;

    // Hash Password if provided
    let passwordHash = null;
    if (data.password) {
      passwordHash = await hashPassword(data.password);
    }

    // Create Admin User
    const adminUser = await adminAuthRepository.createUser({
      tenantId: data.tenantId,
      email: data.email,
      passwordHash: passwordHash || "",
      fullName: data.fullName,
      role: (data.role as AdminRole) || AdminRole.STAFF,
      employeeCode,
    });

    return {
      message: AUTH_MESSAGES.REGISTER_SUCCESS,
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
        employeeCode: adminUser.employeeCode,
      },
    };
  }

  /**
   * Login Admin User
   */
  async login(email: string, password: string) {
    const adminUser = await adminAuthRepository.findUserByEmail(undefined, email);

    if (!adminUser) {
      throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (!adminUser.isActive) {
      throw new AppError("Account is disabled.", 403);
    }

    if (!adminUser.passwordHash) {
      throw new AppError("Please reset your password first.", 403);
    }

    // Compare Password
    const isValid = await comparePassword(password, adminUser.passwordHash);

    if (!isValid) {
      throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    // Update Last Login
    await adminAuthRepository.updateLastLogin(adminUser.id);

    const payload = {
      adminId: adminUser.id,
      tenantId: adminUser.tenantId,
      role: adminUser.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await adminAuthRepository.saveRefreshToken(
      adminUser.id,
      adminUser.tenantId,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    return {
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
        employeeCode: adminUser.employeeCode,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Logout
   */
  async logout(refreshToken: string) {
    await adminAuthRepository.revokeRefreshToken(refreshToken);
    return { message: "Logged out successfully." };
  }

  /**
   * Refresh Access Token
   */
  async refreshToken(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    const storedToken = await adminAuthRepository.findRefreshToken(refreshToken);

    if (!storedToken) {
      throw new AppError("Invalid refresh token.", 401);
    }

    if (!payload.adminId) {
      throw new AppError("Invalid token payload.", 401);
    }

    const adminUser = await adminAuthRepository.findUserById(payload.adminId);

    if (!adminUser) {
      throw new AppError("Admin user not found.", 404);
    }

    const accessToken = generateAccessToken({
      adminId: adminUser.id,
      tenantId: adminUser.tenantId,
      role: adminUser.role,
    });

    return {
      accessToken,
    };
  }

  /**
   * Forgot Password (Stub)
   */
  async forgotPassword(email: string) {
    const adminUser = await adminAuthRepository.findUserByEmail(undefined, email);
    if (!adminUser) {
      // Don't leak user existence
      return { message: "If your email is registered, you will receive a reset link." };
    }

    // In a real application, you would generate a reset token and send an email
    // For now, we will just return a mocked token response for demonstration
    const resetToken = "mocked-reset-token-for-" + adminUser.id;

    return { 
      message: "Password reset link generated (Mock).",
      resetToken 
    };
  }

  /**
   * Reset Password
   */
  async resetPassword(token: string, newPassword: string) {
    // In a real application, verify the token and get the user ID
    // Here we extract the user ID from the mocked token string
    if (!token.startsWith("mocked-reset-token-for-")) {
      throw new AppError("Invalid or expired reset token.", 400);
    }

    const adminId = token.replace("mocked-reset-token-for-", "");
    
    const adminUser = await adminAuthRepository.findUserById(adminId);
    if (!adminUser) {
      throw new AppError("Invalid reset token.", 400);
    }

    const passwordHash = await hashPassword(newPassword);
    await adminAuthRepository.updatePassword(adminId, passwordHash);

    return { message: "Password has been reset successfully. You can now login." };
  }
}

export const adminAuthService = new AdminAuthService();
