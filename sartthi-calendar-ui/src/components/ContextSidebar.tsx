import React from 'react';
import { Calendar, Users, Video, Mail, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { CalendarEvent } from '../services/calendarApi';

interface ContextSidebarProps {
  selectedEvent: CalendarEvent | null;
  onClose: () => void;
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  events?: CalendarEvent[];
}

const ContextSidebar: React.FC<ContextSidebarProps> = ({ selectedEvent, onClose, currentDate = new Date(), onDateChange, events = [] }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    gray: 'bg-gray-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  if (!selectedEvent) {
    // Filter and sort upcoming events
    const upcomingEvents = events
      .filter(event => {
        const eventDate = new Date(`${event.date}T${event.startTime}`);
        return eventDate > new Date();
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5); // Show next 5 events

    return (
      <div className="w-80 bg-sidebar-bg border-l border-border-subtle p-6 overflow-y-auto flex flex-col h-full">
        {/* Mini Calendar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">{format(currentDate, 'MMMM yyyy')}</h3>
            <div className="flex gap-1">
              <button 
                onClick={() => onDateChange?.(subMonths(currentDate, 1))}
                className="p-1 hover:bg-hover-bg rounded text-text-muted hover:text-text-primary transition-colors"
              >
                ←
              </button>
              <button 
                onClick={() => onDateChange?.(addMonths(currentDate, 1))}
                className="p-1 hover:bg-hover-bg rounded text-text-muted hover:text-text-primary transition-colors"
              >
                →
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-text-muted font-medium">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {eachDayOfInterval({
              start: startOfMonth(currentDate),
              end: endOfMonth(currentDate)
            }).map((date, i) => {
              const isCurrent = isSameDay(date, currentDate);
              const isTodayDate = isToday(date);
              
              return (
                <div
                  key={i}
                  onClick={() => onDateChange?.(date)}
                  className={`
                    p-1.5 rounded-full cursor-pointer transition-all
                    ${isCurrent ? 'bg-accent-blue text-white font-bold' : ''}
                    ${!isCurrent && isTodayDate ? 'text-accent-blue font-bold border border-accent-blue/30' : ''}
                    ${!isCurrent && !isTodayDate ? 'text-text-primary hover:bg-hover-bg' : ''}
                  `}
                >
                  {format(date, 'd')}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, i) => (
                <div key={event.id || i} className="flex items-center gap-3 p-3 rounded-lg bg-card-bg border border-border-subtle hover:border-accent-blue/50 transition-colors cursor-pointer group">
                  <div className={`w-1 h-8 rounded-full ${colorMap[event.color || 'blue']}`} />
                  <div>
                    <h4 className="text-sm font-medium text-text-primary group-hover:text-accent-blue transition-colors">{event.title}</h4>
                    <p className="text-xs text-text-muted">
                      {isToday(new Date(event.date)) ? 'Today' : format(new Date(event.date), 'MMM d')} • {event.startTime}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-text-muted italic p-2">No upcoming events</div>
            )}
          </div>
        </div>

        {/* Keyboard Shortcuts (Collapsed/Smaller) */}
        <div>
          <h3 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Shortcuts</h3>
          <div className="space-y-2">
            <ShortcutItem keys={['C']} description="Create Event" />
            <ShortcutItem keys={['W', 'M']} description="View Switch" />
          </div>
        </div>
      </div>
    );
  }

  const isUpcoming = () => {
    // Check if event starts within 15 minutes
    const now = new Date();
    const eventTime = new Date(); // Parse selectedEvent.startTime
    const diff = eventTime.getTime() - now.getTime();
    return diff > 0 && diff < 15 * 60 * 1000;
  };

  return (
    <div className="w-80 bg-sidebar-bg border-l border-border-subtle overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-1 h-12 rounded-full ${colorMap[selectedEvent.color || 'blue']}`} />
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">{selectedEvent.title}</h2>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Clock className="w-4 h-4" />
          <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
        </div>
      </div>

      {/* Description */}
      {selectedEvent.description && (
        <div className="p-6 border-b border-border-subtle">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Description</h3>
          <p className="text-sm text-text-light leading-relaxed">{selectedEvent.description}</p>
        </div>
      )}

      {/* Attendees */}
      {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
        <div className="p-6 border-b border-border-subtle">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Attendees ({selectedEvent.attendees.length})
          </h3>
          <div className="space-y-2">
            {selectedEvent.attendees.map((attendee, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-blue text-white flex items-center justify-center text-xs font-semibold">
                  {getInitials(attendee.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">{attendee.name}</div>
                  <div className="text-xs text-text-muted truncate">{attendee.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-6 space-y-3">
        {selectedEvent.meetingLink && (
          <button
            className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              isUpcoming()
                ? 'bg-accent-blue text-white hover:bg-blue-600 animate-pulse'
                : 'bg-blue-500/20 text-blue-100 hover:bg-blue-500/30'
            }`}
            onClick={() => window.open(selectedEvent.meetingLink, '_blank')}
          >
            <Video className="w-4 h-4" />
            {isUpcoming() ? 'Join Now' : 'Join Meeting'}
          </button>
        )}
        
        <button className="w-full py-2.5 px-4 rounded-lg bg-card-bg hover:bg-hover-bg text-text-primary font-medium transition-colors flex items-center justify-center gap-2">
          <Mail className="w-4 h-4" />
          Email Participants
        </button>
        
        <button className="w-full py-2.5 px-4 rounded-lg bg-card-bg hover:bg-hover-bg text-text-primary font-medium transition-colors flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4" />
          Edit Event
        </button>
      </div>
    </div>
  );
};

const ShortcutItem: React.FC<{ keys: string[]; description: string }> = ({ keys, description }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-text-light">{description}</span>
    <div className="flex gap-1">
      {keys.map((key, idx) => (
        <kbd
          key={idx}
          className="px-2 py-1 text-xs font-mono bg-card-bg border border-border-subtle rounded text-text-primary"
        >
          {key}
        </kbd>
      ))}
    </div>
  </div>
);

export default ContextSidebar;
