import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

export interface IAICache extends Document {
    userId: mongoose.Types.ObjectId;
    feature: 'chatbot' | 'meeting_summary' | 'smart_decision' | 'report_generation';
    requestHash: string; // Hash of the input to detect duplicates
    inputData: any; // Original input for reference
    result: any; // Cached AI response
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Interface for static methods
export interface IAICacheModel extends Model<IAICache> {
    generateHash(input: any): string;
    findCached(
        userId: mongoose.Types.ObjectId,
        feature: string,
        input: any
    ): Promise<IAICache | null>;
    cacheResult(
        userId: mongoose.Types.ObjectId,
        feature: string,
        input: any,
        result: any,
        ttlHours?: number
    ): Promise<IAICache>;
}

const AICacheSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        feature: {
            type: String,
            enum: ['chatbot', 'meeting_summary', 'smart_decision', 'report_generation'],
            required: true,
            index: true,
        },
        requestHash: {
            type: String,
            required: true,
            index: true,
        },
        inputData: {
            type: Schema.Types.Mixed,
            required: true,
        },
        result: {
            type: Schema.Types.Mixed,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient cache lookups
AICacheSchema.index({ userId: 1, feature: 1, requestHash: 1 }, { unique: true });

// TTL index to automatically delete expired cache entries
AICacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to generate hash from input
AICacheSchema.statics.generateHash = function (input: any): string {
    const inputString = typeof input === 'string' ? input : JSON.stringify(input);
    return crypto.createHash('sha256').update(inputString).digest('hex');
};

// Static method to find cached result
AICacheSchema.statics.findCached = async function (
    userId: mongoose.Types.ObjectId,
    feature: string,
    input: any
): Promise<IAICache | null> {
    const hash = (this as any).generateHash(input);
    return await this.findOne({
        userId,
        feature,
        requestHash: hash,
        expiresAt: { $gt: new Date() },
    });
};

// Static method to cache result
AICacheSchema.statics.cacheResult = async function (
    userId: mongoose.Types.ObjectId,
    feature: string,
    input: any,
    result: any,
    ttlHours: number = 24
): Promise<IAICache> {
    const hash = (this as any).generateHash(input);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);

    return await this.findOneAndUpdate(
        { userId, feature, requestHash: hash },
        {
            userId,
            feature,
            requestHash: hash,
            inputData: input,
            result,
            expiresAt,
        },
        { upsert: true, new: true }
    );
};

export default mongoose.model<IAICache, IAICacheModel>('AICache', AICacheSchema);
