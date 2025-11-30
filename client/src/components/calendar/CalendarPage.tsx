import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WeekGrid, { Event } from './WeekGrid';

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/sartthi/calendar/events');
      const fetchedEvents = response.data.events.map((event: any) => ({
        id: event.id || Math.random().toString(),
        title: event.title,
        startTime: new Date(event.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        endTime: new Date(event.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        day: event.day !== undefined ? event.day : (new Date(event.startTime).getDay() === 0 ? 6 : new Date(event.startTime).getDay() - 1),
        color: event.color || 'blue',
      }));
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <WeekGrid events={events} />
    </div>
  );
};

export default CalendarPage;
