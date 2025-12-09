import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { PIXELS_PER_HOUR, ROW_HEIGHT, TimelineTask, TimelineResource } from '../../../types/timeline';
import { generateTimeLabels } from '../../../utils/timelineHelpers';
import TimelineTaskBar from './TimelineTaskBar';

interface TimelineGridProps {
    tasks: TimelineTask[];
    resources: TimelineResource[];
    timelineStart: Date;
    startHour?: number;
    endHour?: number;
    onTaskClick?: (task: TimelineTask) => void;
}

const TimelineGrid: React.FC<TimelineGridProps> = ({
    tasks,
    resources,
    timelineStart,
    startHour = 0,
    endHour = 24,
    onTaskClick,
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'timeline-grid',
    });

    const hours = endHour - startHour;
    const gridWidth = hours * PIXELS_PER_HOUR;
    const timeLabels = generateTimeLabels(startHour, endHour);

    // Group tasks by resource
    const tasksByResource = React.useMemo(() => {
        const grouped: Record<string, TimelineTask[]> = {};
        resources.forEach(resource => {
            grouped[resource.id] = tasks.filter(
                task => task.resourceId === resource.id && task.startDate !== null
            );
        });
        // Tasks without resource
        grouped['unassigned'] = tasks.filter(
            task => !task.resourceId && task.startDate !== null
        );
        return grouped;
    }, [tasks, resources]);

    return (
        <div className="flex-1 overflow-auto bg-notion-canvas dark:bg-app-bg">
            {/* Time Header */}
            <div className="sticky top-0 z-10 bg-notion-canvas dark:bg-app-bg border-b border-notion-border dark:border-border-subtle">
                <div className="flex" style={{ width: `${gridWidth}px` }}>
                    {timeLabels.map((label, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 px-2 py-3 text-xs font-medium text-notion-text-secondary dark:text-gray-400 border-r border-notion-border dark:border-border-subtle"
                            style={{ width: `${PIXELS_PER_HOUR}px` }}
                        >
                            {label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid Body */}
            <div ref={setNodeRef} className={`relative ${isOver ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                {/* Resource Rows */}
                {resources.map((resource, rowIndex) => (
                    <div
                        key={resource.id}
                        className="relative border-b border-notion-border dark:border-border-subtle"
                        style={{ height: `${ROW_HEIGHT}px` }}
                    >
                        {/* Resource Label */}
                        <div className="absolute left-0 top-0 bottom-0 w-40 bg-notion-sidebar dark:bg-sidebar-bg border-r border-notion-border dark:border-border-subtle px-3 py-2 flex items-center gap-2 z-10">
                            {resource.avatarUrl ? (
                                <img
                                    src={resource.avatarUrl}
                                    alt={resource.name}
                                    className="w-6 h-6 rounded-full"
                                />
                            ) : (
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                                    style={{ backgroundColor: resource.color || '#3B82F6' }}
                                >
                                    {resource.name[0]?.toUpperCase()}
                                </div>
                            )}
                            <span className="text-sm font-medium text-notion-text dark:text-white truncate">
                                {resource.name}
                            </span>
                        </div>

                        {/* Time Grid */}
                        <div className="absolute left-40 top-0 bottom-0 right-0">
                            <div className="relative h-full" style={{ width: `${gridWidth}px` }}>
                                {/* Hour Dividers */}
                                {Array.from({ length: hours }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="absolute top-0 bottom-0 border-r border-notion-border dark:border-border-subtle/50"
                                        style={{ left: `${index * PIXELS_PER_HOUR}px` }}
                                    />
                                ))}

                                {/* Tasks for this resource */}
                                {tasksByResource[resource.id]?.map(task => (
                                    <TimelineTaskBar
                                        key={task.id}
                                        task={task}
                                        timelineStart={timelineStart}
                                        onClick={() => onTaskClick?.(task)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Unassigned Row */}
                {tasksByResource['unassigned']?.length > 0 && (
                    <div
                        className="relative border-b border-notion-border dark:border-border-subtle"
                        style={{ height: `${ROW_HEIGHT}px` }}
                    >
                        <div className="absolute left-0 top-0 bottom-0 w-40 bg-notion-sidebar dark:bg-sidebar-bg border-r border-notion-border dark:border-border-subtle px-3 py-2 flex items-center gap-2 z-10">
                            <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-xs font-medium text-white">
                                ?
                            </div>
                            <span className="text-sm font-medium text-notion-text-secondary dark:text-gray-400 truncate">
                                Unassigned
                            </span>
                        </div>

                        <div className="absolute left-40 top-0 bottom-0 right-0">
                            <div className="relative h-full" style={{ width: `${gridWidth}px` }}>
                                {Array.from({ length: hours }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="absolute top-0 bottom-0 border-r border-notion-border dark:border-border-subtle/50"
                                        style={{ left: `${index * PIXELS_PER_HOUR}px` }}
                                    />
                                ))}

                                {tasksByResource['unassigned'].map(task => (
                                    <TimelineTaskBar
                                        key={task.id}
                                        task={task}
                                        timelineStart={timelineStart}
                                        onClick={() => onTaskClick?.(task)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(TimelineGrid);
