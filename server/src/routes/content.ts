import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
    getAllBanners,
    getActiveBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    uploadBannerImage
} from '../controllers/contentController';

const router = express.Router();

// Create uploads/banners directory if it doesn't exist
const bannersDir = path.join(__dirname, '../../uploads/banners');
if (!fs.existsSync(bannersDir)) {
    fs.mkdirSync(bannersDir, { recursive: true });
}

// Configure multer for banner image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, bannersDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `banner-${uniqueSuffix}.png`);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Allow only image files
    const allowedTypes = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB max file size
    }
});

// Public route - get active banners for a specific route
router.get('/banners/active', getActiveBanners);

// Admin routes - accessible from admin panel (admin panel has its own auth)
router.get('/banners', getAllBanners);
router.post('/banners', createBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);

// Banner image upload route
router.post('/banners/upload-image', upload.single('image'), uploadBannerImage);

export default router;

