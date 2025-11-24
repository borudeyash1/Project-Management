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
  acceptWorkspaceInvite,
  rejectWorkspaceInvite,
  getSentInvitations,
  getReceivedInvitations,
  cancelWorkspaceInvite,
  sendJoinRequest,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  cancelJoinRequest
} from '../controllers/workspaceController';
import { sendMemberRemovalOtp, validateMemberRemovalOtp } from '../controllers/memberRemovalOtp';

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
router.post('/:id/members/removal-otp', sendMemberRemovalOtp);
router.post('/:id/members/validate-removal-otp', validateMemberRemovalOtp);
router.delete('/:id/members/:memberId', removeMember);
router.put('/:id/members/:memberId/role', updateMemberRole);
router.post('/:id/invite', sendWorkspaceInvite);
router.post('/:id/accept-invite', acceptWorkspaceInvite);
router.post('/:id/reject-invite', rejectWorkspaceInvite);
router.get('/invitations/received', getReceivedInvitations);
router.get('/:id/invitations', getSentInvitations);
router.delete('/:id/invitations/:invitationId', cancelWorkspaceInvite);

// Join request routes
router.post('/:id/join-request', sendJoinRequest);
router.delete('/:id/join-request', cancelJoinRequest);
router.get('/:id/join-requests', getJoinRequests);
router.post('/:id/join-requests/:requestId/approve', approveJoinRequest);
router.post('/:id/join-requests/:requestId/reject', rejectJoinRequest);

export default router;
