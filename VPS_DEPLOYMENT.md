# VPS Deployment - Complete Guide

## Prerequisites

### 1. Install Node.js 18 LTS
```bash
ssh saurabh@srv1132332

# Remove NVM if it exists
rm -rf ~/.nvm ~/.npm

# Edit .bashrc to remove NVM lines
nano ~/.bashrc
# Delete any lines containing "nvm"
# Save: Ctrl+X, Y, Enter

# Reload shell
source ~/.bashrc

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node -v  # Should show v18.20.8
npm -v
```

### 2. Install PM2 (Process Manager)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify
pm2 --version

# Setup PM2 to start on boot
pm2 startup
# Follow the command it gives you (usually starts with 'sudo env PATH=...')
```

## Deploy Application

```bash
cd ~/Project-Management

# Pull latest code
git reset --hard
git pull origin main

# Install server dependencies
cd server
rm -rf node_modules package-lock.json
npm install

# Build TypeScript
npm run build

# Install client dependencies and build
cd ../client
rm -rf node_modules package-lock.json build
npm install
npm run build

# Go back to root
cd ..
```

## Start/Restart Server with PM2

### First Time Setup
```bash
# Start server with PM2
pm2 start server/dist/server.js --name server

# Save PM2 process list
pm2 save

# Check status
pm2 status
```

### Restart After Updates
```bash
# Restart server
pm2 restart server

# Or reload (zero-downtime)
pm2 reload server
```

## Monitor & Logs

```bash
# View logs
pm2 logs server

# View last 50 lines
pm2 logs server --lines 50

# Monitor in real-time
pm2 monit

# Check status
pm2 status

# Stop server
pm2 stop server

# Delete from PM2
pm2 delete server
```

## Verify R2 Upload Works

After deployment, test R2 upload:
```bash
# Watch logs for R2 activity
pm2 logs server | grep "R2"
```

Should see:
```
✅ [R2-SDK] File uploaded successfully
```

## Quick Deploy Script

Create a deploy script:
```bash
nano ~/deploy.sh
```

Add:
```bash
#!/bin/bash
cd ~/Project-Management
git pull origin main
cd server && npm install && npm run build
cd ../client && npm install && npm run build
cd ..
pm2 restart server
pm2 logs server --lines 20
```

Make executable:
```bash
chmod +x ~/deploy.sh
```

Use:
```bash
~/deploy.sh
```

## Troubleshooting

### Port 5000 in use
```bash
pm2 stop server
pm2 delete server
pm2 start server/dist/server.js --name server
```

### Check what's using port 5000
```bash
sudo lsof -i :5000
```

### Environment variables
Make sure `.env` exists in `~/Project-Management/server/`:
```bash
cd ~/Project-Management/server
ls -la .env
```

### MongoDB connection
```bash
pm2 logs server | grep "MongoDB"
```

Should see: `Connected to MongoDB`
