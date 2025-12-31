import { Request, Response } from 'express';
import Coupon from '../models/Coupon';
import { ApiResponse } from '../types';

// GET /api/admin/coupons - Get all coupons
export const getAllCoupons = async (req: Request, res: Response): Promise<void> => {
    try {
        const authUser = (req as any).user;
        if (!authUser) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const coupons = await Coupon.find()
            .sort({ createdAt: -1 })
            .populate('createdBy', 'fullName email');

        const response: ApiResponse = {
            success: true,
            message: 'Coupons fetched successfully',
            data: coupons,
        };

        res.status(200).json(response);
    } catch (error: any) {
        console.error('Get coupons error:', error);
        res.status(500).json({ success: false, message: 'Internal server error while fetching coupons' });
    }
};

// POST /api/admin/coupons - Create new coupon
export const createCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const authUser = (req as any).user;
        if (!authUser) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const {
            name,
            note,
            code,
            durationType,
            usageCount,
            startDate,
            endDate,
            status,
            discountType,
            discountValue,
            minPurchase,
            maxDiscount,
            applicablePlans
        } = req.body;

        // Validation
        if (!name || !code || !durationType || !discountType || discountValue === undefined) {
            res.status(400).json({ success: false, message: 'Name, code, duration type, discount type, and discount value are required' });
            return;
        }

        // Validate duration type specific fields
        if (durationType === 'count' && !usageCount) {
            res.status(400).json({ success: false, message: 'Usage count is required for count-based duration' });
            return;
        }

        if (durationType === 'days' && (!startDate || !endDate)) {
            res.status(400).json({ success: false, message: 'Start date and end date are required for date-based duration' });
            return;
        }

        // Check if code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            res.status(400).json({ success: false, message: 'A coupon with this code already exists' });
            return;
        }

        const coupon = new Coupon({
            name,
            note,
            code: code.toUpperCase(),
            durationType,
            usageCount: durationType === 'count' ? usageCount : undefined,
            usedCount: 0,
            startDate: durationType === 'days' ? startDate : undefined,
            endDate: durationType === 'days' ? endDate : undefined,
            status: status || 'inactive',
            discountType,
            discountValue,
            minPurchase: minPurchase || 0,
            maxDiscount,
            applicablePlans: applicablePlans || [],
            createdBy: authUser._id,
        });

        await coupon.save();

        const response: ApiResponse = {
            success: true,
            message: 'Coupon created successfully',
            data: coupon,
        };

        res.status(201).json(response);
    } catch (error: any) {
        console.error('Create coupon error:', error);
        res.status(500).json({ success: false, message: 'Internal server error while creating coupon' });
    }
};

// PUT /api/admin/coupons/:id - Update coupon
export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const authUser = (req as any).user;
        if (!authUser) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const { id } = req.params;
        const {
            name,
            note,
            code,
            durationType,
            usageCount,
            startDate,
            endDate,
            status,
            discountType,
            discountValue,
            minPurchase,
            maxDiscount,
            applicablePlans
        } = req.body;

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            res.status(404).json({ success: false, message: 'Coupon not found' });
            return;
        }

        // If code is being changed, check if new code already exists
        if (code && code.toUpperCase() !== coupon.code) {
            const existingCoupon = await Coupon.findOne({ code: code.toUpperCase(), _id: { $ne: id } });
            if (existingCoupon) {
                res.status(400).json({ success: false, message: 'A coupon with this code already exists' });
                return;
            }
            coupon.code = code.toUpperCase();
        }

        // Update fields
        if (name !== undefined) coupon.name = name;
        if (note !== undefined) coupon.note = note;
        if (durationType !== undefined) {
            coupon.durationType = durationType;
            
            // Clear fields based on duration type
            if (durationType === 'count') {
                coupon.startDate = undefined;
                coupon.endDate = undefined;
                if (usageCount !== undefined) coupon.usageCount = usageCount;
            } else {
                coupon.usageCount = undefined;
                if (startDate !== undefined) coupon.startDate = startDate;
                if (endDate !== undefined) coupon.endDate = endDate;
            }
        }
        if (status !== undefined) coupon.status = status;
        if (discountType !== undefined) coupon.discountType = discountType;
        if (discountValue !== undefined) coupon.discountValue = discountValue;
        if (minPurchase !== undefined) coupon.minPurchase = minPurchase;
        if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
        if (applicablePlans !== undefined) coupon.applicablePlans = applicablePlans;

        await coupon.save();

        const response: ApiResponse = {
            success: true,
            message: 'Coupon updated successfully',
            data: coupon,
        };

        res.status(200).json(response);
    } catch (error: any) {
        console.error('Update coupon error:', error);
        res.status(500).json({ success: false, message: 'Internal server error while updating coupon' });
    }
};

