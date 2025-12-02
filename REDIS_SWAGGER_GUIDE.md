# 🚀 Redis & Swagger Integration - Update Guide

## ✨ What's New

Your authentication backend has been enhanced with:

1. **Redis for Token & OTP Storage** - Better performance and scalability
2. **Swagger API Documentation** - Interactive API documentation
3. **HTTP-only Cookie Storage** - Access tokens now stored in secure cookies

---

## 🔄 Architecture Changes

### Storage Strategy

| Component         | Storage            | Why                            |
| ----------------- | ------------------ | ------------------------------ |
| **Access Token**  | HTTP-only cookie   | Safe, short-lived, no XSS      |
| **Refresh Token** | Redis              | Rotatable, revocable, scalable |
| **OTP**           | Redis              | TTL + fast + secure            |
| **User Data**     | MongoDB            | Permanent storage              |

### Benefits

✅ **Performance**: Redis is 10-100x faster than MongoDB for token operations  
✅ **Scalability**: Redis handles millions of operations per second  
✅ **Auto-expiry**: TTL (Time To Live) automatically deletes expired data  
✅ **Security**: HTTP-only cookies prevent XSS attacks  
✅ **Developer Experience**: Swagger provides interactive API documentation  

---

## 📦 New Dependencies

```json
{
  "ioredis": "^5.3.2",           // Redis client
  "swagger-jsdoc": "^6.2.8",     // Swagger spec generator
  "swagger-ui-express": "^5.0.0" // Swagger UI
}
```

---

## 🔧 Setup Instructions

### 1. Install Redis

#### macOS (Homebrew)
```bash
brew install redis
brew services start redis
```

#### Ubuntu/Debian
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

#### Windows
Download from: https://redis.io/download

#### Docker
```bash
docker run -d -p 6379:6379 redis:alpine
```

### 2. Update Environment Variables

Add to your `.env` file:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 3. Install New Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
npm run dev
```

---

## 📚 Swagger Documentation

### Access Swagger UI

Once the server is running, visit:

**http://localhost:5000/api-docs**

### Features

- 📖 **Interactive API Documentation** - Test endpoints directly from browser
- 🔐 **Authentication Support** - Add Bearer tokens for protected routes
- 📝 **Request/Response Examples** - See sample data for all endpoints
- 🎨 **Beautiful UI** - Clean, professional interface
- 📥 **Export OpenAPI Spec** - Download JSON spec at `/api-docs.json`

### Using Swagger

1. **Open Swagger UI**: http://localhost:5000/api-docs
2. **Authorize**: Click "Authorize" button, enter your access token
3. **Test Endpoints**: Click any endpoint → "Try it out" → Fill parameters → "Execute"
4. **View Responses**: See real-time responses with status codes

---

## 🍪 HTTP-only Cookie Authentication

### How It Works

**Before** (Token in Response Body):
```javascript
// Client stores token in localStorage (vulnerable to XSS)
localStorage.setItem('accessToken', token);
```

**After** (Token in HTTP-only Cookie):
```javascript
// Server sets cookie automatically (XSS-safe)
res.cookie('accessToken', token, {
  httpOnly: true,  // JavaScript cannot access
  secure: true,    // HTTPS only
  sameSite: 'strict' // CSRF protection
});
```

### Client-Side Changes

**Option 1: Use Cookies (Recommended)**
```javascript
// No need to send Authorization header
// Cookies are sent automatically
fetch('http://localhost:5000/api/auth/me', {
  credentials: 'include' // Important!
});
```

**Option 2: Use Authorization Header (Still Supported)**
```javascript
// Traditional Bearer token method still works
fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

## 🔄 Migration from MongoDB to Redis

### What Changed

#### Refresh Tokens
**Before**: Stored in MongoDB `RefreshToken` collection  
**After**: Stored in Redis with automatic expiry

#### OTPs
**Before**: Stored in MongoDB `OTP` collection  
**After**: Stored in Redis with TTL

### Data Migration

**No migration needed!** The old MongoDB collections (`RefreshToken`, `OTP`) can be safely deleted or ignored. New tokens and OTPs will be created in Redis.

```javascript
// Optional: Clean up old MongoDB collections
db.refreshtokens.drop();
db.otps.drop();
```

---

## 🧪 Testing

### Test Redis Connection

```bash
redis-cli ping
# Should return: PONG
```

