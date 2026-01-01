import express from 'express';
import {
  createOrder,
  verifyPayment,
  getActiveSubscription,
  getPaymentHistory,
  cancelSubscription,
  handleWebhook
} from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Protected routes (require authentication)
router.post('/create-order', authenticate, createOrder);
router.post('/verify-payment', authenticate, verifyPayment);
router.get('/subscription', authenticate, getActiveSubscription);
router.get('/history', authenticate, getPaymentHistory);
router.post('/cancel-subscription', authenticate, cancelSubscription);

// Webhook route (no authentication required, verified via signature)
router.post('/webhook', handleWebhook);

export default router;
