import React, { useEffect, useState } from 'react';
import EventCard from './EventCard';

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  day: number; // 0-6 (Mon-Sun)
  color?: 'blue' | 'gray' | 'green' | 'purple' | 'orange';
}

const WeekGrid: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Sample events
  const events: Event[] = [
    {
      id: '1',
      title: 'Team Standup',
      startTime: '9:00 AM',
      endTime: '9:30 AM',
      day: 0,
      color: 'blue',
    },
    {
      id: '2',
      title: 'Design Review',
      startTime: '11:00 AM',
      endTime: '12:00 PM',
      day: 0,
      color: 'purple',
    },
    {
      id: '3',
      title: 'Lunch Break',
      startTime: '12:30 PM',
      endTime: '1:30 PM',
      day: 0,
      color: 'gray',
    },
    {
      id: '4',
      title: 'Client Meeting',
      startTime: '2:00 PM',
      endTime: '3:30 PM',
      day: 1,
      color: 'orange',
    },
    {
      id: '5',
      title: 'Code Review',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      day: 2,
      color: 'green',
    },
  ];

  // Get current day and time for the "now" indicator
  const currentDay = currentTime.getDay() === 0 ? 6 : currentTime.getDay() - 1; // Convert to Mon=0
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimePosition = (currentHour * 60 + currentMinute) * (60 / 60); // 60px per hour

  // Get dates for the week
  const getWeekDates = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDayOfWeek);

    return days.map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date.getDate();
    });
  };

  const weekDates = getWeekDates();

  const timeToPosition = (time: string): number => {
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return (hours * 60 + minutes) * (60 / 60); // 60px per hour
  };

  const calculateEventHeight = (startTime: string, endTime: string): number => {
    const start = timeToPosition(startTime);
    const end = timeToPosition(endTime);
    return end - start;
  };

  return (
    <div className="h-screen bg-app-bg text-text-primary overflow-hidden flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-app-bg/95 backdrop-blur border-b border-border-subtle">
        <div className="flex">
          {/* Time column header */}
          <div className="w-16 flex-shrink-0 border-r border-border-subtle" />
          
          {/* Day headers */}
          {days.map((day, index) => {
            const isToday = index === currentDay;
            return (
              <div
                key={day}
                className="flex-1 text-center py-4 border-r border-border-subtle last:border-r-0"
              >
                <div className={`text-xs font-bold ${isToday ? 'text-accent-red' : 'text-text-muted'}`}>
                  {day}
                </div>
                <div className={`text-lg font-bold mt-1 ${isToday ? 'text-accent-red' : 'text-text-primary'}`}>
                  {weekDates[index]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="flex">
          {/* Time labels */}
          <div className="w-16 flex-shrink-0 border-r border-border-subtle">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-border-subtle text-right pr-2 pt-1"
              >
                <span className="text-2xs text-text-lighter">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((_, dayIndex) => (
            <div key={dayIndex} className="flex-1 relative border-r border-border-subtle last:border-r-0">
              {/* Hour rows */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-border-subtle hover:bg-sidebar-bg/50 transition-colors"
                />
              ))}

              {/* Events for this day */}
              {events
                .filter((event) => event.day === dayIndex)
                .map((event) => (
                  <EventCard
                    key={event.id}
                    {...event}
                    top={timeToPosition(event.startTime)}
                    height={calculateEventHeight(event.startTime, event.endTime)}
                  />
                ))}
            </div>
          ))}
        </div>

        {/* Current Time Indicator */}
        {currentDay >= 0 && currentDay < 7 && (
          <div
            className="absolute left-0 right-0 z-10 pointer-events-none"
            style={{ top: `${currentTimePosition}px` }}
          >
            {/* Time badge */}
            <div className="absolute left-0 -top-3 ml-1 bg-accent-red text-white text-2xs font-bold px-2 py-0.5 rounded-full">
              {currentTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </div>
            {/* Red line */}
            <div className="h-0.5 bg-accent-red ml-16" />
          </div>
        )}
      </div>
    </div>
  );
};

export default WeekGrid;