### Test Swagger

Visit: http://localhost:5000/api-docs

### Test Cookie Authentication

```bash
# Login (cookies set automatically)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}' \
  -c cookies.txt

# Access protected route (cookies sent automatically)
curl http://localhost:5000/api/auth/me \
  -b cookies.txt
```

---

## 📊 Redis Data Structure

### Refresh Tokens
```
Key: refresh_token:<hashed_token>
Value: {
  "userId": "507f1f77bcf86cd799439011",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2025-12-01T18:00:00.000Z",
  "expiresAt": "2025-12-31T18:00:00.000Z"
}
TTL: 30 days
```

### User Token Set
```
Key: user_tokens:<userId>
Value: Set of hashed tokens
TTL: 30 days
```

### OTPs
```
Key: otp:email_verification:<email>
Value: {
  "otp": "123456",
  "email": "user@example.com",
  "type": "email_verification",
  "attempts": 0,
  "createdAt": "2025-12-01T18:00:00.000Z",
  "expiresAt": "2025-12-01T18:10:00.000Z"
}
TTL: 10 minutes
```

---

## 🔍 Monitoring Redis

### View All Keys
```bash
redis-cli keys "*"
```

### Check Specific Token
```bash
redis-cli get "refresh_token:abc123..."
```

### Monitor Real-time Commands
```bash
redis-cli monitor
```

### Check Memory Usage
```bash
redis-cli info memory
```

---

## 🚀 Production Deployment

### Redis Cloud Options

1. **Redis Cloud** (https://redis.com/cloud/)
   - Free tier: 30MB
   - Managed service
   - High availability

2. **AWS ElastiCache**
   - Fully managed
   - Auto-scaling
   - Multi-AZ

3. **DigitalOcean Managed Redis**
   - Simple setup
   - Affordable
   - Automatic backups

### Environment Variables (Production)

```env
REDIS_HOST=your-redis-cloud-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your-strong-password
REDIS_DB=0
```

---

## 🔒 Security Considerations

### Redis Security

1. **Password Protection**
   ```bash
   # redis.conf
   requirepass your-strong-password
   ```

2. **Bind to Localhost** (if not using cloud)
   ```bash
   # redis.conf
   bind 127.0.0.1
   ```

3. **Disable Dangerous Commands**
   ```bash
   # redis.conf
   rename-command FLUSHDB ""
   rename-command FLUSHALL ""
   ```

### Cookie Security

✅ **HttpOnly**: Prevents JavaScript access  
✅ **Secure**: HTTPS only in production  
✅ **SameSite**: CSRF protection  
✅ **Short Expiry**: Access tokens expire in 15 minutes  

---

## 📝 API Changes

### No Breaking Changes!

All existing endpoints work the same way. The only difference:

**Tokens are now also available in cookies** (in addition to response body)

### Example Response (Unchanged)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Plus**: Cookies are set automatically:
- `accessToken` (15 min)
- `refreshToken` (30 days)

---

## 🐛 Troubleshooting

### Redis Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution**: Start Redis server
```bash
brew services start redis  # macOS
sudo systemctl start redis-server  # Linux
```

### Swagger Not Loading

**Solution**: Check Helmet CSP settings. Swagger UI requires inline scripts.

### Cookies Not Working

**Solution**: Ensure `credentials: 'include'` in fetch requests:
```javascript
fetch(url, {
  credentials: 'include'
});
```

---

## 📚 Additional Resources

- **Redis Documentation**: https://redis.io/documentation
- **ioredis Guide**: https://github.com/redis/ioredis
- **Swagger OpenAPI**: https://swagger.io/specification/
- **HTTP-only Cookies**: https://owasp.org/www-community/HttpOnly

---

## ✅ Summary

Your authentication backend now has:

✅ **Redis** for fast, scalable token and OTP storage  
✅ **Swagger** for interactive API documentation  
✅ **HTTP-only Cookies** for secure token storage  
✅ **Better Performance** with Redis caching  
✅ **Auto-expiry** for tokens and OTPs  
✅ **Production-ready** architecture  

**Next Steps**:
1. Install and start Redis
2. Update `.env` with Redis configuration
3. Test Swagger UI at http://localhost:5000/api-docs
4. Update frontend to use cookie-based auth (optional)

🎉 **Your backend is now even more robust and production-ready!**
