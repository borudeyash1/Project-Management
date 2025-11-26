import React from 'react';
import { format, isToday, isSameDay, parseISO } from 'date-fns';
import { CalendarEvent } from '../services/calendarApi';

interface AgendaViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const AgendaView: React.FC<AgendaViewProps> = ({ events, onEventClick }) => {
  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    if (!event.date) return acc;
    const dateKey = event.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  if (sortedDates.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted">
        No events scheduled
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-app-bg p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {sortedDates.map((dateStr) => {
          const date = parseISO(dateStr);
          const isTodayDate = isToday(date);
          const dayEvents = groupedEvents[dateStr].sort((a, b) => {
            return (a.startTime || '').localeCompare(b.startTime || '');
          });

          return (
            <div key={dateStr} className="flex gap-4">
              {/* Date Column */}
              <div className="w-24 flex-shrink-0 text-right pt-1">
                <div className={`text-sm font-medium ${isTodayDate ? 'text-accent-blue' : 'text-text-muted'}`}>
                  {format(date, 'EEE')}
                </div>
                <div className={`text-2xl font-bold ${isTodayDate ? 'text-accent-blue' : 'text-text-primary'}`}>
                  {format(date, 'd')}
                </div>
              </div>

              {/* Events Column */}
              <div className="flex-1 space-y-2 border-l border-border-subtle pl-4 pb-6">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="flex items-center gap-4 p-3 bg-card-bg rounded-lg border border-border-subtle hover:border-accent-blue transition-all cursor-pointer group"
                  >
                    <div className={`w-3 h-3 rounded-full bg-${event.color || 'blue'}-500 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-text-primary truncate group-hover:text-accent-blue transition-colors">
                        {event.title}
                      </h4>
                      <div className="text-xs text-text-muted">
                        {event.startTime} - {event.endTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgendaView;
