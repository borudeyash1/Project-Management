import express, { Request, Response } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import {
    listFiles,
    uploadFile,
    downloadFile,
    deleteFile,
    renameFile,
    createFolder,
    getDriveClient
} from '../services/driveService';

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

/**
 * GET /api/vault/files
 * List files in a folder
 */
router.get('/files', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const folderId = req.query.folderId as string | undefined;

        const files = await listFiles(userId, folderId);

        res.json({
            success: true,
            data: files
        });
    } catch (error: any) {
        console.error('List files error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list files',
            error: error.message
        });
    }
});

/**
 * POST /api/vault/upload
 * Upload a file
 */
router.post('/upload', authenticate, upload.single('file'), async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const folderId = req.body.folderId as string | undefined;
        const file = req.file;

        if (!file) {
            res.status(400).json({
                success: false,
                message: 'No file provided'
            });
            return;
        }

        const uploadedFile = await uploadFile(userId, file, folderId);

        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: uploadedFile
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload file',
            error: error.message
        });
    }
});

/**
 * GET /api/vault/download/:fileId
 * Download a file
 */
router.get('/download/:fileId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { fileId } = req.params;

        // Get file metadata first
        const drive = await getDriveClient(userId);
        const metadata = await drive.files.get({
            fileId,
            fields: 'name, mimeType'
        });

        const fileStream = await downloadFile(userId, fileId);

        res.setHeader('Content-Type', metadata.data.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${metadata.data.name}"`);

        fileStream.pipe(res);
    } catch (error: any) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download file',
            error: error.message
        });
    }
});

/**
 * GET /api/vault/view/:fileId
 * View/stream a file (for preview)
 */
router.get('/view/:fileId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { fileId } = req.params;

        // Get file metadata first
        const drive = await getDriveClient(userId);
        const metadata = await drive.files.get({
            fileId,
            fields: 'name, mimeType'
        });

        const fileStream = await downloadFile(userId, fileId);

        res.setHeader('Content-Type', metadata.data.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${metadata.data.name}"`);

        fileStream.pipe(res);
    } catch (error: any) {
        console.error('View error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to view file',
            error: error.message
        });
    }
});

/**
 * DELETE /api/vault/files/:fileId
 * Delete a file
 */
router.delete('/files/:fileId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { fileId } = req.params;

        await deleteFile(userId, fileId);

        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete file',
            error: error.message
        });
    }
});

/**
 * PATCH /api/vault/files/:fileId
 * Rename a file
 */
router.patch('/files/:fileId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { fileId } = req.params;
        const { name } = req.body;

        if (!name) {
            res.status(400).json({
                success: false,
                message: 'New name is required'
            });
            return;
        }

        const updatedFile = await renameFile(userId, fileId, name);

        res.json({
            success: true,
            message: 'File renamed successfully',
            data: updatedFile
        });
    } catch (error: any) {
        console.error('Rename error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to rename file',
            error: error.message
        });
    }
});

/**
 * POST /api/vault/folders
 * Create a new folder
 */
router.post('/folders', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { name, parentFolderId } = req.body;

        if (!name) {
            res.status(400).json({
                success: false,
                message: 'Folder name is required'
            });
            return;
        }

        const folder = await createFolder(userId, name, parentFolderId);

        res.json({
            success: true,
            message: 'Folder created successfully',
            data: folder
        });
    } catch (error: any) {
        console.error('Create folder error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create folder',
            error: error.message
        });
    }
});

export default router;
