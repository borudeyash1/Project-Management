import express from 'express';
import { authenticate } from '../middleware/auth';
import {
    getAllDocs,
    getDocBySlug,
    getAdminDocs,
    createDoc,
    updateDoc,
    deleteDoc,
} from '../controllers/documentationController';

const router = express.Router();

// Public routes
router.get('/', getAllDocs);
router.get('/:slug', getDocBySlug);

// Admin routes (protected)
router.get('/admin/all', authenticate, getAdminDocs);
router.post('/admin/create', authenticate, createDoc);
router.put('/admin/:id', authenticate, updateDoc);
router.delete('/admin/:id', authenticate, deleteDoc);

export default router;
