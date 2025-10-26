# 🔐 Admin OAuth + OTP Implementation Guide

## ✅ Completed Features

### 1. **Analytics Dashboard** (`/admin/analytics`)
- User growth metrics with growth rate
- Active users (today, week, month)
- Subscription distribution (Free/Pro/Ultra)
- Revenue tracking (monthly/yearly)
- User engagement metrics
- Conversion rate analytics
- Time range selector (7d, 30d, 90d, 1y)

### 2. **Settings Page** (`/admin/settings`)
- Profile management
- Password change functionality
- Security settings (placeholder)
- Notification preferences (placeholder)
- System settings (placeholder)

### 3. **Routes Added**
- `/admin/analytics` - Analytics Dashboard
- `/admin/settings` - Admin Settings
- Both linked from Admin Dashboard

---

## 🚀 Next Steps: OAuth + OTP Implementation

### **Overview**
Implement Google OAuth login for admin portal with OTP verification for both OAuth and custom email/password login.

### **Requirements**
1. **OAuth Login** - Google Sign-In for admins
2. **OTP Verification** - Required for both OAuth and custom login
3. **Admin Collection** - Check against `admins` collection (not `users`)
4. **Reuse Logic** - Use existing OAuth/OTP logic from `/login` and `/register`

---

## 📋 Implementation Steps

### **Step 1: Backend - Admin OTP Routes**

Create `/server/src/routes/adminAuth.ts`:

```typescript
import express from 'express';
import {
  adminLogin,
  adminGoogleLogin,
  sendAdminOTP,
  verifyAdminOTP,
  adminLogout
} from '../controllers/adminAuthController';

const router = express.Router();

// Custom login (email/password) - sends OTP
router.post('/login', adminLogin);

// Google OAuth login - sends OTP
router.post('/google-login', adminGoogleLogin);

// Send OTP (resend)
router.post('/send-otp', sendAdminOTP);

// Verify OTP and complete login
router.post('/verify-otp', verifyAdminOTP);

// Logout
router.post('/logout', adminLogout);

export default router;
```

### **Step 2: Backend - Admin Auth Controller**

Update `/server/src/controllers/adminController.ts`:

```typescript
// Admin Login Step 1: Validate credentials, send OTP
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  
  // 1. Find admin in Admin collection
  const admin = await Admin.findOne({ email, isActive: true }).select('+password');
  
  if (!admin || admin.loginMethod !== 'email') {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }
  
  // 2. Verify password
  const isValid = await admin.comparePassword(password);
  if (!isValid) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }
  
  // 3. Generate and send OTP
  const otp = generateOTP(); // 6-digit code
  admin.loginOtp = otp;
  admin.loginOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await admin.save();
  
  // 4. Send OTP via email
  await sendOTPEmail(admin.email, otp, admin.name);
  
  res.status(200).json({
    success: true,
    message: 'OTP sent to your email',
    data: { email: admin.email, requiresOTP: true }
  });
};

// Admin Google Login Step 1: Validate Google token, send OTP
export const adminGoogleLogin = async (req: Request, res: Response): Promise<void> => {
  const { credential } = req.body;
  
  // 1. Verify Google token
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  
  const payload = ticket.getPayload();
  const { email, name, sub: googleId, picture } = payload!;
  
  // 2. Find admin in Admin collection
  let admin = await Admin.findOne({ email, isActive: true });
  
  if (!admin) {
    res.status(401).json({ success: false, message: 'Admin account not found' });
    return;
  }
  
  // 3. Update Google ID if not set
  if (!admin.googleId) {
    admin.googleId = googleId;
    admin.loginMethod = 'google';
    admin.avatar = picture;
    await admin.save();
  }
  
  // 4. Generate and send OTP
  const otp = generateOTP();
  admin.loginOtp = otp;
  admin.loginOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await admin.save();
  
  await sendOTPEmail(admin.email, otp, admin.name);
  
  res.status(200).json({
    success: true,
    message: 'OTP sent to your email',
    data: { email: admin.email, requiresOTP: true }
  });
};

// Verify OTP Step 2: Complete login
export const verifyAdminOTP = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;
  
  // 1. Find admin with valid OTP
  const admin = await Admin.findOne({
    email,
    loginOtp: otp,
    loginOtpExpiry: { $gt: new Date() },
    isActive: true
  });
  
  if (!admin) {
    res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    return;
  }
  
  // 2. Clear OTP
  admin.loginOtp = undefined;
  admin.loginOtpExpiry = undefined;
  admin.lastLogin = new Date();
  await admin.save();
  
  // 3. Generate JWT token
  const token = jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role, type: 'admin' },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar
      }
    }
  });
};
```

### **Step 3: Frontend - Update AdminLogin Component**

Update `/client/src/components/admin/AdminLogin.tsx`:

