import { authRepository } from "./auth.repository";
import { hashPassword, comparePassword } from "../../utils/bcrypt";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, } from "../../utils/jwt";
import { AppError } from "../../utils/AppError";
import { RegisterInput } from "./auth.validation";
import { AUTH_MESSAGES } from "../../constants/auth.constants";

export class AuthService {
  /**
   * Register Customer
   */
  async register(data: RegisterInput) {
    // Check if customer already exists
    const existingUser = await authRepository.findUserByEmail(
      data.tenantId,
      data.email
    );

    if (existingUser) {
      throw new AppError(AUTH_MESSAGES.USER_ALREADY_EXISTS, 400);
    }

    // Hash Password
    const passwordHash = await hashPassword(data.password);

    // Create Customer
    const customer = await authRepository.createUser({
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
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save Refresh Token
    await authRepository.saveRefreshToken(
      customer.id,
      customer.tenantId,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    return {
      message: AUTH_MESSAGES.REGISTER_SUCCESS,
      customer: {
        id: customer.id,
        customerCode: customer.customerCode,
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
  async login(
    tenantId: string,
    email: string,
    password: string
  ) {

    // Find Customer
    const customer = await authRepository.findUserByEmail(
      tenantId,
      email
    );

    if (!customer) {
      throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    // Compare Password
    const isValid = await comparePassword(
      password,
      customer.passwordHash
    );

    if (!isValid) {
      throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    // Update Last Login
    await authRepository.updateLastLogin(customer.id);

    const payload = {
      customerId: customer.id,
      tenantId: customer.tenantId,
      role: customer.role,
    };

    const accessToken = generateAccessToken(payload);

    const refreshToken = generateRefreshToken(payload);

    await authRepository.saveRefreshToken(
      customer.id,
      customer.tenantId,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    return {
      message: AUTH_MESSAGES.LOGIN_SUCCESS,

      customer: {
        id: customer.id,
        customerCode: customer.customerCode,
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
async refreshToken(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);

  const storedToken = await authRepository.findRefreshToken(refreshToken);

  if (!storedToken) {
    throw new AppError("Invalid refresh token.", 401);
  }

  if (!payload.customerId) {
    throw new AppError("Invalid token payload.", 401);
  }

  const customer = await authRepository.findUserById(payload.customerId);

  if (!customer) {
    throw new AppError("Customer not found.", 404);
  }

  const accessToken = generateAccessToken({
    customerId: customer.id,
    tenantId: customer.tenantId,
    role: customer.role,
  });

  return {
    accessToken,
  };
}
}

export const authService = new AuthService();