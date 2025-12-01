import express from 'express';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/noteController';
import { authenticate as protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', getNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
