# API Documentation

Complete API reference for the Production-Grade Authentication Backend.

**Base URL**: `http://localhost:5000/api`

---

## 📋 Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Admin Endpoints](#admin-endpoints)
3. [Response Formats](#response-formats)
4. [Error Codes](#error-codes)
5. [Rate Limits](#rate-limits)

---

## 🔐 Authentication Endpoints

### 1. Register User

Create a new user account and send email verification OTP.

**Endpoint**: `POST /auth/register`  
**Access**: Public  
**Rate Limit**: 5 requests per 15 minutes

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "SecurePass123!",
  "role": "user"
}
```

#### Field Validation
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | String | Yes | 2-50 characters |
| email | String | Yes | Valid email format, unique |
| phone | String | No | 10-15 digits |
| password | String | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char |
| role | String | No | 'user', 'admin', 'superadmin' (default: 'user') |

#### Success Response (201)
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification OTP.",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "user",
      "isVerified": false,
      "createdAt": "2025-12-01T17:54:49.000Z",
      "updatedAt": "2025-12-01T17:54:49.000Z"
    }
  }
}
```

#### Error Responses
- **400**: Validation error or email already exists
- **429**: Too many requests

---

### 2. Verify Email

Verify email address using 6-digit OTP sent to email.

**Endpoint**: `POST /auth/verify-email`  
**Access**: Public  
**Rate Limit**: 3 requests per 10 minutes

#### Request Body
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### Field Validation
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | String | Yes | Valid email format |
| otp | String | Yes | Exactly 6 digits |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "message": "Email verified successfully",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "isVerified": true
    }
  }
}
```

#### Error Responses
- **400**: Invalid or expired OTP, email already verified
- **429**: Too many attempts

---

### 3. Login

Authenticate user and receive access + refresh tokens.

**Endpoint**: `POST /auth/login`  
**Access**: Public  
**Rate Limit**: 5 requests per 15 minutes

#### Request Body
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isVerified": true,
      "lastLogin": "2025-12-01T17:54:49.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Cookies Set
- `refreshToken`: HTTP-only, Secure (production), SameSite, 30 days

#### Error Responses
- **401**: Invalid email or password
- **403**: Email not verified, account deactivated
- **429**: Too many login attempts

---

### 4. Get Profile

Get current authenticated user's profile.

**Endpoint**: `GET /auth/me`  
**Access**: Private (requires authentication)  
**Rate Limit**: 100 requests per 15 minutes

#### Headers
```
Authorization: Bearer <access_token>
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "role": "user",
      "name": "John Doe"
    }
  }
}
```

#### Error Responses
- **401**: Missing or invalid access token, token expired
- **403**: Email not verified
- **404**: User not found

---

### 5. Refresh Token

Get new access token using refresh token. Old refresh token is revoked.

**Endpoint**: `POST /auth/refresh-token`  
**Access**: Public (requires refresh token)  
**Rate Limit**: 100 requests per 15 minutes

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note**: Refresh token can be sent in request body OR as HTTP-only cookie.

#### Success Response (200)
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses
- **400**: Refresh token required
- **401**: Invalid or revoked refresh token, token expired

---

### 6. Logout

Logout user and revoke refresh token.

**Endpoint**: `POST /auth/logout`  
**Access**: Public (requires refresh token)  
**Rate Limit**: 100 requests per 15 minutes

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

#### Cookies Cleared
- `refreshToken`

#### Error Responses
- **400**: Refresh token required

---

### 7. Forgot Password

Request password reset OTP via email.

**Endpoint**: `POST /auth/forgot-password`  
**Access**: Public  
**Rate Limit**: 3 requests per 1 hour

#### Request Body
```json
{
  "email": "john@example.com"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "If an account exists with this email, you will receive a password reset OTP.",
  "data": null
}
```

**Note**: Response is the same whether email exists or not (security best practice).

#### Error Responses
- **400**: Validation error
- **429**: Too many password reset attempts

---

### 8. Reset Password

Reset password using OTP received via email.

**Endpoint**: `POST /auth/reset-password`  
**Access**: Public  
**Rate Limit**: 3 requests per 1 hour

#### Request Body
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123!"
}
```

#### Field Validation
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | String | Yes | Valid email format |
| otp | String | Yes | Exactly 6 digits |
| newPassword | String | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password.",
  "data": null
}
```

#### Error Responses
- **400**: Invalid or expired OTP, validation error
- **404**: User not found
- **429**: Too many attempts

---

## 👥 Admin Endpoints

All admin endpoints require:
- **Authentication**: Valid access token
- **Authorization**: Admin or SuperAdmin role

### 1. Get Dashboard Statistics

Get overview statistics for admin dashboard.

**Endpoint**: `GET /admin/stats`  
**Access**: Private (Admin/SuperAdmin)  
**Rate Limit**: 100 requests per 15 minutes

#### Headers
```
Authorization: Bearer <admin_access_token>
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalUsers": 150,
    "verifiedUsers": 120,
    "unverifiedUsers": 30,
    "deletedUsers": 5,
    "activeUsers": 145,
    "usersByRole": {
      "user": 140,
      "admin": 8,
      "superadmin": 2
    }
  }
}
```

#### Error Responses
- **401**: Not authenticated
- **403**: Insufficient permissions (not admin)

---

### 2. Get All Users

Get paginated list of users with filtering and search.

**Endpoint**: `GET /admin/users`  
**Access**: Private (Admin/SuperAdmin)  
**Rate Limit**: 100 requests per 15 minutes

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | Number | No | Page number (default: 1) |
| limit | Number | No | Items per page (default: 10) |
| role | String | No | Filter by role ('user', 'admin', 'superadmin') |
| isVerified | Boolean | No | Filter by verification status |
| search | String | No | Search by name or email |

#### Example Request
```
GET /admin/users?page=1&limit=10&role=user&isVerified=true&search=john
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "user",
      "isVerified": true,
      "lastLogin": "2025-12-01T17:54:49.000Z",
      "createdAt": "2025-11-01T10:00:00.000Z",
      "updatedAt": "2025-12-01T17:54:49.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 15,
    "totalItems": 150,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Error Responses
