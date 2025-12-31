import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { body } from 'express-validator';
import {
  getAllReleases,
  getLatestReleases,
  getReleaseById,
  createRelease,
  updateRelease,
  deleteRelease,
  downloadRelease,
  getReleaseStats
} from '../controllers/desktopReleaseController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/releases');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `release-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow common desktop app file types
  const allowedExtensions = ['.exe', '.dmg', '.pkg', '.deb', '.rpm', '.appimage', '.zip', '.tar.gz'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1GB max file size
  }
});

// Validation rules
const createReleaseValidation = [
  body('version').notEmpty().withMessage('Version is required'),
  body('versionName').notEmpty().withMessage('Version name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('releaseNotes').notEmpty().withMessage('Release notes are required'),
  body('platform').isIn(['windows', 'macos', 'linux']).withMessage('Invalid platform'),
  body('architecture').isIn(['x64', 'arm64', 'universal']).withMessage('Invalid architecture')
];

const updateReleaseValidation = [
  body('versionName').optional().notEmpty().withMessage('Version name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('releaseNotes').optional().notEmpty().withMessage('Release notes cannot be empty')
];

// Public routes
router.get('/', getAllReleases);
router.get('/latest', getLatestReleases);
router.get('/download/:filename', downloadRelease);
router.get('/:id', getReleaseById);

// Admin routes - require authentication
router.post(
  '/',
  authenticate,
  upload.single('file'),
  createReleaseValidation,
  validateRequest,
  createRelease
);

router.put(
  '/:id',
  authenticate,
  updateReleaseValidation,
  validateRequest,
  updateRelease
);

// Create release from URL (no file upload)
router.post(
  '/create-from-url',
  authenticate,
  [
    body('version').notEmpty().withMessage('Version is required'),
    body('versionName').notEmpty().withMessage('Version name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('releaseNotes').notEmpty().withMessage('Release notes are required'),
    body('platform').isIn(['windows', 'macos', 'linux']).withMessage('Invalid platform'),
    body('architecture').isIn(['x64', 'arm64', 'universal']).withMessage('Invalid architecture'),
    body('downloadUrl').isURL().withMessage('Valid download URL is required')
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { version, versionName, description, releaseNotes, platform, architecture, isLatest, downloadUrl } = req.body;
      const authUser = (req as any).user;

      // Import the model
      const DesktopRelease = require('../models/DesktopRelease').default;

      // Extract filename from URL
      const urlParts = downloadUrl.split('/');
      const fileName = urlParts[urlParts.length - 1] || `${platform}-${version}`;

      const release = new DesktopRelease({
        version,
        versionName,
        description,
        releaseNotes,
        platform,
        architecture,
        fileName,
        fileSize: 0, // Unknown for URL-based releases
        downloadUrl,
        isLatest: isLatest || false,
        isActive: true,
        uploadedBy: authUser._id
      });

      await release.save();

      res.status(201).json({
        success: true,
        message: 'Release created successfully from URL',
        data: release
      });
    } catch (error: any) {
      console.error('Create release from URL error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create release from URL'
      });
    }
  }
);

router.delete('/:id', authenticate, deleteRelease);
router.get('/admin/stats', authenticate, getReleaseStats);

export default router;
