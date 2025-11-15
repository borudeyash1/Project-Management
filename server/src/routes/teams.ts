import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTeams,
  createTeam,
  getTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  getTeamStats,
} from '../controllers/teamController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getTeams);
router.post('/', createTeam);
router.get('/:id', getTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

router.post('/:id/members', addTeamMember);
router.put('/:id/members/:memberId', updateTeamMember);
router.delete('/:id/members/:memberId', removeTeamMember);

router.get('/:id/stats', getTeamStats);

export default router;
