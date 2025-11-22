# VPS Deployment Steps - Fix CORS and Hardcoded URLs

## Issue Summary
The production build has hardcoded `localhost:5000` URLs baked into the JavaScript bundle. We've fixed the source code, now we need to rebuild and redeploy.

## Steps to Execute on VPS

### 1. SSH into VPS
```bash
ssh saurabh@srv1132332
```

### 2. Navigate to Project Directory
```bash
cd ~/Project-Management
```

### 3. Pull Latest Changes
```bash
git pull
```

### 4. Verify Environment Variables

#### Check Server .env
```bash
cat server/.env
```
**Verify these settings:**
- `FRONTEND_URL=https://sartthi.com`
- `NODE_ENV=production`
- `PORT=5000`

#### Check Client .env
```bash
cat client/.env
```
**Verify these settings:**
- `REACT_APP_API_URL=/api`
- `REACT_APP_GOOGLE_REDIRECT_URI=https://sartthi.com/auth/google/callback`

### 5. Rebuild Server (TypeScript)
```bash
cd ~/Project-Management/server
npm install
npm run build
```
**Expected output:** Build should complete without TypeScript errors

### 6. Rebuild Client (React Production Build)
```bash
cd ~/Project-Management/client
npm install
npm run build
```
**This is critical!** The production build will now use `/api` instead of `localhost:5000`

### 7. Restart PM2 Services
```bash


```

### 8. Verify Services are Running
```bash
pm2 status
pm2 logs server --lines 50
```

### 9. Check Nginx Configuration
```bash
sudo nginx -t
```
If there are any errors, check the nginx config:
```bash
sudo nano /etc/nginx/sites-available/sartthi.com
```

**Verify the proxy configuration includes:**
```nginx
location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 10. Reload Nginx (if config changed)
```bash
sudo systemctl reload nginx
```

### 11. Test the Application
Open browser and go to: `https://sartthi.com`

**Test these features:**
1. ✅ Login page loads without CORS errors
2. ✅ Google OAuth works
3. ✅ Banners load on public pages
4. ✅ No `localhost:5000` errors in browser console

### 12. Monitor Logs
```bash
# Watch server logs in real-time
pm2 logs server

# Check nginx access logs
sudo tail -f /var/log/nginx/access.log

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### If CORS errors persist:
1. Clear browser cache completely (Ctrl+Shift+Delete)
2. Try incognito/private browsing mode
3. Check if old service workers are cached:
   - Open DevTools → Application → Service Workers → Unregister

### If build fails:
```bash
# Clean node_modules and rebuild
cd ~/Project-Management/client
rm -rf node_modules package-lock.json
npm install
npm run build
```

### If server won't start:
```bash
# Check what's using port 5000
sudo lsof -i :5000

# Kill the process if needed
sudo kill -9 <PID>

# Restart PM2
pm2 restart server
```

## Expected Results

After completing these steps:
- ✅ No more `localhost:5000` references in production
- ✅ All API calls use relative path `/api`
- ✅ Nginx proxies `/api` to `localhost:5000` on the backend
- ✅ CORS headers properly configured for `https://sartthi.com`
- ✅ Google OAuth works with production redirect URI

## Quick Command Summary
```bash
cd ~/Project-Management
git pull
cd server && npm install && npm run build
cd ../client && npm install && npm run build
pm2 restart server
pm2 logs server
```

---
**Note:** The key fix was removing all hardcoded `localhost:5000` URLs from the client code and using environment variables instead. The production build will now correctly use `/api` which Nginx proxies to the backend.
