# Razorpay Payment Integration Plan

## Overview
This document outlines the complete implementation plan for integrating Razorpay payment gateway into the Sartthi Project Management System for handling subscription payments.

---

## 1. Prerequisites

### Environment Variables Required
Add to `.env` file in the server directory:
```env
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### NPM Packages to Install

**Backend (Server):**
```bash
npm install razorpay crypto
```

**Frontend (Client):**
```bash
npm install @types/razorpay
```

---

## 2. Backend Implementation

### 2.1 Create Razorpay Service (`server/src/services/razorpayService.ts`)

```typescript
import Razorpay from 'razorpay';
import crypto from 'crypto';

class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!
    });
  }

  // Create order
  async createOrder(amount: number, currency: string = 'INR', receipt: string) {
    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt,
      payment_capture: 1
    };
    return await this.razorpay.orders.create(options);
  }

  // Verify payment signature
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    const text = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');
    return expectedSignature === signature;
  }

  // Create subscription
  async createSubscription(planId: string, customerId: string, totalCount: number) {
    const options = {
      plan_id: planId,
      customer_notify: 1,
      total_count: totalCount,
      notes: {
        customer_id: customerId
      }
    };
    return await this.razorpay.subscriptions.create(options);
  }

  // Fetch payment details
  async fetchPayment(paymentId: string) {
    return await this.razorpay.payments.fetch(paymentId);
  }

  // Fetch subscription details
  async fetchSubscription(subscriptionId: string) {
    return await this.razorpay.subscriptions.fetch(subscriptionId);
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string) {
    return await this.razorpay.subscriptions.cancel(subscriptionId);
  }
}

export default new RazorpayService();
```

### 2.2 Create Payment Model (`server/src/models/Payment.ts`)

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  orderId: string;
  paymentId?: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  planType: 'free' | 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  paymentMethod?: string;
  razorpaySignature?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
  orderId: { type: String, required: true, unique: true },
  paymentId: { type: String },
  subscriptionId: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { 
    type: String, 
    enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
    default: 'created'
  },
  planType: { 
    type: String, 
    enum: ['free', 'pro', 'enterprise'],
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  paymentMethod: { type: String },
  razorpaySignature: { type: String },
  metadata: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

export default mongoose.model<IPayment>('Payment', PaymentSchema);
```

### 2.3 Create Subscription Model (`server/src/models/Subscription.ts`)

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  planType: 'free' | 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  razorpaySubscriptionId?: string;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  features: {
    maxProjects: number;
    maxMembers: number;
    storage: number; // in GB
    aiTokens?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
  planType: { 
    type: String, 
    enum: ['free', 'pro', 'enterprise'],
    required: true,
    default: 'free'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'past_due'],
    default: 'active'
  },
  razorpaySubscriptionId: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  autoRenew: { type: Boolean, default: true },
  features: {
    maxProjects: { type: Number, required: true },
    maxMembers: { type: Number, required: true },
    storage: { type: Number, required: true },
    aiTokens: { type: Number }
  }
}, {
  timestamps: true
});

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
```

### 2.4 Create Payment Routes (`server/src/routes/payment.ts`)

```typescript
import express from 'express';
import { auth } from '../middleware/auth';
import razorpayService from '../services/razorpayService';
import Payment from '../models/Payment';
import Subscription from '../models/Subscription';

const router = express.Router();

// Create order for one-time payment
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, planType, billingCycle } = req.body;
    const userId = req.user._id;

    const receipt = `receipt_${Date.now()}`;
    const order = await razorpayService.createOrder(amount, 'INR', receipt);

    // Save payment record
    const payment = new Payment({
      userId,
      orderId: order.id,
      amount,
      currency: 'INR',
      planType,
      billingCycle,
      status: 'created'
    });
    await payment.save();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify payment
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { orderId, paymentId, signature, planType, billingCycle } = req.body;
    const userId = req.user._id;

    // Verify signature
    const isValid = razorpayService.verifyPaymentSignature(orderId, paymentId, signature);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { orderId },
      {
        paymentId,
        razorpaySignature: signature,
        status: 'captured'
      },
      { new: true }
    );

    // Create/Update subscription
    const planFeatures = {
      free: { maxProjects: 1, maxMembers: 5, storage: 1 },
      pro: { maxProjects: 25, maxMembers: 100, storage: 50, aiTokens: 10000 },
      enterprise: { maxProjects: 200, maxMembers: 1000, storage: 500, aiTokens: 100000 }
    };

    const features = planFeatures[planType as keyof typeof planFeatures];
    const duration = billingCycle === 'yearly' ? 365 : 30;

    const subscription = new Subscription({
      userId,
      planType,
      billingCycle,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      features
    });
    await subscription.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      subscription
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user subscription
router.get('/subscription', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active'
    }).sort({ createdAt: -1 });

    res.json({ success: true, subscription });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel subscription
