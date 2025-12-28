import { Request, Response } from 'express';
import jiraService from '../services/jiraService';
import JiraIssue from '../models/JiraIssue';
import User from '../models/User';
import axios from 'axios';
import { ConnectedAccount } from '../models/ConnectedAccount';

/**
 * Get Jira config from user's connected accounts
 */
const getJiraConfig = async (userId: string): Promise<{ baseUrl: string; email: string; apiToken: string } | null> => {
    try {
        console.log('[JIRA CONFIG] Fetching user:', userId);
        const user = await User.findById(userId).populate('connectedAccounts.jira.accounts');

        if (!user) {
            console.log('[JIRA CONFIG] User not found');
            return null;
        }

        const jiraAccount = (user?.connectedAccounts as any)?.jira;
        console.log('[JIRA CONFIG] Jira account data:', JSON.stringify(jiraAccount, null, 2));

        if (!jiraAccount?.activeAccountId) {
            console.log('[JIRA CONFIG] No activeAccountId found');
            return null;
        }

        if (!jiraAccount?.accounts?.length) {
            console.log('[JIRA CONFIG] No accounts array found');
            return null;
        }

        const activeAccount = jiraAccount.accounts.find(
            (acc: any) => {
                const match = acc._id.toString() === jiraAccount.activeAccountId.toString();
                console.log(`[JIRA CONFIG] Comparing ${acc._id} with ${jiraAccount.activeAccountId}: ${match}`);
                return match;
            }
        );

        if (!activeAccount) {
            console.log('[JIRA CONFIG] Active account not found in accounts list');
            return null;
        }

        if (!activeAccount?.accessToken) {
            console.log('[JIRA CONFIG] No access token in active account');
            return null;
        }

        // Check if token is expired and refresh if needed
        let accessToken = activeAccount.accessToken;
        const now = new Date();
        const isExpired = activeAccount.expiresAt && activeAccount.expiresAt < now;

        if (isExpired && activeAccount.refreshToken) {
            console.log('[JIRA CONFIG] Access token expired, refreshing...');
            try {
                const refreshResponse = await axios.post('https://auth.atlassian.com/oauth/token', {
                    grant_type: 'refresh_token',
                    client_id: process.env.JIRA_CLIENT_ID,
                    client_secret: process.env.JIRA_CLIENT_SECRET,
                    refresh_token: activeAccount.refreshToken
                });

                const newTokens = refreshResponse.data;
                accessToken = newTokens.access_token;

                // Update the account with new tokens
                await ConnectedAccount.findByIdAndUpdate(activeAccount._id, {
                    $set: {
                        accessToken: newTokens.access_token,
                        refreshToken: newTokens.refresh_token || activeAccount.refreshToken,
                        expiresAt: new Date(Date.now() + (newTokens.expires_in * 1000))
                    }
                });
                console.log('[JIRA CONFIG] Token refreshed successfully');
            } catch (err: any) {
                console.error('[JIRA CONFIG] Error refreshing token:', err.response?.data || err.message);
                return null;
            }
        }

        let cloudId = activeAccount.settings?.jira?.cloudId;

        // Auto-heal: If cloudId is missing, fetch it using the access token and update the DB
        if (!cloudId) {
            console.log('[JIRA CONFIG] Missing cloudId, attempting to fetch from Atlassian...');
            try {
                const resourcesResponse = await axios.get('https://api.atlassian.com/oauth/token/accessible-resources', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                cloudId = resourcesResponse.data[0]?.id;

                if (cloudId) {
                    console.log('[JIRA CONFIG] Retrieved cloudId:', cloudId);

                    // Update the ConnectedAccount in the database with the new cloudId
                    await ConnectedAccount.findByIdAndUpdate(activeAccount._id, {
                        $set: { 'settings.jira.cloudId': cloudId }
                    });
                    console.log('[JIRA CONFIG] Updated ConnectedAccount with new cloudId');
                } else {
                    console.error('[JIRA CONFIG] Failed to retrieve cloudId from Atlassian');
                    return null;
                }
            } catch (err) {
                console.error('[JIRA CONFIG] Error fetching cloudId:', err);
                return null;
            }
        }

        console.log('[JIRA CONFIG] Using Cloud ID:', cloudId);

        return {
            baseUrl: `https://api.atlassian.com/ex/jira/${cloudId}`,
            email: activeAccount.providerEmail || '',
            apiToken: accessToken
        };
    } catch (error) {
        console.error('[JIRA] Error getting config:', error);
        return null;
    }
};

// Get workspace issues
export const getWorkspaceIssues = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const issues = await JiraIssue.find({ workspaceId })
            .populate('assignee', 'name email avatar')
            .populate('reporter', 'name email avatar')
            .populate('projectId', 'name')
            .sort({ updatedAt: -1 });

        console.log(`[JIRA] Returning ${issues.length} Jira issues for workspace ${workspaceId}`);
        console.log('[JIRA] Issue keys:', issues.map(i => i.issueKey).join(', '));

        return res.json({ success: true, data: issues });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update workspace Jira issue
export const updateJiraIssue = async (req: Request, res: Response) => {
    try {
        const { workspaceId, id } = req.params;
        const updates = req.body;
        const authUser = (req as any).user;

        console.log(`[JIRA] Updating issue ${id} in workspace ${workspaceId}`, updates);

        // Find the Jira issue
        const issue = await JiraIssue.findOne({ _id: id, workspaceId });
        if (!issue) {
            return res.status(404).json({ success: false, message: 'Jira issue not found' });
        }

        console.log(`[JIRA] Found issue: ${issue.issueKey}`);
        console.log(`[JIRA] Calling getJiraConfig for user: ${authUser._id}`);

        // Get Jira config using the helper function
        const config = await getJiraConfig(authUser._id);

        console.log(`[JIRA] Config result:`, config ? 'Retrieved successfully' : 'NULL - No config');

        if (config) {
            console.log(`[JIRA] Config details - baseUrl: ${config.baseUrl}, email: ${config.email}, hasToken: ${!!config.apiToken}`);
            console.log(`[JIRA] Config retrieved successfully, syncing to Jira API...`);

            try {
                // Sync status change to Jira
                if (updates.status) {
                    console.log(`[JIRA] Syncing status: ${updates.status}`);
                    await jiraService.syncTaskStatusToJira(issue.issueKey, updates.status, config);
                    console.log(`[JIRA] Status synced successfully`);
                }

                // Sync other field updates to Jira
                const fieldUpdates: any = {};
                // Map title to summary (frontend uses 'title', Jira uses 'summary')
                if (updates.title) fieldUpdates.title = updates.title;
                if (updates.summary) fieldUpdates.title = updates.summary;
                if (updates.description !== undefined) fieldUpdates.description = updates.description;
                if (updates.priority) fieldUpdates.priority = updates.priority;
                if (updates.dueDate) fieldUpdates.dueDate = updates.dueDate;

                if (Object.keys(fieldUpdates).length > 0) {
                    console.log(`[JIRA] Syncing field updates:`, fieldUpdates);
                    await jiraService.syncTaskUpdatesToJira(issue.issueKey, fieldUpdates, config);
                    console.log(`[JIRA] Field updates synced successfully`);
                }

                console.log(`✅ [JIRA] Synced updates to Jira API for ${issue.issueKey}`);
            } catch (syncError: any) {
                console.error(`❌ [JIRA] Failed to sync to Jira API:`, syncError.message);
                // Continue to update local database even if Jira sync fails
            }
        } else {
            console.warn(`[JIRA] Could not retrieve Jira config - user may not have Jira connected`);
        }

        // Update local JiraIssue document
        // Map title to summary for local storage
        if (updates.title !== undefined) issue.summary = updates.title;
        if (updates.summary !== undefined) issue.summary = updates.summary;
        if (updates.description !== undefined) issue.description = updates.description;
        if (updates.status !== undefined) issue.status = updates.status;
        if (updates.priority !== undefined) issue.priority = updates.priority;
        if (updates.dueDate !== undefined) issue.dueDate = updates.dueDate;

        issue.lastSyncedAt = new Date();
        await issue.save();

        console.log(`✅ [JIRA] Updated local JiraIssue document for ${issue.issueKey}`);

        return res.json({ success: true, data: issue });
    } catch (error: any) {
        console.error('[JIRA] Update error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


// Get project issues
export const getProjectIssues = async (req: Request, res: Response) => {
    try {
        const { workspaceId, projectId } = req.params;
        const issues = await JiraIssue.find({ workspaceId, projectId })
            .populate('assignee', 'name email avatar')
            .populate('reporter', 'name email avatar')
            .sort({ updatedAt: -1 });
        return res.json({ success: true, data: issues });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Import issues from Jira
export const importIssues = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const { jql, projectKey } = req.body;
        const userId = (req as any).user._id;

        if (!workspaceId) {
            return res.status(400).json({ success: false, message: 'Workspace ID required' });
        }

        const config = await getJiraConfig(userId);
        if (!config) {
            return res.status(400).json({ success: false, message: 'Jira not connected' });
        }

        const finalJql = jql || `project = ${projectKey} ORDER BY created DESC`;
        const searchResult = await jiraService.searchIssues(finalJql, config);

        const syncedIssues = [];
        for (const issue of searchResult.issues) {
            // New API only returns IDs, fetch full details
            let fullIssue = issue;
            if (!issue.fields && issue.id) {
                console.log(`[JIRA IMPORT] Fetching full details for issue ${issue.id}`);
                fullIssue = await jiraService.getIssue(issue.id, config);
            }

            const synced = await jiraService.syncIssueToDatabase(fullIssue, workspaceId);
            syncedIssues.push(synced);
        }

        return res.json({ success: true, data: syncedIssues, total: searchResult.total });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Create issue
export const createIssue = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const { projectKey, summary, description, issueType, priority } = req.body;
        const userId = (req as any).user._id;

        if (!workspaceId) {
            return res.status(400).json({ success: false, message: 'Workspace ID required' });
        }

        const config = await getJiraConfig(userId);
        if (!config) {
            return res.status(400).json({ success: false, message: 'Jira not connected' });
        }

        const issueData = {
            fields: {
                project: { key: projectKey },
                summary,
                description: { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: description || '' }] }] },
                issuetype: { name: issueType || 'Task' },
                priority: { name: priority || 'Medium' }
            }
        };

        const created = await jiraService.createIssue(issueData, config);
        const fullIssue = await jiraService.getIssue(created.key, config);
        const synced = await jiraService.syncIssueToDatabase(fullIssue, workspaceId);

        return res.json({ success: true, data: synced });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update issue
export const updateIssue = async (req: Request, res: Response) => {
    try {
        const { issueKey } = req.params;
        const updateData = req.body;
        const userId = (req as any).user._id;

        if (!issueKey) {
            return res.status(400).json({ success: false, message: 'Issue key required' });
        }

        const config = await getJiraConfig(userId);
        if (!config) {
            return res.status(400).json({ success: false, message: 'Jira not connected' });
        }

        await jiraService.updateIssue(issueKey, { fields: updateData }, config);
        const updated = await jiraService.getIssue(issueKey, config);
        const issue = await JiraIssue.findOne({ issueKey });

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found in database' });
        }

        const synced = await jiraService.syncIssueToDatabase(updated, issue.workspaceId.toString());
        return res.json({ success: true, data: synced });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Transition issue
export const transitionIssue = async (req: Request, res: Response) => {
    try {
        const { issueKey } = req.params;
        const { transitionId } = req.body;
        const userId = (req as any).user._id;

        if (!issueKey) {
            return res.status(400).json({ success: false, message: 'Issue key required' });
        }

        const config = await getJiraConfig(userId);
        if (!config) {
            return res.status(400).json({ success: false, message: 'Jira not connected' });
        }

        await jiraService.transitionIssue(issueKey, transitionId, config);
        const updated = await jiraService.getIssue(issueKey, config);
        const issue = await JiraIssue.findOne({ issueKey });

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found in database' });
        }

        const synced = await jiraService.syncIssueToDatabase(updated, issue.workspaceId.toString());
        return res.json({ success: true, data: synced });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get transitions
export const getTransitions = async (req: Request, res: Response) => {
    try {
        const { issueKey } = req.params;
        const userId = (req as any).user._id;

        if (!issueKey) {
            return res.status(400).json({ success: false, message: 'Issue key required' });
        }

        const config = await getJiraConfig(userId);
        if (!config) {
            return res.status(400).json({ success: false, message: 'Jira not connected' });
        }

        const transitions = await jiraService.getTransitions(issueKey, config);
        return res.json({ success: true, data: transitions });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Add comment
export const addComment = async (req: Request, res: Response) => {
    try {
        const { issueKey } = req.params;
        const { comment } = req.body;
        const userId = (req as any).user._id;

        if (!issueKey) {
            return res.status(400).json({ success: false, message: 'Issue key required' });
        }

        const config = await getJiraConfig(userId);
        if (!config) {
            return res.status(400).json({ success: false, message: 'Jira not connected' });
        }

        await jiraService.addComment(issueKey, comment, config);
        const updated = await jiraService.getIssue(issueKey, config);
        const issue = await JiraIssue.findOne({ issueKey });

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found in database' });
        }

        const synced = await jiraService.syncIssueToDatabase(updated, issue.workspaceId.toString());
        return res.json({ success: true, data: synced });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Link to task
export const linkToTask = async (req: Request, res: Response) => {
    try {
        const { issueKey, taskId } = req.params;
        const issue = await JiraIssue.findOne({ issueKey });

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        if (!issue.linkedTasks.includes(taskId as any)) {
            issue.linkedTasks.push(taskId as any);
            await issue.save();
        }

        return res.json({ success: true, data: issue });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get Jira projects
export const getJiraProjects = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        const config = await getJiraConfig(userId);
        if (!config) {
            return res.status(400).json({ success: false, message: 'Jira not connected' });
        }

        const projects = await jiraService.getProjects(config);

        // Prevent caching
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        return res.json({ success: true, data: projects });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Sync workspace
export const syncWorkspace = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const userId = (req as any).user._id;

        if (!workspaceId) {
            return res.status(400).json({ success: false, message: 'Workspace ID required' });
        }

        const config = await getJiraConfig(userId);
        if (!config) {
            return res.status(400).json({ success: false, message: 'Jira not connected' });
        }

        const existingIssues = await JiraIssue.find({ workspaceId });
        if (existingIssues.length === 0) {
            return res.json({ success: true, data: [], message: 'No issues to sync' });
        }

        const syncedIssues = [];
        for (const existingIssue of existingIssues) {
            try {
                const issue = await jiraService.getIssue(existingIssue.issueKey, config);
                const synced = await jiraService.syncIssueToDatabase(issue, workspaceId);
                syncedIssues.push(synced);
            } catch (error) {
                console.error(`Failed to sync ${existingIssue.issueKey}:`, error);
            }
        }

        return res.json({ success: true, data: syncedIssues });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Delete issue
export const deleteIssue = async (req: Request, res: Response) => {
    try {
        const { issueKey } = req.params;
        await JiraIssue.findOneAndDelete({ issueKey });
        return res.json({ success: true, message: 'Issue removed from database' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
