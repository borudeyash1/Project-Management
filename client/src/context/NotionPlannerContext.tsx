import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/api';
import { Task, Column } from './PlannerContext';

interface NotionPlannerContextType {
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
const NotionPlannerContext = createContext<NotionPlannerContextType | null>(null);

// Transform Notion task to Task format
function transformNotionTaskToTask(notionTask: any): Task {
    // Map Notion status to planner status
    const statusMap: Record<string, string> = {
        'Not started': 'pending',
        'In progress': 'in-progress',
        'Done': 'completed'
    };

    const plannerStatus = statusMap[notionTask.status] || 'pending';

    return {
        _id: notionTask._id,
        title: notionTask.title,
        description: notionTask.description || '',
        status: plannerStatus,
        priority: (notionTask.priority?.toLowerCase() || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
        dueDate: notionTask.dueDate ? new Date(notionTask.dueDate) : undefined,
        startDate: undefined,
        assignee: null,
        assignees: [],
        reporter: null,
        project: null,
        workspace: notionTask.workspaceId,
        estimatedHours: undefined,
        estimatedTime: 0,
        actualHours: undefined,
        progress: notionTask.status === 'Done' ? 100 : notionTask.status === 'In progress' ? 50 : 0,
        subtasks: [],
        tags: notionTask.labels || [],
        comments: [],
        attachments: [],
        createdAt: notionTask.createdAt ? new Date(notionTask.createdAt) : new Date(),
        updatedAt: notionTask.updatedAt ? new Date(notionTask.updatedAt) : new Date(),
        // Notion metadata
        source: 'notion' as const,
        externalId: notionTask.pageId,
        externalUrl: `https://notion.so/${notionTask.pageId.replace(/-/g, '')}`,
        syncedAt: notionTask.lastSyncedAt ? new Date(notionTask.lastSyncedAt) : undefined
    };
}

export const NotionPlannerProvider: React.FC<{ children: ReactNode; workspaceId: string }> = ({
    children,
    workspaceId
}) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [dataVersion, setDataVersion] = useState(0);

    // Notion uses 3 columns (no Review)
    const [columns] = useState<Column[]>([
        { id: 'pending', name: 'planner.board.todo', color: 'bg-gray-500', order: 1 },
        { id: 'in-progress', name: 'planner.board.inProgress', color: 'bg-blue-500', order: 2 },
        { id: 'completed', name: 'planner.board.done', color: 'bg-green-500', order: 3 }
    ]);

    const fetchData = async () => {
        console.log('🔄 [NotionPlanner] Fetching Notion tasks for workspace:', workspaceId);
        setLoading(true);
        try {
            const response = await apiService.get(`/notion/workspace/${workspaceId}/tasks`);
            const notionTasks = response.data || [];
            console.log('✅ [NotionPlanner] Fetched', notionTasks.length, 'Notion tasks');

            const transformedTasks = notionTasks.map(transformNotionTaskToTask);
            setTasks(transformedTasks);
            setDataVersion(v => v + 1);
        } catch (error) {
            console.error('❌ [NotionPlanner] Failed to fetch Notion tasks:', error);
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

        // Sync with Notion-specific endpoint
        try {
            await apiService.put(`/notion/workspace/${workspaceId}/tasks/${taskId}`, {
                status: newStatus
            });
            console.log('✅ [NotionPlanner] Moved task, synced to Notion');
        } catch (error) {
            console.error('❌ [NotionPlanner] Failed to move task:', error);
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

        // Sync with Notion-specific endpoint
        try {
            await apiService.put(`/notion/workspace/${workspaceId}/tasks/${taskId}`, updates);
            console.log('✅ [NotionPlanner] Updated task, synced to Notion');
        } catch (error) {
            console.error('❌ [NotionPlanner] Failed to update task:', error);
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
        // Not supported for Notion - tasks must be created in Notion
        throw new Error('Cannot create Notion tasks from Sartthi. Please create in Notion.');
    };

    const deleteTask = async (taskId: string) => {
        console.log('Delete task:', taskId);
        // Not supported for Notion - tasks must be deleted in Notion
        throw new Error('Cannot delete Notion tasks from Sartthi. Please delete in Notion.');
    };

    const bulkUpdateTasks = async (taskIds: string[], updates: Partial<Task>) => {
        await Promise.all(taskIds.map(id => updateTask(id, updates)));
    };

    const addSubtask = async (taskId: string, subtask: any) => {
        console.log('Add subtask:', taskId, subtask);
        // Not supported for Notion subtasks
    };

    const toggleSubtask = async (taskId: string, subtaskId: string) => {
        console.log('Toggle subtask:', taskId, subtaskId);
        // Not supported for Notion subtasks
    };

    const addComment = async (taskId: string, comment: any) => {
        console.log('Add comment:', taskId, comment);
        // Not supported for Notion comments
    };

    useEffect(() => {
        if (workspaceId) {
            fetchData();
        }
    }, [workspaceId]);

    return (
        <NotionPlannerContext.Provider
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
        </NotionPlannerContext.Provider>
    );
};

// Hook that returns null if not in NotionPlannerProvider (instead of throwing)
export const useNotionPlanner = () => {
    return useContext(NotionPlannerContext);
};
