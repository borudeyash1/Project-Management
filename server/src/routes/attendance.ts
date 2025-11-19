import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAttendanceConfig,
  updateAttendanceConfig,
  getProjectDayAttendance,
  setProjectDayAttendanceManual,
  markTodayAttendance,
  getMyAttendanceHistory,
  getProjectAttendanceStats,
} from '../controllers/attendanceController';

const router = express.Router();

router.use(authenticate);

// Config
router.get('/project/:projectId/config', getAttendanceConfig);
router.put('/project/:projectId/config', updateAttendanceConfig);

// PM / owner: day-wise view & manual edit (today only)
router.get('/project/:projectId/day/:date', getProjectDayAttendance);
router.post('/project/:projectId/day/:date/manual', setProjectDayAttendanceManual);

// Employee: mark today + history
router.post('/project/:projectId/mark-today', markTodayAttendance);
router.get('/project/:projectId/my-history', getMyAttendanceHistory);

// PM: stats
router.get('/project/:projectId/stats', getProjectAttendanceStats);

export default router;
