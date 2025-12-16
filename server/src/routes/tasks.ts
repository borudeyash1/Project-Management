import express from 'express';
import { authenticate } from '../middleware/auth';
import { getTasks, getTaskById, createTask, updateTask, deleteTask, reassignTask } from '../controllers/taskController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Task CRUD routes
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.put('/:id/reassign', reassignTask);
router.delete('/:id', deleteTask);

export default router;
