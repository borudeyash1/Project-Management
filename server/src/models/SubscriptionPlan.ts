import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  planKey: 'free' | 'pro' | 'ultra';
  displayName: string;
  summary: string;
  monthlyPrice: number;
  yearlyPrice: number;
  limits: {
    maxWorkspaces: number;
    maxProjects: number;
    maxTeamMembers: number;
    storageInGB: number;
  };
  features: {
    aiAccess: boolean;
    adsEnabled: boolean;
    collaboratorAccess: boolean;
    customStorageIntegration: boolean;
    desktopAppAccess: boolean;
    automaticScheduling: boolean;
    realtimeAISuggestions: boolean;
  };
  workspaceFees: {
    personal: number;
    team: number;
    enterprise: number;
  };
  perHeadPrice: number;
  collaboratorsLimit: number;
  order: number;
  couponCodes?: Array<{
    code: string;
    type: 'percentage' | 'flat';
    amount: number;
    maxRedemptions?: number;
    redeemedCount: number;
    expiresAt?: Date;
    isActive: boolean;
    notes?: string;
  }>;
  affiliateLinks?: Array<{
    code: string;
    referralUrl?: string;
    commissionRate: number;
    discountPercentage: number;
    totalReferrals: number;
    isActive: boolean;
    notes?: string;
  }>;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>({
  planKey: {
    type: String,
    enum: ['free', 'pro', 'ultra'],
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  monthlyPrice: {
    type: Number,
    default: 0
  },
  yearlyPrice: {
    type: Number,
    default: 0
  },
  limits: {
    maxWorkspaces: { type: Number, default: 1 },
    maxProjects: { type: Number, default: 3 },
    maxTeamMembers: { type: Number, default: 5 },
    storageInGB: { type: Number, default: 1 }
  },
  features: {
    aiAccess: { type: Boolean, default: false },
    adsEnabled: { type: Boolean, default: true },
    collaboratorAccess: { type: Boolean, default: false },
    customStorageIntegration: { type: Boolean, default: false },
    desktopAppAccess: { type: Boolean, default: false },
    automaticScheduling: { type: Boolean, default: false },
    realtimeAISuggestions: { type: Boolean, default: false }
  },
  workspaceFees: {
    personal: { type: Number, default: 29.99 },
    team: { type: Number, default: 49.99 },
    enterprise: { type: Number, default: 69.99 }
  },
  perHeadPrice: {
    type: Number,
    default: 5
  },
  collaboratorsLimit: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  couponCodes: {
    type: [
      {
        code: { type: String, required: true, uppercase: true },
        type: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
        amount: { type: Number, required: true, min: 0 },
        maxRedemptions: { type: Number },
        redeemedCount: { type: Number, default: 0 },
        expiresAt: { type: Date },
        isActive: { type: Boolean, default: true },
        notes: { type: String, trim: true }
      }
    ],
    default: []
  },
  affiliateLinks: {
    type: [
      {
        code: { type: String, required: true, uppercase: true },
        referralUrl: { type: String, trim: true },
        commissionRate: { type: Number, default: 10, min: 0 },
        discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
        totalReferrals: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        notes: { type: String, trim: true }
      }
    ],
    default: []
  }
}, {
  timestamps: true
});

export default mongoose.model<ISubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);
