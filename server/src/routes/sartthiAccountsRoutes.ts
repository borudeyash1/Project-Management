import express from 'express';
import { authenticate } from '../middleware/auth';
import * as sartthiAccountsController from '../controllers/sartthiAccountsController';
import { syncExistingAccounts } from '../controllers/syncAccountsController';

const router = express.Router();

// Sync existing connected accounts with modules field (migration endpoint)
router.post('/sync', authenticate, syncExistingAccounts);

// Get all connected accounts for a service
router.get('/:service', authenticate, sartthiAccountsController.getAccounts);

// Initiate OAuth connection for new account
router.post('/:service/connect', authenticate, sartthiAccountsController.initiateConnection);

// OAuth callback handler
router.get('/:service/callback', sartthiAccountsController.handleCallback);

// Set active account for a service
router.put('/:service/active', authenticate, sartthiAccountsController.setActiveAccount);

// Disconnect/remove an account
router.delete('/:service/:accountId', authenticate, sartthiAccountsController.disconnectAccount);

// Refresh OAuth tokens for an account
router.post('/:service/:accountId/refresh', authenticate, sartthiAccountsController.refreshTokens);

export default router;
