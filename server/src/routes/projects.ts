import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createProject,
  getWorkspaceProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
  linkProjectToWorkspace,
  createRequest,
  getProjectRequests,
  approveRequest,
  rejectRequest
} from '../controllers/projectController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Project routes
router.post('/', createProject);
router.get('/workspace/:workspaceId', getWorkspaceProjects);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/link-workspace', linkProjectToWorkspace);

// Member management routes
router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);
router.put('/:id/members/:memberId/role', updateMemberRole);

// Request management routes
router.post('/:id/requests', createRequest);
router.get('/:id/requests', getProjectRequests);
router.put('/:id/requests/:requestId/approve', approveRequest);
router.put('/:id/requests/:requestId/reject', rejectRequest);

export default router;
