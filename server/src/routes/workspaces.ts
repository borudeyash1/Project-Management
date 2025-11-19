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
  verifyWorkspaceCreationOtp,
  discoverWorkspaces,
  sendWorkspaceInvite,
  acceptWorkspaceInvite
} from '../controllers/workspaceController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Workspace routes
router.get('/', getUserWorkspaces);
router.post('/', createWorkspace);
router.post('/otp', sendWorkspaceCreationOtp);
router.post('/otp/verify', verifyWorkspaceCreationOtp);
router.get('/discover', discoverWorkspaces);
router.get('/:id', getWorkspace);
router.put('/:id', updateWorkspace);
router.delete('/:id', deleteWorkspace);

// Member management & invitations
router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);
router.put('/:id/members/:memberId/role', updateMemberRole);
router.post('/:id/invite', sendWorkspaceInvite);
router.post('/:id/accept-invite', acceptWorkspaceInvite);

export default router;
