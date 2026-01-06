import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  _id: string;
  userId: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  
  // Plan Details
  planKey: 'free' | 'pro' | 'ultra' | 'premium' | 'enterprise';
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  
  // Amount Details
  amount: number;
  currency: string;
  amountInPaise: number;
  
  // Payment Status
  status: 'created' | 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
  paymentMethod?: string;
  
  // Billing Information (snapshot at time of payment)
  billingInfo: {
    fullName: string;
    email: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    companyName?: string;
    gstNumber?: string;
  };
  
  // Invoice Details
  invoiceNumber?: string;
  invoiceUrl?: string;
  invoiceGenerated: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  refundedAt?: Date;
  
  // Error Information
  errorCode?: string;
  errorDescription?: string;
  
  // Metadata
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    source?: string;
    [key: string]: any;
  };
  
  // Coupon Information
  couponCode?: string;
  discountAmount?: number;
  originalAmount?: number;
  
  // Notes
  notes?: string;
}

const paymentSchema = new Schema<IPayment>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    index: true
  },
  razorpaySignature: {
    type: String
  },
  
  // Plan Details
  planKey: {
    type: String,
    required: true,
    enum: ['free', 'pro', 'ultra', 'premium', 'enterprise']
  },
  planName: {
    type: String,
    required: true
  },
  billingCycle: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly']
  },
  
  // Amount Details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  amountInPaise: {
    type: Number,
    required: true
  },
  
  // Payment Status
  status: {
    type: String,
    required: true,
    enum: ['created', 'pending', 'authorized', 'captured', 'failed', 'refunded'],
    default: 'created',
    index: true
  },
  paymentMethod: {
    type: String
  },
  
  // Billing Information
  billingInfo: {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    companyName: String,
    gstNumber: String
  },
  
  // Invoice Details
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  invoiceUrl: String,
  invoiceGenerated: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  paidAt: Date,
  refundedAt: Date,
  
  // Error Information
  errorCode: String,
  errorDescription: String,
  
  // Metadata
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  
  // Coupon Information
  couponCode: {
    type: String,
    uppercase: true
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  originalAmount: {
    type: Number
  },
  
  // Notes
  notes: String
}, {
  timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ planKey: 1, status: 1 });

// Generate invoice number before saving
paymentSchema.pre('save', async function(next) {
  if (!this.invoiceNumber && this.status === 'captured') {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Count payments this month to generate sequential number
    const count = await mongoose.model('Payment').countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), 1),
        $lt: new Date(year, date.getMonth() + 1, 1)
      }
    });
    
    this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Transform JSON output
paymentSchema.methods.toJSON = function() {
  const paymentObject = this.toObject();
  // Don't expose sensitive Razorpay data in API responses
  delete paymentObject.razorpaySignature;
  return paymentObject;
};

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
