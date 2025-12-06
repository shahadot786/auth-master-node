# 🔐 Robust Authentication Backend (TypeScript)

A production-grade authentication backend built with **TypeScript**, Node.js, Express.js, MongoDB, Redis, JWT tokens, and industry-standard security best practices.

## ✨ Features

### 🔑 Authentication
- **User Registration** with email verification (6-digit OTP)
- **User Login** with JWT access tokens (15 min expiry) and refresh tokens (30 days)
- **Secure Token Rotation** - Old refresh tokens are revoked when new ones are issued
- **Email Verification** using OTP stored in Redis
- **Password Reset** with OTP-based verification
- **Logout** with token revocation

### 🛡️ Security
- **bcrypt** password hashing with configurable salt rounds
- **JWT** access and refresh tokens with secure rotation
- **Redis** for fast OTP and token storage
- **Helmet** for HTTP security headers
- **Rate Limiting** to prevent brute-force attacks
- **CORS** configuration
- **Input Sanitization** and validation with Joi
- **NoSQL Injection Prevention** with express-mongo-sanitize
- **HTTP-only Cookies** for refresh tokens
- **Secure Cookie Settings** (SameSite, Secure flags)

### 👥 Authorization (RBAC)
- **Role-Based Access Control** with three roles: `user`, `admin`, `superadmin`
- **Protected Routes** with role-based middleware
- **Admin Dashboard** with user management

### 📧 Email Service
- **Nodemailer** integration for email sending
- **Professional HTML Email Templates** for verification and password reset
- **6-digit OTP** for email verification and password reset

### 🎯 Additional Features
- **TypeScript** for type safety and better developer experience
- **Soft Delete** for user accounts
- **Pagination** for admin user lists
- **Winston Logging** with file and console outputs
- **Morgan** HTTP request logging
- **Global Error Handler** with detailed error messages
- **Standardized API Responses**
- **Swagger/OpenAPI Documentation**
- **Comprehensive Test Suite** with Jest and Supertest
- **MVC Architecture** with clean code organization

---

## 📁 Project Structure

```
/auth-master-node
├── /config
│   ├── database.ts          # MongoDB connection
│   ├── email.ts             # Email configuration
│   ├── redis.ts             # Redis configuration
│   ├── security.ts          # Security settings
│   └── swagger.ts           # Swagger/OpenAPI config
├── /controllers
│   ├── authController.ts    # Authentication logic
│   └── adminController.ts   # Admin operations
├── /services
│   ├── authService.ts       # Business logic for auth
│   ├── emailService.ts      # Email sending service
│   ├── tokenService.ts      # JWT token management
│   ├── redisOTPService.ts   # OTP management with Redis
│   └── redisTokenService.ts # Token storage in Redis
├── /models
│   ├── User.ts              # User schema with Mongoose
│   ├── RefreshToken.ts      # Refresh token schema
│   └── OTP.ts               # OTP schema
├── /routes
│   ├── authRoutes.ts        # Auth endpoints
│   └── adminRoutes.ts       # Admin endpoints
├── /middleware
│   ├── authMiddleware.ts    # JWT validation
│   ├── roleMiddleware.ts    # RBAC authorization
│   ├── errorHandler.ts      # Global error handler
│   ├── rateLimiter.ts       # Rate limiting
│   └── validator.ts         # Input validation
├── /utils
│   ├── responseFormatter.ts # Standard responses
│   ├── logger.ts            # Winston logger
│   ├── validators.ts        # Joi schemas
│   └── helpers.ts           # Utility functions
├── /types
│   └── index.ts             # TypeScript type definitions
├── /tests
│   ├── auth.test.ts         # Authentication tests
│   ├── admin.test.ts        # Admin endpoint tests
│   ├── setup.ts             # Test configuration
│   ├── README.md            # Testing guide
│   └── TEST_RESULTS.md      # Test results
├── /logs                    # Log files (auto-generated)
├── /dist                    # Compiled JavaScript (auto-generated)
├── server.ts                # Entry point
├── tsconfig.json            # TypeScript configuration
├── jest.config.js           # Jest test configuration
├── .env.example             # Environment template
├── .env.test.example        # Test environment template
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **Redis** (local or Redis Cloud)
- **Gmail Account** (for SMTP) or other email service

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd auth-master-node
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and configure the following:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/robust-auth-db
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/robust-auth-db

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-token-key
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=12

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@yourapp.com

# OTP Configuration
OTP_EXPIRY_MINUTES=10

# Cookie Configuration
COOKIE_SECRET=your-cookie-secret-key

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Application URLs
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### Step 4: Gmail SMTP Setup (if using Gmail)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated password in `EMAIL_PASSWORD`

### Step 5: Build and Start the Server

**Development Mode** (with hot-reloading):
```bash
npm run dev
```

**Build TypeScript**:
```bash
npm run build
```

**Production Mode**:
```bash
npm start
```

**Type Checking** (without building):
```bash
npm run type-check
```

The server will start on `http://localhost:5000`

