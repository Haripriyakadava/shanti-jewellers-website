import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Shanti Jewellers API",
      version: "1.0.0",
      description: "API Documentation for Shanti Jewellers Backend",
    },
    servers: [
      {
        url: env.APP_URL || "http://localhost:5000",
        description: "API Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/modules/**/*.route.ts", "./src/app.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
