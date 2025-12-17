import express from 'express';
import { body } from 'express-validator';
import {
  getProfile,
  updateProfile,
  updateSettings,
  deleteAccount,
  uploadAvatar,
  searchUsers,
  saveFaceScan,
  verifyFace,
  getPreferences,
  updatePreferences,
  getUserById
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

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
router.put('/settings', validateRequest, updateSettings);
router.delete('/account', deleteAccount);
router.post('/avatar', uploadAvatar);

// Preferences routes
router.get('/preferences', getPreferences);
router.put('/preferences', validateRequest, updatePreferences);

// Get user by ID (for viewing other users' profiles)
router.get('/:userId', getUserById);

export default router;
