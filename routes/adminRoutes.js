import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin/superadmin role
router.use(authenticate);
router.use(authorizeRoles('admin', 'superadmin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin user management endpoints (requires admin/superadmin role)
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Dashboard statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                       example: 150
 *                     verifiedUsers:
 *                       type: number
 *                       example: 120
 *                     unverifiedUsers:
 *                       type: number
 *                       example: 30
 *                     deletedUsers:
 *                       type: number
 *                       example: 5
 *                     activeUsers:
 *                       type: number
 *                       example: 145
 *                     usersByRole:
 *                       type: object
 *                       properties:
 *                         user:
 *                           type: number
 *                           example: 140
 *                         admin:
 *                           type: number
 *                           example: 8
 *                         superadmin:
 *                           type: number
 *                           example: 2
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.get('/stats', adminController.getDashboardStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with pagination and filtering
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin, superadmin]
 *         description: Filter by user role
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *                     totalItems:
 *                       type: number
 *                     itemsPerPage:
 *                       type: number
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.get('/users', adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (MongoDB ObjectId)
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.get('/users/:id', adminController.getUserById);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin, superadmin]
 *                 example: admin
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid role
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Cannot change own role or insufficient permissions
 *       404:
 *         description: User not found
 */
router.patch('/users/:id/role', adminController.updateUserRole);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Soft delete user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       400:
 *         description: User already deleted
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Cannot delete own account or insufficient permissions
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', adminController.deleteUser);

/**
 * @swagger
 * /api/admin/users/{id}/restore:
 *   patch:
 *     summary: Restore soft-deleted user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Deleted user not found
 */
router.patch('/users/:id/restore', adminController.restoreUser);

export default router;
