# API Testing Guide

## Overview

Comprehensive test suite for the auth-master-node API using Jest and Supertest. Tests cover all authentication and admin endpoints with proper setup and teardown.

## Test Files

- **[tests/auth.test.ts](file:///Users/shahadot/Desktop/LocalApps/MERN/auth-master-node/tests/auth.test.ts)**: Authentication endpoint tests
- **[tests/admin.test.ts](file:///Users/shahadot/Desktop/LocalApps/MERN/auth-master-node/tests/admin.test.ts)**: Admin endpoint tests
- **[tests/setup.ts](file:///Users/shahadot/Desktop/LocalApps/MERN/auth-master-node/tests/setup.ts)**: Test environment setup

## Test Coverage

### Authentication Tests (auth.test.ts)

✅ **User Registration**
- Register new user successfully
- Fail with existing email
- Fail with invalid email
- Fail with weak password

✅ **Email Verification**
- Verify email with correct OTP
- Fail with incorrect OTP

✅ **User Login**
- Login with correct credentials
- Fail with incorrect password
- Fail with non-existent email

✅ **User Profile**
- Get profile with valid token
- Fail without token
- Fail with invalid token

✅ **Token Refresh**
- Refresh access token successfully
- Fail with invalid refresh token

✅ **Password Reset**
- Send password reset OTP
- Reset password with valid OTP
- Fail with invalid OTP
- Login with new password

✅ **Logout**
- Logout successfully
- Invalidate refresh token after logout

✅ **Health Check**
- Server health status

### Admin Tests (admin.test.ts)

✅ **Dashboard Statistics**
- Get stats with admin token
- Fail without token
- Fail with regular user token

✅ **User Management**
- Get all users with pagination
- Filter users by role
- Search users by name/email
- Fail with regular user token

✅ **User Details**
- Get user by ID (admin)
- Fail with invalid ID
- Fail without admin token

✅ **User Updates**
- Update user details (admin)
- Update user role (admin)
- Fail without admin token

✅ **User Deletion**
- Soft delete user (admin)
- Fail without admin token

✅ **User Restoration**
- Restore soft-deleted user (admin)
- Fail without admin token

## Running Tests

### Prerequisites

1. **MongoDB** must be running
2. **Redis** must be running
3. Environment variables configured (see `.env.test.example`)

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Configuration

Tests are configured in [jest.config.js](file:///Users/shahadot/Desktop/LocalApps/MERN/auth-master-node/jest.config.js):

- **Test Environment**: Node.js
- **Test Timeout**: 30 seconds
- **Test Pattern**: `**/*.test.ts`
- **Setup File**: `tests/setup.ts`

## Environment Setup

Copy `.env.test.example` to `.env.test` and configure:

```bash
cp .env.test.example .env.test
```

**Important**: Use a separate test database to avoid affecting development data.

## Test Execution Flow

1. **Setup** (before all tests)
   - Connect to MongoDB
   - Connect to Redis
   - Initialize test environment

2. **Test Execution**
   - Create test users
   - Run API requests with Supertest
   - Verify responses
   - Clean up test data

3. **Teardown** (after all tests)
   - Close MongoDB connection
   - Close Redis connection
   - Clean up resources

## Writing New Tests

### Example Test Structure

```typescript
describe('Feature Name', () => {
  // Setup
  beforeAll(async () => {
    // Initialize test data
  });

  // Cleanup
  afterAll(async () => {
    // Remove test data
  });

  describe('POST /api/endpoint', () => {
    it('should perform action successfully', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .send({ data: 'value' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
```

## Test Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data
3. **Unique Data**: Use timestamps for unique test emails
4. **Assertions**: Test both success and failure cases
5. **Security**: Test authentication and authorization
6. **Edge Cases**: Test validation and error handling

## Troubleshooting

### Tests Hanging

- Check MongoDB connection
- Check Redis connection
- Ensure proper cleanup in `afterAll`

### Connection Errors

- Verify MongoDB is running: `mongod --version`
- Verify Redis is running: `redis-cli ping`
- Check environment variables

### Authentication Failures

- Ensure test users are created and verified
- Check JWT secret configuration
- Verify token generation and validation

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    npm install
    npm test
  env:
    NODE_ENV: test
    MONGODB_URI: ${{ secrets.TEST_MONGODB_URI }}
```

## Coverage Reports

Generate coverage reports with:

```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage/` directory.

## Next Steps

- Add integration tests for email sending
- Add performance tests for rate limiting
- Add security tests for SQL injection prevention
- Add E2E tests with real database scenarios
