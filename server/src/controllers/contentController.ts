import { Response } from 'express';
import ContentBanner from '../models/ContentBanner';
import { AuthenticatedRequest } from '../types';
import path from 'path';
import fs from 'fs';
import { uploadToR2, deleteFromR2, extractR2Key } from '../services/r2ServiceHybrid';

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
        console.log('📋 [CONTENT] Fetching active banners for route:', route);

        if (!route) {
            res.status(400).json({
                success: false,
                message: 'Route parameter is required'
            });
            return;
        }

        const now = new Date();
        console.log('🕐 [CONTENT] Current time:', now);
        console.log('🕐 [CONTENT] Current time ISO:', now.toISOString());

        // First, let's see ALL banners
        const allBanners = await ContentBanner.find({});
        console.log('📊 [CONTENT] Total banners in database:', allBanners.length);
        console.log('📊 [CONTENT] All banners:', JSON.stringify(allBanners, null, 2));

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

        console.log('✅ [CONTENT] Found', banners.length, 'active banners for route:', route);
        console.log('📦 [CONTENT] Banners:', JSON.stringify(banners, null, 2));

        res.status(200).json({
            success: true,
            data: banners
        });
    } catch (error: any) {
        console.error('❌ [CONTENT] Get active banners error:', error);
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
            priority,
            customX,
            customY,
            customWidth
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
            customX,
            customY,
            customWidth,
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
        console.log('🗑️ [CONTENT] Deleting banner:', id);

        const banner = await ContentBanner.findById(id);

        if (!banner) {
            res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
            return;
        }

        // Delete image from storage if it exists
        if (banner.imageUrl) {
            try {
                const r2Key = extractR2Key(banner.imageUrl);
                console.log('🗑️ [CONTENT] Deleting banner image:', r2Key);
                await deleteFromR2(r2Key, 'banners');
            } catch (err) {
                console.warn('⚠️ [CONTENT] Failed to delete banner image:', err);
            }
        }

        await ContentBanner.findByIdAndDelete(id);

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

// Upload banner image (admin only)
export const uploadBannerImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
            return;
        }

        console.log('📤 [CONTENT] Banner image uploaded:', req.file.filename);

        // Read uploaded file from disk
        const fileBuffer = await fs.promises.readFile(req.file.path);

        // Upload to R2 (or fallback to local)
        // Use 'banners' as subfolder
        const r2Key = `banners/${req.file.filename}`;
        const imageUrl = await uploadToR2(fileBuffer, r2Key, req.file.mimetype, 'banners');

        // Delete the temp file from multer
        try {
            await fs.promises.unlink(req.file.path);
            console.log('✅ [CONTENT] Temp file deleted');
        } catch (err) {
            console.warn('⚠️ [CONTENT] Failed to delete temp file:', err);
        }

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: { imageUrl }
        });
    } catch (error: any) {
        console.error('❌ [CONTENT] Upload banner image error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image'
        });
    }
};

