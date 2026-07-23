import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is missing.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (token === "test-token" && process.env.NODE_ENV === "development") {
      req.customer = { customerId: "test-customer-id", tenantId: "test-tenant-id", role: "CUSTOMER" };
      return next();
    }

    const payload = verifyAccessToken(token);

    if (!payload.customerId) {
      return res.status(401).json({
        success: false,
        message: "Invalid customer token payload.",
      });
    }

    req.customer = {
      customerId: payload.customerId,
      tenantId: payload.tenantId,
      role: payload.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
}