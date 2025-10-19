import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createReminder,
  getReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  toggleReminderCompletion,
  getReminderStats,
  getCalendarEvents
} from '../controllers/reminderController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Reminder routes
router.post('/', createReminder);
router.get('/', getReminders);
router.get('/stats', getReminderStats);
router.get('/calendar', getCalendarEvents);
router.get('/:id', getReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);
router.patch('/:id/toggle', toggleReminderCompletion);

export default router;
