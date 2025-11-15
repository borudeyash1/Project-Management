import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createWorkspace,
  getUserWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
  updateMemberRole,
  sendWorkspaceCreationOtp,
  verifyWorkspaceCreationOtp
} from '../controllers/workspaceController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Workspace routes
router.get('/', getUserWorkspaces);
router.post('/', createWorkspace);
router.post('/otp', sendWorkspaceCreationOtp);
router.post('/otp/verify', verifyWorkspaceCreationOtp);
router.get('/:id', getWorkspace);
router.put('/:id', updateWorkspace);
router.delete('/:id', deleteWorkspace);

// Member management routes
router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);
router.put('/:id/members/:memberId/role', updateMemberRole);

export default router;
