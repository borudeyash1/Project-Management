import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  configureWorkspaceAttendance,
  getWorkspaceAttendanceConfig,
  markWorkspaceAttendance,
  getTodayAttendance,
  getMyAttendanceHistory,
  getWorkspaceAttendance
} from '../controllers/workspaceAttendanceController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Configure attendance settings (Owner only)
router.put('/workspace/:workspaceId/configure', configureWorkspaceAttendance);

// Get attendance configuration
router.get('/workspace/:workspaceId/config', getWorkspaceAttendanceConfig);

// Mark attendance for a slot
router.post('/workspace/:workspaceId/mark', markWorkspaceAttendance);

// Get today's attendance for current user
router.get('/workspace/:workspaceId/today', getTodayAttendance);

// Get attendance history for current user
router.get('/workspace/:workspaceId/my-history', getMyAttendanceHistory);

// Get all workspace attendance for a date (Owner only)
router.get('/workspace/:workspaceId/all', getWorkspaceAttendance);

export default router;
