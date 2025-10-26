import express from 'express';
import { body } from 'express-validator';
import {
  checkDeviceAccess,
  getAllowedDevices,
  addAllowedDevice,
  updateAllowedDevice,
  deleteAllowedDevice,
  logDeviceAccess,
  adminLogin,
  adminGoogleLogin
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

// Protected routes - require authentication
router.get('/devices', authenticate, getAllowedDevices);
router.post('/devices', authenticate, addDeviceValidation, validateRequest, addAllowedDevice);
router.put('/devices/:id', authenticate, updateAllowedDevice);
router.delete('/devices/:id', authenticate, deleteAllowedDevice);

export default router;
