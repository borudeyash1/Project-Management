import React from 'react';

interface EventCardProps {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color?: 'blue' | 'gray' | 'green' | 'purple' | 'orange';
  top: number; // Position in pixels
  height: number; // Height in pixels
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  startTime,
  endTime,
  color = 'blue',
  top,
  height,
}) => {
  const colorClasses = {
    blue: 'bg-blue-500/15 border-blue-500 text-blue-100',
    gray: 'bg-gray-700/30 border-gray-500 text-gray-200',
    green: 'bg-green-500/15 border-green-500 text-green-100',
    purple: 'bg-purple-500/15 border-purple-500 text-purple-100',
    orange: 'bg-orange-500/15 border-orange-500 text-orange-100',
  };

  return (
    <div
      className={`
        absolute left-0 right-0 mx-1 rounded-[4px] border-l-2 px-2 py-1
        cursor-pointer hover:opacity-90 transition-opacity
        ${colorClasses[color]}
      `}
      style={{ top: `${top}px`, height: `${height}px` }}
    >
      <div className="text-xs font-bold truncate">{title}</div>
      <div className="text-2xs opacity-80">
        {startTime} - {endTime}
      </div>
    </div>
  );
};

export default EventCard;
