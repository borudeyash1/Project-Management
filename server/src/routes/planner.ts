import express, { RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getPlannerEvents,
  createPlannerEvent,
  updatePlannerEvent,
  deletePlannerEvent,
  updateParticipation,
} from '../controllers/plannerController';

const router = express.Router();

const authMiddleware = authenticate as unknown as RequestHandler;
const getEventsHandler = getPlannerEvents as unknown as RequestHandler;
const createEventHandler = createPlannerEvent as unknown as RequestHandler;
const updateEventHandler = updatePlannerEvent as unknown as RequestHandler;
const deleteEventHandler = deletePlannerEvent as unknown as RequestHandler;
const participationHandler = updateParticipation as unknown as RequestHandler;

router.use(authMiddleware);

router.get('/events', getEventsHandler);
router.post('/events', createEventHandler);
router.put('/events/:id', updateEventHandler);
router.delete('/events/:id', deleteEventHandler);
router.post('/events/:id/participate', participationHandler);

export default router;
