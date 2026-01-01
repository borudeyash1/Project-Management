# Razorpay Payment Gateway Integration Guide

## Overview
This document provides a comprehensive guide for the Razorpay payment gateway integration in the Sartthi Project Management application.

## Live Credentials
- **Key ID**: `rzp_live_RvlEltzGQKSzF1`
- **Key Secret**: `M8pDGHicbzPEZG1ESYmI5FRu`

## Environment Variables

Add the following to your `.env` file in the `server` directory:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_RvlEltzGQKSzF1
RAZORPAY_KEY_SECRET=M8pDGHicbzPEZG1ESYmI5FRu
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

## Features Implemented

### 1. **Payment Order Creation**
- Endpoint: `POST /api/payment/create-order`
- Creates a Razorpay order for subscription payments
- Supports monthly and yearly billing cycles
- Automatic 10% discount for yearly subscriptions

### 2. **Payment Verification**
- Endpoint: `POST /api/payment/verify-payment`
- Verifies payment signature using HMAC SHA256
- Creates/updates subscription records
- Updates user subscription status

### 3. **Subscription Management**
- Endpoint: `GET /api/payment/subscription`
- Retrieves active subscription details
- Endpoint: `POST /api/payment/cancel-subscription`
- Cancels active subscriptions

### 4. **Payment History**
- Endpoint: `GET /api/payment/history`
- Retrieves user's payment transaction history

### 5. **Webhook Handler**
- Endpoint: `POST /api/payment/webhook`
- Handles Razorpay webhook events:
  - `payment.captured`
  - `payment.failed`
  - `refund.created`

## Database Models

### Subscription Model
Tracks user subscriptions with fields:
- Plan details (planKey, planName, amount, billingCycle)
- Razorpay transaction IDs
- Subscription period (startDate, endDate, nextBillingDate)
- Status (active, expired, cancelled, pending)
- Auto-renewal settings

### PaymentTransaction Model
Tracks all payment transactions with:
- Payment details (amount, currency, status)
- Razorpay IDs (orderId, paymentId, signature)
- Error handling fields
- Refund tracking

## Client-Side Integration

### RazorpayPaymentModal Component
A comprehensive payment modal that:
- Loads Razorpay SDK dynamically
- Creates payment orders
- Handles payment verification
- Provides user-friendly error messages
- Shows payment processing states

### Usage in PricingPage
```typescript
import RazorpayPaymentModal from './RazorpayPaymentModal';

// In component
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [selectedPlan, setSelectedPlan] = useState(null);

// Open modal for paid plans
const handleGetStarted = (plan) => {
  if (plan.price > 0) {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  }
};

// Render modal
{showPaymentModal && selectedPlan && (
  <RazorpayPaymentModal
    isOpen={showPaymentModal}
    onClose={() => setShowPaymentModal(false)}
    planKey={selectedPlan.planKey}
    planName={selectedPlan.displayName}
    amount={selectedPlan.price}
    billingCycle={isYearly ? 'yearly' : 'monthly'}
    onSuccess={handlePaymentSuccess}
  />
)}
```

## Security Measures

1. **Signature Verification**: All payments are verified using HMAC SHA256 signature
2. **Webhook Verification**: Webhooks are verified using webhook secret
3. **Authentication**: All payment endpoints (except webhooks) require user authentication
4. **HTTPS**: Production environment uses HTTPS for all transactions
5. **Environment Variables**: Sensitive credentials stored in environment variables

## Testing

### Test Mode
For testing, use Razorpay test credentials:
- Test Key ID: `rzp_test_XXXXXXXXXXXXXXX`
- Test Key Secret: `XXXXXXXXXXXXXXXXXXXXXXX`

### Test Cards
Razorpay provides test cards for different scenarios:
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002

## Webhook Configuration

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payment/webhook`
3. Select events:
   - payment.captured
   - payment.failed
   - refund.created
4. Copy the webhook secret and add to `.env`

## Pricing Plans Integration

The system supports 4 pricing tiers:
1. **Free** - ₹0/month
2. **Pro** - ₹449/month (₹4,851/year with 10% discount)
3. **Premium** - Contact for pricing
4. **Enterprise** - Custom pricing

## Error Handling

The integration includes comprehensive error handling:
- Payment creation failures
- Signature verification failures
- Network errors
- Razorpay SDK loading failures
- Transaction recording failures

## Subscription Lifecycle

1. **Creation**: User selects a plan → Payment modal opens
2. **Payment**: Razorpay checkout → User completes payment
3. **Verification**: Server verifies payment signature
4. **Activation**: Subscription activated, user access granted
5. **Renewal**: Auto-renewal on next billing date (if enabled)
6. **Cancellation**: User can cancel anytime, access until period end

## API Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Deployment Checklist

- [ ] Add Razorpay credentials to production `.env`
- [ ] Configure webhook URL in Razorpay Dashboard
- [ ] Test payment flow in production
- [ ] Verify webhook events are received
- [ ] Monitor payment transactions
- [ ] Set up error alerting
- [ ] Configure refund policies
- [ ] Add terms and conditions
- [ ] Add privacy policy

## Support & Documentation

- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Dashboard: https://dashboard.razorpay.com/
- Support: support@razorpay.com

## Notes

- All amounts are in INR (Indian Rupees)
- Razorpay uses paise (smallest currency unit), so ₹1 = 100 paise
- Yearly subscriptions get 10% discount automatically
- Free plan doesn't require payment
- Contact plans redirect to contact page
