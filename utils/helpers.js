import crypto from 'crypto';
import securityConfig from '../config/security.js';

/**
 * Generate a random 6-digit OTP
 * @returns {String} 6-digit OTP
 */
export const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

/**
 * Hash a token using SHA-256
 * Used for storing refresh tokens securely
 * @param {String} token - Token to hash
 * @returns {String} Hashed token
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a secure random token
 * @param {Number} length - Length of the token in bytes (default: 32)
 * @returns {String} Random token in hex format
 */
export const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Calculate OTP expiry time
 * @returns {Date} Expiry date object
 */
export const getOTPExpiry = () => {
  const expiryMinutes = securityConfig.otp.expiryMinutes;
  return new Date(Date.now() + expiryMinutes * 60 * 1000);
};

/**
 * Calculate refresh token expiry time
 * @returns {Date} Expiry date object
 */
export const getRefreshTokenExpiry = () => {
  // 30 days from now
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
};

/**
 * Sanitize user object for response
 * Removes sensitive fields like password
 * @param {Object} user - User object
 * @returns {Object} Sanitized user object
 */
export const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  const { password, __v, ...sanitizedUser } = userObj;
  return sanitizedUser;
};

/**
 * Generate a random verification code
 * @param {Number} length - Length of the code (default: 6)
 * @returns {String} Verification code
 */
export const generateVerificationCode = (length = 6) => {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
};

/**
 * Check if a date is expired
 * @param {Date} expiryDate - Date to check
 * @returns {Boolean} True if expired, false otherwise
 */
export const isExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};

export default {
  generateOTP,
  hashToken,
  generateRandomToken,
  getOTPExpiry,
  getRefreshTokenExpiry,
  sanitizeUser,
  generateVerificationCode,
  isExpired,
};
