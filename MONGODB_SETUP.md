# ⚠️ MongoDB Installation Issue

## Current Status

✅ **Redis**: Installed and running  
❌ **MongoDB**: Installation via Homebrew failed  

---

## Quick Solution: Use Docker (Recommended)

The fastest way to get MongoDB running is using Docker:

### 1. Install Docker Desktop
Download from: https://www.docker.com/products/docker-desktop

### 2. Start MongoDB Container
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest
```

### 3. Update .env
```env
MONGODB_URI=mongodb://admin:password@localhost:27017/robust-auth-db?authSource=admin
```

### 4. Start Your Server
```bash
npm run dev
```

---

## Alternative: MongoDB Atlas (Cloud - Free)

### 1. Create Account
Visit: https://www.mongodb.com/cloud/atlas/register

### 2. Create Free Cluster
- Click "Build a Database"
- Choose "FREE" tier
- Select region closest to you
- Click "Create"

### 3. Create Database User
- Go to "Database Access"
- Add new user with username/password
- Save credentials

### 4. Whitelist IP
- Go to "Network Access"
- Add IP Address: `0.0.0.0/0` (allow from anywhere)

### 5. Get Connection String
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string
- Replace `<password>` with your password

### 6. Update .env
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/robust-auth-db?retryWrites=true&w=majority
```

---

## Alternative: Retry Homebrew Installation

### Clean and Retry
```bash
# Clean up
brew cleanup

# Try installing again
brew install mongodb-community@8.0

# Start MongoDB
brew services start mongodb-community@8.0
```

### If Still Fails
```bash
# Check for errors
brew doctor

# Update Homebrew
brew update

# Try again
brew install mongodb-community
```

---

## Alternative: Manual Installation

### Download MongoDB
1. Visit: https://www.mongodb.com/try/download/community
2. Select macOS
3. Download and install the .tgz file

### Start MongoDB Manually
```bash
# Create data directory
mkdir -p ~/data/db

# Start MongoDB
mongod --dbpath ~/data/db
```

---

## Current Setup

### What's Working ✅
- Node.js and npm
- Redis (running on port 6379)
- All project files
- .env configuration

### What's Needed ❌
- MongoDB (choose one method above)

---

## Quick Test

Once MongoDB is running, test with:

```bash
# Test MongoDB connection
mongosh

# Or with connection string
mongosh "mongodb://localhost:27017"
```

Then start your server:
```bash
npm run dev
```

---

## Recommended: Docker Approach

**Pros**:
- ✅ Fastest setup (5 minutes)
- ✅ No system conflicts
- ✅ Easy to start/stop
- ✅ Isolated environment

**Command**:
```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

Then update `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/robust-auth-db
```

And run:
```bash
npm run dev
```

---

## Need Help?

If you're stuck, I recommend:
1. **Docker** (easiest and fastest)
2. **MongoDB Atlas** (free cloud, no installation)
3. **Homebrew retry** (if you prefer local installation)

Let me know which method you'd like to use!
