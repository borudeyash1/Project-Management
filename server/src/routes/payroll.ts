import express from 'express';
import { authenticate } from '@/middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Placeholder routes
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Get payroll - not implemented yet' });
});

export default router;
