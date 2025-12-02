import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

/**
 * Rate Limiting Middleware
 * Protects against brute-force attacks
 */

/**
 * Rate limiter for authentication routes
 * Stricter limits to prevent brute-force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    });
  },
  skip: (req) => {
    // Skip rate limiting in development if needed
    // return process.env.NODE_ENV === 'development';
    return false;
  },
});

/**
 * Rate limiter for password reset routes
 * Prevent abuse of password reset functionality
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again after 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many password reset attempts. Please try again after 1 hour.',
    });
  },
});

/**
 * Rate limiter for email verification routes
 * Prevent spam of verification emails
 */
export const emailVerificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // Limit each IP to 3 requests per 10 minutes
  message: {
    success: false,
    message: 'Too many verification attempts. Please try again after 10 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Email verification rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many verification attempts. Please try again after 10 minutes.',
    });
  },
});

/**
 * General rate limiter for API routes
 * More lenient limits for general API usage
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`General rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  },
});

export default {
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  generalLimiter,
};
