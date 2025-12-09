import React from 'react';
import { TimelineTask, TimelineResource, DEFAULT_TASK_DURATION } from '../types/timeline';
import TimelineView from './planner/timeline/TimelineView';

interface Task {
    _id: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed' | 'blocked';
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignee: {
        _id: string;
        name: string;
        email: string;
        avatarUrl?: string;
    };
    startDate: Date;
    dueDate?: Date;
    estimatedHours: number;
    project: {
        _id: string;
        name: string;
        color: string;
    };
    tags: string[];
}

interface TaskTimelineViewProps {
    tasks: Task[];
    onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
    onTaskCreate: (task: Partial<Task>) => void;
    onTaskDelete: (taskId: string) => void;
}

const TaskTimelineView: React.FC<TaskTimelineViewProps> = ({
    tasks,
    onTaskUpdate,
    onTaskCreate,
    onTaskDelete,
}) => {
    // Convert TaskManagement tasks to timeline format
    const timelineTasks: TimelineTask[] = React.useMemo(() => {
        return tasks.map(task => ({
            id: task._id,
            title: task.title,
            description: task.description,
            status: task.status === 'pending' ? 'todo' :
                task.status === 'in-progress' ? 'in-progress' :
                    task.status === 'completed' ? 'done' : 'todo',
            priority: task.priority === 'critical' ? 'urgent' : task.priority,
            startDate: task.startDate ? task.startDate.toISOString() : null,
            duration: task.estimatedHours
                ? task.estimatedHours * 60 * 60 * 1000
                : DEFAULT_TASK_DURATION,
            resourceId: task.assignee?._id,
            assignees: task.assignee ? [task.assignee.name] : [],
            tags: task.tags || [],
            project: task.project,
        }));
    }, [tasks]);

    // Create resources from unique assignees
    const resources: TimelineResource[] = React.useMemo(() => {
        const assigneeMap = new Map<string, TimelineResource>();

        tasks.forEach(task => {
            if (task.assignee) {
                if (!assigneeMap.has(task.assignee._id)) {
                    assigneeMap.set(task.assignee._id, {
                        id: task.assignee._id,
                        name: task.assignee.name,
                        type: 'user',
                        avatarUrl: task.assignee.avatarUrl,
                        color: task.project?.color || '#3B82F6',
                    });
                }
            }
        });

        return Array.from(assigneeMap.values());
    }, [tasks]);

    const handleTaskUpdate = (taskId: string, updates: Partial<TimelineTask>) => {
        const taskUpdates: any = {};

        if (updates.startDate !== undefined) {
            taskUpdates.startDate = updates.startDate ? new Date(updates.startDate) : null;
        }

        if (updates.duration !== undefined) {
            taskUpdates.estimatedHours = updates.duration / (60 * 60 * 1000);
        }

        if (updates.status !== undefined) {
            taskUpdates.status = updates.status === 'todo' ? 'pending' :
                updates.status === 'in-progress' ? 'in-progress' :
                    updates.status === 'done' ? 'completed' : 'pending';
        }

        onTaskUpdate(taskId, taskUpdates);
    };

    const handleAddTask = () => {
        onTaskCreate({
            title: 'New Task',
            status: 'pending',
            priority: 'medium',
        });
    };

    return (
        <TimelineView
            tasks={timelineTasks}
            resources={resources}
            onTaskUpdate={handleTaskUpdate}
            onAddTask={handleAddTask}
            startHour={0}
            endHour={24}
        />
    );
};

export default TaskTimelineView;
