#!/bin/bash

echo "🚀 Starting Services for Robust Auth Backend"
echo "=============================================="
echo ""

# Check if MongoDB is installed
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is installed"
    
    # Check if MongoDB is running
    if pgrep -x mongod > /dev/null; then
        echo "✅ MongoDB is already running"
    else
        echo "🔄 Starting MongoDB..."
        brew services start mongodb-community 2>/dev/null || \
        sudo systemctl start mongod 2>/dev/null || \
        mongod --fork --logpath /tmp/mongodb.log --dbpath /tmp/mongodb-data 2>/dev/null || \
        echo "⚠️  Please start MongoDB manually"
    fi
else
    echo "❌ MongoDB is NOT installed"
    echo "   Install with: brew install mongodb-community"
fi

echo ""

# Check if Redis is installed
if command -v redis-server &> /dev/null; then
    echo "✅ Redis is installed"
    
    # Check if Redis is running
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is already running"
    else
        echo "🔄 Starting Redis..."
        brew services start redis 2>/dev/null || \
        sudo systemctl start redis-server 2>/dev/null || \
        redis-server --daemonize yes 2>/dev/null || \
        echo "⚠️  Please start Redis manually"
    fi
else
    echo "❌ Redis is NOT installed"
    echo "   Install with: brew install redis"
fi

echo ""
echo "🔍 Checking services..."
sleep 2

# Verify MongoDB
if pgrep -x mongod > /dev/null; then
    echo "✅ MongoDB is running on port 27017"
else
    echo "❌ MongoDB is NOT running"
    echo "   Start with: brew services start mongodb-community"
fi

# Verify Redis
if redis-cli ping &> /dev/null; then
    echo "✅ Redis is running on port 6379"
else
    echo "❌ Redis is NOT running"
    echo "   Start with: brew services start redis"
fi

echo ""
echo "📝 Next steps:"
echo "   1. Make sure MongoDB and Redis are running (see above)"
echo "   2. Run: npm run dev"
echo "   3. Visit: http://localhost:5000/health"
echo "   4. API Docs: http://localhost:5000/api-docs"
echo ""
