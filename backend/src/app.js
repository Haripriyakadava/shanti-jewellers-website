"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const product_route_1 = __importDefault(require("./modules/products/product.route"));
const auth_route_1 = __importDefault(require("./modules/auth/auth.route"));
const env_1 = require("./config/env");
const not_found_middleware_1 = require("./middleware/not-found.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const role_middleware_1 = require("./middleware/role.middleware");
const auth_middleware_1 = require("./middleware/auth.middleware");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const app = (0, express_1.default)();
// Security
app.use((0, helmet_1.default)());
// Compression
app.use((0, compression_1.default)());
// CORS
app.use((0, cors_1.default)({
    origin: env_1.env.FRONTEND_URL,
    credentials: true,
}));
// Body Parser
app.use(express_1.default.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use(express_1.default.urlencoded({ extended: true }));
// Cookies
app.use((0, cookie_parser_1.default)());
// Logger
app.use((0, morgan_1.default)("dev"));
// Swagger UI
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// Health Check
app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Shanti Jewellers Backend Running 🚀",
    });
});
const tenant_route_1 = __importDefault(require("./modules/tenant/tenant.route"));
const category_route_1 = __importDefault(require("./modules/category/category.route"));
const collection_route_1 = __importDefault(require("./modules/collection/collection.route"));
const cart_route_1 = __importDefault(require("./modules/cart/cart.route"));
const address_route_1 = __importDefault(require("./modules/address/address.route"));
const checkout_route_1 = __importDefault(require("./modules/checkout/checkout.route"));
const payment_route_1 = __importDefault(require("./modules/payment/payment.route"));
const order_route_1 = __importDefault(require("./modules/order/order.route"));
// Authentication Routes
app.use("/api/auth", auth_route_1.default);
app.use("/api/categories", category_route_1.default);
app.use("/api/collections", collection_route_1.default);
app.use("/api/products", product_route_1.default);
app.use("/api/cart", cart_route_1.default);
app.use("/api/addresses", address_route_1.default);
app.use("/api/checkout", checkout_route_1.default);
app.use("/api/payments", payment_route_1.default);
app.use("/api/orders", order_route_1.default);
app.use("/api/tenants", tenant_route_1.default);
// 404 Middleware
app.use(not_found_middleware_1.notFoundMiddleware);
// Error Middleware
app.use(error_middleware_1.errorMiddleware);
app.get("/admin-test", auth_middleware_1.authMiddleware, (0, role_middleware_1.authorize)("ADMIN"), (_req, res) => {
    res.json({
        success: true,
        message: "Welcome Admin",
    });
});
exports.default = app;
