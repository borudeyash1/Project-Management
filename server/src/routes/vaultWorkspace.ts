import express from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
    linkVaultToWorkspace,
    unlinkVaultFromWorkspace,
    getWorkspaceDocuments,
    pinDocumentToWorkspace,
    unpinDocumentFromWorkspace,
    uploadDocumentToWorkspace,
    syncWorkspaceVault
} from '../controllers/vaultWorkspaceController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Link/unlink vault folder to workspace
router.post('/link', linkVaultToWorkspace);
router.delete('/unlink/:workspaceId', unlinkVaultFromWorkspace);

// Get workspace documents
router.get('/documents/:workspaceId', getWorkspaceDocuments);

// Pin/unpin documents
router.post('/pin', pinDocumentToWorkspace);
router.post('/unpin', unpinDocumentFromWorkspace);

// Upload document to workspace
router.post('/upload/:workspaceId', upload.single('file'), uploadDocumentToWorkspace);

// Sync workspace vault
router.post('/sync/:workspaceId', syncWorkspaceVault);

export default router;