```typescript
// Add Google OAuth button
import { GoogleLogin } from '@react-oauth/google';

// State for OTP
const [showOTPModal, setShowOTPModal] = useState(false);
const [otpEmail, setOtpEmail] = useState('');
const [otp, setOtp] = useState('');

// Handle custom login
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await api.post('/admin/login', { email, password });
    if (response?.success && response.data.requiresOTP) {
      setOtpEmail(response.data.email);
      setShowOTPModal(true);
      addToast('OTP sent to your email', 'success');
    }
  } catch (error: any) {
    addToast(error?.message || 'Login failed', 'error');
  }
};

// Handle Google login
const handleGoogleSuccess = async (credentialResponse: any) => {
  try {
    const response = await api.post('/admin/google-login', {
      credential: credentialResponse.credential
    });
    if (response?.success && response.data.requiresOTP) {
      setOtpEmail(response.data.email);
      setShowOTPModal(true);
      addToast('OTP sent to your email', 'success');
    }
  } catch (error: any) {
    addToast(error?.message || 'Google login failed', 'error');
  }
};

// Verify OTP
const handleVerifyOTP = async () => {
  try {
    const response = await api.post('/admin/verify-otp', {
      email: otpEmail,
      otp
    });
    if (response?.success) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminData', JSON.stringify(response.data.admin));
      addToast('Login successful!', 'success');
      window.location.href = '/admin/dashboard';
    }
  } catch (error: any) {
    addToast(error?.message || 'Invalid OTP', 'error');
  }
};

// Add Google button in JSX
<GoogleLogin
  onSuccess={handleGoogleSuccess}
  onError={() => addToast('Google login failed', 'error')}
  theme={isDarkMode ? 'filled_black' : 'outline'}
  size="large"
  text="signin_with"
  shape="rectangular"
  width="100%"
/>
```

### **Step 4: OTP Modal Component**

```typescript
{showOTPModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 max-w-md w-full mx-4`}>
      <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
        Verify OTP
      </h3>
      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
        Enter the 6-digit code sent to {otpEmail}
      </p>
      
      <input
        type="text"
        maxLength={6}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        placeholder="000000"
        className={`w-full px-4 py-3 text-center text-2xl tracking-widest rounded-xl border-2 ${
          isDarkMode 
            ? 'bg-gray-700 border-gray-600 text-white' 
            : 'bg-white border-gray-300 text-gray-900'
        } focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-6`}
      />
      
      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowOTPModal(false);
            setOtp('');
          }}
          className={`flex-1 px-4 py-3 rounded-xl border-2 ${
            isDarkMode 
              ? 'border-gray-600 hover:bg-gray-700 text-white' 
              : 'border-gray-300 hover:bg-gray-50 text-gray-900'
          } font-semibold transition-colors`}
        >
          Cancel
        </button>
        <button
          onClick={handleVerifyOTP}
          disabled={otp.length !== 6}
          className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
            otp.length === 6
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Verify
        </button>
      </div>
      
      <button
        onClick={async () => {
          try {
            await api.post('/admin/send-otp', { email: otpEmail });
            addToast('OTP resent successfully', 'success');
          } catch (error: any) {
            addToast('Failed to resend OTP', 'error');
          }
        }}
        className="w-full mt-4 text-sm text-yellow-500 hover:text-yellow-600 font-medium"
      >
        Resend OTP
      </button>
    </div>
  </div>
)}
```

### **Step 5: Environment Variables**

Add to `.env`:
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### **Step 6: Install Dependencies**

```bash
# Backend
cd server
npm install google-auth-library

# Frontend
cd client
npm install @react-oauth/google
```

### **Step 7: Wrap App with GoogleOAuthProvider**

In `client/src/index.tsx`:
```typescript
import { GoogleOAuthProvider } from '@react-oauth/google';

<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
  <App />
</GoogleOAuthProvider>
```

---

## 🔑 Key Points

1. **Admin Collection Only** - All lookups use `Admin` model, not `User`
2. **OTP Required** - Both OAuth and custom login require OTP verification
3. **JWT Token** - Include `type: 'admin'` in token payload
4. **Email Service** - Reuse existing OTP email service
5. **Security** - OTP expires in 10 minutes
6. **Device Check** - Still required before showing login form

---

## 📝 Testing Checklist

- [ ] Custom login sends OTP
- [ ] Google OAuth login sends OTP
- [ ] OTP verification works
- [ ] Invalid OTP shows error
- [ ] Expired OTP shows error
- [ ] Resend OTP works
- [ ] Admin token stored correctly
- [ ] Dashboard accessible after login
- [ ] Logout clears tokens
- [ ] Device check still works

---

## 🎯 Summary

This implementation provides:
- ✅ Google OAuth for admin login
- ✅ OTP verification for all login methods
- ✅ Admin-specific authentication (separate from users)
- ✅ Reuses existing OAuth/OTP infrastructure
- ✅ Secure token-based authentication
- ✅ Device fingerprinting still active

**Ready to implement!** 🚀
