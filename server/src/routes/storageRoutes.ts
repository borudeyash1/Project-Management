import express from 'express';
import { authenticate } from '../middleware/auth';
import * as dropboxController from '../controllers/storage/dropboxController';
import multer from 'multer';

const router = express.Router();

// Multer setup for file uploads (memory storage for immediate re-upload)
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to route to correct provider controller
const storageHandler = (method: string) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const { provider } = req.params;

        if (provider === 'dropbox') {
            switch (method) {
                case 'list':
                    dropboxController.listFiles(req, res);
                    break;
                case 'upload':
                    dropboxController.uploadFile(req, res);
                    break;
                case 'delete':
                    dropboxController.deleteFile(req, res);
                    break;
                case 'download':
                    dropboxController.getDownloadLink(req, res);
                    break;
                case 'createFolder':
                    dropboxController.createFolder(req, res);
                    break;
                default:
                    res.status(400).json({ success: false, message: 'Invalid method' });
            }
        } else {
            res.status(400).json({ success: false, message: 'Unsupported provider' });
        }
    };
};

// Routes
router.use(authenticate);

router.post('/:provider/list', storageHandler('list'));
router.post('/:provider/upload', upload.single('file'), storageHandler('upload'));
router.post('/:provider/delete', storageHandler('delete'));
router.post('/:provider/download', storageHandler('download'));
router.post('/:provider/folder', storageHandler('createFolder'));

export default router;
