import AIUsage, { IAIUsage } from '../models/AIUsage';
import AICache from '../models/AICache';
import mongoose from 'mongoose';

/**
 * AI Credit Costs Configuration
 * Based on $1.20/day = 1200 credits
 */
export const AI_CREDIT_COSTS = {
    chatbot: 5,              // ~240 messages/day
    meeting_summary: 100,    // ~12 summaries/day (or 6 hours of meetings at 30min each)
    smart_decision: 50,      // ~24 analyses/day
    report_generation: 30,   // ~40 reports/day
    context_analysis: 15,    // ~80 context analyses/day
    context_question: 10,    // ~120 questions/day
    context_action: 10,      // ~120 action suggestions/day
} as const;

export type AIFeature = keyof typeof AI_CREDIT_COSTS;

/**
 * Cool-down periods (in minutes) to prevent spam
 */
const COOLDOWN_PERIODS = {
    smart_decision: 15,      // Can't re-run task allocation within 15 minutes
    report_generation: 5,    // Can't regenerate same report within 5 minutes
};

/**
 * Cache TTL (in hours)
 */
const CACHE_TTL = {
    meeting_summary: 24,     // Cache meeting summaries for 24 hours
    report_generation: 24,   // Cache reports for 24 hours
    smart_decision: 1,       // Cache smart decisions for 1 hour
};

class AICreditsService {
    /**
     * Get or create today's usage record for a user
     */
    async getTodayUsage(userId: mongoose.Types.ObjectId): Promise<IAIUsage> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let usage = await AIUsage.findOne({ userId, date: today });

        if (!usage) {
            usage = await AIUsage.create({
                userId,
                date: today,
                creditsUsed: 0,
                creditsLimit: 1200,
                transactions: [],
                warnings: {
                    fiftyPercent: false,
                    eightyPercent: false,
                    hundredPercent: false,
                },
            });
        }

