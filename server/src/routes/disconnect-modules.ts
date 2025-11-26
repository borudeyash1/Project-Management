import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

/**
 * POST /api/auth/sartthi/disconnect-mail
 * Disconnect Mail module
 */
router.post('/disconnect-mail', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Remove mail module data
        if (user.modules && user.modules.mail) {
            user.modules.mail = {
                isEnabled: false,
                refreshToken: undefined,
                connectedAt: undefined
            };
            await user.save();
        }

        res.json({
            success: true,
            message: 'Mail disconnected successfully'
        });
    } catch (error: any) {
        console.error('Disconnect mail error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disconnect mail',
            error: error.message
        });
    }
});

/**
 * POST /api/auth/sartthi/disconnect-calendar
 * Disconnect Calendar module
 */
router.post('/disconnect-calendar', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Remove calendar module data
        if (user.modules && user.modules.calendar) {
            user.modules.calendar = {
                isEnabled: false,
                refreshToken: undefined,
                connectedAt: undefined
            };
            await user.save();
        }

        res.json({
            success: true,
            message: 'Calendar disconnected successfully'
        });
    } catch (error: any) {
        console.error('Disconnect calendar error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disconnect calendar',
            error: error.message
        });
    }
});

/**
 * POST /api/auth/sartthi/disconnect-vault
 * Disconnect Vault module
 */
router.post('/disconnect-vault', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Remove vault module data
        if (user.modules && user.modules.vault) {
            user.modules.vault = {
                isEnabled: false,
                refreshToken: undefined,
                rootFolderId: undefined,
                connectedAt: undefined
            };
            await user.save();
        }

        res.json({
            success: true,
            message: 'Vault disconnected successfully'
        });
    } catch (error: any) {
        console.error('Disconnect vault error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disconnect vault',
            error: error.message
        });
    }
});

export default router;
