import express from 'express';
import { authenticate } from '../middleware/auth';
import { getUserActivities } from '../controllers/activityController';

const router = express.Router();

// Protected routes
router.get('/', authenticate, getUserActivities);

export default router;
