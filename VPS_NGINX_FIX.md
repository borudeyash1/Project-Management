# VPS Nginx Fix - Based on Current Configuration

## Current Configuration Analysis

Your Nginx config already has:
- ✅ API proxy to `http://localhost:5000`
- ✅ SSL certificates (Certbot managed)
- ✅ React app serving from `/home/saurabh/Project-Management/client/build`

**Missing:**
- ❌ `client_max_body_size` for file uploads
- ❌ Proper timeout settings for large uploads

## Exact Fix Needed

### Step 1: Edit Nginx Configuration

```bash
# On VPS
sudo nano /etc/nginx/sites-available/sartthi.com
```

### Step 2: Add Upload Size Limit

Find the first `server {` block (the one with `listen 443 ssl;`) and add this line right after `server_name`:

```nginx
server {
    server_name sartthi.com www.sartthi.com;
    
    # ADD THIS LINE:
    client_max_body_size 10M;
    
    # This is the path to your React app's "build" folder
    root /home/saurabh/Project-Management/client/build;
    index index.html index.htm;
    
    # ... rest of config
}
```

### Step 3: Update API Proxy Timeouts

Find the `location /api {` block and update it to:

```nginx
# This forwards all API requests to your backend (running on port 5000)
location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    
    # ADD THESE LINES FOR LARGE UPLOADS:
    proxy_connect_timeout 600;
    proxy_send_timeout 600;
    proxy_read_timeout 600;
    send_timeout 600;
}
```

### Step 4: Save and Test

```bash
# Save the file (Ctrl+X, then Y, then Enter)

# Test configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

## Complete Updated Configuration

Here's what the relevant parts should look like:

```nginx
server {
    server_name sartthi.com www.sartthi.com;
    
    # Upload size limit
    client_max_body_size 10M;
    
    # This is the path to your React app's "build" folder
    root /home/saurabh/Project-Management/client/build;
    index index.html index.htm;

    location / {
        try_files $uri /index.html;
    }

    # This forwards all API requests to your backend (running on port 5000)
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for large uploads
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/sartthi.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/sartthi.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
```

## Quick Copy-Paste Fix

```bash
# 1. Edit config
sudo nano /etc/nginx/sites-available/sartthi.com

# 2. Add after "server_name sartthi.com www.sartthi.com;":
#    client_max_body_size 10M;

# 3. Add inside "location /api {" block (before the closing }):
#    proxy_connect_timeout 600;
#    proxy_send_timeout 600;
#    proxy_read_timeout 600;
#    send_timeout 600;

# 4. Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

## Verify Fix

After reloading Nginx:

1. **Test API:**
   ```bash
   curl https://sartthi.com/api/content/banners
   ```

2. **Test from browser:**
   - Go to https://sartthi.com/admin/content
   - Should load banners without 404 error

3. **Test file upload:**
   - Go to https://sartthi.com/admin/releases
   - Upload a file (up to 10MB)
   - Should work without 413 error

## Troubleshooting

If still getting errors:

```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check if backend is running
pm2 status
pm2 logs server

# Restart everything
pm2 restart server
sudo systemctl restart nginx
```
