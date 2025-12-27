import axios from 'axios';
import { IConnectedAccount } from '../../models/ConnectedAccount';

interface LinearIssue {
    id: string;
    identifier: string;
    title: string;
    description: string;
    state: {
        name: string;
        color: string;
    };
    priority: number;
    url: string;
    createdAt: string;
    updatedAt: string;
    assignee?: {
        id: string;
        name: string;
    };
}

interface LinearViewer {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

export const linearService = {
    /**
     * Helper to execute GraphQL queries
     */
    executeQuery: async (accessToken: string, query: string, variables = {}) => {
        try {
            const response = await axios.post(
                'https://api.linear.app/graphql',
                { query, variables },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.errors) {
                throw new Error(JSON.stringify(response.data.errors));
            }

            return response.data.data;
        } catch (error: any) {
            console.error('Linear GraphQL Error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Get Viewer (Current User)
     */
    getViewer: async (account: IConnectedAccount): Promise<LinearViewer> => {
        const query = `
            query {
                viewer {
                    id
                    name
                    email
                    avatarUrl
                }
            }
        `;
        const data = await linearService.executeQuery(account.accessToken, query);
        return data.viewer;
    },

    /**
     * Get Issues assigned to viewer or generally visible
     */
    getIssues: async (account: IConnectedAccount): Promise<LinearIssue[]> => {
        const query = `
            query {
                issues(first: 50, orderBy: updatedAt) {
                    nodes {
                        id
                        identifier
                        title
                        description
                        state {
                            name
                            color
                        }
                        priority
                        url
                        createdAt
                        updatedAt
                        assignee {
                            id
                            name
                        }
                    }
                }
            }
        `;
        const data = await linearService.executeQuery(account.accessToken, query);
        return data.issues.nodes;
    }
};
