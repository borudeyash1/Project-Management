# Rate Limiting Implementation

## 🔒 Security Enhancement: Comprehensive Rate Limiting

### Overview
Implemented robust rate limiting across all authentication, OTP, and sensitive endpoints to prevent abuse, brute force attacks, and API flooding.

---

## 📋 Rate Limiting Rules

### 1. **OTP Endpoints** (Strictest)
- **Limit:** 3 requests per 15 minutes
- **Key:** IP + Email combination
- **Applies to:**
  - `/api/auth/verify-email-otp`
  - `/api/auth/resend-email-otp`
  - `/api/admin/verify-login-otp`
  - `/api/admin/send-password-otp`
  - `/api/admin/verify-password-otp`

**Rationale:** OTP endpoints are highly sensitive and prone to abuse. Strict limits prevent:
- Brute force OTP guessing
- OTP flooding attacks
- Email spam

### 2. **Login Endpoints**
- **Limit:** 5 requests per 15 minutes
- **Key:** IP + Email combination
- **Applies to:**
  - `/api/auth/login`
  - `/api/auth/google`

**Rationale:** Prevents credential stuffing and brute force login attempts while allowing legitimate users multiple tries.

### 3. **Admin Login Endpoints**
- **Limit:** 5 requests per 30 minutes
- **Key:** IP + Email combination
- **Applies to:**
  - `/api/admin/login`
  - `/api/admin/google-login`

**Rationale:** Admin accounts are more sensitive, so we use a longer window (30 min) for better security.

### 4. **Registration Endpoints**
- **Limit:** 3 requests per hour
- **Key:** IP address
- **Applies to:**
  - `/api/auth/register`

**Rationale:** Prevents mass account creation and spam registrations.

### 5. **Password Reset Endpoints**
- **Limit:** 3 requests per hour
- **Key:** Email address
- **Applies to:**
  - `/api/auth/forgot-password`
  - `/api/auth/reset-password`

**Rationale:** Prevents password reset abuse and email flooding.

### 6. **Sensitive Operations**
- **Limit:** 10 requests per hour
- **Key:** User ID + IP
- **Applies to:** Future sensitive operations

**Rationale:** Generic rate limiter for any sensitive user operations.

### 7. **General API**
- **Limit:** 100 requests per 15 minutes
- **Key:** IP address
- **Applies to:** Can be applied to general API routes

**Rationale:** Prevents API abuse while allowing normal usage.

---

## 🛠️ Implementation Details

### File Structure
```
server/src/middleware/rateLimiter.ts
```

### Key Features

1. **In-Memory Store**
   - Fast and efficient for development
   - Auto-cleanup of expired entries every 5 minutes
   - **Production Note:** Should be replaced with Redis for scalability

2. **Flexible Key Generation**
   - IP-based limiting
   - Email-based limiting
   - Combined IP + Email
   - User ID + IP for authenticated routes

3. **HTTP Headers**
   - `X-RateLimit-Limit`: Maximum requests allowed
   - `X-RateLimit-Remaining`: Requests remaining in window
   - `X-RateLimit-Reset`: Seconds until limit resets

4. **Error Response**
   ```json
   {
     "success": false,
     "message": "Too many requests, please try again later",
     "retryAfter": 900,
     "limit": 3,
     "remaining": 0
   }
   ```

---

## 📊 Rate Limit Matrix

| Endpoint | Limit | Window | Key Type |
|----------|-------|--------|----------|
| OTP Verification | 3 | 15 min | IP + Email |
| OTP Resend | 3 | 15 min | IP + Email |
| User Login | 5 | 15 min | IP + Email |
| Admin Login | 5 | 30 min | IP + Email |
| Registration | 3 | 1 hour | IP |
| Password Reset | 3 | 1 hour | Email |
| Admin OTP | 3 | 30 min | IP + Email |

---

## 🔍 Monitoring & Logging

### Console Logs
- ✅ **Allowed Request:** `[RATE LIMIT] Request from {key} - {count}/{max} requests`
- ⚠️ **Blocked Request:** `[RATE LIMIT] Blocked request from {key} - {count}/{max} requests`

