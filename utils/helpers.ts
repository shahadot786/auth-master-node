import crypto from 'crypto';
import securityConfig from '../config/security.js';
import { UserDocument, SanitizedUser } from '../types/index.js';

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export const generateOTP = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

/**
 * Hash a token using SHA-256
 * Used for storing refresh tokens securely
 * @param {string} token - Token to hash
 * @returns {string} Hashed token
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a secure random token
 * @param {number} length - Length of the token in bytes (default: 32)
 * @returns {string} Random token in hex format
 */
export const generateRandomToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Calculate OTP expiry time
 * @returns {Date} Expiry date object
 */
export const getOTPExpiry = (): Date => {
  const expiryMinutes = securityConfig.otp.expiryMinutes;
  return new Date(Date.now() + expiryMinutes * 60 * 1000);
};

/**
 * Calculate refresh token expiry time
 * @returns {Date} Expiry date object
 */
export const getRefreshTokenExpiry = (): Date => {
  // 30 days from now
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
};

/**
 * Sanitize user object for response
 * Removes sensitive fields like password
 * @param {UserDocument | any} user - User object
 * @returns {SanitizedUser} Sanitized user object
 */
export const sanitizeUser = (user: UserDocument | any): SanitizedUser => {
  const userObj = user.toObject ? user.toObject() : user;
  const { password, __v, ...sanitizedUser } = userObj;
  return sanitizedUser as SanitizedUser;
};

/**
 * Generate a random verification code
 * @param {number} length - Length of the code (default: 6)
 * @returns {string} Verification code
 */
export const generateVerificationCode = (length: number = 6): string => {
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
 * @returns {boolean} True if expired, false otherwise
 */
export const isExpired = (expiryDate: Date): boolean => {
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
