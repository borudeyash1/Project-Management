#!/bin/bash

# Quick deployment script for webhook fix
echo "🚀 Deploying webhook fix to VPS..."

# SSH into VPS and run commands
ssh saurabh@srv1132332 << 'ENDSSH'
cd ~/Project-Management

echo "📥 Pulling latest code..."
git pull origin main

echo "🔨 Building server..."
cd server
npm run build

echo "🔍 Verifying new code..."
if grep -q "Verifying signature" dist/routes/githubWebhooks.js; then
    echo "✅ New code found in build"
else
    echo "❌ New code NOT found - build may have failed"
    exit 1
fi

echo "🔄 Restarting PM2..."
pm2 restart proxima-server

echo "📊 Showing recent logs..."
pm2 logs proxima-server --lines 20 --nostream

echo "✅ Deployment complete!"
echo "Now make a commit to test the webhook"
ENDSSH
