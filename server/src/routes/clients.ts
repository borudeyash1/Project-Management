import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createClient,
  getWorkspaceClients,
  updateClient,
  deleteClient,
  sendClientDeletionOtp,
  deleteClientWithOtp
} from '../controllers/clientController';

const router = express.Router();

router.use(authenticate);

// Workspace-scoped clients
router.get('/workspace/:workspaceId', getWorkspaceClients);
router.post('/', createClient);
router.put('/:id', updateClient);

// Client deletion with OTP
router.post('/:id/deletion-otp', sendClientDeletionOtp);
router.delete('/:id/with-otp', deleteClientWithOtp);

// Legacy delete without OTP (for backward compatibility)
router.delete('/:id', deleteClient);

export default router;
