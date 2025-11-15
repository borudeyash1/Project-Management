import express from 'express';
import { body } from 'express-validator';
import {
  checkDeviceAccess,
  logDeviceAccess,
  adminLogin,
  adminGoogleLogin,
  verifyAdminLoginOTP,
  sendPasswordChangeOTP,
  verifyOTPAndChangePassword,
  getDashboardStats,
  getAllDevices,
  addDevice,
  updateDevice,
  deleteDevice
} from '../controllers/adminController';
import { getAdminAIResponse } from '../controllers/adminAIController';
import { getAnalyticsData, getUserInsights } from '../controllers/analyticsController';
import {
  getAdminSubscriptionPlans,
  updateSubscriptionPlan,
  addSubscriptionCoupon,
  updateSubscriptionCoupon,
  deleteSubscriptionCoupon,
  addSubscriptionAffiliate,
  updateSubscriptionAffiliate,
  deleteSubscriptionAffiliate
} from '../controllers/subscriptionController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  adminOtpRateLimiter,
  adminLoginRateLimiter,
  sensitiveOperationRateLimiter,
  aiChatbotRateLimiter
} from '../middleware/rateLimiter';

const router = express.Router();

// Validation rules
const checkDeviceValidation = [
  body('deviceId')
    .notEmpty()
    .withMessage('Device ID is required')
];

const addDeviceValidation = [
  body('deviceId')
    .notEmpty()
    .withMessage('Device ID is required'),
  body('deviceName')
    .notEmpty()
    .withMessage('Device name is required'),
  body('deviceType')
    .optional()
    .isIn(['admin', 'trusted'])
    .withMessage('Device type must be admin or trusted')
];

// Public routes - no auth required
router.post('/check-device', checkDeviceValidation, validateRequest, checkDeviceAccess);
router.post('/log-access', logDeviceAccess);

// Admin authentication routes
const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const googleLoginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('googleId').notEmpty().withMessage('Google ID is required')
];

// Admin login routes with rate limiting
router.post('/login', adminLoginRateLimiter, loginValidation, validateRequest, adminLogin);
router.post('/google-login', adminLoginRateLimiter, googleLoginValidation, validateRequest, adminGoogleLogin);

// OTP verification route with rate limiting
const otpVerificationValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];

router.post('/verify-login-otp', adminOtpRateLimiter, otpVerificationValidation, validateRequest, verifyAdminLoginOTP);

// Password change routes with rate limiting
const passwordChangeValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required')
];

const verifyOTPValidation = [
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

router.post('/send-password-otp', authenticate, adminOtpRateLimiter, passwordChangeValidation, validateRequest, sendPasswordChangeOTP);
router.post('/verify-password-otp', authenticate, adminOtpRateLimiter, verifyOTPValidation, validateRequest, verifyOTPAndChangePassword);

// Dashboard stats route
router.get('/dashboard-stats', getDashboardStats);

// AI Assistant route with rate limiting (10 questions per day)
router.post('/ai-assistant', aiChatbotRateLimiter, getAdminAIResponse);

// Device management routes
router.get('/devices', getAllDevices);
router.post('/devices', addDevice);
router.put('/devices/:id', updateDevice);
router.delete('/devices/:id', deleteDevice);

// Analytics routes
router.get('/analytics-data', getAnalyticsData);
router.get('/user-insights', getUserInsights);
// Subscription management
router.get('/subscriptions', authenticate, getAdminSubscriptionPlans);
router.put('/subscriptions/:planKey', authenticate, updateSubscriptionPlan);
router.post('/subscriptions/:planKey/coupons', authenticate, addSubscriptionCoupon);
router.put('/subscriptions/:planKey/coupons/:code', authenticate, updateSubscriptionCoupon);
router.delete('/subscriptions/:planKey/coupons/:code', authenticate, deleteSubscriptionCoupon);
router.post('/subscriptions/:planKey/affiliates', authenticate, addSubscriptionAffiliate);
router.put('/subscriptions/:planKey/affiliates/:code', authenticate, updateSubscriptionAffiliate);
router.delete('/subscriptions/:planKey/affiliates/:code', authenticate, deleteSubscriptionAffiliate);

export default router;
