"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const AppError_1 = require("../utils/AppError");
const logger_1 = require("../utils/logger");
const ResponseFormatter_1 = require("../utils/ResponseFormatter");
const errorMiddleware = (error, _req, res, _next) => {
    logger_1.logger.error(error.message, { stack: error.stack, error });
    if (error instanceof AppError_1.AppError) {
        return ResponseFormatter_1.ResponseFormatter.error(res, error.message, error.statusCode);
    }
    return ResponseFormatter_1.ResponseFormatter.error(res, error.message || "Internal Server Error", error.statusCode || 500);
};
exports.errorMiddleware = errorMiddleware;
