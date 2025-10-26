import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateSubscription,
  toggleUserStatus,
  deleteUser,
  getUserStats,
  resetUserPassword,
  verifyUserEmail
} from '../controllers/userManagementController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// Validation rules
const getUsersValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().trim(),
  query('subscription').optional().isIn(['free', 'pro', 'ultra']).withMessage('Invalid subscription plan'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  query('sortBy').optional().isString(),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
];

const userIdValidation = [
  param('id').isMongoId().withMessage('Invalid user ID')
];

const updateSubscriptionValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('plan').optional().isIn(['free', 'pro', 'ultra']).withMessage('Invalid subscription plan'),
  body('status').optional().isIn(['active', 'inactive', 'cancelled', 'expired']).withMessage('Invalid status'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('autoRenew').optional().isBoolean().withMessage('autoRenew must be a boolean'),
  body('billingCycle').optional().isIn(['monthly', 'yearly']).withMessage('Invalid billing cycle')
];

const resetPasswordValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// All routes require authentication
router.use(authenticate);

// Get all users with filters and pagination
router.get('/', getUsersValidation, validateRequest, getAllUsers);

// Get user statistics
router.get('/stats', getUserStats);

// Get user by ID
router.get('/:id', userIdValidation, validateRequest, getUserById);

// Update user details
router.put('/:id', userIdValidation, validateRequest, updateUser);

// Update subscription
router.put('/:id/subscription', updateSubscriptionValidation, validateRequest, updateSubscription);

// Toggle user active status
router.patch('/:id/toggle-status', userIdValidation, validateRequest, toggleUserStatus);

// Verify user email
router.patch('/:id/verify-email', userIdValidation, validateRequest, verifyUserEmail);

// Reset user password
router.post('/:id/reset-password', resetPasswordValidation, validateRequest, resetUserPassword);

// Delete user
router.delete('/:id', userIdValidation, validateRequest, deleteUser);

export default router;
