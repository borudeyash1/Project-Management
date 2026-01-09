import mongoose, { Schema, Document } from 'mongoose';

export interface IAIUsage extends Document {
    userId: mongoose.Types.ObjectId;
    date: Date; // Reset monthly (first day of month)
    creditsUsed: number;
    creditsLimit: number;
    transactions: Array<{
        feature: 'chatbot' | 'meeting_summary' | 'smart_decision' | 'report_generation' | 'context_analysis' | 'context_question' | 'context_action';
        creditsDeducted: number;
        timestamp: Date;
        metadata?: {
            cached?: boolean;
            requestId?: string;
            inputSize?: number;
        };
    }>;
    warnings: {
        fiftyPercent: boolean;
        eightyPercent: boolean;
        hundredPercent: boolean;
    };
    createdAt: Date;
    updatedAt: Date;

    // Instance methods
    hasEnoughCredits(requiredCredits: number): boolean;
    getRemainingCredits(): number;
    getUsagePercentage(): number;
}

const AIUsageSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        date: {
            type: Date,
            required: true,
            index: true,
        },
        creditsUsed: {
            type: Number,
            default: 0,
            min: 0,
        },
        creditsLimit: {
            type: Number,
            default: 1200, // $1.20/month
        },
        transactions: [
            {
                feature: {
                    type: String,
                    enum: ['chatbot', 'meeting_summary', 'smart_decision', 'report_generation', 'context_analysis', 'context_question', 'context_action'],
                    required: true,
                },
                creditsDeducted: {
                    type: Number,
                    required: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                metadata: {
                    cached: Boolean,
                    requestId: String,
                    inputSize: Number,
                },
            },
        ],
        warnings: {
            fiftyPercent: {
                type: Boolean,
                default: false,
            },
            eightyPercent: {
                type: Boolean,
                default: false,
            },
            hundredPercent: {
                type: Boolean,
                default: false,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries
AIUsageSchema.index({ userId: 1, date: 1 }, { unique: true });

// Method to check if user has enough credits
AIUsageSchema.methods.hasEnoughCredits = function (requiredCredits: number): boolean {
    return this.creditsUsed + requiredCredits <= this.creditsLimit;
};

// Method to get remaining credits
AIUsageSchema.methods.getRemainingCredits = function (): number {
    return Math.max(0, this.creditsLimit - this.creditsUsed);
};

// Method to get usage percentage
AIUsageSchema.methods.getUsagePercentage = function (): number {
    return (this.creditsUsed / this.creditsLimit) * 100;
};

export default mongoose.model<IAIUsage>('AIUsage', AIUsageSchema);
