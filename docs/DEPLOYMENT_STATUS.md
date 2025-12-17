# Sartthi Ecosystem Deployment Guide

## Overview

Your Project Management application is part of the **Sartthi Ecosystem**, which includes:
- **Main App** (sartthi.com) - Project Management
- **Mail** (mail.sartthi.com) - Gmail integration
- **Calendar** (calendar.sartthi.com) - Google Calendar integration  
- **Vault** (vault.sartthi.com / drive.sartthi.com) - Google Drive integration

## Current Status: ⚠️ PARTIALLY READY

### ✅ What's Working (Backend APIs)
Your server already has the backend APIs ready:
- `/api/mail/*` - Mail endpoints (sartthi-mail.ts)
- `/api/calendar/*` - Calendar endpoints (sartthi-calendar.ts)
- `/api/vault/*` - Vault endpoints (sartthi-vault.ts)
- `/api/auth/sartthi/*` - OAuth authentication for Google services

### ❌ What's NOT Ready (Frontend UIs)
The separate frontend UIs exist but are **NOT production-ready**:
- `sartthi-mail-ui/` - Vite app on port 3001
- `sartthi-calendar-ui/` - Vite app on port 3002
- `sartthi-vault-ui/` - Vite app on port 3003

## Will They Work When You Host? 

### Short Answer: **NO, not yet**

### Why Not?

1. **No Nginx Configuration for Subdomains**
   - Your current `nginx-sartthi.conf` only configures `sartthi.com`
   - No configuration exists for `mail.sartthi.com`, `calendar.sartthi.com`, `vault.sartthi.com`

2. **Frontend UIs Not Built**
   - The separate UI folders need to be built and deployed
   - They need proper API endpoint configuration

3. **No SSL Certificates for Subdomains**
   - Each subdomain needs its own SSL certificate

4. **DNS Records May Not Exist**
   - Subdomains need A records pointing to your VPS IP

## What You Need to Do

### Option 1: Deploy All Subdomains (Full Ecosystem)

#### Step 1: Build All Frontend UIs
```bash
# Build mail UI
cd ~/Project-Management/sartthi-mail-ui
npm install
npm run build

# Build calendar UI
cd ~/Project-Management/sartthi-calendar-ui
npm install
npm run build

# Build vault UI
cd ~/Project-Management/sartthi-vault-ui
npm install
npm run build
```

#### Step 2: Create Nginx Configurations

**For mail.sartthi.com:**
```nginx
server {
    listen 80;
    server_name mail.sartthi.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mail.sartthi.com;
    
    ssl_certificate /etc/letsencrypt/live/mail.sartthi.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mail.sartthi.com/privkey.pem;
    
    root /home/saurabh/Project-Management/sartthi-mail-ui/dist;
    index index.html;
    
    # API proxy to main backend
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Repeat similar configs for:**
- `calendar.sartthi.com` → `sartthi-calendar-ui/dist`
- `vault.sartthi.com` → `sartthi-vault-ui/dist`

#### Step 3: Get SSL Certificates
```bash
sudo certbot --nginx -d mail.sartthi.com
sudo certbot --nginx -d calendar.sartthi.com
sudo certbot --nginx -d vault.sartthi.com
```

#### Step 4: Update DNS Records
Add A records for:
- mail.sartthi.com → Your VPS IP
- calendar.sartthi.com → Your VPS IP
- vault.sartthi.com → Your VPS IP

### Option 2: Deploy Only Main App (Recommended for Now)

**Just deploy sartthi.com with the Project Management app.**

The Sartthi modules (mail, calendar, vault) can be:
1. Accessed via the main app's integration features
2. Deployed later when you're ready

## Current Deployment Steps (Main App Only)

### On Your VPS (srv1132332):

```bash
cd ~/Project-Management

# Configure git to handle divergent branches
git config pull.rebase false

# Pull latest changes
git pull origin main

# Install server dependencies
cd server
npm install
npm run build

# Install client dependencies with legacy peer deps
cd ../client
npm install --legacy-peer-deps
npm run build

# Restart PM2
pm2 restart server
pm2 save
```

## Recommendation

**For your immediate deployment, I recommend:**

1. ✅ Deploy only the main Project Management app (sartthi.com)
2. ⏸️ Keep the Sartthi ecosystem modules (mail, calendar, vault) for later
3. 🔧 The backend APIs are ready, so when you're ready to deploy the UIs, you just need to:
   - Build the frontend UIs
   - Configure nginx for subdomains
   - Get SSL certificates
   - Update DNS

## Summary

| Component | Backend Ready? | Frontend Ready? | Deployment Ready? |
|-----------|---------------|-----------------|-------------------|
| Main App (sartthi.com) | ✅ Yes | ✅ Yes | ✅ **YES** |
| Mail (mail.sartthi.com) | ✅ Yes | ⚠️ Exists but not configured | ❌ **NO** |
| Calendar (calendar.sartthi.com) | ✅ Yes | ⚠️ Exists but not configured | ❌ **NO** |
| Vault (vault.sartthi.com) | ✅ Yes | ⚠️ Exists but not configured | ❌ **NO** |

## Next Steps

1. **Now**: Push your fixes and deploy the main app
2. **Later**: When ready to deploy the ecosystem:
   - Update frontend UIs with proper API configurations
   - Create nginx configs for subdomains
   - Get SSL certificates
   - Test OAuth flows for Google services
