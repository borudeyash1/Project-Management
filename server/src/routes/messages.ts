import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getWorkspaceMessages,
  getWorkspaceMembers,
  sendWorkspaceMessage,
  markMessageAsRead,
  getConversation
} from '../controllers/messageController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get workspace members for inbox
router.get('/workspace/:workspaceId/members', getWorkspaceMembers);

// Get all messages for user in workspace
router.get('/workspace/:workspaceId', getWorkspaceMessages);

// Get conversation between two users
router.get('/workspace/:workspaceId/conversation/:userId', getConversation);

// Send message to workspace member
router.post('/workspace/:workspaceId', sendWorkspaceMessage);

// Mark message as read
router.patch('/:messageId/read', markMessageAsRead);

export default router;