### Example Logs
```
✅ [RATE LIMIT] Request from otp:192.168.1.1:user@example.com - 1/3 requests
✅ [RATE LIMIT] Request from otp:192.168.1.1:user@example.com - 2/3 requests
⚠️ [RATE LIMIT] Blocked request from otp:192.168.1.1:user@example.com - 4/3 requests
```

---

## 🚀 Usage Examples

### Frontend Handling

```typescript
try {
  const response = await api.post('/auth/verify-email-otp', { email, otp });
  // Success
} catch (error) {
  if (error.status === 429) {
    // Rate limit exceeded
    const retryAfter = error.data.retryAfter; // seconds
    showToast(`Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes`, 'error');
  }
}
```

### Response Headers
```
X-RateLimit-Limit: 3
X-RateLimit-Remaining: 1
X-RateLimit-Reset: 847
```

---

## 🔐 Security Benefits

1. **Brute Force Protection**
   - Prevents automated password guessing
   - Limits OTP brute force attempts
   - Protects against credential stuffing

2. **DDoS Mitigation**
   - Prevents API flooding
   - Limits resource consumption
   - Protects server availability

3. **Spam Prevention**
   - Limits mass registrations
   - Prevents OTP spam
   - Reduces email abuse

4. **Account Enumeration Protection**
   - Makes it harder to discover valid emails
   - Slows down reconnaissance attacks

---

## 📈 Production Recommendations

### 1. **Use Redis for Rate Limiting**
```typescript
import Redis from 'ioredis';
const redis = new Redis();

// Store rate limit data in Redis instead of memory
await redis.setex(`ratelimit:${key}`, windowSeconds, count);
```

### 2. **Add IP Whitelisting**
```typescript
const WHITELIST_IPS = ['10.0.0.1', '192.168.1.1'];
if (WHITELIST_IPS.includes(ip)) {
  return next(); // Skip rate limiting
}
```

### 3. **Add Monitoring**
```typescript
// Track rate limit violations
analytics.track('rate_limit_exceeded', {
  endpoint,
  ip,
  email,
  timestamp
});
```

### 4. **Implement CAPTCHA**
```typescript
// After 3 failed attempts, require CAPTCHA
if (failedAttempts > 3) {
  requireCaptcha = true;
}
```

---

## 🧪 Testing Rate Limits

### Manual Testing
```bash
# Test OTP rate limit (should block after 3 requests)
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/auth/resend-email-otp \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  echo "\n---Request $i---\n"
  sleep 1
done
```

### Expected Behavior
- Requests 1-3: Success (200)
- Request 4+: Rate limited (429)

---

## ⚙️ Configuration

### Adjusting Limits
Edit `server/src/middleware/rateLimiter.ts`:

```typescript
export const otpRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // Change window
  maxRequests: 3,           // Change limit
  message: 'Custom message'
});
```

### Adding New Rate Limiters
```typescript
export const customRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 10,
  keyGenerator: (req) => `custom:${req.user.id}`
});
```

---

## 📝 Summary

✅ **Implemented:**
- OTP rate limiting (3/15min)
- Login rate limiting (5/15min)
- Registration rate limiting (3/hour)
- Password reset rate limiting (3/hour)
- Admin-specific rate limiting
- Automatic cleanup of expired entries
- HTTP headers for client feedback
- Comprehensive logging

✅ **Protected Endpoints:**
- All authentication routes
- All OTP routes
- All admin routes
- Password reset flows

✅ **Security Improvements:**
- Brute force protection
- DDoS mitigation
- Spam prevention
- Account enumeration protection

---

## 🔄 Next Steps

1. **Monitor rate limit violations** in production
2. **Adjust limits** based on real usage patterns
3. **Implement Redis** for distributed rate limiting
4. **Add CAPTCHA** for repeated violations
5. **Set up alerts** for suspicious activity

---

**Status:** ✅ Fully Implemented and Active
**Last Updated:** Oct 31, 2025
