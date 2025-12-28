import axios from 'axios';
import User from '../models/User';
import JiraIssue from '../models/JiraIssue';
import { ConnectedAccount } from '../models/ConnectedAccount';

/**
 * Jira Polling Service
 * Periodically syncs Jira issues to keep Sartthi up-to-date with changes made in Jira
 */
class JiraPollerService {
    private pollingInterval: NodeJS.Timeout | null = null;
    private readonly POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

    /**
     * Start polling for all users with Jira connected
     */
    start() {
        console.log('🔄 [JIRA POLLER] Starting Jira polling service...');

        // Run immediately on start
        this.pollAllUsers();

        // Then run every 5 minutes
        this.pollingInterval = setInterval(() => {
            this.pollAllUsers();
        }, this.POLL_INTERVAL);
    }

    /**
     * Stop polling
     */
    stop() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('⏹️ [JIRA POLLER] Stopped Jira polling service');
        }
    }

    /**
     * Poll all users with Jira connected
     */
    private async pollAllUsers() {
        try {
            // Find all users with Jira connected
            const users = await User.find({
                'connectedAccounts.jira.accounts.0': { $exists: true }
            }).select('_id connectedAccounts.jira');

            console.log(`🔄 [JIRA POLLER] Syncing ${users.length} users...`);

            for (const user of users) {
                try {
                    await this.syncUserIssues(user._id.toString());
                } catch (error: any) {
                    console.error(`❌ [JIRA POLLER] Error syncing user ${user._id}:`, error.message);
                }
            }

            console.log(`✅ [JIRA POLLER] Sync completed for ${users.length} users`);
        } catch (error: any) {
            console.error('❌ [JIRA POLLER] Error in pollAllUsers:', error.message);
        }
    }

    /**
     * Sync issues for a specific user
     */
    private async syncUserIssues(userId: string) {
        try {
            const user = await User.findById(userId).select('connectedAccounts.jira');
            if (!user) return;

            const jiraAccount = (user.connectedAccounts as any)?.jira;
            if (!jiraAccount?.activeAccountId || !jiraAccount?.accounts?.length) {
                return;
            }

            // Get active account
            const activeAccount = jiraAccount.accounts.find(
                (acc: any) => acc._id.toString() === jiraAccount.activeAccountId.toString()
            );

            if (!activeAccount?.accessToken) {
                return;
            }

            // Get cloudId
            const cloudId = activeAccount.settings?.jira?.cloudId;
            if (!cloudId) {
                console.warn(`[JIRA POLLER] No cloudId for user ${userId}`);
                return;
            }

            const config = {
                baseUrl: `https://api.atlassian.com/ex/jira/${cloudId}`,
                apiToken: activeAccount.accessToken,
                email: activeAccount.providerEmail || ''
            };

            // Get all Jira issues for this user's workspaces
            const userIssues = await JiraIssue.find({
                workspaceId: { $exists: true }
            }).distinct('workspaceId');

            for (const workspaceId of userIssues) {
                await this.syncWorkspaceIssues(workspaceId.toString(), config);
            }
        } catch (error: any) {
            console.error(`[JIRA POLLER] Error syncing user ${userId}:`, error.message);
        }
    }

    /**
     * Sync issues for a specific workspace
     */
    private async syncWorkspaceIssues(workspaceId: string, config: any) {
        try {
            // Get all issues for this workspace from local DB
            const localIssues = await JiraIssue.find({ workspaceId });

            if (localIssues.length === 0) {
                return; // No issues to sync
            }

            console.log(`[JIRA POLLER] Syncing ${localIssues.length} issues for workspace ${workspaceId}`);

            // Fetch updated data from Jira for each issue
            for (const localIssue of localIssues) {
                try {
                    await this.syncSingleIssue(localIssue, config);
                } catch (error: any) {
                    console.error(`[JIRA POLLER] Error syncing issue ${localIssue.issueKey}:`, error.message);
                }
            }
        } catch (error: any) {
            console.error(`[JIRA POLLER] Error syncing workspace ${workspaceId}:`, error.message);
        }
    }

    /**
     * Sync a single issue from Jira
     */
    private async syncSingleIssue(localIssue: any, config: any) {
        try {
            // Fetch latest data from Jira
            const response = await axios.get(
                `${config.baseUrl}/rest/api/3/issue/${localIssue.issueKey}`,
                {
                    headers: {
                        'Authorization': `Bearer ${config.apiToken}`,
                        'Accept': 'application/json'
                    }
                }
            );

            const jiraIssue = response.data;
            const fields = jiraIssue.fields;

            // Check if issue was updated in Jira after our last sync
            const jiraUpdatedAt = new Date(jiraIssue.fields.updated);
            const lastSyncedAt = localIssue.lastSyncedAt || new Date(0);

            if (jiraUpdatedAt <= lastSyncedAt) {
                // No changes since last sync
                return;
            }

            console.log(`🔄 [JIRA POLLER] Updating ${localIssue.issueKey} - changed in Jira`);

            // Extract plain text from description (ADF format)
            let description = '';
            if (fields.description) {
                if (typeof fields.description === 'string') {
                    description = fields.description;
                } else if (fields.description.content) {
                    description = this.extractTextFromADF(fields.description);
                }
            }

            // Update local issue with Jira data
            localIssue.summary = fields.summary;
            localIssue.description = description;
            localIssue.status = fields.status?.name || 'Unknown';
            localIssue.priority = fields.priority?.name || 'Medium';
            localIssue.dueDate = fields.duedate ? new Date(fields.duedate) : undefined;
            localIssue.labels = fields.labels || [];
            localIssue.lastSyncedAt = new Date();

            await localIssue.save();

            console.log(`✅ [JIRA POLLER] Updated ${localIssue.issueKey}`);

            // TODO: Emit Socket.IO event to notify frontend
            // io.emit('jira:issue:updated', { 
            //     issueKey: localIssue.issueKey, 
            //     workspaceId: localIssue.workspaceId 
            // });

        } catch (error: any) {
            if (error.response?.status === 404) {
                // Issue was deleted in Jira
                console.log(`🗑️ [JIRA POLLER] Issue ${localIssue.issueKey} deleted in Jira`);
                await JiraIssue.deleteOne({ _id: localIssue._id });
            } else {
                throw error;
            }
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
            if (node.type === 'paragraph') {
                text += '\n';
            }
        };

        adf.content.forEach(extractFromNode);
        return text.trim();
    }
}

export default new JiraPollerService();
