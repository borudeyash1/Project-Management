// Timeline-specific TypeScript types

export interface TimelineTask {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'in-review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    startDate: string | null; // ISO String. If null, task is unscheduled
    duration: number; // in milliseconds (default 1 hour = 3600000ms)
    resourceId?: string; // ID of the row/user/project
    assignees: string[];
    tags: string[];
    project?: {
        _id: string;
        name: string;
        color: string;
    };
}

export interface TimelineResource {
    id: string;
    name: string;
    type: 'user' | 'project' | 'team';
    avatarUrl?: string;
    color?: string;
}

export interface TimelineConfig {
    startHour: number; // e.g., 8 for 8 AM
    endHour: number; // e.g., 18 for 6 PM
    pixelsPerHour: number; // e.g., 120
    snapInterval: number; // in minutes, e.g., 15
    rowHeight: number; // in pixels, e.g., 60
}

export interface DragData {
    type: 'unscheduled' | 'scheduled';
    task: TimelineTask;
    originalStartDate?: string | null;
}

export interface DropResult {
    taskId: string;
    newStartDate: string;
    resourceId?: string;
}

// Constants
export const DEFAULT_TASK_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
export const PIXELS_PER_HOUR = 120;
export const SNAP_INTERVAL_MINUTES = 15;
export const ROW_HEIGHT = 60;
export const SIDEBAR_WIDTH = 280;

// Helper type for drag overlay transformation
export interface DragTransform {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
}
