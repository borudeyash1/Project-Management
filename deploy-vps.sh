#!/bin/bash

# Sartthi VPS Deployment Script
# Run this on VPS after pushing changes from local

echo "🚀 Starting Sartthi deployment..."

# Navigate to project directory
cd ~/Project-Management

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull

# Install dependencies if package.json changed
echo "📦 Checking for dependency updates..."
cd ~/Project-Management/server
npm install
cd ~/Project-Management/client
npm install --legacy-peer-deps

# Build all applications
echo "🔨 Building server..."
cd ~/Project-Management/server
npm run build

echo "🔨 Building main client..."
cd ~/Project-Management/client
npm run build

echo "🔨 Building Sartthi Mail..."
cd ~/Project-Management/sartthi-mail-ui
npm install --legacy-peer-deps 2>/dev/null || true
npm run build

echo "🔨 Building Sartthi Calendar..."
cd ~/Project-Management/sartthi-calendar-ui
npm install --legacy-peer-deps 2>/dev/null || true
npm run build

echo "🔨 Building Sartthi Vault..."
cd ~/Project-Management/sartthi-vault-ui
npm install --legacy-peer-deps 2>/dev/null || true
npm run build

# Restart PM2 processes
echo "🔄 Restarting PM2 processes..."
pm2 restart all

# Reload Nginx
echo "🌐 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo "🌍 Your sites are live:"
echo "   - https://sartthi.com"
echo "   - https://mail.sartthi.com"
echo "   - https://calendar.sartthi.com"
echo "   - https://vault.sartthi.com"
