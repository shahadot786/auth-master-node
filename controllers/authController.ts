// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService.js';
import { rotateRefreshToken } from '../services/tokenService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import logger from '../utils/logger.js';

/**
 * Auth Controller
 * Handles HTTP requests for authentication endpoints
 */

/**
 * Register a new user
 * POST /auth/register
 */
export const register = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const result = await authService.registerUser(req.body);

    return successResponse(
      res,
      result,
      'Registration successful. Please check your email for verification OTP.',
      201
    );
  } catch (error) {
    const err = error as Error;
    logger.error(`Registration error: ${err.message}`);
    return errorResponse(res, err.message, 400);
  }
};

/**
 * Login user
 * POST /auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const result = await authService.loginUser(email, password, ipAddress, userAgent);

    // Set access token in HTTP-only cookie
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return successResponse(
      res,
      result,
      'Login successful',
      200
    );
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return errorResponse(res, error.message, 401);
  }
};

/**
 * Logout user
 * POST /auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    // Get refresh token from body or cookie
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    await authService.logoutUser(refreshToken);

    // Clear both access and refresh token cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return successResponse(
      res,
      null,
      'Logged out successfully',
      200
    );
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Refresh access token
 * POST /auth/refresh-token
 */
export const refreshToken = async (req, res, next) => {
  try {
    // Get refresh token from body or cookie
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    // Rotate tokens
    const tokens = await rotateRefreshToken(refreshToken, ipAddress, userAgent);

    // Set new access token in HTTP-only cookie
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Update refresh token cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return successResponse(
      res,
      tokens,
      'Token refreshed successfully',
      200
    );
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    return errorResponse(res, error.message, 401);
  }
};

/**
 * Verify email with OTP
 * POST /auth/verify-email
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const result = await authService.verifyEmail(email, otp);

    return successResponse(
      res,
      result,
      'Email verified successfully',
      200
    );
  } catch (error) {
    logger.error(`Email verification error: ${error.message}`);
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Request password reset
 * POST /auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await authService.requestPasswordReset(email);

    return successResponse(
      res,
      null,
      result.message,
      200
    );
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Reset password with OTP
 * POST /auth/reset-password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const result = await authService.resetPassword(email, otp, newPassword);

    return successResponse(
      res,
      null,
      result.message,
      200
    );
  } catch (error) {
    logger.error(`Password reset error: ${error.message}`);
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Get current user profile (protected route example)
 * GET /auth/me
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user is set by authenticate middleware
    return successResponse(
      res,
      { user: req.user },
      'Profile retrieved successfully',
      200
    );
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    return errorResponse(res, error.message, 400);
  }
};

export default {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
};