- **401**: Not authenticated
- **403**: Insufficient permissions

---

### 3. Get User By ID

Get detailed information about a specific user.

**Endpoint**: `GET /admin/users/:id`  
**Access**: Private (Admin/SuperAdmin)  
**Rate Limit**: 100 requests per 15 minutes

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | String | User's MongoDB ObjectId |

#### Success Response (200)
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "user",
      "isVerified": true,
      "lastLogin": "2025-12-01T17:54:49.000Z",
      "createdAt": "2025-11-01T10:00:00.000Z",
      "updatedAt": "2025-12-01T17:54:49.000Z"
    }
  }
}
```

#### Error Responses
- **400**: Invalid ID format
- **401**: Not authenticated
- **403**: Insufficient permissions
- **404**: User not found

---

### 4. Update User Role

Change a user's role.

**Endpoint**: `PATCH /admin/users/:id/role`  
**Access**: Private (Admin/SuperAdmin)  
**Rate Limit**: 100 requests per 15 minutes

#### Request Body
```json
{
  "role": "admin"
}
```

#### Valid Roles
- `user`
- `admin`
- `superadmin`

#### Success Response (200)
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    }
  }
}
```

#### Error Responses
- **400**: Invalid role
- **401**: Not authenticated
- **403**: Cannot change own role, insufficient permissions
- **404**: User not found

---

### 5. Delete User (Soft Delete)

Soft delete a user account (marks as deleted, doesn't remove from database).

**Endpoint**: `DELETE /admin/users/:id`  
**Access**: Private (Admin/SuperAdmin)  
**Rate Limit**: 100 requests per 15 minutes

#### Success Response (200)
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

#### Error Responses
- **400**: User already deleted
- **401**: Not authenticated
- **403**: Cannot delete own account, insufficient permissions
- **404**: User not found

---

### 6. Restore User

Restore a soft-deleted user account.

**Endpoint**: `PATCH /admin/users/:id/restore`  
**Access**: Private (Admin/SuperAdmin)  
**Rate Limit**: 100 requests per 15 minutes

#### Success Response (200)
```json
{
  "success": true,
  "message": "User restored successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

#### Error Responses
- **401**: Not authenticated
- **403**: Insufficient permissions
- **404**: Deleted user not found

---

## 📊 Response Formats

### Success Response Structure
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response Structure
```json
{
  "success": false,
  "message": "Error description"
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

### Paginated Response Structure
```json
{
  "success": true,
  "message": "Success",
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## ⚠️ Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error, invalid input) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

---

## 🚦 Rate Limits

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| Authentication (login, register) | 5 requests | 15 minutes |
| Password Reset | 3 requests | 1 hour |
| Email Verification | 3 requests | 10 minutes |
| General API | 100 requests | 15 minutes |

### Rate Limit Headers
```
RateLimit-Limit: 5
RateLimit-Remaining: 4
RateLimit-Reset: 1638360000
```

### Rate Limit Exceeded Response (429)
```json
{
  "success": false,
  "message": "Too many authentication attempts. Please try again after 15 minutes."
}
```

---

## 🔒 Authentication

### Access Token
- **Type**: JWT (JSON Web Token)
- **Expiry**: 15 minutes
- **Usage**: Include in Authorization header
- **Format**: `Authorization: Bearer <token>`

### Refresh Token
- **Type**: JWT (JSON Web Token)
- **Expiry**: 30 days
- **Storage**: Database (hashed) + HTTP-only cookie
- **Usage**: Refresh access token when expired

### Token Rotation
When refreshing tokens:
1. Old refresh token is revoked
2. New access token is generated (15 min)
3. New refresh token is generated (30 days)
4. Both tokens returned in response

---

## 📝 Notes

1. **Email Verification**: Users must verify email before logging in
2. **OTP Expiry**: All OTPs expire after 10 minutes
3. **Soft Delete**: Deleted users are marked as deleted, not removed from database
4. **Password Requirements**: Minimum 8 characters, must include uppercase, lowercase, number, and special character
5. **Role Hierarchy**: superadmin > admin > user
6. **Token Security**: Refresh tokens are hashed before storage, never stored in plain text
7. **CORS**: Configure allowed origins in .env file
8. **Rate Limiting**: Limits are per IP address

---

## 🧪 Testing

Import `POSTMAN_COLLECTION.json` into Postman for complete API testing with:
- Pre-configured requests
- Automatic token management
- Example request bodies
- Environment variables

---

## 📞 Support

For issues or questions, refer to:
- `README.md` - Complete setup guide
- `QUICK_REFERENCE.md` - Common commands and troubleshooting
- GitHub Issues - Report bugs or request features
