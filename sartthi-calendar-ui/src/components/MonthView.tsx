import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { CalendarEvent } from '../services/calendarApi';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const MonthView: React.FC<MonthViewProps> = ({ currentDate, events, onDateClick, onEventClick }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="flex flex-col h-full bg-app-bg">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-border-subtle bg-sidebar-bg/30">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-text-muted border-r border-border-subtle last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6">
        {calendarDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);
          const dayEvents = events.filter(event =>
            event.date && isSameDay(parseISO(event.date), day)
          );

          // Limit displayed events to prevent overflow
          const displayedEvents = dayEvents.slice(0, 3);
          const moreCount = dayEvents.length - 3;

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={`
                min-h-[100px] border-b border-r border-border-subtle p-1 transition-colors cursor-pointer hover:bg-hover-bg/30
                ${!isCurrentMonth ? 'bg-sidebar-bg/20 text-text-muted' : 'text-text-primary'}
                ${index % 7 === 6 ? 'border-r-0' : ''} /* Remove right border for last column */
              `}
            >
              <div className="flex justify-center mb-1">
                <span className={`
                  text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                  ${isTodayDate ? 'bg-accent-blue text-white' : ''}
                `}>
                  {format(day, 'd')}
                </span>
              </div>

              <div className="space-y-1">
                {displayedEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`
                      text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80
                      ${event.color === 'blue' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-900 dark:text-blue-100 border-l-2 border-blue-600 dark:border-blue-500' : ''}
                      ${event.color === 'green' ? 'bg-green-100 dark:bg-green-500/20 text-green-900 dark:text-green-100 border-l-2 border-green-600 dark:border-green-500' : ''}
                      ${event.color === 'purple' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-900 dark:text-purple-100 border-l-2 border-purple-600 dark:border-purple-500' : ''}
                      ${event.color === 'orange' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-900 dark:text-orange-100 border-l-2 border-orange-600 dark:border-orange-500' : ''}
                      ${!event.color ? 'bg-gray-200 dark:bg-gray-500/20 text-gray-900 dark:text-gray-100 border-l-2 border-gray-600 dark:border-gray-500' : ''}
                    `}
                  >
                    {event.startTime && <span className="mr-1 opacity-70">{event.startTime.split(' ')[0]}</span>}
                    {event.title}
                  </div>
                ))}
                {moreCount > 0 && (
                  <div className="text-xs text-text-muted px-1 hover:text-text-primary">
                    {moreCount} more...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
