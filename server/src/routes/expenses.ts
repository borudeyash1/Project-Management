import express from 'express';
import { authenticate } from '../middleware/auth';
import {
    createExpense,
    getProjectExpenses,
    getWorkspaceExpenses,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense
} from '../controllers/expenseController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Expense routes
router.post('/', createExpense);
router.get('/project/:projectId', getProjectExpenses);
router.get('/workspace/:workspaceId', getWorkspaceExpenses);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);
router.put('/:id/approve', approveExpense);
router.put('/:id/reject', rejectExpense);

export default router;
