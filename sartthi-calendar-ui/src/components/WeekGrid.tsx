import React, { useEffect, useState, useCallback } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { 
  format, startOfWeek, endOfWeek, addWeeks, subWeeks, 
  addDays, isSameDay, parseISO, isToday, startOfMonth, endOfMonth, addMonths, subMonths,
  startOfYear, endOfYear
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Menu, X } from 'lucide-react';
import EventCard from './EventCard';
import ContextSidebar from './ContextSidebar';
import QuickEventModal from './QuickEventModal';
import ViewSwitcher, { CalendarViewType } from './ViewSwitcher';
import MonthView from './MonthView';
import YearView from './YearView';
import EventDetailPopover from './EventDetailPopover';
import { calendarApi, CalendarEvent } from '../services/calendarApi';
import { useToast } from '../context/ToastContext';

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

  const handleDragEnd = (event: DragEndEvent) => {
    console.log('Drag ended:', event);
  };

  const handleGridClick = (day: Date, hour: number) => {
    setModalInitialDate(day);
    setModalInitialTime(`${hour.toString().padStart(2, '0')}:00`);
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
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-sidebar-bg/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold flex items-center gap-2 min-w-[200px]">
                <CalendarIcon className="text-accent-blue" />
                {format(currentDate, 'MMMM yyyy')}
              </h1>
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
                <div className="flex items-center gap-3 pl-4 border-l border-border-subtle">
                  <div className="text-right hidden md:block">
                    <div className="text-sm font-medium text-text-primary">{user.name}</div>
                    <div className="text-xs text-text-muted">{user.email}</div>
                  </div>
                  {user.picture || user.avatar ? (
                    <img 
                      src={user.picture || user.avatar} 
                      alt={user.name} 
                      className="w-9 h-9 rounded-full border border-border-subtle object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
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
              events={events} 
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
                      className={`flex-1 py-3 text-center border-r border-border-subtle last:border-r-0 ${
                        isTodayDate ? 'bg-accent-blue/5' : ''
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
                      {events
                        .filter((event) => event.date && event.startTime && event.endTime && isSameDay(parseISO(event.date), day))
                        .map((event) => {
                          const startMinutes = timeToMinutes(event.startTime);
                          const endMinutes = timeToMinutes(event.endTime);
                          const height = Math.max(endMinutes - startMinutes, 30);
                          
                          // Skip rendering if event is outside work hours when filter is active
                          if (workHoursOnly && (startMinutes < 0 || startMinutes > (18-8)*60)) {
                             // Optional: could render a small indicator
                          }

                          const isPast = new Date(`${event.date}T${event.startTime}`) < new Date();
                          const opacityClass = dimPastEvents && isPast ? 'opacity-50' : '';

                          return (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                              }}
                              className={`absolute w-[95%] left-[2.5%] z-10 cursor-pointer transition-transform hover:scale-[1.02] ${opacityClass}`}
                              style={{ top: `${startMinutes}px`, height: `${height}px` }}
                            >
                              <EventCard
                                title={event.title}
                                time={`${event.startTime} - ${event.endTime}`}
                                color={event.color || 'blue'}
                                top={0}
                                height={height}
                              />
                            </div>
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
              // You might need to update QuickEventModal to handle "Edit Mode" or pre-fill data
              // For now, we'll just open the create modal as a placeholder or "Duplicate" style
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
            events={events}
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
