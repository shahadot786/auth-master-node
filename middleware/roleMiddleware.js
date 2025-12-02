import { errorResponse } from '../utils/responseFormatter.js';
import logger from '../utils/logger.js';

/**
 * Role-based Access Control (RBAC) Middleware
 * Restricts access based on user roles
 */

/**
 * Authorize roles middleware factory
 * @param  {...String} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return errorResponse(res, 'Authentication required', 401);
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(
          `Access denied for user ${req.user.email} with role ${req.user.role}. Required roles: ${allowedRoles.join(', ')}`
        );
        
        return errorResponse(
          res,
          'You do not have permission to access this resource',
          403
        );
      }

      // User has required role
      next();
    } catch (error) {
      logger.error(`Authorization error: ${error.message}`);
      return errorResponse(res, 'Authorization failed', 403);
    }
  };
};

/**
 * Check if user is admin or superadmin
 */
export const isAdmin = authorizeRoles('admin', 'superadmin');

/**
 * Check if user is superadmin only
 */
export const isSuperAdmin = authorizeRoles('superadmin');

/**
 * Check if user owns the resource or is admin
 * @param {String} resourceUserIdField - Field name in req.params that contains the user ID
 */
export const isOwnerOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return errorResponse(res, 'Authentication required', 401);
      }

      const resourceUserId = req.params[resourceUserIdField];
      const isOwner = req.user.id.toString() === resourceUserId;
      const isAdminUser = ['admin', 'superadmin'].includes(req.user.role);

      if (!isOwner && !isAdminUser) {
        logger.warn(
          `Access denied for user ${req.user.email}. Not owner and not admin.`
        );
        
        return errorResponse(
          res,
          'You do not have permission to access this resource',
          403
        );
      }

      next();
    } catch (error) {
      logger.error(`Authorization error: ${error.message}`);
      return errorResponse(res, 'Authorization failed', 403);
    }
  };
};

export default {
  authorizeRoles,
  isAdmin,
  isSuperAdmin,
  isOwnerOrAdmin,
};
