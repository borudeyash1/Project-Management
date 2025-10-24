import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  verifyEmailOTP, // Updated: Use new OTP verification function
  resendEmailOTP, // New: Import resend OTP function
  googleAuth
} from '../controllers/authController';
import { authenticate, authenticateRefresh } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  body('contactNumber')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

const googleAuthValidation = [
  body('id')
    .notEmpty()
    .withMessage('Google user ID is required'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('name')
    .notEmpty()
    .withMessage('Name is required'),
  body('accessToken')
    .notEmpty()
    .withMessage('Google access token is required'),
  body('idToken')
    .notEmpty()
    .withMessage('Google ID token is required')
];

// New validation for OTP verification
const otpVerificationValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be a 6-digit code')
    .isNumeric()
    .withMessage('OTP must be numeric')
];

// New validation for resending OTP
const resendOtpValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];


// Routes
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.post('/google', googleAuthValidation, validateRequest, googleAuth);
router.post('/logout', authenticate, logout);
router.post('/refresh', authenticateRefresh, refreshToken);
router.get('/me', authenticate, getCurrentUser);
router.post('/forgot-password', forgotPasswordValidation, validateRequest, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validateRequest, resetPassword);

// OTP specific routes
router.post('/verify-email-otp', otpVerificationValidation, validateRequest, verifyEmailOTP); // New route
router.post('/resend-email-otp', resendOtpValidation, validateRequest, resendEmailOTP); // New route

// Removed old /verify-email/:token route as it's replaced by OTP
// router.get('/verify-email/:token', verifyEmail);

export default router;
