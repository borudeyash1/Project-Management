import express from 'express';
import { protect } from '../middleware/auth';
import aiCreditsService from '../services/aiCreditsService';
import { getAICostEstimate } from '../middleware/aiCredits';

const router = express.Router();

/**
 * @route   GET /api/ai-credits/usage
 * @desc    Get current AI credit usage and statistics
 * @access  Private
 */
router.get('/usage', protect, async (req, res) => {
    try {
        const userId = req.user!._id;
        const stats = await aiCreditsService.getUsageStats(userId);

        return res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error: any) {
        console.error('[AI Credits] Error getting usage:', error);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving AI credit usage',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

/**
 * @route   POST /api/ai-credits/estimate
 * @desc    Get cost estimate for an AI feature
 * @access  Private
 */
router.post('/estimate', protect, async (req, res) => {
    try {
        const { feature, inputSize } = req.body;

        if (!feature) {
            return res.status(400).json({
                success: false,
                message: 'Feature is required',
            });
        }

        const estimate = getAICostEstimate(feature, inputSize);
        const userId = req.user!._id;
        const creditCheck = await aiCreditsService.checkCredits(userId, feature);

        return res.status(200).json({
            success: true,
            data: {
                ...estimate,
                hasEnoughCredits: creditCheck.hasEnough,
                currentBalance: creditCheck.remaining,
            },
        });
    } catch (error: any) {
        console.error('[AI Credits] Error estimating cost:', error);
        return res.status(500).json({
            success: false,
            message: 'Error estimating AI cost',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

/**
 * @route   GET /api/ai-credits/history
 * @desc    Get AI credit transaction history
 * @access  Private
 */
router.get('/history', protect, async (req, res) => {
    try {
        const userId = req.user!._id;
        const stats = await aiCreditsService.getUsageStats(userId);

        return res.status(200).json({
            success: true,
            data: {
                transactions: stats.transactions,
                totalUsed: stats.creditsUsed,
                limit: stats.creditsLimit,
            },
        });
    } catch (error: any) {
        console.error('[AI Credits] Error getting history:', error);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving transaction history',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

export default router;
