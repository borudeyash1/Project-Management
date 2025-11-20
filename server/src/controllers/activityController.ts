import { Request, Response } from 'express';
import Activity from '../models/Activity';
import { ApiResponse } from '../types';

// GET /api/activities - Get all activities for authenticated user
export const getUserActivities = async (req: Request, res: Response): Promise<void> => {
    try {
        const authUser = (req as any).user;
        if (!authUser) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const { limit = 50, type } = req.query;
        const filter: any = { user: authUser._id };

        if (type) {
            filter.type = type;
        }

        const activities = await Activity.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .lean();

        const response: ApiResponse = {
            success: true,
            message: 'Activities fetched successfully',
            data: activities,
        };

        res.status(200).json(response);
    } catch (error: any) {
        console.error('Get activities error:', error);
        res.status(500).json({ success: false, message: 'Internal server error while fetching activities' });
    }
};
