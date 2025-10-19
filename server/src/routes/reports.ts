import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getReports,
  createReport,
  getReport,
  updateReport,
  deleteReport,
  exportReport,
  getProjectMetrics,
  getTeamPerformance,
  getTimeTrackingData,
  getProductivityStats,
  generateAIReport
} from '../controllers/reportController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Report routes
router.get('/', getReports);
router.post('/', createReport);
router.post('/ai', generateAIReport);
router.get('/:id', getReport);
router.put('/:id', updateReport);
router.delete('/:id', deleteReport);
router.get('/:id/export', exportReport);

// Analytics routes
router.get('/analytics/projects', getProjectMetrics);
router.get('/analytics/team', getTeamPerformance);
router.get('/analytics/time', getTimeTrackingData);
router.get('/analytics/productivity', getProductivityStats);

export default router;
