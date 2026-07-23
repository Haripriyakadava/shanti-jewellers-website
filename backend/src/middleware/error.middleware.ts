import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { ResponseFormatter } from "../utils/ResponseFormatter";

export const errorMiddleware = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(error.message, { stack: error.stack, error });

  if (error instanceof ZodError) {
    const errorMessages = (error as any).errors ? (error as any).errors.map((err: any) => err.message).join(", ") : error.message;
    return ResponseFormatter.error(res, errorMessages, 400);
  }

  if (error instanceof AppError) {
    return ResponseFormatter.error(res, error.message, error.statusCode);
  }

  return ResponseFormatter.error(
    res,
    error.message || "Internal Server Error",
    error.statusCode || 500
  );
};