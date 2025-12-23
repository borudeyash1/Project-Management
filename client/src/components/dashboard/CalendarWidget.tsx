import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { getPlannerEvents, PlannerEvent } from '../../services/plannerService';
import { apiService } from '../../services/api';
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
    const { state, dispatch } = useApp();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Default to today
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);

    // Quick Add State
    const [newEventTitle, setNewEventTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);

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
        setNewEventTitle(''); // Clear input on date change
    };

    const handleAddEvent = async () => {
        if (!selectedDate || !newEventTitle.trim()) return;

        try {
            setIsAdding(true);

            // Create a task with due date set to selected date
            // Set time to end of day or keeping it just date-based
            const dueDate = new Date(selectedDate);
            dueDate.setHours(23, 59, 59, 999);

            await apiService.createTask({
                title: newEventTitle,
                dueDate: dueDate,
                type: 'task',
                priority: 'medium',
                status: 'todo'
            });

            dispatch({
                type: 'ADD_TOAST',
                payload: {
                    id: Date.now().toString(),
                    type: 'success',
                    message: 'Task created successfully',
                    duration: 3000
                }
            });

            setNewEventTitle('');
            loadEvents(); // Refresh calendar to show dot
        } catch (error) {
            console.error('Failed to create task:', error);
            dispatch({
                type: 'ADD_TOAST',
                payload: {
                    id: Date.now().toString(),
                    type: 'error',
                    message: 'Failed to create task',
                    duration: 3000
                }
            });
        } finally {
            setIsAdding(false);
        }
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
            ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/70 backdrop-blur-sm'
            : 'bg-gradient-to-br from-white to-blue-50/30 border-gray-300/60'
            } h-full flex flex-col`}>
            {/* Header */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700/70' : 'border-gray-300/60'}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-500/10'}`}>
                            <CalendarIcon className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {t('home.calendar')}
                            </h3>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {t('home.poweredBySartthi')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/planner?view=calendar')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isDarkMode
                            ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                            : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
                            }`}
                    >
                        {t('home.viewPlanner')}
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
                                className={`aspect-square rounded-lg p-1 text-xs font-medium transition-all relative group hover:ring-2 hover:ring-opacity-50 hover:z-20 ${today
                                    ? isDarkMode
                                        ? 'bg-blue-500/20 text-blue-400 ring-2 ring-blue-500/50 hover:bg-blue-500/40 hover:ring-blue-400'
                                        : 'bg-blue-500/20 text-blue-600 ring-2 ring-blue-500/50 hover:bg-blue-500/40 hover:ring-blue-400'
                                    : selected
                                        ? isDarkMode
                                            ? 'bg-blue-500/30 text-white hover:bg-blue-500/40 hover:ring-blue-400'
                                            : 'bg-blue-500/30 text-blue-900 hover:bg-blue-500/40 hover:ring-blue-400'
                                        : dayEvents.length > 0
                                            ? isDarkMode
                                                ? 'bg-purple-500/10 text-gray-200 hover:bg-purple-500/30 border border-purple-500/20 hover:ring-purple-400'
                                                : 'bg-purple-50 text-gray-900 hover:bg-purple-100 border border-purple-100 hover:ring-purple-400'
                                            : isDarkMode
                                                ? 'text-gray-300 hover:bg-gray-700 hover:ring-gray-500 hover:text-white'
                                                : 'text-gray-700 hover:bg-gray-100 hover:ring-gray-300 hover:text-gray-900'
                                    }`}
                            >
                                <span className="block">{day}</span>
                                {dayEvents.length > 0 && (
                                    <>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-max max-w-[200px] pointer-events-none">
                                            <div className={`p-2.5 rounded-xl shadow-xl border text-[10px] text-left backdrop-blur-md ${isDarkMode
                                                ? 'bg-gray-900/95 border-gray-700 text-gray-200 shadow-black/50'
                                                : 'bg-white/95 border-gray-200 text-gray-700 shadow-gray-200/50'
                                                }`}>
                                                <div className="font-semibold mb-1.5 pb-1 border-b border-dashed opacity-50">
                                                    {dayEvents.length} Event{dayEvents.length > 1 ? 's' : ''}
                                                </div>
                                                {dayEvents.map((event, i) => (
                                                    <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
                                                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: event.color || '#6366f1' }} />
                                                        <span className="truncate max-w-[150px]">{event.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Arrow */}
                                            <div className={`w-2 h-2 rotate-45 mx-auto -mt-1 border-r border-b ${isDarkMode
                                                ? 'bg-gray-900 border-gray-700'
                                                : 'bg-white border-gray-200'
                                                }`}></div>
                                        </div>

                                        {/* Dots */}
                                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                                            {dayEvents.slice(0, 3).map((event, i) => (
                                                <div
                                                    key={i}
                                                    className="w-1 h-1 rounded-full"
                                                    style={{ backgroundColor: event.color || '#6366f1' }}
                                                />
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <div className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} />
                                            )}
                                        </div>
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Selected Date & Quick Add */}
                {selectedDate && (
                    <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700/70' : 'border-gray-300/60'}`}>
                        <div className="flex justify-between items-center mb-3">
                            <h5 className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {selectedDate.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', weekday: 'short' })}
                            </h5>
                        </div>

                        {/* Quick Add Form */}
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={newEventTitle}
                                onChange={(e) => setNewEventTitle(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddEvent()}
                                placeholder={t('home.addTaskForDay', 'Add task for this day...')}
                                className={`flex-1 px-3 py-1.5 text-xs rounded-lg border ${isDarkMode
                                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                    } focus:ring-1 focus:ring-blue-500 outline-none`}
                                disabled={isAdding}
                            />
                            <button
                                onClick={handleAddEvent}
                                disabled={isAdding || !newEventTitle.trim()}
                                className={`p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Events List */}
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                            {selectedDateEvents.length > 0 ? (
                                selectedDateEvents.map((event, index) => (
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
                                ))
                            ) : (
                                <div className={`text-center py-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                    <p className="text-xs italic">{t('home.noEventsForDay', 'No events planned')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarWidget;
