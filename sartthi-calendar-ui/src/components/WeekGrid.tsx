import React, { useEffect, useState, useCallback } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import {
  format, startOfWeek, endOfWeek, addWeeks, subWeeks,
  addDays, isSameDay, parseISO, isToday, startOfMonth, endOfMonth, addMonths, subMonths,
  startOfYear, endOfYear
} from 'date-fns';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import EventCard from './EventCard';
import ContextSidebar from './ContextSidebar';
import QuickEventModal from './QuickEventModal';
import ViewSwitcher, { CalendarViewType } from './ViewSwitcher';
import MonthView from './MonthView';
import YearView from './YearView';
import EventDetailPopover from './EventDetailPopover';
import { calendarApi, CalendarEvent } from '../services/calendarApi';
import { useToast } from '../context/ToastContext';
import ProfileMenu from './ProfileMenu/ProfileMenu';

interface WeekGridProps {
  user?: any;
}

const WeekGrid: React.FC<WeekGridProps> = ({ user }) => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<CalendarViewType>('week');

  // View Settings
  const [workHoursOnly, setWorkHoursOnly] = useState(false);
  const [dimPastEvents, setDimPastEvents] = useState(false);

  // Modal State
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalInitialDate, setModalInitialDate] = useState<Date | undefined>(undefined);
  const [modalInitialTime, setModalInitialTime] = useState<string | undefined>(undefined);

  // Calendar List State
  const [myCalendars, setMyCalendars] = useState([
    { id: 'primary', label: 'Yash Borude', color: 'bg-blue-500', checked: true },
    { id: 'birthdays', label: 'Birthdays', color: 'bg-green-500', checked: true },
    { id: 'tasks', label: 'Tasks', color: 'bg-purple-500', checked: true },
  ]);

  const [otherCalendars, setOtherCalendars] = useState([
    { id: 'holidays', label: 'Holidays in India', color: 'bg-orange-500', checked: true },
    { id: 'travel', label: 'Travel Schedule', color: 'bg-gray-500', checked: true },
  ]);

  const handleToggleCalendar = (id: string, isOther: boolean = false) => {
    if (isOther) {
      setOtherCalendars(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
    } else {
      setMyCalendars(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
    }
  };

  // Filter events based on active calendars
  const getBaseColor = (twColor: string) => twColor.replace('bg-', '').replace('-500', '');

  const visibleEvents = events.filter(event => {
    // match event.color against checked calendars
    const eventColor = event.color || 'blue'; // Default to blue

    // Find which calendar this color belongs to
    const myCal = myCalendars.find(c => getBaseColor(c.color) === eventColor);
    if (myCal) return myCal.checked;

    const otherCal = otherCalendars.find(c => getBaseColor(c.color) === eventColor);
    if (otherCal) return otherCal.checked;

    return true; // If color doesn't match any calendar, show it (e.g. unknown categories)
  });

  // Fetch events when date range changes
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      let start, end;

      if (currentView === 'month') {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        start = startOfWeek(monthStart, { weekStartsOn: 1 }).toISOString();
        end = endOfWeek(monthEnd, { weekStartsOn: 1 }).toISOString();
      } else if (currentView === 'year') {
        const yearStart = startOfWeek(startOfMonth(startOfYear(currentDate)), { weekStartsOn: 1 });
        const yearEnd = endOfWeek(endOfMonth(endOfYear(currentDate)), { weekStartsOn: 1 });
        start = yearStart.toISOString();
        end = yearEnd.toISOString();
      } else {
        // For day, week views
        start = startOfWeek(currentDate, { weekStartsOn: 1 }).toISOString();
        end = endOfWeek(currentDate, { weekStartsOn: 1 }).toISOString();
      }

      if (start && end) {
        const data = await calendarApi.getEvents(start, end);
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [currentDate, currentView, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Navigation Logic
  const handleNavigate = (direction: 'prev' | 'next') => {
    switch (currentView) {
      case 'day':
        setCurrentDate(prev => direction === 'next' ? addDays(prev, 1) : addDays(prev, -1));
        break;
      case 'week':
        setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
        break;
      case 'year':
        setCurrentDate(prev => direction === 'next' ? addMonths(prev, 12) : subMonths(prev, 12));
        break;
      default:
        setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 't': setCurrentDate(new Date()); break;
        case 'd': setCurrentView('day'); break;
        case 'w': setCurrentView('week'); break;
        case 'm': setCurrentView('month'); break;
        case 'y': setCurrentView('year'); break;
        case 'c':
          setModalInitialDate(new Date());
          setModalInitialTime(format(new Date(), 'HH:mm'));
          setShowEventModal(true);
          break;
        case 'escape': setSelectedEvent(null); break;
        case 'arrowleft': handleNavigate('prev'); break;
        case 'arrowright': handleNavigate('next'); break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentView]);

  // View Configuration
  const getVisibleDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    switch (currentView) {
      case 'day': return [currentDate];
      case 'week':
      default: return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
  };

  const visibleDays = getVisibleDays();

  // Generate hours based on workHoursOnly setting
  const hours = workHoursOnly
    ? Array.from({ length: 11 }, (_, i) => i + 8) // 8 AM to 6 PM
    : Array.from({ length: 24 }, (_, i) => i);

  // Time Grid Helpers
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimePosition = (currentHour * 60 + currentMinute) - (workHoursOnly ? 8 * 60 : 0);
  const showCurrentTimeIndicator = !workHoursOnly || (currentHour >= 8 && currentHour <= 18);

  const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const parts = time.split(' ');
    if (parts.length < 2) return 0;
    const [timePart, period] = parts;
    let [h, m] = timePart.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return 0;
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;

    // Adjust for work hours view
    let minutes = h * 60 + m;
    if (workHoursOnly) {
      minutes -= 8 * 60; // Offset by start hour (8 AM)
    }
    return minutes;
  };

  // Resize Logic
  const [resizingEvent, setResizingEvent] = useState<{ id: string, startY: number, originalHeight: number, originalEndTime: string } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingEvent) return;

      const deltaY = e.clientY - resizingEvent.startY;
      // const minutesDelta = Math.round(deltaY / 60 * 60); 
      // const snappedMinutes = Math.round(minutesDelta / 15) * 15;

      // Visual feedback logic would go here
    };

    const handleMouseUp = async (e: MouseEvent) => {
      if (!resizingEvent) return;

      const deltaY = e.clientY - resizingEvent.startY;
      const minutesDelta = Math.round(deltaY / 60 * 60); // 60px = 60min assuming 60px/hr
      const snappedMinutes = Math.round(minutesDelta / 15) * 15;

      if (snappedMinutes !== 0) {
        const event = events.find(e => e.id === resizingEvent.id);
        if (event) {
          const endMinutes = timeToMinutes(resizingEvent.originalEndTime) + snappedMinutes;
          // Convert back to HH:mm
          const h = Math.floor(endMinutes / 60);
          const m = endMinutes % 60;

          // Basic formatting (simplified, assumes same day)
          const newEndTime = `${h > 12 ? h - 12 : (h === 0 || h === 24 ? 12 : h)}:${m.toString().padStart(2, '0')} ${h >= 12 && h < 24 ? 'PM' : 'AM'}`;

          // Update Event
          try {
            const updatedEvent = { ...event, endTime: newEndTime };
            // Optimistic update
            setEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));
            await calendarApi.updateEvent(event.id, { endTime: newEndTime });
          } catch (err) {
            toast.error("Failed to resize event");
            fetchEvents(); // Revert
          }
        }
      }

      setResizingEvent(null);
      document.body.style.cursor = 'default';
    };

    if (resizingEvent) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingEvent, events]);

  const handleResizeStart = (e: React.MouseEvent, event: CalendarEvent, height: number) => {
    e.stopPropagation(); // Prevent drag from firing
    setResizingEvent({
      id: event.id,
      startY: e.clientY,
      originalHeight: height,
      originalEndTime: event.endTime
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, delta } = event;
    if (!delta.y) return;

    const eventId = active.id.toString().replace('event-', '');
    const targetEvent = events.find(e => e.id === eventId);

    // Calculate 1px = 1min
    const minutesDelta = Math.round(delta.y); // Direct mapping if 60px = 1 hr (60min)
    const snappedMinutes = Math.round(minutesDelta / 15) * 15;

    if (targetEvent && snappedMinutes !== 0) {
      const oldStart = timeToMinutes(targetEvent.startTime);
      const oldEnd = timeToMinutes(targetEvent.endTime);

      const newStartMins = oldStart + snappedMinutes;
      const newEndMins = oldEnd + snappedMinutes;

      // Helpers to format back to string
      const formatTime = (totalMins: number) => {
        let h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        const period = h >= 12 && h < 24 ? 'PM' : 'AM';
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        if (h === 24) h = 12; // Handle midnight wrap if needed
        return `${h}:${m.toString().padStart(2, '0')} ${period}`;
      };

      const newStartTime = formatTime(newStartMins);
      const newEndTime = formatTime(newEndMins);

      try {
        const updated = { ...targetEvent, startTime: newStartTime, endTime: newEndTime };
        setEvents(prev => prev.map(e => e.id === eventId ? updated : e));
        await calendarApi.updateEvent(eventId, { startTime: newStartTime, endTime: newEndTime });
      } catch (err) {
        toast.error("Failed to move event");
        fetchEvents();
      }
    }
  };

  const handleGridClick = (day: Date, hour: number) => {
    setModalInitialDate(day);
    setModalInitialTime(`${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${'00'} ${hour >= 12 ? 'PM' : 'AM'}`);
    setShowEventModal(true);
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      const newEvent = await calendarApi.createEvent({
        ...eventData,
      });
      setEvents([...events, newEvent]);
      toast.success('Event created successfully');
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-app-bg text-text-primary overflow-hidden">
        {/* Main Calendar Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {loading && (
            <div className="absolute inset-0 bg-app-bg/50 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-sidebar-bg/50 backdrop-blur-md relative z-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Sartthi Calendar" className="h-6" />
                <span className="text-[18px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  Calendar
                </span>
                <span className="text-xl text-text-muted mx-2">|</span>
                <h1 className="text-xl font-bold text-text-primary min-w-[160px]">
                  {format(currentDate, 'MMMM yyyy')}
                </h1>
              </div>
              <div className="flex items-center bg-card-bg rounded-lg border border-border-subtle p-1">
                <button
                  onClick={() => handleNavigate('prev')}
                  className="p-1 hover:bg-hover-bg rounded text-text-muted hover:text-text-primary transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 text-sm font-medium text-text-primary hover:bg-hover-bg rounded transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => handleNavigate('next')}
                  className="p-1 hover:bg-hover-bg rounded text-text-muted hover:text-text-primary transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <ViewSwitcher
                currentView={currentView}
                onViewChange={setCurrentView}
                workHoursOnly={workHoursOnly}
                setWorkHoursOnly={setWorkHoursOnly}
                dimPastEvents={dimPastEvents}
                setDimPastEvents={setDimPastEvents}
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setModalInitialDate(new Date());
                  setModalInitialTime(format(new Date(), 'HH:mm'));
                  setShowEventModal(true);
                }}
                className="bg-accent-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
              >
                Create
              </button>

              {/* User Profile */}
              {user && (
                <ProfileMenu
                  user={{
                    fullName: user.name || user.fullName || 'User',
                    email: user.email
                  }}
                />
              )}

              {/* Sidebar Toggle */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-hover-bg rounded-lg text-text-muted hover:text-text-primary transition-colors"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* View Content */}
          {currentView === 'month' ? (
            <MonthView
              currentDate={currentDate}
              events={visibleEvents}
              onDateClick={(date) => {
                setCurrentDate(date);
                setCurrentView('day');
              }}
              onEventClick={setSelectedEvent}
            />
          ) : currentView === 'year' ? (
            <YearView
              currentDate={currentDate}
              onMonthClick={(date) => {
                setCurrentDate(date);
                setCurrentView('month');
              }}
            />
          ) : (
            /* Time Grid (Day, Week) */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Days Header */}
              <div className="flex border-b border-border-subtle bg-sidebar-bg/30 pr-[16px]"> {/* pr for scrollbar compensation */}
                <div className="w-16 flex-shrink-0 border-r border-border-subtle" />
                {visibleDays.map((day) => {
                  const isTodayDate = isToday(day);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`flex-1 py-3 text-center border-r border-border-subtle last:border-r-0 ${isTodayDate ? 'bg-accent-blue/5' : ''
                        }`}
                    >
                      <div className={`text-xs font-semibold ${isTodayDate ? 'text-accent-blue' : 'text-text-muted'}`}>
                        {format(day, 'EEE').toUpperCase()}
                      </div>
                      <div className={`text-2xl font-bold mt-1 ${isTodayDate ? 'text-accent-blue' : 'text-text-primary'}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scrollable Grid */}
              <div className="flex-1 overflow-y-auto relative custom-scrollbar">
                <div className="flex min-h-[1440px]">
                  {/* Time Column */}
                  <div className="w-16 flex-shrink-0 border-r border-border-subtle bg-sidebar-bg/30 sticky left-0 z-10">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="h-[60px] border-b border-border-subtle text-right pr-2 pt-1 relative"
                      >
                        <span className="text-2xs text-text-lighter -translate-y-1/2 block">
                          {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Day Columns */}
                  {visibleDays.map((day) => (
                    <div
                      key={day.toISOString()}
                      className="flex-1 relative border-r border-border-subtle last:border-r-0 min-w-[120px]"
                    >
                      {/* Hour Cells */}
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="h-[60px] border-b border-border-subtle hover:bg-hover-bg/30 transition-colors cursor-pointer"
                          onClick={() => handleGridClick(day, hour)}
                        />
                      ))}

                      {/* Events */}
                      {visibleEvents
                        .filter((event) => event.date && event.startTime && event.endTime && isSameDay(parseISO(event.date), day))
                        .map((event) => {
                          const startMinutes = timeToMinutes(event.startTime);
                          const endMinutes = timeToMinutes(event.endTime);
                          const height = Math.max(endMinutes - startMinutes, 30);

                          // Skip rendering if event is outside work hours when filter is active
                          if (workHoursOnly && (startMinutes < 0 || startMinutes > (18 - 8) * 60)) {
                            // Optional: could render a small indicator
                          }

                          const isPast = new Date(`${event.date}T${event.startTime}`) < new Date();
                          // const opacityClass = dimPastEvents && isPast ? 'opacity-50' : '';

                          return (
                            <EventCard
                              key={event.id}
                              id={event.id}
                              title={event.title}
                              time={`${event.startTime} - ${event.endTime}`}
                              color={event.color || 'blue'}
                              top={startMinutes}
                              height={height}
                              onResizeStart={(e) => handleResizeStart(e, event, height)}
                            />
                          );
                        })}

                      {/* Current Time Indicator */}
                      {isToday(day) && showCurrentTimeIndicator && (
                        <div
                          className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                          style={{ top: `${currentTimePosition}px` }}
                        >
                          <div className="w-2 h-2 rounded-full bg-accent-red -ml-1 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                          <div className="h-[2px] bg-accent-red flex-1 shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Event Detail Popover */}
        {selectedEvent && (
          <EventDetailPopover
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onEdit={(event) => {
              setSelectedEvent(null);
              // Populate modal with event data for editing
              setModalInitialDate(new Date(event.date));
              setModalInitialTime(event.startTime);
              setShowEventModal(true);
            }}
            onDelete={async (eventId) => {
              try {
                await calendarApi.deleteEvent(eventId);
                setEvents(events.filter(e => e.id !== eventId));
                setSelectedEvent(null);
                toast.success('Event deleted');
              } catch (error) {
                toast.error('Failed to delete event');
              }
            }}
          />
        )}

        {/* Context Sidebar (Only for Mini Calendar now) */}
        {isSidebarOpen && (
          <ContextSidebar
            selectedEvent={null} // No longer used for details
            onClose={() => setIsSidebarOpen(false)}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            events={visibleEvents}
            myCalendars={myCalendars}
            otherCalendars={otherCalendars}
            onToggleCalendar={handleToggleCalendar}
          />
        )}
      </div>

      {/* Quick Event Modal */}
      <QuickEventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        initialDate={modalInitialDate}
        initialTime={modalInitialTime}
        onSave={handleCreateEvent}
      />
    </DndContext>
  );
};

export default WeekGrid;
