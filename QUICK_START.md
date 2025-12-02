# 🚀 Quick Start Guide

## ⚠️ Prerequisites

You need to install and start **MongoDB** and **Redis** before running the server.

---

## 📦 Installation

### 1. Install MongoDB

#### macOS (Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
```

#### Ubuntu/Debian
```bash
sudo apt-get install -y mongodb
```

#### Windows
Download from: https://www.mongodb.com/try/download/community

### 2. Install Redis

#### macOS (Homebrew)
```bash
brew install redis
```

#### Ubuntu/Debian
```bash
sudo apt-get install redis-server
```

#### Windows
Download from: https://redis.io/download

---

## ▶️ Starting Services

### Option 1: Use the Startup Script (Recommended)
```bash
./start-services.sh
```

### Option 2: Start Manually

#### Start MongoDB
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Manual
mongod --dbpath /path/to/data
```

#### Start Redis
```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis-server

# Manual
redis-server
```

---

## ✅ Verify Services

### Check MongoDB
```bash
# Should show MongoDB process
pgrep -x mongod

# Or connect with mongo shell
mongosh
```

### Check Redis
```bash
# Should return "PONG"
redis-cli ping
```

---

## 🚀 Start the Server

Once MongoDB and Redis are running:

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
✅ Redis client ready to use
🚀 Server running in development mode on port 5000
📚 API Documentation: http://localhost:5000/api-docs
```

---

## 🧪 Test the Setup

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Swagger UI
Visit: **http://localhost:5000/api-docs**

### 3. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

---

## 🐛 Troubleshooting

### Port 5000 Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
pgrep -x mongod

# Start MongoDB
brew services start mongodb-community

# Check logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Redis Connection Failed
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
brew services start redis

# Check logs
tail -f /usr/local/var/log/redis.log
```

### Environment Variables Not Loaded
```bash
# Make sure .env file exists
ls -la .env

# Check contents
cat .env
```

---

## 📝 Configuration

### Update Email Settings

Edit `.env` file:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

**For Gmail**:
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password in `.env`

### Update Database URLs

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/robust-auth-db

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Local Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Redis Cloud
REDIS_HOST=your-redis-host.com
REDIS_PASSWORD=your-password
```

---

## 🎯 Quick Commands

```bash
# Install dependencies
npm install

# Start services (MongoDB + Redis)
./start-services.sh

# Start development server
npm run dev

# Start production server
npm start

# Check service status
pgrep -x mongod    # MongoDB
redis-cli ping     # Redis
```

---

## 📚 Documentation

- **API Documentation**: http://localhost:5000/api-docs
- **Setup Guide**: `REDIS_SWAGGER_GUIDE.md`
- **Enhancement Summary**: `ENHANCEMENT_SUMMARY.md`
- **Full README**: `README.md`

---

## ✅ Checklist

Before running `npm run dev`:

- [ ] MongoDB installed
- [ ] Redis installed
- [ ] MongoDB running (check with `pgrep -x mongod`)
- [ ] Redis running (check with `redis-cli ping`)
- [ ] `.env` file created (from `.env.example`)
- [ ] Dependencies installed (`npm install`)

Then run:
```bash
npm run dev
```

---

## 🎉 Success!

If everything is working, you should see:

```
✅ MongoDB Connected: localhost
✅ Redis client ready to use
🚀 Server running in development mode on port 5000
📍 Health check: http://localhost:5000/health
📍 API Base URL: http://localhost:5000/api
📍 API Documentation: http://localhost:5000/api-docs
📍 Redis status: ready
```

Visit **http://localhost:5000/api-docs** to explore the API! 🚀
