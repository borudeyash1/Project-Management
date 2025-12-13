import express from 'express';
import { getEmployeePerformanceAnalytics } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get employee performance analytics
router.get('/employee/:employeeId/performance', authenticate, getEmployeePerformanceAnalytics);

export default router;
