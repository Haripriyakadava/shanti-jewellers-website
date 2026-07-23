import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";

declare global {
  namespace Express {
    interface Request {
      admin?: {
        adminId: string;
        tenantId: string;
        role: string;
      };
    }
  }
}

export const adminAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication token is missing.", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (!decoded.adminId) {
      throw new AppError("Invalid admin token payload.", 401);
    }

    req.admin = {
      adminId: decoded.adminId,
      tenantId: decoded.tenantId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(new AppError("Invalid or expired token.", 401));
  }
};

export const requireAdminRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return next(new AppError("Authentication required.", 401));
    }

    if (!roles.includes(req.admin.role)) {
      return next(new AppError("Access denied. Insufficient permissions.", 403));
    }

    next();
  };
};
