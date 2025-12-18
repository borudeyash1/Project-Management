import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getReports,
  createReport,
  getProjectAnalytics,
  getTeamAnalytics,
  getTimeAnalytics,
  deleteReport
} from '../controllers/reportController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Report CRUD
router.get('/', getReports);
router.post('/', createReport);
router.delete('/:id', deleteReport);

// Analytics endpoints
router.get('/analytics/projects', getProjectAnalytics);
router.get('/analytics/team', getTeamAnalytics);
router.get('/analytics/time', getTimeAnalytics);

export default router;
