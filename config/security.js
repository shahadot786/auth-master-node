import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

/**
 * Centralized security configuration
 * Contains all security-related settings and constants
 */

export const securityConfig = {
  // JWT Configuration
  jwt: {
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
    accessTokenSecret: process.env.JWT_ACCESS_SECRET,
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
  },

  // Bcrypt Configuration
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
  },

  // Cookie Configuration
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    signed: true,
  },

  // OTP Configuration
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 10,
    length: 6,
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5,
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
  },

  // Password Requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
};

export default securityConfig;
