import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getWorkspaceThreads,
  getConversationMessages,
  sendMessage,
  markConversationRead,
  getProjectThreads,
} from '../controllers/inboxController';

const router = express.Router();

router.use(authenticate);

router.get('/workspace/:workspaceId/threads', getWorkspaceThreads);
router.get('/project/:projectId/threads', getProjectThreads);
router.get('/workspace/:workspaceId/messages/:otherUserId', getConversationMessages);
router.post('/workspace/:workspaceId/messages/:otherUserId', sendMessage);
router.post('/workspace/:workspaceId/messages/:otherUserId/read', markConversationRead);

export default router;
