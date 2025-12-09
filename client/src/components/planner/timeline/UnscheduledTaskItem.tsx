import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Clock, GripVertical, Calendar } from 'lucide-react';
import { TimelineTask } from '../../../types/timeline';
import { format } from 'date-fns';

interface UnscheduledTaskItemProps {
    task: TimelineTask;
}

const UnscheduledTaskItem: React.FC<UnscheduledTaskItemProps> = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: {
            type: 'unscheduled',
            task,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
            case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10';
            case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
            case 'low': return 'border-l-gray-400 bg-gray-50 dark:bg-gray-800';
            default: return 'border-l-gray-300 bg-white dark:bg-gray-800';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative border-l-4 ${getPriorityColor(task.priority)} rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-notion-hover`}
            {...listeners}
            {...attributes}
        >
            {/* Grip Icon */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-notion-text-secondary" />
            </div>

            {/* Content */}
            <div className="pl-6">
                <h4 className="font-medium text-sm text-notion-text dark:text-white mb-1 line-clamp-1">
                    {task.title}
                </h4>

                {task.description && (
                    <p className="text-xs text-notion-text-secondary dark:text-gray-400 mb-2 line-clamp-2">
                        {task.description}
                    </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs text-notion-text-secondary dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{Math.round(task.duration / (60 * 60 * 1000))}h</span>
                    </div>

                    {task.assignees.length > 0 && (
                        <div className="flex items-center gap-1">
                            <div className="flex -space-x-1">
                                {task.assignees.slice(0, 2).map((assignee, idx) => (
                                    <div
                                        key={idx}
                                        className="w-5 h-5 rounded-full bg-accent text-white text-2xs flex items-center justify-center border border-white dark:border-gray-700"
                                    >
                                        {typeof assignee === 'string' ? assignee[0]?.toUpperCase() : 'U'}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {task.project && (
                        <div className="flex items-center gap-1">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: task.project.color }}
                            />
                            <span className="truncate max-w-[80px]">{task.project.name}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(UnscheduledTaskItem);