---

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- ✅ 21 Authentication endpoint tests
- ✅ 17 Admin endpoint tests
- ✅ Full RBAC testing
- ✅ OTP verification flow
- ✅ Token refresh and rotation
- ✅ Password reset flow

See [tests/README.md](tests/README.md) for detailed testing documentation.

---

## 📡 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/logout` | Logout user | Public |
| POST | `/api/auth/refresh-token` | Refresh access token | Public |
| POST | `/api/auth/verify-email` | Verify email with OTP | Public |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| POST | `/api/auth/reset-password` | Reset password with OTP | Public |
| GET | `/api/auth/me` | Get current user profile | Private |

### Admin Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/stats` | Get dashboard statistics | Admin |
| GET | `/api/admin/users` | Get all users (paginated) | Admin |
| GET | `/api/admin/users/:id` | Get user by ID | Admin |
| PUT | `/api/admin/users/:id` | Update user details | Admin |
| DELETE | `/api/admin/users/:id` | Soft delete user | Admin |
| POST | `/api/admin/users/:id/restore` | Restore deleted user | Admin |

### Utility Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/health` | Health check | Public |
| GET | `/api-docs` | Swagger documentation | Public |
| GET | `/api-docs.json` | OpenAPI JSON spec | Public |

---

## 🔧 API Usage Examples

### 1. Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "SecurePass123!",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification OTP.",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isVerified": false
    }
  }
}
```

### 2. Verify Email
```bash
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

### 3. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Access Protected Route
```bash
GET /api/auth/me
Authorization: Bearer <access_token>
```

### 5. Refresh Token
```bash
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 6. Admin - Get All Users
```bash
GET /api/admin/users?page=1&limit=10&role=user&search=john
Authorization: Bearer <admin_access_token>
```

---

## � API Documentation

Interactive API documentation is available via Swagger UI:

**Local Development**: http://localhost:5000/api-docs

The documentation includes:
- All endpoint descriptions
- Request/response schemas
- Authentication requirements
- Example requests and responses
- Try-it-out functionality

---

## �🔐 Security Best Practices Implemented

1. **Password Security**
   - Bcrypt hashing with configurable salt rounds
   - Strong password requirements (min 8 chars, uppercase, lowercase, number, special char)
   - Password never returned in API responses

2. **Token Security**
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (30 days) stored in Redis
   - Secure token rotation on refresh
   - Tokens revoked on logout
   - Token blacklisting support

3. **HTTP Security**
   - Helmet for security headers
   - CORS with specific origin configuration
   - Rate limiting on sensitive endpoints
   - NoSQL injection prevention
   - Request size limits

4. **Cookie Security**
   - HTTP-only cookies
   - Secure flag in production
   - SameSite attribute
   - Signed cookies

5. **Input Validation**
   - Joi validation on all inputs
   - Sanitization to prevent XSS
   - Email format validation
   - Type safety with TypeScript

6. **Error Handling**
   - No sensitive data in error messages
   - Different messages for dev/production
   - Comprehensive logging
   - Global error handler

7. **TypeScript Benefits**
   - Compile-time type checking
   - Better IDE support and autocomplete
   - Reduced runtime errors
   - Self-documenting code

---

## 📊 Logging

Logs are stored in the `/logs` directory:
- `error.log` - Error-level logs
- `combined.log` - All logs
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

---

## 🌐 Deployment

### Build for Production
```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong, unique secrets for JWT and cookies
- Configure MongoDB Atlas connection string
- Configure Redis Cloud or ElastiCache
- Set up proper CORS origins
- Use HTTPS for secure cookies

### Recommended Hosting
- **Backend**: Heroku, Railway, Render, DigitalOcean, AWS
- **Database**: MongoDB Atlas
- **Cache**: Redis Cloud, AWS ElastiCache
- **Email**: SendGrid, AWS SES, or Gmail SMTP

---

## 🛠️ Development

### TypeScript Configuration

The project uses strict TypeScript settings in `tsconfig.json`:
- Strict type checking enabled
- ES2020 target
- ESNext modules
- Source maps for debugging

### Gradual Type Improvement

Some files use `// @ts-nocheck` for gradual migration. To improve types:

1. Remove `// @ts-nocheck` from a file
2. Add proper type annotations
3. Fix any type errors
4. Test thoroughly

---

## 📝 License

MIT License

---

## 👨‍💻 Author

Built with ❤️ using TypeScript, Node.js, Express, MongoDB, and Redis

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

## 🎯 Roadmap

- [ ] Add email queue with Bull
- [ ] Add 2FA authentication
- [ ] Add OAuth integration (Google, GitHub)
- [ ] Add WebSocket support for real-time notifications
- [ ] Add GraphQL API
- [ ] Improve test coverage to 100%
- [ ] Add performance monitoring
- [ ] Add API versioning
