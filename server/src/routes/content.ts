import express from 'express';
import {
    getAllBanners,
    getActiveBanners,
    createBanner,
    updateBanner,
    deleteBanner
} from '../controllers/contentController';

const router = express.Router();

// Public route - get active banners for a specific route
router.get('/banners/active', getActiveBanners);

// Admin routes - accessible from admin panel (admin panel has its own auth)
router.get('/banners', getAllBanners);
router.post('/banners', createBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);

export default router;

