import mongoose, { Schema, Document } from 'mongoose';

interface PricingFeature {
  text: string;
  included: boolean;
  integrations?: Array<{
    icon: string;
    name: string;
  }>;
}

export interface IPricingPlan extends Document {
  planKey: 'free' | 'pro' | 'premium' | 'enterprise';
  displayName: string;
  price: number | string;
  description: string;
  recommended: boolean;
  features: PricingFeature[];
  buttonText: string;
  buttonStyle: 'solid' | 'outline';
  contactLink?: boolean;
  order: number;
  isActive: boolean;
  paymentEnabled: boolean; // Enable/disable payment processing for this plan
}

const pricingPlanSchema = new Schema<IPricingPlan>({
  planKey: {
    type: String,
    enum: ['free', 'pro', 'premium', 'enterprise'],
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  price: {
    type: Schema.Types.Mixed, // Can be number or string
    required: true
  },
  description: {
    type: String,
    required: true
  },
  recommended: {
    type: Boolean,
    default: false
  },
  features: [{
    text: { type: String, required: true },
    included: { type: Boolean, default: true },
    integrations: [{
      icon: String,
      name: String
    }]
  }],
  buttonText: {
    type: String,
    required: true
  },
  buttonStyle: {
    type: String,
    enum: ['solid', 'outline'],
    default: 'outline'
  },
  contactLink: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  paymentEnabled: {
    type: Boolean,
    default: true // Payment enabled by default for all plans
  }
}, {
  timestamps: true
});

export default mongoose.model<IPricingPlan>('PricingPlan', pricingPlanSchema);
