import axios from 'axios';

interface JiraConfig {
    baseUrl: string; // e.g., https://your-domain.atlassian.net
    email: string;
    apiToken: string;
}

interface JiraIssueResponse {
    id: string;
    key: string;
    fields: any;
}

interface JiraSearchResponse {
    issues: JiraIssueResponse[];
    total: number;
    maxResults: number;
    startAt: number;
}

class JiraService {
    /**
     * Get Jira issues using JQL (read:jira-work)
     */
    async searchIssues(jql: string, config: JiraConfig, startAt: number = 0, maxResults: number = 50): Promise<JiraSearchResponse> {
        try {
            // Use new Jira search/jql endpoint with minimal payload
            const response = await axios.post(`${config.baseUrl}/rest/api/3/search/jql`, {
                jql
            }, {
                headers: {
                    'Authorization': `Bearer ${config.apiToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                params: {
                    startAt,
                    maxResults,
                    fields: ['summary', 'status', 'priority', 'issuetype', 'project', 'updated', 'created'],
                    expand: ['names', 'renderedFields']
                }
            });

            return response.data;
        } catch (error: any) {
            const status = error.response?.status;
            console.error('Jira searchIssues error:', { status, message: error.message, data: error.response?.data });

            if (status === 401) {
                throw new Error('Invalid Jira credentials. Please reconnect your account.');
            } else if (status === 403) {
                throw new Error('Insufficient permissions to access Jira.');
            } else if (status === 404) {
                throw new Error('Jira project not found.');
            } else if (status === 410) {
                throw new Error('This Jira API endpoint is no longer available. Please update your Jira integration.');
            }
            throw new Error('Failed to fetch Jira issues');
        }
    }

    /**
     * Get single issue by key (read:jira-work)
     */
    async getIssue(issueKey: string, config: JiraConfig): Promise<JiraIssueResponse> {
        try {
            const response = await axios.get(`${config.baseUrl}/rest/api/3/issue/${issueKey}`, {
                headers: {
                    'Authorization': `Bearer ${config.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error: any) {
            console.error('Jira getIssue error:', error.message);
            throw new Error('Failed to fetch Jira issue');
        }
    }

    /**
     * Create new issue (write:jira-work)
     */
    async createIssue(issueData: any, config: JiraConfig): Promise<JiraIssueResponse> {
        try {
            const response = await axios.post(`${config.baseUrl}/rest/api/3/issue`, issueData, {
                headers: {
                    'Authorization': `Bearer ${config.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error: any) {
            console.error('Jira createIssue error:', error.response?.data || error.message);
            throw new Error('Failed to create Jira issue');
        }
    }

    /**
     * Update issue (write:jira-work)
     */
    async updateIssue(issueKey: string, updateData: any, config: JiraConfig): Promise<void> {
        try {
            await axios.put(`${config.baseUrl}/rest/api/3/issue/${issueKey}`, updateData, {
                headers: {
                    'Authorization': `Bearer ${config.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error: any) {
            console.error('Jira updateIssue error:', error.response?.data || error.message);
            throw new Error('Failed to update Jira issue');
        }
    }

    /**
     * Transition issue (write:jira-work)
     */
    async transitionIssue(issueKey: string, transitionId: string, config: JiraConfig): Promise<void> {
        try {
            await axios.post(
                `${config.baseUrl}/rest/api/3/issue/${issueKey}/transitions`,
                {
                    transition: { id: transitionId }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${config.apiToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error: any) {
            console.error('Jira transitionIssue error:', error.response?.data || error.message);
            throw new Error('Failed to transition Jira issue');
        }
    }

    /**
     * Sync task updates to Jira (maps Sartthi fields to Jira fields)
     */
    async syncTaskUpdatesToJira(issueKey: string, taskUpdates: any, config: JiraConfig): Promise<void> {
        try {
            const jiraUpdates: any = {};

            // Map Sartthi fields to Jira fields
            if (taskUpdates.title) {
                jiraUpdates.summary = taskUpdates.title;
            }

            if (taskUpdates.description !== undefined) {
                // Convert plain text to ADF format
                jiraUpdates.description = {
                    type: 'doc',
                    version: 1,
                    content: [{
                        type: 'paragraph',
                        content: [{
                            type: 'text',
                            text: taskUpdates.description || ''
                        }]
                    }]
                };
            }

            if (taskUpdates.priority) {
                // Map Sartthi priority to Jira priority format
                const priorityMap: Record<string, string> = {
                    'low': 'Low',
                    'medium': 'Medium',
                    'high': 'High',
                    'urgent': 'Highest'
                };
                const jiraPriority = priorityMap[taskUpdates.priority.toLowerCase()] || 'Medium';
                jiraUpdates.priority = { name: jiraPriority };
                console.log(`[JIRA SYNC] Mapped priority: ${taskUpdates.priority} → ${jiraPriority}`);
            }

            if (taskUpdates.dueDate) {
                jiraUpdates.duedate = new Date(taskUpdates.dueDate).toISOString().split('T')[0];
            }

            // Only update if there are changes
            if (Object.keys(jiraUpdates).length === 0) {
                return;
            }

            await this.updateIssue(issueKey, { fields: jiraUpdates }, config);
            console.log(`[JIRA SYNC] Updated issue ${issueKey}:`, Object.keys(jiraUpdates));
        } catch (error: any) {
            console.error('[JIRA SYNC] Update error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Sync task status change to Jira (finds and executes appropriate transition)
     */
    async syncTaskStatusToJira(issueKey: string, newStatus: string, config: JiraConfig): Promise<void> {
        try {
            // Get available transitions
            const transitionsRes = await axios.get(
                `${config.baseUrl}/rest/api/3/issue/${issueKey}/transitions`,
                {
                    headers: {
                        'Authorization': `Bearer ${config.apiToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Map Sartthi status to Jira status
            const statusMap: Record<string, string> = {
                'To Do': 'To Do',
                'pending': 'To Do',
                'todo': 'To Do',
                'In Progress': 'In Progress',
                'in-progress': 'In Progress',
                'Done': 'Done',
                'completed': 'Done',
                'done': 'Done'
            };

            const targetStatus = statusMap[newStatus] || newStatus;

            // Find matching transition
            const transition = transitionsRes.data.transitions.find(
                (t: any) => t.to.name === targetStatus
            );

            if (!transition) {
                console.warn(`[JIRA SYNC] No transition found for ${targetStatus}. Available:`,
                    transitionsRes.data.transitions.map((t: any) => t.to.name));
                return;
            }

            // Execute transition
            await this.transitionIssue(issueKey, transition.id, config);
            console.log(`[JIRA SYNC] Transitioned ${issueKey} to ${targetStatus}`);
        } catch (error: any) {
            console.error('[JIRA SYNC] Transition error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get available transitions (read:jira-work)
     */
    async getTransitions(issueKey: string, config: JiraConfig): Promise<any[]> {
        try {
            const response = await axios.get(`${config.baseUrl}/rest/api/3/issue/${issueKey}/transitions`, {
                headers: {
                    'Authorization': `Bearer ${config.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.transitions;
        } catch (error: any) {
            console.error('Jira getTransitions error:', error.message);
            throw new Error('Failed to get transitions');
        }
    }

    /**
     * Add comment to issue (write:jira-work)
     */
    async addComment(issueKey: string, comment: string, config: JiraConfig): Promise<void> {
        try {
            await axios.post(
                `${config.baseUrl}/rest/api/3/issue/${issueKey}/comment`,
                {
                    body: {
                        type: 'doc',
                        version: 1,
                        content: [{
                            type: 'paragraph',
                            content: [{
                                type: 'text',
                                text: comment
                            }]
                        }]
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${config.apiToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error: any) {
            console.error('Jira addComment error:', error.response?.data || error.message);
            throw new Error('Failed to add comment');
        }
    }

    /**
     * Get sprints for a board (read:jira-work)
     */
    async getSprints(boardId: string, config: JiraConfig): Promise<any[]> {
        try {
            const response = await axios.get(`${config.baseUrl}/rest/agile/1.0/board/${boardId}/sprint`, {
                headers: {
                    'Authorization': `Bearer ${config.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.values;
        } catch (error: any) {
            console.error('Jira getSprints error:', error.message);
            throw new Error('Failed to get sprints');
        }
    }

    /**
     * Get projects (read:jira-work)
     */
    async getProjects(config: JiraConfig): Promise<any[]> {
        try {
            const response = await axios.get(`${config.baseUrl}/rest/api/3/project`, {
                headers: {
                    'Authorization': `Bearer ${config.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('[JIRA] Projects response:', JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error: any) {
            console.error('Jira getProjects error:', error.response?.data || error.message);
            throw new Error('Failed to get Jira projects');
        }
    }

    /**
     * Assign issue to user (write:jira-work)
     */
    async assignIssue(issueKey: string, accountId: string, config: JiraConfig): Promise<void> {
        try {
            await axios.put(
                `${config.baseUrl}/rest/api/3/issue/${issueKey}/assignee`,
                { accountId },
                {
                    headers: {
                        'Authorization': `Bearer ${config.apiToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error: any) {
            console.error('Jira assignIssue error:', error.response?.data || error.message);
            throw new Error('Failed to assign issue');
        }
    }

    /**
     * Get current user profile (read:me, read:jira-user)
     */
    async getCurrentUser(config: JiraConfig): Promise<any> {
        try {
            const response = await axios.get(`${config.baseUrl}/rest/api/3/myself`, {
                headers: {
                    'Authorization': `Bearer ${config.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error: any) {
            console.error('Jira getCurrentUser error:', error.message);
            throw new Error('Failed to get current user');
        }
    }

    /**
     * Get user by account ID (read:jira-user)
     */
    async getUser(accountId: string, config: JiraConfig): Promise<any> {
        try {
            const response = await axios.get(`${config.baseUrl}/rest/api/3/user`, {
                headers: {
                    'Authorization': `Bearer ${config.apiToken}`,
                    'Content-Type': 'application/json'
                },
                params: { accountId }
            });

            return response.data;
        } catch (error: any) {
            console.error('Jira getUser error:', error.message);
            throw new Error('Failed to get user');
        }
    }

    /**
     * Add worklog to issue (write:jira-work)
     */
    async addWorklog(issueKey: string, timeSpentSeconds: number, comment: string, config: JiraConfig): Promise<void> {
        try {
            await axios.post(
                `${config.baseUrl}/rest/api/3/issue/${issueKey}/worklog`,
                {
                    timeSpentSeconds,
                    comment
                },
                {
                    headers: {
                        'Authorization': `Bearer ${config.apiToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error: any) {
            console.error('Jira addWorklog error:', error.response?.data || error.message);
            throw new Error('Failed to add worklog');
        }
    }

    /**
     * Get issue worklogs (read:jira-work)
     */
    async getWorklogs(issueKey: string, config: JiraConfig): Promise<any[]> {
        try {
            const response = await axios.get(`${config.baseUrl}/rest/api/3/issue/${issueKey}/worklog`, {
                headers: {
                    'Authorization': `Bearer ${config.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.worklogs || [];
        } catch (error: any) {
            console.error('Jira getWorklogs error:', error.message);
            throw new Error('Failed to get worklogs');
        }
    }

    /**
     * Register webhook (manage:jira-webhook)
     */
    async registerWebhook(webhookData: any, config: JiraConfig): Promise<any> {
        try {
            const response = await axios.post(
                `${config.baseUrl}/rest/api/3/webhook`,
                webhookData,
                {
                    headers: {
                        'Authorization': `Bearer ${config.apiToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Jira registerWebhook error:', error.response?.data || error.message);
            throw new Error('Failed to register webhook');
        }
    }

    /**
     * Get all webhooks (manage:jira-webhook)
     */
    async getWebhooks(config: JiraConfig): Promise<any[]> {
        try {
            const response = await axios.get(`${config.baseUrl}/rest/api/3/webhook`, {
                headers: {
                    'Authorization': `Bearer ${config.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.values || [];
        } catch (error: any) {
            console.error('Jira getWebhooks error:', error.message);
            throw new Error('Failed to get webhooks');
        }
    }

    /**
     * Delete webhook (manage:jira-webhook)
     */
    async deleteWebhook(webhookId: string, config: JiraConfig): Promise<void> {
        try {
            await axios.delete(`${config.baseUrl}/rest/api/3/webhook`, {
                headers: {
                    'Authorization': `Bearer ${config.apiToken}`,
                    'Content-Type': 'application/json'
                },
                params: { webhookId }
            });
        } catch (error: any) {
            console.error('Jira deleteWebhook error:', error.response?.data || error.message);
            throw new Error('Failed to delete webhook');
        }
    }

    /**
     * Sync issue to database
     */
    async syncIssueToDatabase(issueData: JiraIssueResponse, workspaceId: string): Promise<any> {
        const JiraIssue = (await import('../models/JiraIssue')).default;

        try {
            console.log('[JIRA SYNC] Issue data received:', JSON.stringify(issueData, null, 2));

            const fields = issueData.fields;

            if (!fields) {
                console.error('[JIRA SYNC] No fields in issue data:', issueData);
                throw new Error('Invalid issue data: missing fields');
            }

            // Convert ADF (Atlassian Document Format) description to plain text
            let description = '';
            if (fields.description) {
                if (typeof fields.description === 'string') {
                    description = fields.description;
                } else if (typeof fields.description === 'object' && fields.description.content) {
                    // ADF format - extract text from content
                    description = this.extractTextFromADF(fields.description);
                }
            }

            const issueDoc = {
                issueKey: issueData.key,
                issueId: issueData.id,
                summary: fields.summary,
                description,
                status: fields.status?.name || 'Unknown',
                priority: fields.priority?.name || 'Medium',
                issueType: fields.issuetype?.name || 'Task',
                workspaceId,
                jiraProjectKey: fields.project?.key,
                jiraProjectName: fields.project?.name,
                labels: fields.labels || [],
                sprint: fields.sprint?.name,
                storyPoints: fields.customfield_10016, // Story points (may vary)
                components: fields.components?.map((c: any) => c.name) || [],
                fixVersions: fields.fixVersions?.map((v: any) => v.name) || [],
                dueDate: fields.duedate ? new Date(fields.duedate) : undefined,
                resolution: fields.resolution?.name,
                resolutionDate: fields.resolutiondate ? new Date(fields.resolutiondate) : undefined,
                attachments: fields.attachment?.map((a: any) => ({
                    id: a.id,
                    filename: a.filename,
                    url: a.content,
                    mimeType: a.mimeType,
                    size: a.size
                })) || [],
                comments: fields.comment?.comments?.map((c: any) => ({
                    id: c.id,
                    author: c.author.displayName,
                    body: c.body,
                    createdAt: new Date(c.created),
                    updatedAt: new Date(c.updated)
                })) || [],
                lastSyncedAt: new Date()
            };

            const issue = await JiraIssue.findOneAndUpdate(
                { issueKey: issueData.key },
                issueDoc,
                { upsert: true, new: true }
            );

            console.log(`[JIRA SYNC] Issue synced: ${issueData.key}`);
            return issue;
        } catch (error) {
            console.error('[JIRA SYNC] Sync error:', error);
            throw new Error('Failed to sync issue to database');
        }
    }


    /**
     * Extract plain text from Atlassian Document Format (ADF)
     */
    private extractTextFromADF(adf: any): string {
        if (!adf || !adf.content) return '';

        let text = '';
        const extractFromNode = (node: any): void => {
            if (node.type === 'text') {
                text += node.text || '';
            } else if (node.content && Array.isArray(node.content)) {
                node.content.forEach(extractFromNode);
            }
            // Add newline after paragraphs
            if (node.type === 'paragraph') {
                text += '\n';
            }
        };

        adf.content.forEach(extractFromNode);
        return text.trim();
    }
}

export default new JiraService();