        return usage;
    }

    /**
     * Check if user has enough credits for a feature
     */
    async checkCredits(
        userId: mongoose.Types.ObjectId,
        feature: AIFeature
    ): Promise<{
        hasEnough: boolean;
        required: number;
        remaining: number;
        usagePercentage: number;
    }> {
        const usage = await this.getTodayUsage(userId);
        const required = AI_CREDIT_COSTS[feature];
        const remaining = usage.getRemainingCredits();
        const hasEnough = usage.hasEnoughCredits(required);
        const usagePercentage = usage.getUsagePercentage();

        return {
            hasEnough,
            required,
            remaining,
            usagePercentage,
        };
    }

    /**
     * Check if request is cached
     */
    async checkCache(
        userId: mongoose.Types.ObjectId,
        feature: AIFeature,
        input: any
    ): Promise<{ cached: boolean; result?: any }> {
        // Only cache certain features
        if (!['meeting_summary', 'report_generation', 'smart_decision'].includes(feature)) {
            return { cached: false };
        }

        const cachedResult = await AICache.findCached(userId, feature, input);

        if (cachedResult) {
            console.log(`[AI Credits] Cache HIT for ${feature}`);
            return { cached: true, result: cachedResult.result };
        }

        return { cached: false };
    }

    /**
     * Check cool-down period
     */
    async checkCooldown(
        userId: mongoose.Types.ObjectId,
        feature: AIFeature
    ): Promise<{ onCooldown: boolean; remainingMinutes?: number }> {
        const cooldownMinutes = COOLDOWN_PERIODS[feature as keyof typeof COOLDOWN_PERIODS];
        if (!cooldownMinutes) {
            return { onCooldown: false };
        }

        const usage = await this.getTodayUsage(userId);
        const recentTransactions = usage.transactions.filter(
            (t) => t.feature === feature && !t.metadata?.cached
        );

        if (recentTransactions.length === 0) {
            return { onCooldown: false };
        }

        const lastTransaction = recentTransactions[recentTransactions.length - 1];

        if (!lastTransaction) {
            return { onCooldown: false };
        }

        const timeSinceLastUse = Date.now() - lastTransaction.timestamp.getTime();
        const minutesSinceLastUse = timeSinceLastUse / (1000 * 60);

        if (minutesSinceLastUse < cooldownMinutes) {
            const remainingMinutes = Math.ceil(cooldownMinutes - minutesSinceLastUse);
            return { onCooldown: true, remainingMinutes };
        }

        return { onCooldown: false };
    }

    /**
     * Deduct credits and log transaction
     */
    async deductCredits(
        userId: mongoose.Types.ObjectId,
        feature: AIFeature,
        metadata?: {
            cached?: boolean;
            requestId?: string;
            inputSize?: number;
        }
    ): Promise<{
        success: boolean;
        newBalance: number;
        warning?: string;
    }> {
        const usage = await this.getTodayUsage(userId);
        const cost = AI_CREDIT_COSTS[feature];

        // If cached, don't deduct credits
        if (metadata?.cached) {
            usage.transactions.push({
                feature,
                creditsDeducted: 0,
                timestamp: new Date(),
                metadata: { ...metadata, cached: true },
            } as any);
            await usage.save();

            return {
                success: true,
                newBalance: usage.getRemainingCredits(),
            };
        }

        // Check if user has enough credits
        if (!usage.hasEnoughCredits(cost)) {
            return {
                success: false,
                newBalance: usage.getRemainingCredits(),
                warning: 'Insufficient credits',
            };
        }

        // Deduct credits
        usage.creditsUsed += cost;
        usage.transactions.push({
            feature,
            creditsDeducted: cost,
            timestamp: new Date(),
            metadata,
        } as any);

        // Check for warnings
        const usagePercentage = usage.getUsagePercentage();
        let warning: string | undefined;

        if (usagePercentage >= 100 && !usage.warnings.hundredPercent) {
            usage.warnings.hundredPercent = true;
            warning = 'Daily limit reached';
        } else if (usagePercentage >= 80 && !usage.warnings.eightyPercent) {
            usage.warnings.eightyPercent = true;
            warning = 'You are running low on AI capacity for today (80% used)';
        } else if (usagePercentage >= 50 && !usage.warnings.fiftyPercent) {
            usage.warnings.fiftyPercent = true;
            warning = 'You have used 50% of your daily AI capacity';
        }

        await usage.save();

        return {
            success: true,
            newBalance: usage.getRemainingCredits(),
            warning,
        };
    }

    /**
     * Cache AI result
     */
    async cacheResult(
        userId: mongoose.Types.ObjectId,
        feature: AIFeature,
        input: any,
        result: any
    ): Promise<void> {
        const ttl = CACHE_TTL[feature as keyof typeof CACHE_TTL] || 24;
        await AICache.cacheResult(userId, feature, input, result, ttl);
    }

    /**
     * Get usage statistics for a user
     */
    async getUsageStats(userId: mongoose.Types.ObjectId): Promise<{
        creditsUsed: number;
        creditsRemaining: number;
        creditsLimit: number;
        usagePercentage: number;
        resetsAt: Date;
        transactions: Array<{
            feature: string;
            creditsDeducted: number;
            timestamp: Date;
            cached: boolean;
        }>;
    }> {
        const usage = await this.getTodayUsage(userId);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        return {
            creditsUsed: usage.creditsUsed,
            creditsRemaining: usage.getRemainingCredits(),
            creditsLimit: usage.creditsLimit,
            usagePercentage: usage.getUsagePercentage(),
            resetsAt: tomorrow,
            transactions: usage.transactions.map((t) => ({
                feature: t.feature,
                creditsDeducted: t.creditsDeducted,
                timestamp: t.timestamp,
                cached: t.metadata?.cached || false,
            })),
        };
    }

    /**
     * Estimate cost for a feature (for pre-action warnings)
     */
    estimateCost(feature: AIFeature, inputSize?: number): {
        credits: number;
        description: string;
    } {
        const credits = AI_CREDIT_COSTS[feature];
        const descriptions: Record<AIFeature, string> = {
            chatbot: 'AI chat message',
            meeting_summary: 'Meeting transcript analysis',
            smart_decision: 'Smart task allocation analysis',
            report_generation: 'Report generation',
            context_analysis: 'Page context analysis',
            context_question: 'Context-aware question',
            context_action: 'Smart action suggestion',
        };

        return {
            credits,
            description: descriptions[feature],
        };
    }
}

export const aiCreditsService = new AICreditsService();
export default aiCreditsService;
