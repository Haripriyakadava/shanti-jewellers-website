import dotenv from "dotenv";
dotenv.config();

import { cleanEnv, str, port, url, num } from "envalid";

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "production", "test"],
  }),

  PORT: port(),

  APP_NAME: str(),

  APP_URL: url(),

  DATABASE_URL: str(),

  JWT_ACCESS_SECRET: str(),

  JWT_REFRESH_SECRET: str(),

  JWT_ACCESS_EXPIRES_IN: str(),

  JWT_REFRESH_EXPIRES_IN: str(),

  SUPABASE_URL: url(),

  SUPABASE_ANON_KEY: str(),

  SUPABASE_SERVICE_ROLE_KEY: str(),

  RAZORPAY_KEY_ID: str(),

  RAZORPAY_KEY_SECRET: str(),

  SMTP_HOST: str(),

  SMTP_PORT: num(),

  SMTP_USER: str(),

  SMTP_PASSWORD: str(),

  SMTP_FROM: str(),

  BCRYPT_SALT_ROUNDS: num(),

  FRONTEND_URL: url(),
});