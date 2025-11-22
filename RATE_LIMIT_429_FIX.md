# Rate Limit 429 Error - Troubleshooting Guide

## What is HTTP 429?
HTTP 429 "Too Many Requests" means you've exceeded the rate limit for a specific API endpoint.

## Current Rate Limits

### Authentication Endpoints
- **OTP Requests**: 3 requests per 15 minutes per IP+email
- **Login Attempts**: 5 requests per 15 minutes per IP+email  
- **Registration**: 3 requests per hour per IP
- **Password Reset**: 3 requests per hour per email
- **Admin OTP**: 3 requests per 30 minutes per IP+email
- **Admin Login**: 5 requests per 30 minutes per IP+email

### General Endpoints
- **General API**: 100 requests per 15 minutes per IP
- **Sensitive Operations**: 10 requests per hour per user+IP
- **AI Chatbot**: 10 questions per day per admin

## How to Fix

### Option 1: Wait for Rate Limit to Reset
The error response includes a `retryAfter` field telling you how many seconds to wait.

### Option 2: Clear Rate Limit Store (Development Only)
Since the rate limits are stored in memory, restarting the server will clear them:

```bash
# In the server terminal, press Ctrl+C to stop
# Then restart:
npm run dev
```

### Option 3: Temporarily Disable Rate Limiting (Development Only)

**WARNING: Only do this in development, never in production!**

1. Open `server/src/middleware/rateLimiter.ts`
2. Modify the rate limiter you're hitting to have higher limits:

For example, if you're hitting the OTP rate limit:
```typescript
export const otpRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100, // Increased from 3
  message: 'Too many OTP requests. Please try again after 15 minutes.',
  // ...
});
```

### Option 4: Check Server Logs
The server logs will show which endpoint is being rate limited:
```
⚠️ [RATE LIMIT] Blocked request from <IP> - <count>/<max> requests
```

## Common Scenarios

### Scenario 1: Testing OTP Flow
If you're testing OTP repeatedly:
- You can only request 3 OTPs per 15 minutes
- **Solution**: Restart the server or wait 15 minutes

### Scenario 2: Testing Login
If you're testing login repeatedly:
- You can only attempt 5 logins per 15 minutes
- **Solution**: Restart the server or wait 15 minutes

### Scenario 3: Page Refreshing Too Fast
If you're refreshing a page that makes many API calls:
- General API limit is 100 requests per 15 minutes
- **Solution**: Slow down refreshing or restart server

## Recommended Development Settings

For development, you can increase the limits temporarily. Edit `server/src/middleware/rateLimiter.ts`:

```typescript
// Development-friendly settings
export const otpRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: process.env.NODE_ENV === 'production' ? 3 : 50,
  // ...
});

export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: process.env.NODE_ENV === 'production' ? 5 : 100,
  // ...
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: process.env.NODE_ENV === 'production' ? 100 : 1000,
  // ...
});
```

## Quick Fix for Right Now

**Restart your server** to clear all rate limits:
1. Go to the server terminal
2. Press `Ctrl+C`
3. Run `npm run dev` again

This will reset all rate limit counters.
