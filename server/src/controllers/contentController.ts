import { Response } from 'express';
import ContentBanner from '../models/ContentBanner';
import { AuthenticatedRequest } from '../types';

// Get all banners (admin only)
export const getAllBanners = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        console.log('📋 [CONTENT] Fetching all banners...');
        const banners = await ContentBanner.find().sort({ priority: -1, createdAt: -1 });
        console.log('✅ [CONTENT] Found', banners.length, 'banners');

        res.status(200).json({
            success: true,
            data: banners
        });
    } catch (error: any) {
        console.error('❌ [CONTENT] Get all banners error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch banners'
        });
    }
};

// Get active banners for a specific route (public)
export const getActiveBanners = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { route } = req.query;

        if (!route) {
            res.status(400).json({
                success: false,
                message: 'Route parameter is required'
            });
            return;
        }

        const now = new Date();

        const banners = await ContentBanner.find({
            isActive: true,
            routes: route as string,
            $or: [
                { startDate: null, endDate: null },
                { startDate: { $lte: now }, endDate: null },
                { startDate: null, endDate: { $gte: now } },
                { startDate: { $lte: now }, endDate: { $gte: now } }
            ]
        })
            .sort({ priority: -1, createdAt: -1 })
            .select('-createdBy -__v');

        res.status(200).json({
            success: true,
            data: banners
        });
    } catch (error: any) {
        console.error('Get active banners error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active banners'
        });
    }
};

// Create new banner (admin only)
export const createBanner = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // Use authenticated user ID if available, otherwise use a default admin ID
        // Admin pages have their own authentication system
        const adminId = req.user?._id || '000000000000000000000000';

        const {
            title,
            content,
            type,
            imageUrl,
            backgroundColor,
            textColor,
            height,
            placement,
            routes,
            isActive,
            startDate,
            endDate,
            priority
        } = req.body;

        const banner = await ContentBanner.create({
            title,
            content,
            type,
            imageUrl,
            backgroundColor,
            textColor,
            height,
            placement,
            routes,
            isActive,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            priority,
            createdBy: adminId
        });

        res.status(201).json({
            success: true,
            message: 'Banner created successfully',
            data: banner
        });
    } catch (error: any) {
        console.error('Create banner error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create banner'
        });
    }
};

// Update banner (admin only)
export const updateBanner = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Convert date strings to Date objects if provided
        if (updateData.startDate) {
            updateData.startDate = new Date(updateData.startDate);
        }
        if (updateData.endDate) {
            updateData.endDate = new Date(updateData.endDate);
        }

        const banner = await ContentBanner.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!banner) {
            res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Banner updated successfully',
            data: banner
        });
    } catch (error: any) {
        console.error('Update banner error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update banner'
        });
    }
};

// Delete banner (admin only)
export const deleteBanner = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const banner = await ContentBanner.findByIdAndDelete(id);

        if (!banner) {
            res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Banner deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete banner error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete banner'
        });
    }
};
