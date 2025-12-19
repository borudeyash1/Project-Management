import express from 'express';
import { authenticate } from '../middleware/auth';
import * as sartthiDataController from '../controllers/sartthiDataController';

const router = express.Router();

// Get recent emails from active mail account
router.get('/mail/recent', authenticate, sartthiDataController.getRecentEmails);

// Get upcoming calendar events from active calendar account
router.get('/calendar/upcoming', authenticate, sartthiDataController.getUpcomingEvents);

// Get vault summary from active vault account
router.get('/vault/summary', authenticate, sartthiDataController.getVaultSummary);

export default router;
