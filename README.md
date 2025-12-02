# 🔐 Robust Authentication Backend

A production-grade authentication backend built with Node.js, Express.js, MongoDB, JWT access tokens, refresh tokens, and industry-standard security best practices.

## ✨ Features

### 🔑 Authentication
- **User Registration** with email verification (6-digit OTP)
- **User Login** with JWT access tokens (15 min expiry) and refresh tokens (30 days)
- **Secure Token Rotation** - Old refresh tokens are revoked when new ones are issued
- **Email Verification** using OTP
- **Password Reset** with OTP-based verification
- **Logout** with token revocation

### 🛡️ Security
- **bcrypt** password hashing with 12 salt rounds
- **JWT** access and refresh tokens with secure rotation
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
- **Soft Delete** for user accounts
- **Pagination** for admin user lists
- **Winston Logging** with file and console outputs
- **Morgan** HTTP request logging
- **Global Error Handler** with detailed error messages
- **Standardized API Responses**
- **MVC Architecture** with clean code organization

---

## 📁 Project Structure

```
/auth-master-node
├── /config
│   ├── database.js          # MongoDB connection
│   ├── email.js             # Email configuration
│   └── security.js          # Security settings
├── /controllers
│   ├── authController.js    # Authentication logic
│   └── adminController.js   # Admin operations
├── /services
│   ├── authService.js       # Business logic for auth
│   ├── emailService.js      # Email sending service
│   └── tokenService.js      # JWT token management
├── /models
│   ├── User.js              # User schema
│   ├── RefreshToken.js      # Refresh token schema
│   └── OTP.js               # OTP schema
├── /routes
│   ├── authRoutes.js        # Auth endpoints
│   └── adminRoutes.js       # Admin endpoints
├── /middleware
│   ├── authMiddleware.js    # JWT validation
│   ├── roleMiddleware.js    # RBAC authorization
│   ├── errorHandler.js      # Global error handler
│   ├── rateLimiter.js       # Rate limiting
│   └── validator.js         # Input validation
├── /utils
│   ├── responseFormatter.js # Standard responses
│   ├── logger.js            # Winston logger
│   ├── validators.js        # Joi schemas
│   └── helpers.js           # Utility functions
├── /logs                    # Log files (auto-generated)
├── server.js                # Entry point
├── .env.example             # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or MongoDB Atlas)
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

### Step 5: Start the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

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
| PATCH | `/api/admin/users/:id/role` | Update user role | Admin |
| DELETE | `/api/admin/users/:id` | Soft delete user | Admin |
| PATCH | `/api/admin/users/:id/restore` | Restore deleted user | Admin |

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

## 🔐 Security Best Practices Implemented

1. **Password Security**
   - Bcrypt hashing with 12 salt rounds
   - Strong password requirements (min 8 chars, uppercase, lowercase, number, special char)

2. **Token Security**
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (30 days) stored in database
   - Secure token rotation on refresh
   - Tokens revoked on logout

3. **HTTP Security**
   - Helmet for security headers
   - CORS with specific origin configuration
   - Rate limiting on sensitive endpoints
   - NoSQL injection prevention

4. **Cookie Security**
   - HTTP-only cookies
   - Secure flag in production
   - SameSite attribute
   - Signed cookies

5. **Input Validation**
   - Joi validation on all inputs
   - Sanitization to prevent XSS
   - Email format validation

6. **Error Handling**
   - No sensitive data in error messages
   - Different messages for dev/production
   - Comprehensive logging

---

## 📊 Logging

Logs are stored in the `/logs` directory:
- `error.log` - Error-level logs
- `combined.log` - All logs
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

---

## 🧪 Testing with Postman

Import the `POSTMAN_COLLECTION.json` file into Postman to test all endpoints.

**Steps:**
1. Open Postman
2. Click "Import" → "Upload Files"
3. Select `POSTMAN_COLLECTION.json`
4. Set environment variables:
   - `base_url`: `http://localhost:5000`
   - `access_token`: (will be set automatically after login)
   - `refresh_token`: (will be set automatically after login)

---

## 🌐 Deployment

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong, unique secrets for JWT and cookies
- Configure MongoDB Atlas connection string
- Set up proper CORS origins
- Use HTTPS for secure cookies

### Recommended Hosting
- **Backend**: Heroku, Railway, Render, DigitalOcean
- **Database**: MongoDB Atlas
- **Email**: SendGrid, AWS SES, or Gmail SMTP

---

## 📝 License

MIT License

---

## 👨‍💻 Author

Built with ❤️ using Node.js, Express, and MongoDB

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📞 Support

For issues or questions, please open an issue on GitHub.
