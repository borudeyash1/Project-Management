import Activity from '../models/Activity';
import mongoose from 'mongoose';

// Helper function to create activity
export const createActivity = async (
    userId: mongoose.Types.ObjectId | string,
    type: string,
    title: string,
    description: string,
    relatedModel?: string,
    relatedId?: mongoose.Types.ObjectId | string,
    metadata?: any
): Promise<void> => {
    try {
        await Activity.create({
            user: userId,
            type,
            title,
            description,
            relatedModel,
            relatedId,
            metadata,
        });
    } catch (error) {
        console.error('Error creating activity:', error);
    }
};

// Get user activities
export const getUserActivities = async (
    userId: mongoose.Types.ObjectId | string,
    limit: number = 10
) => {
    try {
        const activities = await Activity.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        return activities;
    } catch (error) {
        console.error('Error fetching activities:', error);
        return [];
    }
};
