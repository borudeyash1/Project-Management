import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  startTimer,
  stopTimer,
  pauseTimer,
  resumeTimer,
  getTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getTimeStats,
  getProjectTimeData
} from '../controllers/trackerController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Timer routes
router.post('/start', startTimer);
router.post('/stop', stopTimer);
router.post('/pause', pauseTimer);
router.post('/resume', resumeTimer);

// Time entry routes
router.get('/entries', getTimeEntries);
router.post('/entries', createTimeEntry);
router.put('/entries/:id', updateTimeEntry);
router.delete('/entries/:id', deleteTimeEntry);

// Stats routes
router.get('/stats', getTimeStats);
router.get('/projects/:projectId/time', getProjectTimeData);

export default router;
