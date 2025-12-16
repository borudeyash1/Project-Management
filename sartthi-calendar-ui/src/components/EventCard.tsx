import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface EventCardProps {
  id: string;
  title: string;
  time: string;
  color?: string;
  top: number;
  height: number;
  onResizeStart?: (e: React.MouseEvent) => void;
}

const EventCard: React.FC<EventCardProps> = ({ id, title, time, color = 'blue', top, height, onResizeStart }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `event-${id}`,
    data: {
      type: 'event',
      id,
      originalTop: top,
      height
    }
  });

  const style: React.CSSProperties = {
    top: `${top}px`,
    height: `${height}px`,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    position: 'absolute',
    left: '4px',
    right: '4px',
    zIndex: isDragging ? 50 : 10,
    opacity: isDragging ? 0.8 : 1,
  };

  // Improved colors for Light Mode visibility
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-500/20',
      border: 'border-blue-600 dark:border-blue-500',
      text: 'text-blue-900 dark:text-blue-100',
    },
    gray: {
      bg: 'bg-gray-200 dark:bg-gray-500/20',
      border: 'border-gray-600 dark:border-gray-500',
      text: 'text-gray-900 dark:text-gray-100',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-500/20',
      border: 'border-green-600 dark:border-green-500',
      text: 'text-green-900 dark:text-green-100',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-500/20',
      border: 'border-purple-600 dark:border-purple-500',
      text: 'text-purple-900 dark:text-purple-100',
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-500/20',
      border: 'border-orange-600 dark:border-orange-500',
      text: 'text-orange-900 dark:text-orange-100',
    },
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        rounded border-l-4 ${colors.border}
        ${colors.bg} ${colors.text}
        p-2 overflow-hidden
        cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow
        group select-none
      `}
    >
      <div className="text-xs font-bold truncate pointer-events-none">{title}</div>
      <div className="text-2xs opacity-80 truncate pointer-events-none">{time}</div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 bg-transparent cursor-ns-resize group-hover:bg-black/5 dark:group-hover:bg-white/10"
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeStart && onResizeStart(e);
        }}
      />
    </div>
  );
};

export default EventCard;
