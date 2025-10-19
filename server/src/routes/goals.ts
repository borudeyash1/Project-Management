import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  getGoalStats,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  toggleMilestoneCompletion
} from '../controllers/goalController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Goal routes
router.post('/', createGoal);
router.get('/', getGoals);
router.get('/stats', getGoalStats);
router.get('/:id', getGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

// Milestone routes
router.post('/:goalId/milestones', createMilestone);
router.put('/:goalId/milestones/:milestoneId', updateMilestone);
router.delete('/:goalId/milestones/:milestoneId', deleteMilestone);
router.patch('/:goalId/milestones/:milestoneId/toggle', toggleMilestoneCompletion);

export default router;
