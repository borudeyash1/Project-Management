import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { listAssets, createFolder, deleteAsset, renameAsset, getAssetDetails } from '../services/vaultService';

const router = express.Router();

/**
 * GET /api/vault/root
 * Get contents of the root Vault folder
 */
router.get('/root', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        const assets = await listAssets(userId);

        res.json({
            success: true,
            data: assets
        });
    } catch (error: any) {
        console.error('Vault Root Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vault contents',
            error: error.message
        });
    }
});

/**
 * GET /api/vault/folder/:folderId
 * Get contents of a specific folder
 */
router.get('/folder/:folderId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const folderId = req.params.folderId;

        if (!folderId) {
            res.status(400).json({
                success: false,
                message: 'Folder ID is required'
            });
            return;
        }

        const assets = await listAssets(userId, folderId);

        res.json({
            success: true,
            data: assets
        });
    } catch (error: any) {
        console.error('Vault Folder Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch folder contents',
            error: error.message
        });
    }
});

/**
 * POST /api/vault/folder
 * Create a new folder
 */
router.post('/folder', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { name, parentId } = req.body;

        if (!name) {
            res.status(400).json({
                success: false,
                message: 'Folder name is required'
            });
            return;
        }

        const folder = await createFolder(userId, name, parentId);

        res.json({
            success: true,
            data: folder
        });
    } catch (error: any) {
        console.error('Create Folder Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create folder',
            error: error.message
        });
    }
});

/**
 * DELETE /api/vault/asset/:assetId
 * Delete a file or folder
 */
router.delete('/asset/:assetId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const assetId = req.params.assetId;

        if (!assetId) {
            res.status(400).json({
                success: false,
                message: 'Asset ID is required'
            });
            return;
        }

        await deleteAsset(userId, assetId);

        res.json({
            success: true,
            message: 'Asset deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete Asset Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete asset',
            error: error.message
        });
    }
});

/**
 * PUT /api/vault/asset/:assetId/rename
 * Rename a file or folder
 */
router.put('/asset/:assetId/rename', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const assetId = req.params.assetId;
        const { name } = req.body;

        if (!assetId || !name) {
            res.status(400).json({
                success: false,
                message: 'Asset ID and new name are required'
            });
            return;
        }

        const asset = await renameAsset(userId, assetId, name);

        res.json({
            success: true,
            data: asset
        });
    } catch (error: any) {
        console.error('Rename Asset Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to rename asset',
            error: error.message
        });
    }
});

/**
 * GET /api/vault/asset/:assetId
 * Get details of a specific asset
 */
router.get('/asset/:assetId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const assetId = req.params.assetId;

        if (!assetId) {
            res.status(400).json({
                success: false,
                message: 'Asset ID is required'
            });
            return;
        }

        const asset = await getAssetDetails(userId, assetId);

        res.json({
            success: true,
            data: asset
        });
    } catch (error: any) {
        console.error('Get Asset Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get asset details',
            error: error.message
        });
    }
});

export default router;
