"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envalid_1 = require("envalid");
exports.env = (0, envalid_1.cleanEnv)(process.env, {
    NODE_ENV: (0, envalid_1.str)({
        choices: ["development", "production", "test"],
    }),
    PORT: (0, envalid_1.port)(),
    APP_NAME: (0, envalid_1.str)(),
    APP_URL: (0, envalid_1.url)(),
    DATABASE_URL: (0, envalid_1.str)(),
    JWT_ACCESS_SECRET: (0, envalid_1.str)(),
    JWT_REFRESH_SECRET: (0, envalid_1.str)(),
    JWT_ACCESS_EXPIRES_IN: (0, envalid_1.str)(),
    JWT_REFRESH_EXPIRES_IN: (0, envalid_1.str)(),
    SUPABASE_URL: (0, envalid_1.url)(),
    SUPABASE_ANON_KEY: (0, envalid_1.str)(),
    SUPABASE_SERVICE_ROLE_KEY: (0, envalid_1.str)(),
    RAZORPAY_KEY_ID: (0, envalid_1.str)(),
    RAZORPAY_KEY_SECRET: (0, envalid_1.str)(),
    SMTP_HOST: (0, envalid_1.str)(),
    SMTP_PORT: (0, envalid_1.num)(),
    SMTP_USER: (0, envalid_1.str)(),
    SMTP_PASSWORD: (0, envalid_1.str)(),
    SMTP_FROM: (0, envalid_1.str)(),
    BCRYPT_SALT_ROUNDS: (0, envalid_1.num)(),
    FRONTEND_URL: (0, envalid_1.url)(),
});
