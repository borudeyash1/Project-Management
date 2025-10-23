import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Placeholder routes
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Get tasks - not implemented yet' });
});

router.get('/:id', (req, res) => {
  res.json({ success: true, message: 'Get task - not implemented yet' });
});

router.post('/', (req, res) => {
  res.json({ success: true, message: 'Create task - not implemented yet' });
});

router.put('/:id', (req, res) => {
  res.json({ success: true, message: 'Update task - not implemented yet' });
});

router.delete('/:id', (req, res) => {
  res.json({ success: true, message: 'Delete task - not implemented yet' });
});

export default router;
