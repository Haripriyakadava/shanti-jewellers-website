import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";



import authRoutes from "./modules/auth/auth.route";
import { env } from "./config/env";
import { notFoundMiddleware } from "./middleware/not-found.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { authorize } from "./middleware/role.middleware";
import { authMiddleware } from "./middleware/auth.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app = express();

// Security
app.use(helmet());

// Compression
app.use(compression());

// CORS
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Body Parser
app.use(express.json({
  verify: (req, res, buf) => {
    (req as any).rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Logger
app.use(morgan("dev"));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Shanti Jewellers Backend Running 🚀",
  });
});



import cartRoutes from "./modules/cart/cart.route";
import addressRoutes from "./modules/address/address.route";
import checkoutRoutes from "./modules/checkout/checkout.route";
import paymentRoutes from "./modules/payment/payment.route";
import orderRoutes from "./modules/order/order.route";
import wishlistRoutes from "./modules/wishlist/wishlist.route";

// Authentication Routes
app.use("/api/auth", authRoutes);



app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);

import tenantRoutes from "./modules/tenant/tenant.route";
import categoryRoutes from "./modules/category/category.route";
import collectionRoutes from "./modules/collection/collection.route";
import productRoutes from "./modules/products/product.route";

app.use("/api/tenant", tenantRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/products", productRoutes);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Shanti Jewellers API is running!"
  });
});

// 404 Middleware
app.use(notFoundMiddleware);

// Error Middleware
app.use(errorMiddleware);

app.get(
  "/admin-test",
  authMiddleware,
  authorize("ADMIN"),
  (_req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin",
    });
  }
);


export default app;