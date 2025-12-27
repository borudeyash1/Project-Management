import axios from 'axios';
import { ConnectedAccount } from '../../models/ConnectedAccount';
import { IConnectedAccount } from '../../models/ConnectedAccount';

interface JiraProject {
    id: string;
    key: string;
    name: string;
    avatarUrls: {
        '48x48': string;
    };
    projectTypeKey: string;
}

interface JiraIssue {
    id: string;
    key: string;
    fields: {
        summary: string;
        description: string;
        status: {
            name: string;
        };
        priority: {
            name: string;
        };
        assignee?: {
            displayName: string;
            emailAddress: string;
            avatarUrls: {
                '48x48': string;
            };
        };
        updated: string;
        created: string;
    };
}

export const jiraService = {
    // Helper to get the Cloud ID (Site ID)
    getCloudId: async (accessToken: string): Promise<string> => {
        try {
            const response = await axios.get('https://api.atlassian.com/oauth/token/accessible-resources', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!response.data || response.data.length === 0) {
                throw new Error('No Jira resources accessible');
            }

            // Return first accessible resource
            return response.data[0].id;
        } catch (error: any) {
            console.error('Error fetching Jira cloud ID:', error.response?.data || error.message);
            throw error;
        }
    },

    // Fetch Projects
    getProjects: async (account: IConnectedAccount): Promise<JiraProject[]> => {
        try {
            const cloudId = await jiraService.getCloudId(account.accessToken);

            // Fetch projects
            const response = await axios.get(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project`, {
                headers: { Authorization: `Bearer ${account.accessToken}` }
            });

            return response.data;
        } catch (error: any) {
            console.error('Error fetching Jira projects:', error.response?.data || error.message);
            throw error;
        }
    },

    // Fetch Issues (JQL search)
    getIssues: async (account: IConnectedAccount, jql: string = 'order by lastViewed desc'): Promise<JiraIssue[]> => {
        try {
            const cloudId = await jiraService.getCloudId(account.accessToken);

            const response = await axios.post(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search`, {
                jql,
                fields: ['summary', 'description', 'status', 'priority', 'assignee', 'updated', 'created'],
                maxResults: 50
            }, {
                headers: { Authorization: `Bearer ${account.accessToken}` }
            });

            return response.data.issues;
        } catch (error: any) {
            console.error('Error fetching Jira issues:', error.response?.data || error.message);
            throw error;
        }
    }
};
