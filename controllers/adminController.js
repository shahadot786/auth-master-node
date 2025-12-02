import User from '../models/User.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseFormatter.js';
import { sanitizeUser } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * Admin Controller
 * Handles admin-only operations
 */

/**
 * Get all users with pagination
 * GET /admin/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter parameters
    const filter = {};
    
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    if (req.query.isVerified !== undefined) {
      filter.isVerified = req.query.isVerified === 'true';
    }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await User.countDocuments(filter);

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Sanitize users
    const sanitizedUsers = users.map((user) => sanitizeUser(user));

    return paginatedResponse(
      res,
      sanitizedUsers,
      page,
      limit,
      total,
      'Users retrieved successfully'
    );
  } catch (error) {
    logger.error(`Get all users error: ${error.message}`);
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Get user by ID
 * GET /admin/users/:id
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(
      res,
      { user: sanitizeUser(user) },
      'User retrieved successfully',
      200
    );
  } catch (error) {
    logger.error(`Get user by ID error: ${error.message}`);
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Update user role
 * PATCH /admin/users/:id/role
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['user', 'admin', 'superadmin'];
    if (!validRoles.includes(role)) {
      return errorResponse(res, 'Invalid role', 400);
    }

    const user = await User.findById(id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Prevent changing own role (optional security measure)
    if (user._id.toString() === req.user.id) {
      return errorResponse(res, 'You cannot change your own role', 403);
    }

    user.role = role;
    await user.save();

    logger.info(`User role updated: ${user.email} -> ${role} by ${req.user.email}`);

    return successResponse(
      res,
      { user: sanitizeUser(user) },
      'User role updated successfully',
      200
    );
  } catch (error) {
    logger.error(`Update user role error: ${error.message}`);
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Soft delete user
 * DELETE /admin/users/:id
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('+isDeleted');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Prevent deleting own account
    if (user._id.toString() === req.user.id) {
      return errorResponse(res, 'You cannot delete your own account', 403);
    }

    // Check if already deleted
    if (user.isDeleted) {
      return errorResponse(res, 'User is already deleted', 400);
    }

    // Soft delete
    user.isDeleted = true;
    await user.save();

    logger.info(`User soft deleted: ${user.email} by ${req.user.email}`);

    return successResponse(
      res,
      null,
      'User deleted successfully',
      200
    );
  } catch (error) {
    logger.error(`Delete user error: ${error.message}`);
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Restore soft-deleted user
 * PATCH /admin/users/:id/restore
 */
export const restoreUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id, isDeleted: true }).select('+isDeleted');

    if (!user) {
      return errorResponse(res, 'Deleted user not found', 404);
    }

    // Restore user
    user.isDeleted = false;
    await user.save();

    logger.info(`User restored: ${user.email} by ${req.user.email}`);

    return successResponse(
      res,
      { user: sanitizeUser(user) },
      'User restored successfully',
      200
    );
  } catch (error) {
    logger.error(`Restore user error: ${error.message}`);
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Get dashboard statistics
 * GET /admin/stats
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });
    const deletedUsers = await User.countDocuments({ isDeleted: true });
    
    const usersByRole = await User.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const stats = {
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      deletedUsers,
      activeUsers: totalUsers - deletedUsers,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };

    return successResponse(
      res,
      stats,
      'Dashboard statistics retrieved successfully',
      200
    );
  } catch (error) {
    logger.error(`Get dashboard stats error: ${error.message}`);
    return errorResponse(res, error.message, 400);
  }
};

export default {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  restoreUser,
  getDashboardStats,
};
