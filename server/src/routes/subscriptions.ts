import express from 'express';
import { getPublicSubscriptionPlans, upgradeSelfSubscription, validateSubscriptionCode } from '../controllers/subscriptionController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', getPublicSubscriptionPlans);
router.post('/validate-code', validateSubscriptionCode);
router.post('/upgrade', authenticate, upgradeSelfSubscription);

export default router;
