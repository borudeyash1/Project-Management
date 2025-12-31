import express from 'express';
import { authenticate } from '../middleware/auth';
import {
    getAllCoupons,
    createCoupon,
    updateCoupon,
    updateCouponStatus,
    deleteCoupon,
    validateCoupon,
} from '../controllers/couponController';

const router = express.Router();

// Public route for validating coupons during checkout
router.get('/validate/:code', validateCoupon);

// Admin routes (protected)
router.get('/admin/all', authenticate, getAllCoupons);
router.post('/admin/create', authenticate, createCoupon);
router.put('/admin/:id', authenticate, updateCoupon);
router.patch('/admin/:id/status', authenticate, updateCouponStatus);
router.delete('/admin/:id', authenticate, deleteCoupon);

export default router;