router.post('/cancel-subscription', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'No active subscription found' });
    }

    if (subscription.razorpaySubscriptionId) {
      await razorpayService.cancelSubscription(subscription.razorpaySubscriptionId);
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();

    res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    // Verify webhook signature here
    
    const event = req.body;
    
    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        // Handle successful payment
        break;
      case 'payment.failed':
        // Handle failed payment
        break;
      case 'subscription.charged':
        // Handle subscription renewal
        break;
      case 'subscription.cancelled':
        // Handle subscription cancellation
        break;
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
```

---

## 3. Frontend Implementation

### 3.1 Create Razorpay Hook (`client/src/hooks/useRazorpay.ts`)

```typescript
import { useState } from 'react';
import { apiService } from '../services/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpay = () => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async (
    planType: 'pro' | 'enterprise',
    billingCycle: 'monthly' | 'yearly',
    amount: number
  ) => {
    try {
      setLoading(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order
      const orderResponse = await apiService.post('/payments/create-order', {
        amount,
        planType,
        billingCycle
      });

      if (!orderResponse.success) {
        throw new Error('Failed to create order');
      }

      const { orderId, amount: orderAmount, currency, keyId } = orderResponse;

      // Razorpay options
      const options = {
        key: keyId,
        amount: orderAmount,
        currency,
        name: 'Sartthi',
        description: `${planType.toUpperCase()} Plan - ${billingCycle}`,
        order_id: orderId,
        handler: async (response: any) => {
          // Verify payment
          const verifyResponse = await apiService.post('/payments/verify-payment', {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            planType,
            billingCycle
          });

          if (verifyResponse.success) {
            return { success: true, subscription: verifyResponse.subscription };
          } else {
            throw new Error('Payment verification failed');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#006397'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  return { initiatePayment, loading };
};
```

### 3.2 Update Pricing Page Component

Add payment button integration to the existing `PricingPage.tsx`:

```typescript
import { useRazorpay } from '../hooks/useRazorpay';
import { useApp } from '../context/AppContext';

// Inside component:
const { initiatePayment, loading } = useRazorpay();
const { addToast } = useApp();

const handleSubscribe = async (planType: 'pro' | 'enterprise', billingCycle: 'monthly' | 'yearly') => {
  try {
    const prices = {
      pro: { monthly: 29, yearly: 290 },
      enterprise: { monthly: 99, yearly: 990 }
    };

    const amount = prices[planType][billingCycle];

    await initiatePayment(planType, billingCycle, amount);
    addToast('Subscription activated successfully!', 'success');
  } catch (error: any) {
    addToast(error.message || 'Payment failed', 'error');
  }
};
```

---

## 4. Database Schema Updates

### Update User Model
Add subscription reference to User model:

```typescript
subscription: {
  type: Schema.Types.ObjectId,
  ref: 'Subscription'
}
```

---

## 5. Testing Plan

### 5.1 Test Mode
- Use Razorpay test keys for development
- Test card numbers:
  - Success: 4111 1111 1111 1111
  - Failure: 4111 1111 1111 1112

### 5.2 Test Scenarios
1. ✅ Create order
2. ✅ Successful payment
3. ✅ Failed payment
4. ✅ Payment verification
5. ✅ Subscription creation
6. ✅ Subscription cancellation
7. ✅ Webhook handling

---

## 6. Security Considerations

1. **Never expose Key Secret on frontend**
2. **Always verify payment signature on backend**
3. **Validate webhook signatures**
4. **Use HTTPS in production**
5. **Store sensitive data encrypted**
6. **Implement rate limiting on payment endpoints**

---

## 7. Deployment Checklist

- [ ] Add Razorpay credentials to production `.env`
- [ ] Set up webhook URL in Razorpay dashboard
- [ ] Test payment flow in production
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications for payment events
- [ ] Set up refund policy and process

---

## 8. Next Steps

1. **Provide Razorpay credentials** (Key ID and Key Secret)
2. **Install required packages**
3. **Implement backend services and routes**
4. **Create database models**
5. **Update frontend components**
6. **Test in development mode**
7. **Deploy to production**

---

## Pricing Structure Reference

| Plan | Monthly | Yearly | Features |
|------|---------|--------|----------|
| Free | $0 | $0 | 1 project, 5 members, 1GB storage |
| Pro | $29 | $290 (save $58) | 25 projects, 100 members, 50GB, AI tokens |
| Enterprise | $99 | $990 (save $198) | 200 projects, 1000 members, 500GB, priority support |

---

**Ready to implement once you provide the Razorpay credentials!** 🚀
