import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Clock, User } from 'lucide-react';
import { TimelineTask } from '../../../types/timeline';
import { durationToPixels, dateToPixel, getTimelineStart } from '../../../utils/timelineHelpers';
import { format } from 'date-fns';

interface TimelineTaskBarProps {
    task: TimelineTask;
    timelineStart: Date;
    onClick?: () => void;
}

const TimelineTaskBar: React.FC<TimelineTaskBarProps> = ({ task, timelineStart, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `scheduled-${task.id}`,
        data: {
            type: 'scheduled',
            task,
            originalStartDate: task.startDate,
        },
    });

    if (!task.startDate) return null;

    const startDate = new Date(task.startDate);
    const leftPosition = dateToPixel(startDate, timelineStart);
    const width = durationToPixels(task.duration);

    const style = {
        transform: CSS.Translate.toString(transform),
        left: `${leftPosition}px`,
        width: `${width}px`,
        opacity: isDragging ? 0.5 : 1,
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500 border-red-600';
            case 'high': return 'bg-orange-500 border-orange-600';
            case 'medium': return 'bg-yellow-500 border-yellow-600';
            case 'low': return 'bg-gray-400 border-gray-500';
            default: return 'bg-blue-500 border-blue-600';
        }
    };

    const getStatusOpacity = (status: string) => {
        switch (status) {
            case 'done': return 'opacity-60';
            case 'in-progress': return 'opacity-90';
            default: return 'opacity-100';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onClick}
            className={`absolute top-2 h-14 ${getPriorityColor(task.priority)} ${getStatusOpacity(task.status)} rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-notion-hover hover:z-10 group`}
            {...listeners}
            {...attributes}
        >
            <div className="h-full px-3 py-2 flex flex-col justify-between overflow-hidden">
                {/* Title */}
                <h4 className="text-xs font-medium text-white truncate">
                    {task.title}
                </h4>

                {/* Metadata */}
                <div className="flex items-center gap-2 text-2xs text-white/80">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{format(startDate, 'h:mm a')}</span>
                    </div>

                    {task.assignees.length > 0 && (
                        <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{task.assignees.length}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Resize handles (for future enhancement) */}
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20 opacity-0 group-hover:opacity-100 cursor-ew-resize" />
        </div>
    );
};

export default React.memo(TimelineTaskBar);
