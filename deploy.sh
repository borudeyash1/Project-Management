#!/bin/bash
# Deployment script for Sartthi Project Management
# Run this on your VPS: bash deploy.sh

set -e  # Exit on any error

echo "🚀 Starting deployment..."

# Navigate to project directory
cd ~/Project-Management

# Configure git to handle divergent branches (one-time setup)
echo "📝 Configuring git..."
git config pull.rebase false

# Reset any local changes and pull latest
echo "⬇️  Pulling latest changes..."
git reset --hard
git pull origin main

# Build server
echo "🔨 Building server..."
cd server
npm install
npm run build

# Build client with legacy peer deps
echo "🔨 Building client..."
cd ../client
npm install --legacy-peer-deps
npm run build

# Restart PM2
echo "🔄 Restarting server..."
pm2 restart server
pm2 save

echo "✅ Deployment complete!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🌐 Your app should now be live at https://sartthi.com"
