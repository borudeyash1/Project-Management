# Security and Configuration Fixes

## Issues Fixed

### 1. Admin Token Expiration Issue ✅

**Problem:** Admin tokens were not being validated for expiration on the client side. When the server was restarted, users could still access admin routes with expired tokens stored in localStorage.

**Solution:**
- Created `tokenUtils.ts` utility with JWT token validation functions
- Added `validateAdminToken()` to check token expiration before allowing access
- Added `clearExpiredTokens()` to automatically clean up expired tokens
- Updated all admin components to validate tokens on mount:
  - `AdminLoginWrapper.tsx`
  - `AdminDashboard.tsx`
  - `UserManagement.tsx`
  - `Analytics.tsx`
  - `Settings.tsx`
  - `ReleaseManagement.tsx`

**How it works:**
- Tokens are decoded on the client side (without verification)
- Expiration time is checked against current time
- If expired, tokens are removed and user is redirected to login
- Users now see "Session expired. Please login again." message

### 2. Email Service Configuration Issue ✅

**Problem:** Registration was failing with "Missing credentials for PLAIN" error when EMAIL_USER and EMAIL_PASS were not configured in the .env file.

**Solution:**
- Made email service optional in `emailService.ts`
- Email transporter is only created if credentials are configured
- Registration continues without error if email service is not configured
- Updated `authController.ts` to handle email failures gracefully
- Registration response now indicates whether email was sent

**How it works:**
- If EMAIL_USER and EMAIL_PASS are not set, email sending is skipped
- User registration succeeds without email verification
- Console shows warning: "Email service not configured. Skipping email send."
- Registration message adapts based on email status

## Configuration

### Setting Up Email Service (Optional)

Email service is **optional**. If not configured, registration will work but email verification will be skipped.

To enable email verification:

1. Copy `.env.example` to `.env` in the server directory
2. For Gmail, create an App Password:
   - Go to [Google Account](https://myaccount.google.com/)
   - Click **Security**
   - Enable **2-Step Verification** if not already enabled
   - Click **App passwords** at the bottom
   - Select app: **Mail** and device: **Other (Custom name)**
   - Enter a name like "TaskFlowHQ" and click **Generate**
   - Copy the 16-character password
3. Update your `.env` file:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```
4. Restart the server

### Token Expiration Settings

Admin tokens expire after 7 days by default. This is configured in:
- Server: `adminController.ts` - `expiresIn: '7d'`
- Client: Token validation happens automatically on component mount

## Testing

### Test Token Expiration:
1. Login to admin panel at `http://localhost:3000/my-admin/login`
2. Stop the server
3. Wait for token to expire (or manually change exp time in token)
4. Start the server
5. Try to access `http://localhost:3000/admin/dashboard`
6. You should be redirected to login with "Session expired" message

### Test Registration Without Email:
1. Don't configure EMAIL_USER and EMAIL_PASS in .env
2. Go to `http://localhost:3000/register`
3. Fill in registration form
4. Submit
5. Registration should succeed with message about email service not being configured

### Test Registration With Email:
1. Configure EMAIL_USER and EMAIL_PASS in .env
2. Restart server
3. Register a new user
4. Check email for OTP
5. Verify with OTP

## Files Modified

### Client Side:
- `client/src/utils/tokenUtils.ts` (NEW)
- `client/src/components/admin/AdminLoginWrapper.tsx`
- `client/src/components/admin/AdminDashboard.tsx`
- `client/src/components/admin/UserManagement.tsx`
- `client/src/components/admin/Analytics.tsx`
- `client/src/components/admin/Settings.tsx`
- `client/src/components/admin/ReleaseManagement.tsx`

### Server Side:
- `server/src/services/emailService.ts`
- `server/src/controllers/authController.ts`
- `server/.env.example`

## Security Best Practices

1. **Token Expiration**: Tokens now properly expire and are validated
2. **Graceful Degradation**: App works without email service configured
3. **Clear User Feedback**: Users see appropriate messages for expired sessions
4. **Automatic Cleanup**: Expired tokens are automatically removed from localStorage

## Notes

- Admin tokens are stored in `localStorage` as `adminToken`
- Token validation happens on every protected route mount
- Email service is completely optional for development
- Production deployments should configure email service for security
