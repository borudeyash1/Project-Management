import express from 'express';
import { body } from 'express-validator';
import {
  checkDeviceAccess,
  logDeviceAccess,
  adminLogin,
  adminGoogleLogin,
  sendPasswordChangeOTP,
  verifyOTPAndChangePassword
} from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

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

router.post('/login', loginValidation, validateRequest, adminLogin);
router.post('/google-login', googleLoginValidation, validateRequest, adminGoogleLogin);

// Password change routes - require authentication
const passwordChangeValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required')
];

const verifyOTPValidation = [
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

router.post('/send-password-otp', authenticate, passwordChangeValidation, validateRequest, sendPasswordChangeOTP);
router.post('/verify-password-otp', authenticate, verifyOTPValidation, validateRequest, verifyOTPAndChangePassword);

export default router;
