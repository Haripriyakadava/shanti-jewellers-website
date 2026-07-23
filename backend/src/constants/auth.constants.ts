export const AUTH_CONSTANTS = {
  ACCESS_TOKEN_COOKIE: "sj_access_token",

  REFRESH_TOKEN_COOKIE: "sj_refresh_token",

  ACCESS_TOKEN_EXPIRES_IN: "15m",

  REFRESH_TOKEN_EXPIRES_IN: "7d",

  PASSWORD_MIN_LENGTH: 8,

  PASSWORD_MAX_LENGTH: 50,

  OTP_LENGTH: 6,

  OTP_EXPIRES_IN_MINUTES: 10,
} as const;

export const USER_ROLES = {
  CUSTOMER: "CUSTOMER",

  ADMIN: "ADMIN",
} as const;

export const AUTH_MESSAGES = {
  REGISTER_SUCCESS: "Customer registered successfully.",

  LOGIN_SUCCESS: "Login successful.",

  LOGOUT_SUCCESS: "Logout successful.",

  INVALID_CREDENTIALS: "Invalid email or password.",

  USER_ALREADY_EXISTS: "Customer already exists.",

  USER_NOT_FOUND: "Customer not found.",

  PASSWORD_RESET_SENT: "Password reset link sent.",

  PASSWORD_RESET_SUCCESS: "Password updated successfully.",

  UNAUTHORIZED: "Unauthorized.",

  FORBIDDEN: "Forbidden.",
} as const;