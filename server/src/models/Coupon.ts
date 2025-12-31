import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
    name: string;
    note: string;
    code: string;
    durationType: 'count' | 'days';
    usageCount?: number;
    usedCount: number;
    startDate?: Date;
    endDate?: Date;
    status: 'active' | 'paused' | 'inactive';
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minPurchase?: number;
    maxDiscount?: number;
    applicablePlans: string[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CouponSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        note: {
            type: String,
            trim: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        durationType: {
            type: String,
            required: true,
            enum: ['count', 'days'],
            default: 'count',
        },
        usageCount: {
            type: Number,
            min: 0,
        },
        usedCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        status: {
            type: String,
            required: true,
            enum: ['active', 'paused', 'inactive'],
            default: 'inactive',
        },
        discountType: {
            type: String,
            required: true,
            enum: ['percentage', 'fixed'],
            default: 'percentage',
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        minPurchase: {
            type: Number,
            min: 0,
            default: 0,
        },
        maxDiscount: {
            type: Number,
            min: 0,
        },
        applicablePlans: {
            type: [String],
            default: [],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
CouponSchema.index({ code: 1 });
CouponSchema.index({ status: 1 });
CouponSchema.index({ durationType: 1 });

export default mongoose.model<ICoupon>('Coupon', CouponSchema);
