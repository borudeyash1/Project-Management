import express from 'express';
import { authenticate } from '../middleware/auth';
import { getMyNotifications, markNotificationRead, deleteNotification } from '../controllers/notificationController';
import { fixJoinRequestNotifications } from '../controllers/notificationFixController';

const router = express.Router();

router.use(authenticate);

router.get('/', getMyNotifications);
router.put('/:id/read', markNotificationRead);
router.patch('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);
router.post('/fix-join-requests', fixJoinRequestNotifications);

export default router;
