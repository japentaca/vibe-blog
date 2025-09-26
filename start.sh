#!/bin/bash

echo "🚀 Starting Editorial Blog Platform..."

# Create database directory if it doesn't exist
mkdir -p database

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Run database migrations
echo "🗄️ Setting up database..."
npx knex migrate:latest

# Seed database with sample data
echo "🌱 Seeding database..."
npx knex seed:run

# Start the backend server
echo "🌐 Starting backend server..."
node server.js &
BACKEND_PID=$!

echo "✅ Backend server started (PID: $BACKEND_PID)"
echo "📡 API available at http://localhost:3000"
echo "📊 Health check at http://localhost:3000/api/health"
echo ""
echo "📝 Frontend available at:"
echo "   Homepage: http://localhost:3000"
echo "   Editor: http://localhost:3000/frontend/editor.html"
echo "   About: http://localhost:3000/frontend/about.html"
echo ""
echo "Press Ctrl+C to stop the server"

# Wait for backend to start
sleep 3

# Keep the script running
wait $BACKEND_PID