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


// Get workspace issues (LIVE from Jira)
export const getWorkspaceIssues = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const userId = (req as any).user._id;

        const config = await getJiraConfig(userId);
        if (!config) {
            return res.status(400).json({ success: false, message: 'Jira not connected' });
        }

        // Fetch "My Tasks" - Assigned to me OR Reported by me
        const jql = 'assignee = currentUser() OR reporter = currentUser() ORDER BY updated DESC';
        console.log(`[JIRA] Fetching LIVE workspace issues with JQL: ${jql}`);

        const searchResult = await jiraService.searchIssues(jql, config);

        // Map to structure compatible with frontend (mix of JiraIssue schema and needed props)
        const issues = searchResult.issues.map((issue: any) => ({
            _id: issue.key, // Use Key as ID for frontend routing/updates
            issueKey: issue.key,
            issueId: issue.id,
            summary: issue.fields?.summary || 'Untitled Issue',
            description: issue.fields?.description || '', // might be complex object, but frontend might expect string?
            // If description is object (ADF), we might need to serialize or just pass it if frontend handles it.
            // Sartthi Task expects string description. Jira returns ADF often.
            // For now, let's try to extract text or leave it.

            status: issue.fields?.status?.name || 'Unknown',
            statusCategory: issue.fields?.status?.statusCategory?.key, // 'new', 'indeterminate', 'done'
            priority: issue.fields?.priority?.name || 'Medium',
            priorityIconUrl: issue.fields?.priority?.iconUrl,

            project: {
                name: issue.fields?.project?.name,
                key: issue.fields?.project?.key,
                avatarUrl: issue.fields?.project?.avatarUrls?.['48x48']
            },

            assignee: issue.fields?.assignee ? {
                name: issue.fields.assignee.displayName,
                avatar: issue.fields.assignee.avatarUrls?.['48x48'],
                email: issue.fields.assignee.emailAddress
            } : null,

            updatedAt: issue.fields?.updated,
            createdAt: issue.fields?.created,
            workspaceId // Pass this back so filtering works if needed
        }));

        console.log(`[JIRA] Returning ${issues.length} LIVE Jira issues`);
        return res.json({ success: true, data: issues });
    } catch (error: any) {
        console.error('Get workspace issues error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// [NEW] Get recent issues for the authenticated user (Global Widget)
export const getRecentIssues = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const config = await getJiraConfig(userId);

        if (!config) {
            return res.status(400).json({ success: false, message: 'Jira not connected' });
        }

        // Fetch "Assigned to Me" issues from Jira directly
        // JQL: assignee = currentUser() ORDER BY updated DESC
        const jql = 'assignee = currentUser() ORDER BY updated DESC';
        const searchResult = await jiraService.searchIssues(jql, config, 20); // Limit to 20

        const issues = searchResult.issues.map((issue: any) => ({
            id: issue.id,
            key: issue.key,
            summary: issue.fields?.summary || 'Untitled Issue',
            status: {
                name: issue.fields?.status?.name || 'Unknown',
                color: issue.fields?.status?.statusCategory?.colorName || 'gray'
            },
            priority: {
                name: issue.fields?.priority?.name || 'Medium',
                iconUrl: issue.fields?.priority?.iconUrl
            },
            updated: issue.fields?.updated || new Date().toISOString(),
            project: {
                name: issue.fields?.project?.name || 'Unknown Project',
                avatarUrl: issue.fields?.project?.avatarUrls?.['48x48']
            },
            type: {
                name: issue.fields?.issuetype?.name || 'Task',
                iconUrl: issue.fields?.issuetype?.iconUrl
            }
        }));

        return res.json({ success: true, data: issues });
    } catch (error: any) {
        console.error('Get recent issues error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


// Update workspace Jira issue (LIVE)
export const updateJiraIssue = async (req: Request, res: Response) => {
    try {
        const { workspaceId, id } = req.params; // id is likely the Issue Key (e.g. SART-12) or ID
        const updates = req.body;
        const authUser = (req as any).user;

        if (!id) {
            return res.status(400).json({ success: false, message: 'Issue key/id required' });
        }

        console.log(`[JIRA] Updating LIVE issue ${id}`, updates);

        const config = await getJiraConfig(authUser._id);
        if (!config) {
            return res.status(400).json({ success: false, message: 'Jira not connected' });
        }

        try {
            // Sync status change to Jira
            if (updates.status) {
                console.log(`[JIRA] Syncing status: ${updates.status}`);
                await jiraService.syncTaskStatusToJira(id, updates.status, config);
            }

            // Sync other field updates to Jira
            const fieldUpdates: any = {};
            if (updates.title) fieldUpdates.title = updates.title;
            if (updates.summary) fieldUpdates.title = updates.summary;
            if (updates.description !== undefined) fieldUpdates.description = updates.description;
            if (updates.priority) fieldUpdates.priority = updates.priority;
            if (updates.dueDate) fieldUpdates.dueDate = updates.dueDate;

            if (Object.keys(fieldUpdates).length > 0) {
                console.log(`[JIRA] Syncing field updates:`, fieldUpdates);
                await jiraService.syncTaskUpdatesToJira(id, fieldUpdates, config);
            }

            console.log(`✅ [JIRA] Live updated Jira issue ${id}`);

            // Return success with echoed data
            return res.json({ success: true, data: { _id: id, ...updates } });

        } catch (syncError: any) {
            console.error(`❌ [JIRA] Failed to sync to Jira API:`, syncError.message);
            return res.status(500).json({ success: false, message: syncError.message });
        }
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
