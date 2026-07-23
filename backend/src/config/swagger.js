"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const env_1 = require("./env");
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Shanti Jewellers API",
            version: "1.0.0",
            description: "API Documentation for Shanti Jewellers Backend",
        },
        servers: [
            {
                url: env_1.env.APP_URL || "http://localhost:5000",
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
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
