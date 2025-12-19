import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { getPlannerEvents, PlannerEvent } from '../../services/plannerService';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface CalendarEvent {
    date: string;
    title: string;
    type: 'event' | 'task' | 'deadline';
    time?: string;
    color?: string;
}

const CalendarWidget: React.FC = () => {
    const { isDarkMode } = useTheme();
    const { state } = useApp();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);

    const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    ).getDay();

    // Generate localized week days starting from Sunday
    const weekDays = React.useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(2025, 0, 5 + i);
            days.push(d.toLocaleString(i18n.language, { weekday: 'short' }));
        }
        return days;
    }, [i18n.language]);

    useEffect(() => {
        loadEvents();
    }, [currentDate]);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const allEvents: CalendarEvent[] = [];

            // Fetch planner events
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            try {
                const plannerEvents = await getPlannerEvents({
                    start: startOfMonth,
                    end: endOfMonth
                });

                const mappedEvents: CalendarEvent[] = plannerEvents.map((event: PlannerEvent) => {
                    const dateObj = new Date(event.start);
                    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                    const timeStr = dateObj.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });

                    return {
                        date: dateStr,
                        title: event.title,
                        type: 'event',
                        time: timeStr,
                        color: event.color || '#6366f1'
                    };
                });
                allEvents.push(...mappedEvents);
            } catch (error) {
                console.error('Failed to load planner events:', error);
            }

            setEvents(allEvents);
        } catch (error) {
            console.error('Error loading calendar events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(clickedDate);
    };

    const getEventsForDate = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.date === dateStr);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        return (
            day === selectedDate.getDate() &&
            currentDate.getMonth() === selectedDate.getMonth() &&
            currentDate.getFullYear() === selectedDate.getFullYear()
        );
    };

    const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate.getDate()) : [];

    return (
        <div className={`rounded-2xl border transition-all duration-300 ${isDarkMode
                ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm'
                : 'bg-gradient-to-br from-white to-blue-50/30 border-gray-200/50 shadow-lg'
            } overflow-hidden h-full flex flex-col`}>
            {/* Header */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-500/10'}`}>
                            <CalendarIcon className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Calendar
                            </h3>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Powered by Sartthi
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/planner')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isDarkMode
                                ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                                : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
                            }`}
                    >
                        View Planner
                    </button>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handlePrevMonth}
                        className={`p-2 rounded-lg transition-all ${isDarkMode
                                ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {currentDate.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
                    </h4>
                    <button
                        onClick={handleNextMonth}
                        className={`p-2 rounded-lg transition-all ${isDarkMode
                                ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4 flex-1 flex flex-col min-h-0">
                {/* Week Days */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day, index) => (
                        <div
                            key={index}
                            className={`text-center text-xs font-medium py-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1 flex-1">
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                        <div key={`empty-${index}`} className="aspect-square" />
                    ))}

                    {/* Actual days */}
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                        const day = index + 1;
                        const dayEvents = getEventsForDate(day);
                        const today = isToday(day);
                        const selected = isSelected(day);

                        return (
                            <button
                                key={day}
                                onClick={() => handleDateClick(day)}
                                className={`aspect-square rounded-lg p-1 text-xs font-medium transition-all relative group ${today
                                        ? isDarkMode
                                            ? 'bg-blue-500/20 text-blue-400 ring-2 ring-blue-500/50'
                                            : 'bg-blue-500/20 text-blue-600 ring-2 ring-blue-500/50'
                                        : selected
                                            ? isDarkMode
                                                ? 'bg-blue-500/30 text-white'
                                                : 'bg-blue-500/30 text-blue-900'
                                            : isDarkMode
                                                ? 'text-gray-300 hover:bg-gray-700/50'
                                                : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <span className="block">{day}</span>
                                {dayEvents.length > 0 && (
                                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                                        {dayEvents.slice(0, 3).map((event, i) => (
                                            <div
                                                key={i}
                                                className="w-1 h-1 rounded-full"
                                                style={{ backgroundColor: event.color || '#6366f1' }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Selected Date Events */}
                {selectedDate && selectedDateEvents.length > 0 && (
                    <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                        <h5 className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedDate.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}
                        </h5>
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                            {selectedDateEvents.map((event, index) => (
                                <div
                                    key={index}
                                    className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-white/50'
                                        } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div
                                            className="w-1 h-full rounded-full mt-1"
                                            style={{ backgroundColor: event.color || '#6366f1' }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-900'
                                                }`}>
                                                {event.title}
                                            </p>
                                            {event.time && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Clock className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {event.time}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarWidget;