// PATCH /api/admin/coupons/:id/status - Update coupon status (activate/pause/deactivate)
export const updateCouponStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const authUser = (req as any).user;
        if (!authUser) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'paused', 'inactive'].includes(status)) {
            res.status(400).json({ success: false, message: 'Invalid status. Must be active, paused, or inactive' });
            return;
        }

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            res.status(404).json({ success: false, message: 'Coupon not found' });
            return;
        }

        coupon.status = status;
        await coupon.save();

        const response: ApiResponse = {
            success: true,
            message: `Coupon ${status === 'active' ? 'activated' : status === 'paused' ? 'paused' : 'deactivated'} successfully`,
            data: coupon,
        };

        res.status(200).json(response);
    } catch (error: any) {
        console.error('Update coupon status error:', error);
        res.status(500).json({ success: false, message: 'Internal server error while updating coupon status' });
    }
};

// DELETE /api/admin/coupons/:id - Delete coupon
export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const authUser = (req as any).user;
        if (!authUser) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const { id } = req.params;

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            res.status(404).json({ success: false, message: 'Coupon not found' });
            return;
        }

        await coupon.deleteOne();

        const response: ApiResponse = {
            success: true,
            message: 'Coupon deleted successfully',
        };

        res.status(200).json(response);
    } catch (error: any) {
        console.error('Delete coupon error:', error);
        res.status(500).json({ success: false, message: 'Internal server error while deleting coupon' });
    }
};

// GET /api/coupons/validate/:code - Validate coupon (public endpoint for checkout)
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code } = req.params;

        if (!code) {
            res.status(400).json({ success: false, message: 'Coupon code is required' });
            return;
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        
        if (!coupon) {
            res.status(404).json({ success: false, message: 'Invalid coupon code' });
            return;
        }

        // Check if coupon is active
        if (coupon.status !== 'active') {
            res.status(400).json({ success: false, message: 'This coupon is not active' });
            return;
        }

        // Check duration type
        if (coupon.durationType === 'count') {
            // Check usage limit
            if (coupon.usageCount && coupon.usedCount >= coupon.usageCount) {
                res.status(400).json({ success: false, message: 'This coupon has reached its usage limit' });
                return;
            }
        } else if (coupon.durationType === 'days') {
            // Check date range
            const now = new Date();
            if (coupon.startDate && now < coupon.startDate) {
                res.status(400).json({ success: false, message: 'This coupon is not yet valid' });
                return;
            }
            if (coupon.endDate && now > coupon.endDate) {
                res.status(400).json({ success: false, message: 'This coupon has expired' });
                return;
            }
        }

        const response: ApiResponse = {
            success: true,
            message: 'Coupon is valid',
            data: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                minPurchase: coupon.minPurchase,
                maxDiscount: coupon.maxDiscount,
                applicablePlans: coupon.applicablePlans,
            },
        };

        res.status(200).json(response);
    } catch (error: any) {
        console.error('Validate coupon error:', error);
        res.status(500).json({ success: false, message: 'Internal server error while validating coupon' });
    }
};
