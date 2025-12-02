# Quick Reference Guide

## 🚀 Common Commands

### Development
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
./setup.sh           # Run setup script
```

### Testing
```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePass123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'
```

---

## 🔑 Environment Variables Quick Reference

```env
# Essential Settings
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/robust-auth-db

# JWT Secrets (CHANGE THESE!)
JWT_ACCESS_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-other-secret-here

# Email (Gmail Example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Generate Strong Secrets
```bash
# Generate random secrets for JWT
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📧 Gmail SMTP Setup

1. **Enable 2-Factor Authentication**
   - Go to Google Account Settings
   - Security → 2-Step Verification

2. **Generate App Password**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update .env**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
   ```

---

## 🗄️ MongoDB Setup Options

### Option 1: Local MongoDB
```bash
# Install MongoDB
brew install mongodb-community  # macOS
# or download from mongodb.com

# Start MongoDB
brew services start mongodb-community

# Connection string
MONGODB_URI=mongodb://localhost:27017/robust-auth-db
```

### Option 2: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create database user
4. Whitelist your IP (or 0.0.0.0/0 for development)
5. Get connection string
6. Update .env:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/robust-auth-db
   ```

---

## 🧪 Testing Flow

### 1. Register User
```bash
POST /api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "SecurePass123!",
  "phone": "1234567890"
}
```
→ Check email for 6-digit OTP

### 2. Verify Email
```bash
POST /api/auth/verify-email
{
  "email": "test@example.com",
  "otp": "123456"
}
```

### 3. Login
```bash
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```
→ Save `accessToken` and `refreshToken`

### 4. Access Protected Route
```bash
GET /api/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 5. Refresh Token
```bash
POST /api/auth/refresh-token
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

### 6. Create Admin User (Manual)
```javascript
// Connect to MongoDB and run:
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin", isVerified: true } }
)
```

### 7. Test Admin Routes
```bash
GET /api/admin/users?page=1&limit=10
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

---

## 🔧 Troubleshooting

### Server won't start
```bash
# Check if port is in use
lsof -i :5000

# Kill process on port
kill -9 <PID>
```

### MongoDB connection failed
```bash
# Check MongoDB is running
brew services list | grep mongodb

# Check connection string in .env
# Ensure no spaces or special characters
```

### Email not sending
```bash
# Verify SMTP settings
# Check EMAIL_USER and EMAIL_PASSWORD
# Ensure Gmail App Password is correct
# Check firewall/antivirus blocking port 587
```

### JWT errors
```bash
# Ensure JWT secrets are set in .env
# Secrets should be different for access and refresh
# Secrets should be long and random
```

### Rate limiting triggered
```bash
# Wait for the time window to pass
# Or restart server to reset in-memory limits
# In production, use Redis for distributed rate limiting
```

---

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Success",
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 🔐 Security Checklist

### Before Production
- [ ] Change all JWT secrets to strong random values
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas or secure MongoDB instance
- [ ] Configure CORS for your frontend domain only
- [ ] Enable HTTPS
- [ ] Use environment-specific .env files
- [ ] Set up proper logging and monitoring
- [ ] Enable database backups
- [ ] Review and update rate limits
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure proper email service (SendGrid, AWS SES)
- [ ] Review and test all security headers
- [ ] Implement IP whitelisting for admin routes (optional)
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules

---

## 📝 Common Modifications

### Change Token Expiry
```javascript
// config/security.js
jwt: {
  accessTokenExpiry: '30m',  // Change from 15m to 30m
  refreshTokenExpiry: '60d', // Change from 30d to 60d
}
```

### Add New Role
```javascript
// models/User.js
role: {
  type: String,
  enum: ['user', 'admin', 'superadmin', 'moderator'], // Add 'moderator'
  default: 'user',
}
```

### Change OTP Length
```javascript
// config/security.js
otp: {
  expiryMinutes: 10,
  length: 8, // Change from 6 to 8
}

// utils/helpers.js
export const generateOTP = () => {
  const otp = Math.floor(10000000 + Math.random() * 90000000).toString();
  return otp;
};
```

### Add Custom Validation
```javascript
// utils/validators.js
export const customSchema = Joi.object({
  // Add your validation rules
});
```

---

## 🎯 Performance Tips

1. **Database Indexing**
   - Already implemented on email, userId, token fields
   - Add more indexes based on query patterns

2. **Caching**
   - Consider Redis for session storage
   - Cache frequently accessed data

3. **Rate Limiting**
   - Use Redis for distributed rate limiting
   - Adjust limits based on traffic

4. **Logging**
   - Use log levels appropriately
   - Rotate logs to prevent disk space issues

5. **Connection Pooling**
   - MongoDB connection pooling is automatic
   - Adjust pool size for high traffic

---

## 📞 Support Resources

- **MongoDB Docs**: https://docs.mongodb.com
- **Express.js Docs**: https://expressjs.com
- **JWT.io**: https://jwt.io
- **Nodemailer Docs**: https://nodemailer.com
- **Joi Validation**: https://joi.dev

---

## 🎓 Learning Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725
- **Node.js Security**: https://nodejs.org/en/docs/guides/security/
- **Express Security**: https://expressjs.com/en/advanced/best-practice-security.html
