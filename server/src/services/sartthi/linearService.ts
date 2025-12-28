import axios from 'axios';
import { IConnectedAccount } from '../../models/ConnectedAccount';
import { ConnectedAccount } from '../../models/ConnectedAccount';

interface LinearIssue {
    id: string;
    identifier: string;
    title: string;
    description: string;
    state: {
        id: string;
        name: string;
        color: string;
        type: string;
    };
    priority: number;
    url: string;
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
    assignee?: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string;
    };
    project?: {
        id: string;
        name: string;
    };
}

interface LinearTeam {
    id: string;
    name: string;
    key: string;
    description?: string;
}

interface LinearProject {
    id: string;
    name: string;
    description?: string;
    color: string;
}

interface LinearWorkflowState {
    id: string;
    name: string;
    color: string;
    type: string;
    position: number;
}

interface LinearViewer {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

export const getLinearService = () => {
    const getAccessToken = async (userId: string, accountId?: string) => {
        let query: any = {
            userId,
            service: 'linear'
        };

        if (accountId) {
            query._id = accountId;
        } else {
            query.isActive = true;
        }

        const account = await ConnectedAccount.findOne(query);

        if (!account || !account.accessToken) {
            throw new Error('Linear account not connected');
        }

        return account.accessToken;
    };

    /**
     * Helper to execute GraphQL queries
     */
    const executeQuery = async (accessToken: string, query: string, variables = {}) => {
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
                console.error('Linear GraphQL Errors:', response.data.errors);
                throw new Error(JSON.stringify(response.data.errors));
            }

            return response.data.data;
        } catch (error: any) {
            console.error('Linear GraphQL Error:', error.response?.data || error.message);
            throw error;
        }
    };

    /**
     * Get Viewer (Current User)
     */
    const getViewer = async (userId: string, accountId?: string): Promise<LinearViewer> => {
        const token = await getAccessToken(userId, accountId);
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
        const data = await executeQuery(token, query);
        return data.viewer;
    };

    /**
     * Get Teams
     */
    const getTeams = async (userId: string, accountId?: string): Promise<LinearTeam[]> => {
        const token = await getAccessToken(userId, accountId);
        const query = `
            query {
                teams {
                    nodes {
                        id
                        name
                        key
                        description
                    }
                }
            }
        `;
        const data = await executeQuery(token, query);
        return data.teams.nodes;
    };

    /**
     * Get Issues for a team
     */
    const getIssues = async (userId: string, teamId?: string, accountId?: string): Promise<LinearIssue[]> => {
        const token = await getAccessToken(userId, accountId);

        const query = teamId ? `
            query($teamId: String!) {
                team(id: $teamId) {
                    issues(first: 100, orderBy: updatedAt) {
                        nodes {
                            id
                            identifier
                            title
                            description
                            state {
                                id
                                name
                                color
                                type
                            }
                            priority
                            url
                            createdAt
                            updatedAt
                            dueDate
                            assignee {
                                id
                                name
                                email
                                avatarUrl
                            }
                            project {
                                id
                                name
                            }
                        }
                    }
                }
            }
        ` : `
            query {
                issues(first: 100, orderBy: updatedAt) {
                    nodes {
                        id
                        identifier
                        title
                        description
                        state {
                            id
                            name
                            color
                            type
                        }
                        priority
                        url
                        createdAt
                        updatedAt
                        dueDate
                        assignee {
                            id
                            name
                            email
                            avatarUrl
                        }
                        project {
                            id
                            name
                        }
                    }
                }
            }
        `;

        const variables = teamId ? { teamId } : {};
        const data = await executeQuery(token, query, variables);
        return teamId ? data.team.issues.nodes : data.issues.nodes;
    };

    /**
     * Get single issue
     */
    const getIssue = async (userId: string, issueId: string, accountId?: string): Promise<LinearIssue> => {
        const token = await getAccessToken(userId, accountId);
        const query = `
            query($issueId: String!) {
                issue(id: $issueId) {
                    id
                    identifier
                    title
                    description
                    state {
                        id
                        name
                        color
                        type
                    }
                    priority
                    url
                    createdAt
                    updatedAt
                    dueDate
                    assignee {
                        id
                        name
                        email
                        avatarUrl
                    }
                    project {
                        id
                        name
                    }
                }
            }
        `;
        const data = await executeQuery(token, query, { issueId });
        return data.issue;
    };

    /**
     * Get Projects for a team
     */
    const getProjects = async (userId: string, teamId: string, accountId?: string): Promise<LinearProject[]> => {
        const token = await getAccessToken(userId, accountId);
        const query = `
            query($teamId: String!) {
                team(id: $teamId) {
                    projects {
                        nodes {
                            id
                            name
                            description
                            color
                        }
                    }
                }
            }
        `;
        const data = await executeQuery(token, query, { teamId });
        return data.team.projects.nodes;
    };

    /**
     * Get Workflow States for a team
     */
    const getWorkflowStates = async (userId: string, teamId: string, accountId?: string): Promise<LinearWorkflowState[]> => {
        const token = await getAccessToken(userId, accountId);
        const query = `
            query($teamId: String!) {
                team(id: $teamId) {
                    states {
                        nodes {
                            id
                            name
                            color
                            type
                            position
                        }
                    }
                }
            }
        `;
        const data = await executeQuery(token, query, { teamId });
        return data.team.states.nodes;
    };

    /**
     * Create Issue
     */
    const createIssue = async (
        userId: string,
        teamId: string,
        issueData: {
            title: string;
            description?: string;
            priority?: number;
            stateId?: string;
            assigneeId?: string;
            projectId?: string;
            dueDate?: string;
        },
        accountId?: string
    ): Promise<LinearIssue> => {
        const token = await getAccessToken(userId, accountId);
        const query = `
            mutation($input: IssueCreateInput!) {
                issueCreate(input: $input) {
                    success
                    issue {
                        id
                        identifier
                        title
                        description
                        state {
                            id
                            name
                            color
                            type
                        }
                        priority
                        url
                        createdAt
                        updatedAt
                        dueDate
                        assignee {
                            id
                            name
                            email
                            avatarUrl
                        }
                        project {
                            id
                            name
                        }
                    }
                }
            }
        `;

        const input: any = {
            teamId,
            title: issueData.title
        };

        if (issueData.description) input.description = issueData.description;
        if (issueData.priority !== undefined) input.priority = issueData.priority;
        if (issueData.stateId) input.stateId = issueData.stateId;
        if (issueData.assigneeId) input.assigneeId = issueData.assigneeId;
        if (issueData.projectId) input.projectId = issueData.projectId;
        if (issueData.dueDate) input.dueDate = issueData.dueDate;

        const data = await executeQuery(token, query, { input });
        return data.issueCreate.issue;
    };

    /**
     * Update Issue
     */
    const updateIssue = async (
        userId: string,
        issueId: string,
        updates: {
            title?: string;
            description?: string;
            priority?: number;
            stateId?: string;
            assigneeId?: string;
            projectId?: string;
            dueDate?: string;
        },
        accountId?: string
    ): Promise<LinearIssue> => {
        const token = await getAccessToken(userId, accountId);
        const query = `
            mutation($issueId: String!, $input: IssueUpdateInput!) {
                issueUpdate(id: $issueId, input: $input) {
                    success
                    issue {
                        id
                        identifier
                        title
                        description
                        state {
                            id
                            name
                            color
                            type
                        }
                        priority
                        url
                        createdAt
                        updatedAt
                        dueDate
                        assignee {
                            id
                            name
                            email
                            avatarUrl
                        }
                        project {
                            id
                            name
                        }
                    }
                }
            }
        `;

        const data = await executeQuery(token, query, { issueId, input: updates });
        return data.issueUpdate.issue;
    };

    return {
        getViewer,
        getTeams,
        getIssues,
        getIssue,
        getProjects,
        getWorkflowStates,
        createIssue,
        updateIssue
    };
};
