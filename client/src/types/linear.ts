// Linear Types
export interface LinearTeam {
    id: string;
    name: string;
    key: string;
    description?: string;
}

export interface LinearIssue {
    id: string;
    identifier: string;
    title: string;
    description?: string;
    priority: number;
    state: {
        id: string;
        name: string;
        color: string;
        type: string;
    };
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
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
    url: string;
}

export interface LinearProject {
    id: string;
    name: string;
    description?: string;
    color: string;
}

export interface LinearWorkflowState {
    id: string;
    name: string;
    color: string;
    type: string;
    position: number;
}
