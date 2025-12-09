import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createMilestone,
  getMilestonesByProject,
  getMilestonesByWorkspace,
  getMilestone,
  updateMilestone,
  deleteMilestone,
  addTaskToMilestone,
  removeTaskFromMilestone,
  updateMilestoneProgress
} from '../controllers/milestoneController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create milestone
router.post('/', createMilestone);

// Get milestones by project
router.get('/project/:projectId', getMilestonesByProject);

// Get milestones by workspace
router.get('/workspace/:workspaceId', getMilestonesByWorkspace);

// Get single milestone
router.get('/:milestoneId', getMilestone);

// Update milestone
router.put('/:milestoneId', updateMilestone);

// Delete milestone
router.delete('/:milestoneId', deleteMilestone);

// Add task to milestone
router.post('/:milestoneId/tasks', addTaskToMilestone);

// Remove task from milestone
router.delete('/:milestoneId/tasks/:taskId', removeTaskFromMilestone);

// Update milestone progress
router.patch('/:milestoneId/progress', updateMilestoneProgress);

export default router;
