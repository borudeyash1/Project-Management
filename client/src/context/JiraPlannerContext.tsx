import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/api';
import { Task, Column } from './PlannerContext';

interface JiraPlannerContextType {
    tasks: Task[];
    columns: Column[];
    loading: boolean;
    fetchData: () => Promise<void>;
    moveTask: (taskId: string, newStatus: string) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    addTask: (columnId: string) => void;
    createTask: (taskData: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    bulkUpdateTasks: (taskIds: string[], updates: Partial<Task>) => Promise<void>;
    addSubtask: (taskId: string, subtask: any) => Promise<void>;
    toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
    addComment: (taskId: string, comment: any) => Promise<void>;
    dataVersion: number;
}

// Make context nullable so it can be optional
const JiraPlannerContext = createContext<JiraPlannerContextType | null>(null);

// Transform Jira issue to Task format
function transformJiraIssueToTask(issue: any): Task {
    // Map Jira status to planner status
    const statusMap: Record<string, string> = {
        'To Do': 'pending',
        'Backlog': 'pending',
        'In Progress': 'in-progress',
        'In Development': 'in-progress',
        'Done': 'completed',
        'Completed': 'completed',
        'Closed': 'completed'
    };

    const plannerStatus = statusMap[issue.status] || 'pending';

    return {
        _id: issue._id,
        title: issue.summary,
        description: issue.description || '',
        status: plannerStatus,
        priority: (issue.priority?.toLowerCase() || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
        dueDate: issue.dueDate ? new Date(issue.dueDate) : undefined,
        startDate: undefined,
        assignee: null,
        assignees: [],
        reporter: null,
        project: null,
        workspace: issue.workspaceId,
        estimatedHours: undefined,
        estimatedTime: 0,
        actualHours: undefined,
        progress: issue.status === 'Done' ? 100 : issue.status === 'In Progress' ? 50 : 0,
        subtasks: [],
        tags: issue.labels || [],
        comments: [],
        attachments: [],
        createdAt: issue.createdAt ? new Date(issue.createdAt) : new Date(),
        updatedAt: issue.updatedAt ? new Date(issue.updatedAt) : new Date(),
        // Jira metadata
        source: 'jira' as const,
        externalId: issue.issueKey,
        externalUrl: `https://sartthi.atlassian.net/browse/${issue.issueKey}`,
        syncedAt: issue.lastSyncedAt ? new Date(issue.lastSyncedAt) : undefined
    };
}

export const JiraPlannerProvider: React.FC<{ children: ReactNode; workspaceId: string }> = ({
    children,
    workspaceId
}) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [dataVersion, setDataVersion] = useState(0);

    // Jira uses 3 columns (no Review)
    const [columns] = useState<Column[]>([
        { id: 'pending', name: 'planner.board.todo', color: 'bg-gray-500', order: 1 },
        { id: 'in-progress', name: 'planner.board.inProgress', color: 'bg-blue-500', order: 2 },
        { id: 'completed', name: 'planner.board.done', color: 'bg-green-500', order: 3 }
    ]);

    const fetchData = async () => {
        console.log('🔄 [JiraPlanner] Fetching Jira issues for workspace:', workspaceId);
        setLoading(true);
        try {
            const response = await apiService.get(`/jira/workspace/${workspaceId}/issues`);
            const jiraIssues = response.data || [];
            console.log('✅ [JiraPlanner] Fetched', jiraIssues.length, 'Jira issues');

            const transformedTasks = jiraIssues.map(transformJiraIssueToTask);
            setTasks(transformedTasks);
            setDataVersion(v => v + 1);
        } catch (error) {
            console.error('❌ [JiraPlanner] Failed to fetch Jira issues:', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const moveTask = async (taskId: string, newStatus: string) => {
        // Optimistic update
        const updatedTasks = tasks.map(task =>
            task._id === taskId ? { ...task, status: newStatus } : task
        );
        setTasks(updatedTasks);

        // Sync with Jira-specific endpoint
        try {
            await apiService.put(`/jira/workspace/${workspaceId}/issues/${taskId}`, {
                status: newStatus
            });
            console.log('✅ [JiraPlanner] Moved task, synced to Jira');
        } catch (error) {
            console.error('❌ [JiraPlanner] Failed to move task:', error);
            // Revert on error
            await fetchData();
        }
    };

    const updateTask = async (taskId: string, updates: Partial<Task>) => {
        // Optimistic update
        const updatedTasks = tasks.map(task =>
            task._id === taskId ? { ...task, ...updates } : task
        );
        setTasks(updatedTasks);

        // Sync with Jira-specific endpoint
        try {
            await apiService.put(`/jira/workspace/${workspaceId}/issues/${taskId}`, updates);
            console.log('✅ [JiraPlanner] Updated task, synced to Jira');
        } catch (error) {
            console.error('❌ [JiraPlanner] Failed to update task:', error);
            // Revert on error
            await fetchData();
        }
    };

    const addTask = (columnId: string) => {
        console.log('Add task to column:', columnId);
        // This would open a modal or form
    };

    const createTask = async (taskData: Partial<Task>) => {
        console.log('Create task:', taskData);
        // Not supported for Jira - tasks must be created in Jira
        throw new Error('Cannot create Jira tasks from Sartthi. Please create in Jira.');
    };

    const deleteTask = async (taskId: string) => {
        console.log('Delete task:', taskId);
        // Not supported for Jira - tasks must be deleted in Jira
        throw new Error('Cannot delete Jira tasks from Sartthi. Please delete in Jira.');
    };

    const bulkUpdateTasks = async (taskIds: string[], updates: Partial<Task>) => {
        await Promise.all(taskIds.map(id => updateTask(id, updates)));
    };

    const addSubtask = async (taskId: string, subtask: any) => {
        console.log('Add subtask:', taskId, subtask);
        // Not supported for Jira subtasks
    };

    const toggleSubtask = async (taskId: string, subtaskId: string) => {
        console.log('Toggle subtask:', taskId, subtaskId);
        // Not supported for Jira subtasks
    };

    const addComment = async (taskId: string, comment: any) => {
        console.log('Add comment:', taskId, comment);
        // Not supported for Jira comments
    };

    useEffect(() => {
        if (workspaceId) {
            fetchData();
        }
    }, [workspaceId]);

    return (
        <JiraPlannerContext.Provider
            value={{
                tasks,
                columns,
                loading,
                dataVersion,
                fetchData,
                moveTask,
                updateTask,
                addTask,
                createTask,
                deleteTask,
                bulkUpdateTasks,
                addSubtask,
                toggleSubtask,
                addComment
            }}
        >
            {children}
        </JiraPlannerContext.Provider>
    );
};

// Hook that returns null if not in JiraPlannerProvider (instead of throwing)
export const useJiraPlanner = () => {
    return useContext(JiraPlannerContext);
};
