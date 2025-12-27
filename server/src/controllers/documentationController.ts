import { Request, Response } from 'express';
import Documentation from '../models/Documentation';
import { ApiResponse } from '../types';

// GET /api/docs - Get all documentation articles (public)
export const getAllDocs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category, published } = req.query;
        const filter: any = {};

        // Only show published docs for public access
        if (published !== 'false') {
            filter.isPublished = true;
        }

        if (category && category !== 'all') {
            filter.category = category;
        }

        const docs = await Documentation.find(filter)
            .sort({ category: 1, order: 1, createdAt: -1 })
            .select('-createdBy');

        const response: ApiResponse = {
            success: true,
            message: 'Documentation fetched successfully',
            data: docs,
        };

        res.status(200).json(response);
    } catch (error: any) {
        console.error('Get documentation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error while fetching documentation' });
    }
};

// GET /api/docs/:slug - Get single documentation by slug (public)
export const getDocBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const { slug } = req.params;

        const doc = await Documentation.findOne({ slug, isPublished: true }).select('-createdBy');

        if (!doc) {
            res.status(404).json({ success: false, message: 'Documentation not found' });
            return;
        }

        const response: ApiResponse = {
            success: true,
            message: 'Documentation fetched successfully',
            data: doc,
        };

        res.status(200).json(response);
    } catch (error: any) {
        console.error('Get documentation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error while fetching documentation' });
    }
};

// GET /api/admin/docs - Get all documentation for admin (including unpublished)
export const getAdminDocs = async (req: Request, res: Response): Promise<void> => {
    try {
        const authUser = (req as any).user;
        if (!authUser) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const { category } = req.query;
        const filter: any = {};

        if (category && category !== 'all') {
            filter.category = category;
        }

        const docs = await Documentation.find(filter)
            .sort({ category: 1, order: 1, createdAt: -1 })
            .populate('createdBy', 'fullName email');

        const response: ApiResponse = {
            success: true,
            message: 'Documentation fetched successfully',
            data: docs,
        };

        res.status(200).json(response);
    } catch (error: any) {
        console.error('Get admin documentation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error while fetching documentation' });
    }
};

// POST /api/admin/docs - Create new documentation (admin only)
export const createDoc = async (req: Request, res: Response): Promise<void> => {
    try {
        const authUser = (req as any).user;
        if (!authUser) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const { title, slug, content, category, subcategory, videoUrl, featuredImage, learnMoreUrl, order, isPublished } = req.body;

        if (!title || !slug || !content || !category) {
            res.status(400).json({ success: false, message: 'Title, slug, content, and category are required' });
            return;
        }

        // Check if slug already exists
        const existingDoc = await Documentation.findOne({ slug });
        if (existingDoc) {
            res.status(400).json({ success: false, message: 'A documentation article with this slug already exists' });
            return;
        }

        const doc = new Documentation({
            title,
            slug: slug.toLowerCase().replace(/\s+/g, '-'),
            content,
            category,
            subcategory,
            videoUrl,
            featuredImage,
            learnMoreUrl,
            order: order || 0,
            isPublished: isPublished || false,
            createdBy: authUser._id,
        });

        await doc.save();

        const response: ApiResponse = {
            success: true,
            message: 'Documentation created successfully',
            data: doc,
        };

        res.status(201).json(response);
    } catch (error: any) {
        console.error('Create documentation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error while creating documentation' });
    }
};

// PUT /api/admin/docs/:id - Update documentation (admin only)
export const updateDoc = async (req: Request, res: Response): Promise<void> => {
    try {
        const authUser = (req as any).user;
        if (!authUser) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const { id } = req.params;
        const { title, slug, content, category, subcategory, videoUrl, featuredImage, learnMoreUrl, order, isPublished } = req.body;

        const doc = await Documentation.findById(id);
        if (!doc) {
            res.status(404).json({ success: false, message: 'Documentation not found' });
            return;
        }

        // If slug is being changed, check if new slug already exists
        if (slug && slug !== doc.slug) {
            const existingDoc = await Documentation.findOne({ slug, _id: { $ne: id } });
            if (existingDoc) {
                res.status(400).json({ success: false, message: 'A documentation article with this slug already exists' });
                return;
            }
            doc.slug = slug.toLowerCase().replace(/\s+/g, '-');
        }

        if (title !== undefined) doc.title = title;
        if (content !== undefined) doc.content = content;
        if (category !== undefined) doc.category = category;
        if (subcategory !== undefined) doc.subcategory = subcategory;
        if (videoUrl !== undefined) doc.videoUrl = videoUrl;
        if (featuredImage !== undefined) doc.featuredImage = featuredImage;
        if (learnMoreUrl !== undefined) doc.learnMoreUrl = learnMoreUrl;
        if (order !== undefined) doc.order = order;
        if (isPublished !== undefined) doc.isPublished = isPublished;

        await doc.save();

        const response: ApiResponse = {
            success: true,
            message: 'Documentation updated successfully',
            data: doc,
        };

        res.status(200).json(response);
    } catch (error: any) {
        console.error('Update documentation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error while updating documentation' });
    }
};

// DELETE /api/admin/docs/:id - Delete documentation (admin only)
export const deleteDoc = async (req: Request, res: Response): Promise<void> => {
    try {
        const authUser = (req as any).user;
        if (!authUser) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const { id } = req.params;

        const doc = await Documentation.findById(id);
        if (!doc) {
            res.status(404).json({ success: false, message: 'Documentation not found' });
            return;
        }

        await doc.deleteOne();

        const response: ApiResponse = {
            success: true,
            message: 'Documentation deleted successfully',
        };

        res.status(200).json(response);
    } catch (error: any) {
        console.error('Delete documentation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error while deleting documentation' });
    }
};
