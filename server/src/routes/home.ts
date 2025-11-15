import express, { RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import { getDashboardData } from '../controllers/dashboardController';

const router = express.Router();

const authMiddleware = authenticate as unknown as RequestHandler;
const dashboardHandler = getDashboardData as unknown as RequestHandler;

router.get('/dashboard', authMiddleware, dashboardHandler);

export default router;
