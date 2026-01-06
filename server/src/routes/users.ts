import express from 'express';
import { body } from 'express-validator';
import {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  deleteAccount,
  uploadAvatar,
  searchUsers,
  saveFaceScan,
  verifyFace,
  getPreferences,
  updatePreferences,
  getUserById,
  updateBillingInfo
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// TEMPORARY DEBUG ENDPOINT - Remove in production
router.get('/debug/list', async (req, res) => {
  try {
    const User = require('../models/User').default;
    const users = await User.find({}).select('email username fullName isActive isEmailVerified createdAt').limit(50);
    res.json({
      success: true,
      count: users.length,
      users: users.map((u: any) => ({
        email: u.email,
        username: u.username,
        fullName: u.fullName,
        isActive: u.isActive,
        isEmailVerified: u.isEmailVerified,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list users', error: String(error) });
  }
});

// All routes require authentication
router.use(authenticate);

// Search users (for invites/autocomplete)
router.get('/search', searchUsers);

// Validation rules
const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Designation cannot exceed 100 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('about')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('About cannot exceed 500 characters')
];

// Routes
router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, validateRequest, updateProfile);
router.post('/face-scan', saveFaceScan);
router.post('/verify-face', verifyFace);
router.get('/settings', getSettings); // GET for fetching settings
router.put('/settings', validateRequest, updateSettings);
router.delete('/account', deleteAccount);
router.post('/avatar', uploadAvatar);

// Preferences routes
router.get('/preferences', getPreferences);
router.put('/preferences', validateRequest, updatePreferences);

// Billing information route
router.put('/billing-info', validateRequest, updateBillingInfo);

// Get user by ID (for viewing other users' profiles) - MUST BE LAST
router.get('/:userId', getUserById);

export default router;
