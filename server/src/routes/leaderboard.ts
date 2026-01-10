import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getWorkspaceLeaderboard,
  getProjectLeaderboard,
  getUserPerformanceRatings,
} from '../controllers/leaderboardController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get workspace leaderboard
router.get('/workspace/:workspaceId', getWorkspaceLeaderboard);

// Get project leaderboard
router.get('/project/:projectId', getProjectLeaderboard);

// Get user performance ratings
router.get('/user/:userId', getUserPerformanceRatings);

export default router;
