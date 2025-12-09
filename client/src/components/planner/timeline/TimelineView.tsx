import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
    KeyboardSensor,
    DragStartEvent,
    DragEndEvent,
    pointerWithin,
} from '@dnd-kit/core';
import { TimelineTask, TimelineResource, DragData, PIXELS_PER_HOUR } from '../../../types/timeline';
import { getTimelineStart, calculateDropDate, durationToPixels } from '../../../utils/timelineHelpers';
import UnscheduledSidebar from './UnscheduledSidebar';
import TimelineGrid from './TimelineGrid';
import { format } from 'date-fns';

interface TimelineViewProps {
    tasks: TimelineTask[];
    resources?: TimelineResource[];
    onTaskUpdate: (taskId: string, updates: Partial<TimelineTask>) => void;
    onTaskClick?: (task: TimelineTask) => void;
    onAddTask?: () => void;
    startHour?: number;
    endHour?: number;
}

const TimelineView: React.FC<TimelineViewProps> = ({
    tasks,
    resources = [],
    onTaskUpdate,
    onTaskClick,
    onAddTask,
    startHour = 0,
    endHour = 24,
}) => {
    const [activeTask, setActiveTask] = useState<TimelineTask | null>(null);
    const timelineStart = getTimelineStart(new Date(), startHour);

    // Configure sensors with activation constraints
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10, // Prevent accidental clicks
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor)
    );

    // Separate scheduled and unscheduled tasks
    const unscheduledTasks = tasks.filter(task => !task.startDate);
    const scheduledTasks = tasks.filter(task => task.startDate);

    const handleDragStart = (event: DragStartEvent) => {
        const dragData = event.active.data.current as DragData;
        setActiveTask(dragData.task);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over, delta } = event;

        if (!over || !activeTask) {
            setActiveTask(null);
            return;
        }

        // Check if dropped on timeline grid
        if (over.id === 'timeline-grid') {
            const dragData = active.data.current as DragData;

            // Get the timeline container element
            const timelineElement = document.querySelector('[data-timeline-grid]');
            if (!timelineElement) {
                setActiveTask(null);
                return;
            }

            const timelineRect = timelineElement.getBoundingClientRect();
            const scrollLeft = timelineElement.scrollLeft || 0;

            // Calculate drop position
            // For unscheduled tasks, use the final position
            // For scheduled tasks, use delta to calculate new position
            let dropX: number;

            if (dragData.type === 'unscheduled') {
                // For unscheduled tasks, use delta from drag start
                // Estimate drop position based on delta
                dropX = Math.max(0, delta.x);
            } else {
                // For scheduled tasks, calculate from original position + delta
                const originalDate = new Date(dragData.originalStartDate!);
                const originalX = ((originalDate.getTime() - timelineStart.getTime()) / (60 * 60 * 1000)) * PIXELS_PER_HOUR;
                dropX = originalX + delta.x;
            }

            // Convert to date and snap to interval
            const newStartDate = calculateDropDate(dropX, timelineStart, 0);

            // Update task
            onTaskUpdate(activeTask.id, {
                startDate: newStartDate.toISOString(),
            });
        }

        setActiveTask(null);
    };

    const handleDragCancel = () => {
        setActiveTask(null);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="h-full flex bg-notion-canvas dark:bg-app-bg">
                {/* Unscheduled Sidebar */}
                <UnscheduledSidebar tasks={unscheduledTasks} onAddTask={onAddTask} />

                {/* Timeline Grid */}
                <div className="flex-1 relative" data-timeline-grid>
                    <TimelineGrid
                        tasks={scheduledTasks}
                        resources={resources}
                        timelineStart={timelineStart}
                        startHour={startHour}
                        endHour={endHour}
                        onTaskClick={onTaskClick}
                    />
                </div>
            </div>

            {/* Drag Overlay - Visual Feedforward */}
            <DragOverlay dropAnimation={null}>
                {activeTask && (
                    <div
                        className="bg-blue-500 border-l-4 border-blue-600 rounded-lg px-3 py-2 shadow-notion-card opacity-90"
                        style={{
                            width: `${durationToPixels(activeTask.duration)}px`,
                            height: '56px',
                        }}
                    >
                        <h4 className="text-xs font-medium text-white truncate mb-1">
                            {activeTask.title}
                        </h4>
                        <p className="text-2xs text-white/80">
                            {Math.round(activeTask.duration / (60 * 60 * 1000))}h duration
                        </p>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
};

export default TimelineView;
