import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  
  // Payment details
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  
  // Razorpay details
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  
  // Plan details
  planKey: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  
  // Payment metadata
  paymentMethod?: string;
  email?: string;
  contact?: string;
  
  // Error handling
  errorCode?: string;
  errorDescription?: string;
  errorSource?: string;
  errorStep?: string;
  errorReason?: string;
  
  // Refund details
  refundId?: string;
  refundAmount?: number;
  refundStatus?: string;
  
  // Metadata
  metadata?: any;
  
  createdAt: Date;
  updatedAt: Date;
}

const paymentTransactionSchema = new Schema<IPaymentTransaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  
  // Payment details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
    default: 'created',
    index: true
  },
  
  // Razorpay details
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  // Plan details
  planKey: {
    type: String,
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  
  // Payment metadata
  paymentMethod: String,
  email: String,
  contact: String,
  
  // Error handling
  errorCode: String,
  errorDescription: String,
  errorSource: String,
  errorStep: String,
  errorReason: String,
  
  // Refund details
  refundId: String,
  refundAmount: Number,
  refundStatus: String,
  
  // Metadata
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes for efficient queries
paymentTransactionSchema.index({ razorpayOrderId: 1 });
paymentTransactionSchema.index({ razorpayPaymentId: 1 });
paymentTransactionSchema.index({ userId: 1, status: 1 });
paymentTransactionSchema.index({ createdAt: -1 });

export default mongoose.model<IPaymentTransaction>('PaymentTransaction', paymentTransactionSchema);
