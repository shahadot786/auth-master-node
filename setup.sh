#!/bin/bash

# Production-Grade Auth Backend - Quick Setup Script
# This script helps you set up the authentication backend quickly

echo "🔐 Production-Grade Authentication Backend - Setup"
echo "=================================================="
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env file already exists"
else
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and configure:"
    echo "   - MONGODB_URI (your MongoDB connection string)"
    echo "   - JWT_ACCESS_SECRET (generate a strong random secret)"
    echo "   - JWT_REFRESH_SECRET (generate a different strong random secret)"
    echo "   - EMAIL_USER (your SMTP email)"
    echo "   - EMAIL_PASSWORD (your SMTP password or Gmail App Password)"
    echo ""
fi

# Check if node_modules exists
if [ -d node_modules ]; then
    echo "✅ Dependencies already installed"
else
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi

# Create logs directory
if [ -d logs ]; then
    echo "✅ Logs directory already exists"
else
    echo "📁 Creating logs directory..."
    mkdir -p logs
    echo "✅ Logs directory created"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Edit .env file with your configuration"
echo "   2. Start MongoDB (local or use MongoDB Atlas)"
echo "   3. Run 'npm run dev' to start the development server"
echo "   4. Test the API at http://localhost:5000/health"
echo "   5. Import POSTMAN_COLLECTION.json into Postman for testing"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Complete setup and API documentation"
echo "   - .env.example - Environment variables reference"
echo "   - POSTMAN_COLLECTION.json - API testing collection"
echo ""
echo "🚀 Quick Start:"
echo "   npm run dev    # Start development server"
echo "   npm start      # Start production server"
echo ""
