import express from 'express';
import { authenticate } from '../middleware/auth';
import * as sartthiController from '../controllers/sartthiController';
import * as notionController from '../controllers/sartthi/notionController';

const router = express.Router();

// Calendar Routes
router.get('/calendar/events', authenticate, sartthiController.getCalendarEvents);

// Mail Routes
router.get('/mail/messages', authenticate, sartthiController.getEmails);
router.post('/mail/send', authenticate, sartthiController.sendEmail);

// Notion Routes
router.post('/notion/search', authenticate, notionController.searchNotion);
router.post('/notion/pages', authenticate, notionController.createNotionPage);
router.patch('/notion/pages/:pageId', authenticate, notionController.updateNotionPage);
router.patch('/notion/blocks/:blockId/children', authenticate, notionController.appendNotionBlocks);
router.post('/notion/databases', authenticate, notionController.createNotionDatabase);
router.get('/notion/databases', authenticate, notionController.listNotionDatabases);
router.post('/notion/set-default-database', authenticate, notionController.setDefaultDatabase);

export default router;
