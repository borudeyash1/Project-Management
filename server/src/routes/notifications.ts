import express from 'express';
import { authenticate } from '../middleware/auth';
import { getMyNotifications, markNotificationRead } from '../controllers/notificationController';

const router = express.Router();

router.use(authenticate);

router.get('/', getMyNotifications);
router.patch('/:id/read', markNotificationRead);

export default router;
