import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  planKey: 'free' | 'pro' | 'premium' | 'enterprise';
  planName: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  
  // Razorpay details
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySubscriptionId?: string;
  razorpaySignature?: string;
  
  // Subscription period
  startDate: Date;
  endDate: Date;
  nextBillingDate?: Date;
  
  // Payment details
  paymentMethod?: string;
  transactionId?: string;
  
  // Auto-renewal
  autoRenew: boolean;
  
  // Metadata
  metadata?: {
    discount?: number;
    couponCode?: string;
    originalAmount?: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  planKey: {
    type: String,
    enum: ['free', 'pro', 'premium', 'enterprise'],
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending',
    index: true
  },
  
  // Razorpay details
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySubscriptionId: String,
  razorpaySignature: String,
  
  // Subscription period
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  nextBillingDate: Date,
  
  // Payment details
  paymentMethod: String,
  transactionId: String,
  
  // Auto-renewal
  autoRenew: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  metadata: {
    discount: Number,
    couponCode: String,
    originalAmount: Number
  }
}, {
  timestamps: true
});

// Index for efficient queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
