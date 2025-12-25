import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, Clock, Users, Filter, Clock3, Calendar as CalendarIcon, X, Check, Clock as ClockIcon, Hash } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { getPlannerEvents, PlannerEvent, updateEventParticipation, createPlannerEvent } from '../services/plannerService';
import { apiService } from '../services/api';

const PlannerPage: React.FC = () => {
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<PlannerEvent | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState<boolean>(false);
  const [newEvent, setNewEvent] = useState<Partial<PlannerEvent>>({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(new Date().setHours(new Date().getHours() + 1)),
    allDay: false,
    color: '#3b82f6',
    slackChannelId: ''
  });
  const [slackChannels, setSlackChannels] = useState<Array<{ id: string; name: string }>>([]);
  const [hasSlackConnected, setHasSlackConnected] = useState(false);

  useEffect(() => {
    checkSlackConnection();
  }, []);

  const checkSlackConnection = async () => {
    try {
      const response = await apiService.get('/sartthi-accounts/slack');
      if (response.success && response.data.accounts && response.data.accounts.length > 0) {
        setHasSlackConnected(true);
        fetchSlackChannels();
      }
    } catch (error) {
      console.error('Failed to check Slack connection:', error);
    }
  };

  const fetchSlackChannels = async () => {
    try {
      const response = await apiService.get('/slack/channels');
      if (response.success) {
        setSlackChannels(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch Slack channels:', error);
    }
  };

  // Fetch events from the API
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start week on Monday
      const endOfWeekDate = addDays(startOfWeekDate, 6);

      const data = await getPlannerEvents({
        start: startOfWeekDate,
        end: endOfWeekDate,
      });

      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle event participation (accept/decline)
  const handleParticipation = async (eventId: string, status: 'accepted' | 'declined' | 'tentative') => {
    try {
      const updatedEvent = await updateEventParticipation(eventId, status);
      setEvents(events.map(evt => evt._id === updatedEvent._id ? updatedEvent : evt));

      if (selectedEvent?._id === eventId) {
        setSelectedEvent(updatedEvent);
      }
    } catch (err) {
      console.error('Error updating participation:', err);
      setError('Failed to update event participation. Please try again.');
    }
  };

  // Handle creating a new event
  const handleCreateEvent = async () => {
    try {
      const eventData = {
        ...newEvent,
        createdBy: '', // Will be set by backend from auth
      };
      await createPlannerEvent(eventData as any);

      // Reset form and close modal
      setIsCreatingEvent(false);
      setNewEvent({
        title: '',
        description: '',
        start: new Date(),
        end: new Date(new Date().setHours(new Date().getHours() + 1)),
        allDay: false,
        color: '#3b82f6',
        slackChannelId: ''
      });

      // Refresh events
      await fetchEvents();
    } catch (error) {
      console.error('Failed to create event:', error);
      setError('Failed to create event. Please try again.');
    }
  };

  // Generate days for the week view
  const weekDays = [];
  const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 });

  for (let i = 0; i < 7; i++) {
    const day = addDays(startOfWeekDate, i);
    weekDays.push(day);
  }

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventStart = typeof event.start === 'string' ? new Date(event.start) : event.start;
      return isSameDay(eventStart, day);
    });
  };

  // Navigate to previous/next week
  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, -7));
  };

  const goToNextWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, 7));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Planner</h1>
          <p className="text-sm text-gray-600 dark:text-gray-200">
            {format(startOfWeekDate, 'MMM d')} - {format(addDays(startOfWeekDate, 6), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Today
          </button>
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-md">
            <button
              onClick={goToPreviousWeek}
              className="px-2 py-1.5 text-gray-600 dark:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              &lt;
            </button>
            <button
              onClick={goToNextWeek}
              className="px-2 py-1.5 text-gray-600 dark:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 border-l border-gray-300 dark:border-gray-600"
            >
              &gt;
            </button>
          </div>
          <button
            onClick={() => setIsCreatingEvent(true)}
            className="ml-2 px-4 py-1.5 text-sm font-medium text-gray-900 bg-accent rounded-md hover:bg-accent-hover flex items-center"
          >
            <Plus size={16} className="mr-1" />
            New Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-300 dark:border-gray-600">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`py-2 text-center font-medium ${isSameDay(day, new Date()) ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-800'}`}
            >
              <div className="text-sm text-gray-600 dark:text-gray-200">
                {format(day, 'EEE')}
              </div>
              <div className={`mt-1 text-lg ${isSameDay(day, new Date()) ? 'text-accent-dark dark:text-accent-light font-bold' : 'text-gray-900 dark:text-white'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-7 divide-x divide-gray-200 dark:divide-gray-700">
          {weekDays.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className={`min-h-32 p-2 ${isSameDay(day, new Date()) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
            >
              <div className="space-y-1">
                {getEventsForDay(day).map(event => {
                  const eventStart = typeof event.start === 'string' ? new Date(event.start) : event.start;
                  const eventEnd = event.end ? (typeof event.end === 'string' ? new Date(event.end) : event.end) : null;

                  return (
                    <div
                      key={event._id}
                      onClick={() => setSelectedEvent(event)}
                      className="p-2 text-xs rounded cursor-pointer truncate"
                      style={{
                        backgroundColor: `${event.color}20`,
                        borderLeft: `3px solid ${event.color}`,
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-gray-600 dark:text-gray-300 text-xs flex items-center">
                        <ClockIcon size={10} className="mr-1" />
                        {format(eventStart, 'h:mm a')}
                        {eventEnd && ` - ${format(eventEnd, 'h:mm a')}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{selectedEvent.title}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-600 hover:text-gray-600 dark:hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              {selectedEvent.description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-700">{selectedEvent.description}</p>
              )}

              <div className="mt-4 space-y-3">
                <div className="flex items-start">
                  <CalendarIcon size={16} className="mt-0.5 mr-2 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {format(new Date(selectedEvent.start), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-200">
                      {format(new Date(selectedEvent.start), 'h:mm a')}
                      {selectedEvent.end && ` - ${format(new Date(selectedEvent.end), 'h:mm a')}`}
                    </p>
                  </div>
                </div>

                {selectedEvent.participants && selectedEvent.participants.length > 0 && (
                  <div className="flex items-start">
                    <Users size={16} className="mt-0.5 mr-2 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Participants</p>
                      <div className="space-y-1">
                        {selectedEvent.participants.map((participant, idx) => (
                          <div key={idx} className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-700">
                              {participant.userId} • {participant.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-2">
                <button
                  onClick={() => handleParticipation(selectedEvent._id, 'accepted')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 flex items-center justify-center"
                >
                  <Check size={16} className="mr-1" /> Accept
                </button>
                <button
                  onClick={() => handleParticipation(selectedEvent._id, 'declined')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleParticipation(selectedEvent._id, 'tentative')}
                  className="flex-1 px-4 py-2 bg-accent text-gray-900 text-sm font-medium rounded-md hover:bg-accent-hover"
                >
                  Maybe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {isCreatingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">New Event</h3>
                <button
                  onClick={() => setIsCreatingEvent(false)}
                  className="text-gray-600 hover:text-gray-600 dark:hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="event-title"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Event title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event-start" className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-1">
                      Start
                    </label>
                    <input
                      type="datetime-local"
                      id="event-start"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white"
                      value={newEvent.start ? (newEvent.start instanceof Date ? newEvent.start.toISOString().slice(0, 16) : newEvent.start) : ''}
                      onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value ? new Date(e.target.value) : new Date() })}
                    />
                  </div>

                  <div>
                    <label htmlFor="event-end" className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-1">
                      End
                    </label>
                    <input
                      type="datetime-local"
                      id="event-end"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white"
                      value={newEvent.end ? (newEvent.end instanceof Date ? newEvent.end.toISOString().slice(0, 16) : newEvent.end) : ''}
                      onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value ? new Date(e.target.value) : new Date() })}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="event-description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white"
                    value={newEvent.description || ''}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Add details about your event"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="event-allday"
                    className="h-4 w-4 text-accent-dark focus:ring-accent border-gray-300 rounded"
                    checked={newEvent.allDay || false}
                    onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                  />
                  <label htmlFor="event-allday" className="ml-2 block text-sm text-gray-700 dark:text-gray-700">
                    All day event
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex space-x-2">
                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-6 h-6 rounded-full ${newEvent.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewEvent({ ...newEvent, color })}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Slack Channel */}
                {hasSlackConnected && slackChannels.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-1">
                      <Hash className="w-4 h-4 inline mr-1" />
                      Slack Channel (Optional)
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white"
                      value={newEvent.slackChannelId || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, slackChannelId: e.target.value })}
                    >
                      <option value="">Don't post to Slack</option>
                      {slackChannels.map((channel) => (
                        <option key={channel.id} value={channel.id}>
                          #{channel.name}
                        </option>
                      ))}
                    </select>
                    {newEvent.slackChannelId && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Hash className="w-3 h-3" />
                        <span>
                          Will post to: <strong>#{slackChannels.find(c => c.id === newEvent.slackChannelId)?.name}</strong>
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Post this event to a Slack channel when created
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingEvent(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateEvent}
                  className="px-4 py-2 text-sm font-medium text-gray-900 bg-accent border border-transparent rounded-md shadow-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerPage;
