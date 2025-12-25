import { Request, Response, NextFunction } from 'express';
import aiCreditsService, { AIFeature } from '../services/aiCreditsService';
import mongoose from 'mongoose';

// Extend Request type to include AI credit info
declare global {
    namespace Express {
        interface Request {
            aiCredits?: {
                feature: AIFeature;
                userId: mongoose.Types.ObjectId;
                cached?: boolean;
                cachedResult?: any;
            };
        }
    }
}

/**
 * Middleware to check AI credits before processing request
 * Usage: router.post('/endpoint', protect, checkAICredits('feature_name'), handler)
 */
export const checkAICredits = (feature: AIFeature) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Ensure user is authenticated
            if (!req.user || !(req.user as any)._id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
            }

            const userId = (req.user as any)._id;

            // 1. Check cache first
            const cacheCheck = await aiCreditsService.checkCache(
                userId,
                feature,
                req.body
            );

            if (cacheCheck.cached) {
                console.log(`[AI Credits] Serving cached result for ${feature}`);

                // Log the cached transaction (0 credits)
                await aiCreditsService.deductCredits(userId, feature, {
                    cached: true,
                    requestId: req.headers['x-request-id'] as string,
                });

                // Attach cached result to request
                req.aiCredits = {
                    feature,
                    userId,
                    cached: true,
                    cachedResult: cacheCheck.result,
                };

                return next();
            }

            // 2. Check cool-down period
            const cooldownCheck = await aiCreditsService.checkCooldown(userId, feature);

            if (cooldownCheck.onCooldown) {
                return res.status(429).json({
                    success: false,
                    message: `Please wait ${cooldownCheck.remainingMinutes} minutes before using this feature again`,
                    error: 'COOLDOWN_ACTIVE',
                    remainingMinutes: cooldownCheck.remainingMinutes,
                });
            }

            // 3. Check if user has enough credits
            const creditCheck = await aiCreditsService.checkCredits(userId, feature);

            if (!creditCheck.hasEnough) {
                const stats = await aiCreditsService.getUsageStats(userId);

                return res.status(402).json({
                    success: false,
                    message: 'Insufficient AI credits',
                    error: 'INSUFFICIENT_CREDITS',
                    data: {
                        required: creditCheck.required,
                        remaining: creditCheck.remaining,
                        resetsAt: stats.resetsAt,
                    },
                });
            }

            // 4. Attach credit info to request for later use
            req.aiCredits = {
                feature,
                userId,
                cached: false,
            };

            next();
        } catch (error: any) {
            console.error('[AI Credits Middleware] Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking AI credits',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    };
};

/**
 * Middleware to deduct credits after successful AI request
 * Should be called in the controller after AI processing is complete
 */
export const deductAICredits = async (
    req: Request,
    res: Response,
    result: any
): Promise<{
    success: boolean;
    warning?: string;
    newBalance: number;
}> => {
    if (!req.aiCredits) {
        throw new Error('AI credits not initialized. Use checkAICredits middleware first.');
    }

    const { feature, userId, cached } = req.aiCredits;

    // If cached, credits already logged in checkAICredits
    if (cached) {
        const stats = await aiCreditsService.getUsageStats(userId);
        return {
            success: true,
            newBalance: stats.creditsRemaining,
        };
    }

    // Deduct credits
    const deduction = await aiCreditsService.deductCredits(userId, feature, {
        requestId: req.headers['x-request-id'] as string,
        inputSize: JSON.stringify(req.body).length,
    });

    // Cache the result for future requests
    await aiCreditsService.cacheResult(userId, feature, req.body, result);

    return {
        success: deduction.success,
        warning: deduction.warning,
        newBalance: deduction.newBalance,
    };
};

/**
 * Get cost estimate for a feature (for pre-action warnings)
 */
export const getAICostEstimate = (feature: AIFeature, inputSize?: number) => {
    return aiCreditsService.estimateCost(feature, inputSize);
};
