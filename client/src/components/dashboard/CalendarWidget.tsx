import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Loader2, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { getPlannerData, PlannerEvent } from '../../services/plannerService';
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
    const { isDarkMode, preferences } = useTheme();
    const { state, dispatch } = useApp();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const accentColor = preferences.accentColor || '#3b82f6';
    const SLIDE_HEIGHT = '280px'; // Height of the detailed view

    const [newEventTitle, setNewEventTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // ... (keep existing calculations for daysInMonth etc) ...
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

    const widgetRef = React.useRef<HTMLDivElement>(null);

    // ... (keep existing useMemo) ...
    const weekDays = React.useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(2025, 0, 5 + i);
            days.push(d.toLocaleString(i18n.language, { weekday: 'short' }));
        }
        return days;
    }, [i18n.language]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (widgetRef.current && !widgetRef.current.contains(event.target as Node) && selectedDate) {
                setSelectedDate(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedDate]); // Depend on selectedDate to re-bind or check efficiently

    useEffect(() => {
        loadEvents();
    }, [currentDate]);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const allItems: CalendarEvent[] = [];
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            
            // Get current user ID
            const currentUserId = state.userProfile?._id;

            try {
                const plannerData = await getPlannerData({
                    startDate: startOfMonth,
                    endDate: endOfMonth
                });

                // Map Events (filter by current user)
                if (plannerData.events) {
                    plannerData.events.forEach((event: PlannerEvent) => {
                        // Only show events assigned to current user
                        if (currentUserId) {
                            const eventWithAssignee = event as any;
                            const isAssignedToMe = 
                                eventWithAssignee.assignee === currentUserId || 
                                eventWithAssignee.assignee?._id === currentUserId ||
                                eventWithAssignee.assignee?.toString() === currentUserId;
                            
                            if (!isAssignedToMe) return;
                        }

                        const dateObj = new Date(event.start);
                        const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                        const timeStr = dateObj.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });

                        allItems.push({
                            date: dateStr,
                            title: event.title,
                            type: 'event',
                            time: timeStr,
                            color: event.color || '#6366f1'
                        });
                    });
                }

                // Map Tasks (filter by current user)
                if (plannerData.tasks) {
                    plannerData.tasks.forEach((task: any) => {
                        if (task.dueDate) {
                            // Only show tasks assigned to current user
                            if (currentUserId) {
                                const isAssignedToMe = 
                                    task.assignee === currentUserId || 
                                    task.assignee?._id === currentUserId ||
                                    task.assignee?.toString() === currentUserId;
                                
                                if (!isAssignedToMe) return;
                            }

                            const dateObj = new Date(task.dueDate);
                            const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                            const timeStr = dateObj.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });

                            allItems.push({
                                date: dateStr,
                                title: task.title,
                                type: 'task',
                                time: timeStr,
                                color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981'
                            });
                        }
                    });
                }

            } catch (error) {
                console.error('Failed to load planner data:', error);
            }

            setEvents(allItems);
        } catch (error) {
            console.error('Error loading calendar items:', error);
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
        if (selectedDate && clickedDate.getTime() === selectedDate.getTime()) {
            setSelectedDate(null); // Toggle off
        } else {
            setSelectedDate(clickedDate);
            setNewEventTitle('');
        }
    };

    const handleAddEvent = async () => {
        if (!selectedDate || !newEventTitle.trim()) return;

        try {
            setIsAdding(true);
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
            loadEvents();
            setSelectedDate(null); // Resettle/Close details
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
        <div
            ref={widgetRef}
            className={`rounded-2xl border overflow-hidden relative ${isDarkMode
                ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/70 backdrop-blur-sm'
                : 'bg-gradient-to-br from-white to-gray-50/30 border-gray-200'
                } h-full`}
        >

            <div
                className="h-full flex flex-col transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)"
                style={{ transform: selectedDate ? `translateY(-${SLIDE_HEIGHT})` : 'translateY(0)' }}
            >
                {/* Main View: Header + Grid */}
                <div className="flex-none h-full flex flex-col min-h-full">
                    {/* Header */}
                    <div className={`px-4 py-3 border-b flex-none ${isDarkMode ? 'border-gray-700/70' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-xl" style={{ backgroundColor: `${accentColor}20` }}>
                                    <CalendarIcon className="w-4 h-4" style={{ color: accentColor }} />
                                </div>
                                <div>
                                    <h3 className={`text-base font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {t('home.calendar')}
                                    </h3>
                                    <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {t('home.poweredBySartthi')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/planner?view=calendar')}
                                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all hover:opacity-80 whitespace-nowrap`}
                                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                            >
                                {t('home.viewPlanner')}
                            </button>
                        </div>

                        {/* Month Navigation */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handlePrevMonth}
                                className={`p-1 rounded-lg transition-all ${isDarkMode
                                    ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <h4 className={`text-xs font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                {currentDate.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
                            </h4>
                            <button
                                onClick={handleNextMonth}
                                className={`p-1 rounded-lg transition-all ${isDarkMode
                                    ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-2 flex-1 flex flex-col min-h-0">
                        {/* Week Days */}
                        <div className="grid grid-cols-7 gap-0.5 mb-1 flex-none">
                            {weekDays.map((day, index) => (
                                <div
                                    key={index}
                                    className={`text-center text-[10px] font-medium py-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'
                                        }`}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-0.5 flex-1 auto-rows-fr">
                            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                                <div key={`empty-${index}`} />
                            ))}

                            {Array.from({ length: daysInMonth }).map((_, index) => {
                                const day = index + 1;
                                const dayEvents = getEventsForDate(day);
                                const today = isToday(day);
                                const selected = isSelected(day);

                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDateClick(day)}
                                        className={`rounded-lg p-1 text-xs font-medium transition-all relative group flex flex-col items-center justify-center ${today || selected
                                            ? '' // Handled by style prop
                                            : dayEvents.length > 0
                                                ? isDarkMode
                                                    ? 'bg-purple-500/10 text-gray-200 hover:bg-purple-500/30 border border-purple-500/20'
                                                    : 'bg-purple-50 text-gray-900 hover:bg-purple-100 border border-purple-100'
                                                : isDarkMode
                                                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                        style={today ? {
                                            backgroundColor: `${accentColor}20`,
                                            color: accentColor,
                                            borderColor: `${accentColor}50`,
                                            borderWidth: 1
                                        } : selected ? {
                                            backgroundColor: accentColor,
                                            color: '#fff'
                                        } : {}}
                                    >
                                        <span>{day}</span>
                                        {/* Dots */}
                                        <div className="flex gap-0.5 mt-0.5 h-1">
                                            {dayEvents.slice(0, 3).map((event, i) => (
                                                <div
                                                    key={i}
                                                    className="w-1 h-1 rounded-full"
                                                    style={{ backgroundColor: selected ? '#fff' : (event.color || '#6366f1') }}
                                                />
                                            ))}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Details View (Slides Up) */}
                <div
                    className={`flex-none w-full border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    style={{ height: SLIDE_HEIGHT }}
                >
                    {selectedDate && (
                        <div className="h-full flex flex-col p-4">
                            <div className="flex justify-between items-center mb-3 flex-none">
                                <h5 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {selectedDate.toLocaleDateString(i18n.language, { month: 'long', day: 'numeric', weekday: 'long' })}
                                </h5>
                                <button
                                    onClick={() => setSelectedDate(null)}
                                    className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex gap-2 mb-3 flex-none">
                                <input
                                    type="text"
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddEvent()}
                                    placeholder={t('home.addTask', 'Add task')}
                                    className={`flex-1 px-3 py-2 text-sm rounded-xl border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                                        } focus:ring-1 focus:ring-accent outline-none transition-all`}
                                    style={{ '--tw-ring-color': accentColor } as any}
                                    disabled={isAdding}
                                    autoFocus
                                />
                                <button
                                    onClick={handleAddEvent}
                                    disabled={isAdding || !newEventTitle.trim()}
                                    className={`p-2 rounded-xl text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                                    style={{ backgroundColor: accentColor }}
                                >
                                    {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                </button>
                            </div>

                            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                {selectedDateEvents.length > 0 ? (
                                    selectedDateEvents.map((event, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                                                } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-all hover:scale-[1.02]`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className="w-1.5 h-8 rounded-full"
                                                    style={{ backgroundColor: event.color || '#6366f1' }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-900'
                                                        }`}>
                                                        {event.title}
                                                    </p>
                                                    {event.time && (
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <Clock className={`w-3.5 h-3.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
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
                                    <div className={`text-center py-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                        <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm font-medium">{t('home.noEvents', 'No events')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarWidget;
