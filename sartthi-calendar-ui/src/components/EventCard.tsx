import React from 'react';

interface EventCardProps {
  title: string;
  time: string;
  color?: string;
  top: number;
  height: number;
}

const EventCard: React.FC<EventCardProps> = ({ title, time, color = 'blue', top, height }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500',
      text: 'text-blue-100',
    },
    gray: {
      bg: 'bg-gray-500/20',
      border: 'border-gray-500',
      text: 'text-gray-100',
    },
    green: {
      bg: 'bg-green-500/20',
      border: 'border-green-500',
      text: 'text-green-100',
    },
    purple: {
      bg: 'bg-purple-500/20',
      border: 'border-purple-500',
      text: 'text-purple-100',
    },
    orange: {
      bg: 'bg-orange-500/20',
      border: 'border-orange-500',
      text: 'text-orange-100',
    },
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div
      className={`
        absolute left-1 right-1 rounded
        border-l-4 ${colors.border}
        ${colors.bg} ${colors.text}
        p-2 overflow-hidden
        cursor-pointer hover:opacity-90 transition-opacity
        shadow-sm
      `}
      style={{ 
        top: `${top}px`, 
        height: `${height}px`,
        position: 'absolute',
        left: '4px',
        right: '4px',
        borderRadius: '4px',
        padding: '0.5rem',
        overflow: 'hidden'
      }}
    >
      <div className="text-xs font-bold truncate" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{title}</div>
      <div className="text-2xs opacity-80 truncate" style={{ fontSize: '0.625rem', opacity: 0.8 }}>{time}</div>
    </div>
  );
};

export default EventCard;
