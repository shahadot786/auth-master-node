import jwt from 'jsonwebtoken';
import securityConfig from '../config/security.js';
import { storeRefreshToken, verifyRefreshToken as verifyRefreshTokenRedis, revokeRefreshToken as revokeRefreshTokenRedis } from './redisTokenService.js';
import logger from '../utils/logger.js';

/**
 * Token Service (Updated with Redis)
 * Handles JWT token generation, verification, and rotation
 * Refresh tokens stored in Redis for better performance and scalability
 */

/**
 * Generate JWT access token
 * @param {String} userId - User ID
 * @param {String} role - User role
 * @param {String} email - User email
 * @returns {String} JWT access token
 */
export const generateAccessToken = (userId, role, email) => {
  const payload = {
    id: userId,
    role,
    email,
  };

  return jwt.sign(payload, securityConfig.jwt.accessTokenSecret, {
    expiresIn: securityConfig.jwt.accessTokenExpiry,
  });
};

/**
 * Generate JWT refresh token and store in Redis
 * @param {String} userId - User ID
 * @param {String} ipAddress - Client IP address
 * @param {String} userAgent - Client user agent
 * @returns {String} JWT refresh token
 */
export const generateRefreshToken = async (userId, ipAddress = null, userAgent = null) => {
  const payload = {
    id: userId,
  };

  const token = jwt.sign(payload, securityConfig.jwt.refreshTokenSecret, {
    expiresIn: securityConfig.jwt.refreshTokenExpiry,
  });

  // Store in Redis
  await storeRefreshToken(token, userId, ipAddress, userAgent);

  logger.info(`Refresh token generated for user: ${userId}`);

  return token;
};

/**
 * Verify JWT access token
 * @param {String} token - Access token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, securityConfig.jwt.accessTokenSecret);
    return { valid: true, decoded };
  } catch (error) {
    logger.warn(`Access token verification failed: ${error.message}`);
    return { valid: false, error: error.message };
  }
};

/**
 * Verify JWT refresh token (checks JWT + Redis)
 * @param {String} token - Refresh token to verify
 * @returns {Object} Verification result with decoded payload
 */
export const verifyRefreshToken = async (token) => {
  try {
    // Verify JWT signature and expiry
    const decoded = jwt.verify(token, securityConfig.jwt.refreshTokenSecret);

    // Check if token exists in Redis
    const tokenData = await verifyRefreshTokenRedis(token);

    if (!tokenData) {
      logger.warn(`Refresh token not found in Redis for user: ${decoded.id}`);
      return { valid: false, error: 'Invalid or revoked refresh token' };
    }

    return { valid: true, decoded, tokenData };
  } catch (error) {
    logger.warn(`Refresh token verification failed: ${error.message}`);
    return { valid: false, error: error.message };
  }
};

/**
 * Rotate refresh token (revoke old, issue new)
 * @param {String} oldToken - Old refresh token
 * @param {String} ipAddress - Client IP address
 * @param {String} userAgent - Client user agent
 * @returns {Object} New tokens
 */
export const rotateRefreshToken = async (oldToken, ipAddress = null, userAgent = null) => {
  // Verify old token
  const verification = await verifyRefreshToken(oldToken);

  if (!verification.valid) {
    throw new Error(verification.error);
  }

  const { decoded } = verification;

  // Revoke old token
  await revokeRefreshToken(oldToken);

  // Get user role and email from tokenData or fetch from DB if needed
  // For now, we'll generate with just the userId
  const newAccessToken = generateAccessToken(decoded.id, decoded.role, decoded.email);
  const newRefreshToken = await generateRefreshToken(decoded.id, ipAddress, userAgent);

  logger.info(`Refresh token rotated for user: ${decoded.id}`);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Revoke a refresh token
 * @param {String} token - Refresh token to revoke
 */
export const revokeRefreshToken = async (token) => {
  await revokeRefreshTokenRedis(token);
  logger.info('Refresh token revoked');
};

/**
 * Revoke all refresh tokens for a user
 * @param {String} userId - User ID
 */
export const revokeAllUserTokens = async (userId) => {
  const { revokeAllUserTokens: revokeAllRedis } = await import('./redisTokenService.js');
  await revokeAllRedis(userId);
  logger.info(`All refresh tokens revoked for user: ${userId}`);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
