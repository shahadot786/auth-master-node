import redisClient from '../config/redis.js';
import { generateOTP } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * Redis OTP Service
 * Stores and manages OTPs in Redis for fast access and automatic expiry
 */

const OTP_PREFIX = 'otp:';
const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10; // minutes
const OTP_EXPIRY_SECONDS = OTP_EXPIRY * 60;

/**
 * Generate and store OTP in Redis
 * @param {String} email - User email
 * @param {String} type - OTP type ('email_verification' or 'password_reset')
 * @returns {Promise<String>} Generated OTP
 */
export const createOTP = async (email, type) => {
  try {
    const otp = generateOTP();
    const key = `${OTP_PREFIX}${type}:${email.toLowerCase()}`;
    
    const otpData = {
      otp,
      email: email.toLowerCase(),
      type,
      attempts: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000).toISOString(),
    };

    // Store in Redis with TTL
    await redisClient.setex(key, OTP_EXPIRY_SECONDS, JSON.stringify(otpData));
    
    logger.info(`OTP created for ${email} (type: ${type})`);
    
    return otp;
  } catch (error) {
    logger.error(`Failed to create OTP in Redis: ${error.message}`);
    throw error;
  }
};

/**
 * Verify OTP
 * @param {String} email - User email
 * @param {String} otp - OTP to verify
 * @param {String} type - OTP type
 * @returns {Promise<Object>} Verification result
 */
export const verifyOTP = async (email, otp, type) => {
  try {
    const key = `${OTP_PREFIX}${type}:${email.toLowerCase()}`;
    
    const otpDataStr = await redisClient.get(key);
    
    if (!otpDataStr) {
      return {
        valid: false,
        message: 'Invalid or expired OTP',
      };
    }
    
    const otpData = JSON.parse(otpDataStr);
    
    // Check attempts
    if (otpData.attempts >= 5) {
      await redisClient.del(key); // Delete after too many attempts
      return {
        valid: false,
        message: 'Too many attempts. Please request a new OTP',
      };
    }
    
    // Verify OTP
    if (otpData.otp !== otp) {
      // Increment attempts
      otpData.attempts += 1;
      const ttl = await redisClient.ttl(key);
      await redisClient.setex(key, ttl > 0 ? ttl : OTP_EXPIRY_SECONDS, JSON.stringify(otpData));
      
      return {
        valid: false,
        message: 'Invalid OTP',
      };
    }
    
    // OTP is valid - delete it (one-time use)
    await redisClient.del(key);
    
    logger.info(`OTP verified successfully for ${email} (type: ${type})`);
    
    return {
      valid: true,
      message: 'OTP verified successfully',
    };
  } catch (error) {
    logger.error(`Failed to verify OTP in Redis: ${error.message}`);
    return {
      valid: false,
      message: 'OTP verification failed',
    };
  }
};

/**
 * Delete OTP (cleanup)
 * @param {String} email - User email
 * @param {String} type - OTP type
 * @returns {Promise<void>}
 */
export const deleteOTP = async (email, type) => {
  try {
    const key = `${OTP_PREFIX}${type}:${email.toLowerCase()}`;
    await redisClient.del(key);
    logger.info(`OTP deleted for ${email} (type: ${type})`);
  } catch (error) {
    logger.error(`Failed to delete OTP in Redis: ${error.message}`);
  }
};

/**
 * Check if OTP exists
 * @param {String} email - User email
 * @param {String} type - OTP type
 * @returns {Promise<Boolean>} True if OTP exists
 */
export const otpExists = async (email, type) => {
  try {
    const key = `${OTP_PREFIX}${type}:${email.toLowerCase()}`;
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error(`Failed to check OTP existence in Redis: ${error.message}`);
    return false;
  }
};

/**
 * Get remaining TTL for OTP
 * @param {String} email - User email
 * @param {String} type - OTP type
 * @returns {Promise<Number>} Remaining seconds (-1 if not found)
 */
export const getOTPTTL = async (email, type) => {
  try {
    const key = `${OTP_PREFIX}${type}:${email.toLowerCase()}`;
    return await redisClient.ttl(key);
  } catch (error) {
    logger.error(`Failed to get OTP TTL in Redis: ${error.message}`);
    return -1;
  }
};

export default {
  createOTP,
  verifyOTP,
  deleteOTP,
  otpExists,
  getOTPTTL,
};
