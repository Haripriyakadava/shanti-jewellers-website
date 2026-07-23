import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.validation";

export class AuthController {
  /**
   * Register Customer
   */
  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Validate Request
      const data = registerSchema.parse(req.body);

      // Call Service
      const result = await authService.register(data);

      // Send Response
      return res.status(201).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }


  /**
   * Login Customer
   */
  async login(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Validate Request
      const data = loginSchema.parse(req.body);

      // Call Service
      const result = await authService.login(
        data.tenantId,
        data.email,
        data.password
      );

      // Response
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
 * Current Logged-in Customer
 */
async me(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    return res.status(200).json({
      success: true,
      customer: req.customer,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh Access Token
 */
async refresh(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refreshToken(refreshToken);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
}

export const authController = new AuthController();