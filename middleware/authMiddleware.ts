// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/tokenService.js';
import { errorResponse } from '../utils/responseFormatter.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { AuthenticatedRequest } from '../types/index.js';

/**
 * Authentication Middleware
 * Validates JWT access token and attaches user to request
 */
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    // Get token from Authorization header or cookie
    let token: string | null = null;
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      // Check HTTP-only cookie
      token = req.cookies.accessToken;
    }

    if (!token) {
      return errorResponse(res, 'Access token is required', 401);
    }

    // Verify token
    const verification = verifyAccessToken(token);

    if (!verification.valid || !verification.decoded) {
      const message = verification.error?.includes('expired')
        ? 'Access token has expired. Please refresh your token.'
        : 'Invalid access token';
      
      return errorResponse(res, message, 401);
    }

    // Get user from database
    const user = await User.findById(verification.decoded.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Check if user is verified
    if (!user.isVerified) {
      return errorResponse(res, 'Please verify your email to access this resource', 403);
    }

    // Attach user to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    const err = error as Error;
    logger.error(`Authentication error: ${err.message}`);
    return errorResponse(res, 'Authentication failed', 401);
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if no token
 */
export const optionalAuthenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const verification = verifyAccessToken(token);

    if (verification.valid && verification.decoded) {
      const user = await User.findById(verification.decoded.id);
      
      if (user && user.isVerified) {
        req.user = {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

export default {
  authenticate,
  optionalAuthenticate,
};
