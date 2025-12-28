import express from 'express';
import { authenticate } from '../middleware/auth';
import * as jiraController from '../controllers/jiraController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Workspace routes
router.get('/workspace/:workspaceId/issues', jiraController.getWorkspaceIssues);
router.put('/workspace/:workspaceId/issues/:id', jiraController.updateJiraIssue);
router.get('/workspace/:workspaceId/project/:projectId/issues', jiraController.getProjectIssues);
router.post('/workspace/:workspaceId/import', jiraController.importIssues);
router.post('/workspace/:workspaceId/issues', jiraController.createIssue);
router.get('/workspace/:workspaceId/sync', jiraController.syncWorkspace);
router.get('/workspace/:workspaceId/projects', jiraController.getJiraProjects);


// Issue routes
router.put('/issues/:issueKey', jiraController.updateIssue);
router.delete('/issues/:issueKey', jiraController.deleteIssue);
router.post('/issues/:issueKey/transition', jiraController.transitionIssue);
router.get('/issues/:issueKey/transitions', jiraController.getTransitions);
router.post('/issues/:issueKey/comment', jiraController.addComment);
router.post('/issues/:issueKey/link-task/:taskId', jiraController.linkToTask);

export default router;
