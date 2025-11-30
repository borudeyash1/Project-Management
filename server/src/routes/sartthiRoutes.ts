import express from 'express';
import { authenticate } from '../middleware/auth';
import * as sartthiController from '../controllers/sartthiController';

const router = express.Router();

// Calendar Routes
router.get('/calendar/events', authenticate, sartthiController.getCalendarEvents);

// Mail Routes
router.get('/mail/messages', authenticate, sartthiController.getEmails);
router.post('/mail/send', authenticate, sartthiController.sendEmail);

export default router;
