# VPS Node.js Fix - Remove NVM and Use System Node.js 18

## Problem: NVM is overriding system Node.js

Your VPS has NVM installed which is using v24.11.1 instead of the system Node.js 18.

## Solution: Remove NVM or Use NVM to Install Node.js 18

### Option 1: Remove NVM (Recommended)

```bash
ssh saurabh@srv1132332

# 1. Remove NVM completely
rm -rf ~/.nvm
rm -rf ~/.npm

# 2. Edit ~/.bashrc to remove NVM lines
nano ~/.bashrc

# Find and DELETE these lines (or similar):
# export NVM_DIR="$HOME/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
# [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Save: Ctrl+X, then Y, then Enter

# 3. Reload shell
source ~/.bashrc

# 4. Verify Node.js 18 is now active
which node  # Should show /usr/bin/node
node -v     # Should show v18.20.8

# 5. If still showing wrong path, update PATH
export PATH="/usr/bin:$PATH"
echo 'export PATH="/usr/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Option 2: Use NVM to Install Node.js 18 (Alternative)

```bash
# Use NVM to install and use Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

# Verify
node -v  # Should show v18.x.x
```

## Deploy Application

```bash
cd ~/Project-Management

# Pull latest code
git reset --hard
git pull origin main

# Install dependencies with correct Node version
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client  
rm -rf node_modules package-lock.json build
npm install
npm run build

# Restart PM2
cd ..
pm2 delete server  # Delete old process
pm2 start server/dist/server.js --name server

# Check logs
pm2 logs server --lines 50
```

## Verify R2 Upload Works

After deployment, upload a release and check logs:

```bash
pm2 logs server | grep "R2"
```

Should see:
```
✅ [R2-SDK] File uploaded successfully
```

NOT:
```
❌ [R2-SDK] Upload failed: SSL error
```

## Quick Commands (Copy-Paste)

```bash
# Remove NVM
rm -rf ~/.nvm ~/.npm
nano ~/.bashrc  # Remove NVM lines, save with Ctrl+X
source ~/.bashrc
node -v  # Verify v18

# Deploy
cd ~/Project-Management
git reset --hard && git pull origin main
cd server && rm -rf node_modules package-lock.json && npm install
cd ../client && rm -rf node_modules package-lock.json build && npm install && npm run build
cd .. && pm2 restart server
pm2 logs server
```
