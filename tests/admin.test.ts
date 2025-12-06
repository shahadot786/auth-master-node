// @ts-nocheck
import request from 'supertest';
import app from '../server';
import User from '../models/User';

/**
 * Admin API Tests
 * Tests all admin endpoints including user management and statistics
 * Requires admin/superadmin role
 */

describe('Admin API Tests', () => {
  let adminUser = {
    name: 'Admin User',
    email: `admin${Date.now()}@example.com`,
    password: 'Admin@123456',
    role: 'admin',
  };

  let regularUser = {
    name: 'Regular User',
    email: `user${Date.now()}@example.com`,
    password: 'User@123456',
  };

  let adminToken: string;
  let regularToken: string;
  let adminUserId: string;
  let regularUserId: string;

  // Setup: Create admin and regular users
  beforeAll(async () => {
    // Clean up test users
    await User.deleteMany({ email: { $regex: /@example\.com$/ } });

    // Create admin user
    const admin = await User.create(adminUser);
    admin.isVerified = true;
    await admin.save();
    adminUserId = admin._id.toString();

    // Create regular user
    const user = await User.create(regularUser);
    user.isVerified = true;
    await user.save();
    regularUserId = user._id.toString();

    // Login as admin
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: adminUser.email,
        password: adminUser.password,
      });
    adminToken = adminLoginResponse.body.data.accessToken;

    // Login as regular user
    const userLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: regularUser.email,
        password: regularUser.password,
      });
    regularToken = userLoginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@example\.com$/ } });
  });

  describe('GET /api/admin/stats', () => {
    it('should get dashboard statistics with admin token', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('verifiedUsers');
      expect(response.body.data).toHaveProperty('unverifiedUsers');
      expect(response.body.data).toHaveProperty('adminUsers');
      expect(response.body.data).toHaveProperty('regularUsers');
    });

    it('should fail to get stats without token', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail to get stats with regular user token', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permission');
    });
  });

  describe('GET /api/admin/users', () => {
    it('should get all users with pagination (admin)', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toHaveProperty('currentPage');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('totalItems');
    });

    it('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .query({ role: 'admin' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].role).toBe('admin');
      }
    });

    it('should search users by name or email', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .query({ search: 'Admin' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should fail to get users with regular user token', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('should get user by ID (admin)', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('email', regularUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should fail to get user with invalid ID', async () => {
      const response = await request(app)
        .get('/api/admin/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail to get user without admin token', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('should update user details (admin)', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated User Name',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe('Updated User Name');
    });

    it('should update user role (admin)', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'admin',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('admin');

      // Revert back to user role
      await request(app)
        .put(`/api/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'user',
        });
    });

    it('should fail to update user without admin token', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          name: 'Hacked Name',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    let userToDelete: any;

    beforeAll(async () => {
      // Create a user to delete
      userToDelete = await User.create({
        name: 'Delete Me',
        email: `delete${Date.now()}@example.com`,
        password: 'Delete@123456',
        isVerified: true,
      });
    });

    it('should soft delete user (admin)', async () => {
      const response = await request(app)
        .delete(`/api/admin/users/${userToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');

      // Verify user is soft deleted
      const deletedUser = await User.findById(userToDelete._id).select('+isDeleted');
      expect(deletedUser?.isDeleted).toBe(true);
    });

    it('should fail to delete user without admin token', async () => {
      const response = await request(app)
        .delete(`/api/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/admin/users/:id/restore', () => {
    let deletedUser: any;

    beforeAll(async () => {
      // Create and delete a user
      deletedUser = await User.create({
        name: 'Restore Me',
        email: `restore${Date.now()}@example.com`,
        password: 'Restore@123456',
        isVerified: true,
      });
      deletedUser.isDeleted = true;
      await deletedUser.save();
    });

    it('should restore soft-deleted user (admin)', async () => {
      const response = await request(app)
        .post(`/api/admin/users/${deletedUser._id}/restore`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('restored successfully');

      // Verify user is restored
      const restoredUser = await User.findById(deletedUser._id).select('+isDeleted');
      expect(restoredUser?.isDeleted).toBe(false);
    });

    it('should fail to restore user without admin token', async () => {
      const response = await request(app)
        .post(`/api/admin/users/${deletedUser._id}/restore`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
