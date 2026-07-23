import { Request, Response } from "express";
import { adminAuthService } from "./admin-auth.service";
import {
  adminLoginSchema,
  adminRegisterSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./admin-auth.validation";
import { ResponseFormatter } from "../../utils/ResponseFormatter";

export class AdminAuthController {
  async register(req: Request, res: Response) {
    const validatedData = adminRegisterSchema.parse(req.body);
    const result = await adminAuthService.register(validatedData);
    return ResponseFormatter.success(res, result, result.message, 201);
  }

  async login(req: Request, res: Response) {
    const validatedData = adminLoginSchema.parse(req.body);
    const result = await adminAuthService.login(
      validatedData.email,
      validatedData.password
    );

    // Set refresh token in httpOnly cookie
    res.cookie("adminRefreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return ResponseFormatter.success(
      res,
      {
        adminUser: result.adminUser,
        accessToken: result.accessToken,
      },
      result.message
    );
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.adminRefreshToken;
    if (refreshToken) {
      await adminAuthService.logout(refreshToken);
    }

    res.clearCookie("adminRefreshToken");
    return ResponseFormatter.success(res, null, "Logged out successfully");
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies?.adminRefreshToken;

    if (!refreshToken) {
      return ResponseFormatter.error(res, "Refresh token not found", 401);
    }

    const result = await adminAuthService.refreshToken(refreshToken);
    return ResponseFormatter.success(res, result, "Token refreshed successfully");
  }

  async forgotPassword(req: Request, res: Response) {
    const validatedData = forgotPasswordSchema.parse(req.body);
    const result = await adminAuthService.forgotPassword(validatedData.email);
    return ResponseFormatter.success(res, result, result.message);
  }

  async resetPassword(req: Request, res: Response) {
    const validatedData = resetPasswordSchema.parse(req.body);
    const result = await adminAuthService.resetPassword(
      validatedData.token,
      validatedData.newPassword
    );
    return ResponseFormatter.success(res, result, result.message);
  }
}

export const adminAuthController = new AdminAuthController();
