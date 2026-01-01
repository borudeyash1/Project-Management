import { Request, Response } from 'express';
import crypto from 'crypto';
import { razorpayInstance, RAZORPAY_CONFIG } from '../config/razorpay';
import Subscription from '../models/Subscription';
import PaymentTransaction from '../models/PaymentTransaction';
import PricingPlan from '../models/PricingPlan';
import User from '../models/User';

/**
 * Create Razorpay order for subscription payment
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planKey, billingCycle } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Validate input
    if (!planKey || !billingCycle) {
      res.status(400).json({
        success: false,
        message: 'Plan key and billing cycle are required'
      });
      return;
    }

    // Get pricing plan details
    const pricingPlan = await PricingPlan.findOne({ planKey, isActive: true });
    
    if (!pricingPlan) {
      res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
      return;
    }

    // Calculate amount based on billing cycle
    let amount = typeof pricingPlan.price === 'number' ? pricingPlan.price : 0;
    
    if (billingCycle === 'yearly') {
      amount = Math.round(amount * 12 * 0.9); // 10% discount for yearly
    }

    // Convert to paise (Razorpay uses smallest currency unit)
    const amountInPaise = amount * 100;

    // Create Razorpay order
    const options = {
      amount: amountInPaise,
      currency: RAZORPAY_CONFIG.currency,
      receipt: `${RAZORPAY_CONFIG.receipt_prefix}${Date.now()}`,
      payment_capture: RAZORPAY_CONFIG.payment_capture,
      notes: {
        ...RAZORPAY_CONFIG.notes,
        userId: userId.toString(),
        planKey,
        billingCycle,
        planName: pricingPlan.displayName
      }
    };

    const order = await razorpayInstance.orders.create(options);

    // Create payment transaction record
    const transaction = await PaymentTransaction.create({
      userId,
      amount,
      currency: RAZORPAY_CONFIG.currency,
      status: 'created',
      razorpayOrderId: order.id,
      planKey,
      planName: pricingPlan.displayName,
      billingCycle,
      metadata: {
        orderDetails: order
      }
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: amount,
        amountInPaise: amountInPaise,
        currency: RAZORPAY_CONFIG.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_live_RvlEltzGQKSzF1',
        planName: pricingPlan.displayName,
        planKey,
        billingCycle,
        transactionId: transaction._id
      }
    });

  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planKey,
      billingCycle
    } = req.body;

    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'M8pDGHicbzPEZG1ESYmI5FRu')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      // Update transaction as failed
      await PaymentTransaction.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          status: 'failed',
          errorDescription: 'Invalid payment signature',
          errorReason: 'signature_mismatch'
        }
      );

      res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
      return;
    }

    // Fetch payment details from Razorpay
    const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);

    // Update payment transaction
    const transaction = await PaymentTransaction.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: 'captured',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentMethod: payment.method,
        email: payment.email,
        contact: payment.contact
      },
      { new: true }
    );

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
      return;
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    
    if (billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Get pricing plan
    const pricingPlan = await PricingPlan.findOne({ planKey });

    // Create or update subscription
    const subscription = await Subscription.findOneAndUpdate(
      { userId, status: 'active' },
      {
        userId,
        planKey,
        planName: pricingPlan?.displayName || planKey,
        amount: transaction.amount,
        currency: transaction.currency,
        billingCycle,
        status: 'active',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        startDate,
        endDate,
        nextBillingDate: endDate,
        paymentMethod: payment.method,
        transactionId: String(transaction._id),
        autoRenew: true
      },
      { upsert: true, new: true }
    );

    // Update transaction with subscription ID
    transaction.subscriptionId = subscription._id as any;
    await transaction.save();

    // Update user's subscription plan
    await User.findByIdAndUpdate(userId, {
      subscriptionPlan: planKey,
      subscriptionStatus: 'active',
      subscriptionEndDate: endDate
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        subscription: {
          id: subscription._id,
          planKey: subscription.planKey,
          planName: subscription.planName,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          billingCycle: subscription.billingCycle
        },
        transaction: {
          id: transaction._id,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          paymentMethod: transaction.paymentMethod
        }
      }
    });

  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

/**
 * Get user's active subscription
 */
export const getActiveSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const subscription = await Subscription.findOne({
      userId,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (!subscription) {
      res.status(200).json({
        success: true,
        data: null,
        message: 'No active subscription found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: subscription
    });

  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription',
      error: error.message
    });
  }
};

/**
 * Get user's payment history
 */
export const getPaymentHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(409).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const transactions = await PaymentTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: transactions
    });

  } catch (error: any) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const subscription = await Subscription.findOneAndUpdate(
      { userId, status: 'active' },
      {
        status: 'cancelled',
        autoRenew: false
      },
      { new: true }
    );

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
      return;
    }

    // Update user's subscription status
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: 'cancelled'
    });

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: subscription
    });

  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
};

/**
 * Razorpay webhook handler
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
      return;
    }

    const event = req.body.event;
    const payload = req.body.payload;

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        // Payment was successfully captured
        await PaymentTransaction.findOneAndUpdate(
          { razorpayPaymentId: payload.payment.entity.id },
          { status: 'captured' }
        );
        break;

      case 'payment.failed':
        // Payment failed
        await PaymentTransaction.findOneAndUpdate(
          { razorpayOrderId: payload.payment.entity.order_id },
          {
            status: 'failed',
            errorCode: payload.payment.entity.error_code,
            errorDescription: payload.payment.entity.error_description,
            errorSource: payload.payment.entity.error_source,
            errorStep: payload.payment.entity.error_step,
            errorReason: payload.payment.entity.error_reason
          }
        );
        break;

      case 'refund.created':
        // Refund was created
        await PaymentTransaction.findOneAndUpdate(
          { razorpayPaymentId: payload.refund.entity.payment_id },
          {
            status: 'refunded',
            refundId: payload.refund.entity.id,
            refundAmount: payload.refund.entity.amount / 100,
            refundStatus: payload.refund.entity.status
          }
        );
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
};
