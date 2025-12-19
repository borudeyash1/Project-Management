import express from 'express';
import { authenticate } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

// Get notification settings
router.get('/notifications', authenticate, async (req, res): Promise<void> => {
    try {
        const user = await User.findById((req as any).user._id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.json({
            success: true,
            data: user.settings?.notifications || {
                email: {
                    enabled: true,
                    taskUpdates: true,
                    projectUpdates: true,
                    mentions: true,
                    deadlines: true,
                    weeklyDigest: false
                },
                push: {
                    enabled: true,
                    taskUpdates: true,
                    projectUpdates: true,
                    mentions: true,
                    deadlines: true
                },
                desktop: {
                    enabled: true,
                    sound: true,
                    badges: true
                }
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update notification settings
router.put('/notifications', authenticate, async (req, res): Promise<void> => {
    try {
        const user = await User.findById((req as any).user._id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        if (!user.settings) {
            user.settings = {
                themeColor: 'yellow',
                darkMode: false,
                notifications: {
                    inApp: true,
                    email: true,
                    push: true
                },
                calendar: {
                    syncGoogle: false,
                    syncOutlook: false,
                    defaultView: 'month'
                },
                privacy: {
                    profileVisibility: 'workspace',
                    twoFactorAuth: false
                }
            };
        }

        // Update notification settings
        user.settings.notifications = {
            ...user.settings.notifications,
            ...req.body
        };

        await user.save();

        res.json({
            success: true,
            data: user.settings.notifications
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
