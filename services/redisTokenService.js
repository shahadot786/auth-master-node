import redisClient from '../config/redis.js';
import { hashToken } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * Redis Refresh Token Service
 * Stores and manages refresh tokens in Redis for better performance and scalability
 */

const REFRESH_TOKEN_PREFIX = 'refresh_token:';
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Store refresh token in Redis
 * @param {String} token - Refresh token (will be hashed)
 * @param {String} userId - User ID
 * @param {String} ipAddress - Client IP
 * @param {String} userAgent - Client user agent
 * @returns {Promise<void>}
 */
export const storeRefreshToken = async (token, userId, ipAddress = null, userAgent = null) => {
  try {
    const hashedToken = hashToken(token);
    const key = `${REFRESH_TOKEN_PREFIX}${hashedToken}`;
    
    const tokenData = {
      userId,
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000).toISOString(),
    };

    // Store in Redis with expiry
    await redisClient.setex(key, REFRESH_TOKEN_EXPIRY, JSON.stringify(tokenData));
    
    // Also add to user's token set for easy revocation
    await redisClient.sadd(`user_tokens:${userId}`, hashedToken);
    await redisClient.expire(`user_tokens:${userId}`, REFRESH_TOKEN_EXPIRY);
    
    logger.info(`Refresh token stored in Redis for user: ${userId}`);
  } catch (error) {
    logger.error(`Failed to store refresh token in Redis: ${error.message}`);
    throw error;
  }
};

/**
 * Verify refresh token exists and is valid
 * @param {String} token - Refresh token
 * @returns {Promise<Object>} Token data or null
 */
export const verifyRefreshToken = async (token) => {
  try {
    const hashedToken = hashToken(token);
    const key = `${REFRESH_TOKEN_PREFIX}${hashedToken}`;
    
    const tokenData = await redisClient.get(key);
    
    if (!tokenData) {
      return null;
    }
    
    return JSON.parse(tokenData);
  } catch (error) {
    logger.error(`Failed to verify refresh token in Redis: ${error.message}`);
    return null;
  }
};

/**
 * Revoke a specific refresh token
 * @param {String} token - Refresh token to revoke
 * @returns {Promise<void>}
 */
export const revokeRefreshToken = async (token) => {
  try {
    const hashedToken = hashToken(token);
    const key = `${REFRESH_TOKEN_PREFIX}${hashedToken}`;
    
    // Get token data to find userId
    const tokenData = await redisClient.get(key);
    
    if (tokenData) {
      const { userId } = JSON.parse(tokenData);
      
      // Remove from Redis
      await redisClient.del(key);
      
      // Remove from user's token set
      await redisClient.srem(`user_tokens:${userId}`, hashedToken);
      
      logger.info(`Refresh token revoked for user: ${userId}`);
    }
  } catch (error) {
    logger.error(`Failed to revoke refresh token in Redis: ${error.message}`);
    throw error;
  }
};

/**
 * Revoke all refresh tokens for a user
 * @param {String} userId - User ID
 * @returns {Promise<void>}
 */
export const revokeAllUserTokens = async (userId) => {
  try {
    // Get all tokens for user
    const tokens = await redisClient.smembers(`user_tokens:${userId}`);
    
    if (tokens && tokens.length > 0) {
      // Delete all tokens
      const pipeline = redisClient.pipeline();
      
      tokens.forEach((hashedToken) => {
        pipeline.del(`${REFRESH_TOKEN_PREFIX}${hashedToken}`);
      });
      
      // Delete user's token set
      pipeline.del(`user_tokens:${userId}`);
      
      await pipeline.exec();
      
      logger.info(`All refresh tokens revoked for user: ${userId}`);
    }
  } catch (error) {
    logger.error(`Failed to revoke all user tokens in Redis: ${error.message}`);
    throw error;
  }
};

/**
 * Get count of active tokens for a user
 * @param {String} userId - User ID
 * @returns {Promise<Number>} Number of active tokens
 */
export const getUserTokenCount = async (userId) => {
  try {
    return await redisClient.scard(`user_tokens:${userId}`);
  } catch (error) {
    logger.error(`Failed to get user token count: ${error.message}`);
    return 0;
  }
};

export default {
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  getUserTokenCount,
};
