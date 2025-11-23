import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getCalendarEvents } from '../../services/calendarService';
import { useTranslation } from 'react-i18next';

interface CalendarEvent {
    date: string;
    title: string;
    type: 'task' | 'deadline' | 'meeting';
}

const CalendarWidget: React.FC = () => {
    const { isDarkMode } = useTheme();
    const { t, i18n } = useTranslation();
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
        // Jan 5, 2025 is a Sunday
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
            const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            const data = await getCalendarEvents(monthStr);
            setEvents(data);
        } catch (error) {
            console.error('Failed to load calendar events:', error);
        } finally {
            setLoading(false);
        }
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const hasEvent = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.some(event => event.date === dateStr);
    };

    const getEventsForDate = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(event => event.date === dateStr);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const renderCalendarDays = () => {
        const days = [];

        // Empty cells for days before month starts
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(
                <div key={`empty-${i}`} className="aspect-square" />
            );
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const hasEvents = hasEvent(day);
            const today = isToday(day);

            days.push(
                <button
                    key={day}
                    onClick={() => {
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        setSelectedDate(date);
                    }}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all relative ${today
                            ? 'bg-blue-600 text-white font-bold'
                            : hasEvents
                                ? isDarkMode
                                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                                    : 'bg-blue-50 text-gray-900 hover:bg-blue-100'
                                : isDarkMode
                                    ? 'text-gray-300 hover:bg-gray-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    {day}
                    {hasEvents && !today && (
                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600" />
                    )}
                </button>
            );
        }

        return days;
    };

    return (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('widgets.calendar')}
                </h2>
                <CalendarIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={previousMonth}
                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentDate.toLocaleString(i18n.language, { month: 'long', year: 'numeric' })}
                </span>
                <button
                    onClick={nextMonth}
                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day, index) => (
                    <div
                        key={index}
                        className={`text-center text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
            </div>

            {/* Selected Date Events */}
            {selectedDate && (
                <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedDate.toLocaleDateString(i18n.language, { month: 'long', day: 'numeric' })}
                    </h3>
                    <div className="space-y-2">
                        {getEventsForDate(selectedDate.getDate()).length > 0 ? (
                            getEventsForDate(selectedDate.getDate()).map((event, index) => (
                                <div
                                    key={index}
                                    className={`text-sm p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                        }`}
                                >
                                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {event.title}
                                    </span>
                                    <span className={`text-xs ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        ({event.type})
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {t('widgets.noEvents')}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarWidget;
