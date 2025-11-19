import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createClient,
  getWorkspaceClients,
  updateClient,
  deleteClient,
} from '../controllers/clientController';

const router = express.Router();

router.use(authenticate);

// Workspace-scoped clients
router.get('/workspace/:workspaceId', getWorkspaceClients);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
