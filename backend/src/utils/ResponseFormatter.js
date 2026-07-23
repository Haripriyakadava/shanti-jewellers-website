"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseFormatter = void 0;
class ResponseFormatter {
    static success(res, data, message = "Success", statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }
    static error(res, message, statusCode = 500, errors) {
        const payload = {
            success: false,
            message,
        };
        if (errors) {
            payload.errors = errors;
        }
        return res.status(statusCode).json(payload);
    }
}
exports.ResponseFormatter = ResponseFormatter;
