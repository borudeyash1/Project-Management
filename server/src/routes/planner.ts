import express, { RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import * as taskController from '../controllers/taskController';
import {
  getPlannerEvents,
  createPlannerEvent,
  updatePlannerEvent,
  deletePlannerEvent,
  updateParticipation,
  getAllPlannerData,
  getCalendarViewData,
  getTimelineViewData,
  getKanbanViewData
} from '../controllers/plannerController';

const router = express.Router();

const authMiddleware = authenticate as unknown as RequestHandler;
const getEventsHandler = getPlannerEvents as unknown as RequestHandler;
const createEventHandler = createPlannerEvent as unknown as RequestHandler;
const updateEventHandler = updatePlannerEvent as unknown as RequestHandler;
const deleteEventHandler = deletePlannerEvent as unknown as RequestHandler;
const participationHandler = updateParticipation as unknown as RequestHandler;
const getAllDataHandler = getAllPlannerData as unknown as RequestHandler;
const getCalendarHandler = getCalendarViewData as unknown as RequestHandler;
const getTimelineHandler = getTimelineViewData as unknown as RequestHandler;
const getKanbanHandler = getKanbanViewData as unknown as RequestHandler;

router.use(authMiddleware);

// Event routes
router.get('/events', getEventsHandler);
router.post('/events', createEventHandler);
router.put('/events/:id', updateEventHandler);
router.delete('/events/:id', deleteEventHandler);
router.post('/events/:id/participate', participationHandler);

// Aggregated data routes
router.get('/data', getAllDataHandler);
router.get('/calendar', getCalendarHandler);
router.get('/timeline', getTimelineHandler);
router.get('/kanban', getKanbanHandler);

router.post('/projects/:projectId/sync/notion', authenticate, taskController.syncProjectTasksFromNotion);

export default router;
