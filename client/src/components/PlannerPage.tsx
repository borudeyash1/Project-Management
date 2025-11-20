import React, { useState, useEffect } from 'react';
import { 
  Plus, Calendar, Clock, Target, Users, CheckCircle, 
  AlertCircle, Star, Flag, Tag, MessageSquare, FileText,
  ChevronLeft, ChevronRight, Filter, Search, MoreVertical,
  Edit, Trash2, Eye, Play, Pause, Square, Zap, Bot, X, Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';

interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  estimatedDuration?: number; // in hours
  actualDuration?: number; // in hours
  project?: {
    _id: string;
    name: string;
    color: string;
  };
  assignee?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  subtasks: Array<{
    _id: string;
    title: string;
    completed: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface CalendarEvent {
  _id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'task' | 'meeting' | 'deadline' | 'milestone';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project?: string;
  color: string;
}

const PlannerPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const { canUseAI } = useFeatureAccess();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: Date; time?: string } | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: '',
    dueTime: '',
    estimatedDuration: 1,
    reminder: '15min' as '15min' | '30min' | '1hour' | '1day',
    tags: [] as string[]
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        _id: '1',
        title: 'Design review meeting',
        description: 'Review the new UI designs with the team',
        priority: 'high',
        status: 'pending',
        dueDate: new Date('2024-03-25T10:00:00'),
        estimatedDuration: 2,
        project: {
          _id: 'p1',
          name: 'E-commerce Platform',
          color: 'bg-accent'
        },
        assignee: {
          _id: 'u1',
          name: 'John Doe',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        },
        tags: ['design', 'meeting'],
        subtasks: [
          { _id: 'st1', title: 'Prepare design files', completed: true },
          { _id: 'st2', title: 'Send meeting invite', completed: false },
          { _id: 'st3', title: 'Review feedback', completed: false }
        ],
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2024-03-20')
      },
      {
        _id: '2',
        title: 'Code review for authentication module',
        description: 'Review the JWT authentication implementation',
        priority: 'medium',
        status: 'in-progress',
        dueDate: new Date('2024-03-26T14:00:00'),
        estimatedDuration: 3,
        actualDuration: 1.5,
        project: {
          _id: 'p1',
          name: 'E-commerce Platform',
          color: 'bg-accent'
        },
        assignee: {
          _id: 'u2',
          name: 'Jane Smith',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
        },
        tags: ['code', 'review', 'backend'],
        subtasks: [
          { _id: 'st4', title: 'Test authentication flow', completed: true },
          { _id: 'st5', title: 'Review security implementation', completed: false }
        ],
        createdAt: new Date('2024-03-18'),
        updatedAt: new Date('2024-03-22')
      },
      {
        _id: '3',
        title: 'Client presentation preparation',
        description: 'Prepare slides and demo for client meeting',
        priority: 'urgent',
        status: 'pending',
        dueDate: new Date('2024-03-27T09:00:00'),
        estimatedDuration: 4,
        project: {
          _id: 'p2',
          name: 'Mobile App',
          color: 'bg-green-500'
        },
        assignee: {
          _id: 'u3',
          name: 'Bob Wilson',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
        },
        tags: ['presentation', 'client', 'demo'],
        subtasks: [
          { _id: 'st6', title: 'Create presentation slides', completed: false },
          { _id: 'st7', title: 'Prepare demo environment', completed: false },
          { _id: 'st8', title: 'Rehearse presentation', completed: false }
        ],
        createdAt: new Date('2024-03-21'),
        updatedAt: new Date('2024-03-21')
      }
    ];

    const mockEvents: CalendarEvent[] = [
      {
        _id: 'e1',
        title: 'Design review meeting',
        start: new Date('2024-03-25T10:00:00'),
        end: new Date('2024-03-25T12:00:00'),
        type: 'meeting',
        priority: 'high',
        project: 'E-commerce Platform',
        color: 'bg-accent'
      },
      {
        _id: 'e2',
        title: 'Sprint Planning',
        start: new Date('2024-03-26T09:00:00'),
        end: new Date('2024-03-26T11:00:00'),
        type: 'meeting',
        priority: 'medium',
        project: 'E-commerce Platform',
        color: 'bg-purple-500'
      },
      {
        _id: 'e3',
        title: 'Client Presentation',
        start: new Date('2024-03-27T09:00:00'),
        end: new Date('2024-03-27T11:00:00'),
        type: 'meeting',
        priority: 'urgent',
        project: 'Mobile App',
        color: 'bg-green-500'
      },
      {
        _id: 'e4',
        title: 'Project Deadline',
        start: new Date('2024-03-30T17:00:00'),
        end: new Date('2024-03-30T17:00:00'),
        type: 'deadline',
        priority: 'high',
        project: 'E-commerce Platform',
        color: 'bg-red-500'
      }
    ];

    setTasks(mockTasks);
    setEvents(mockEvents);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in-progress': return 'text-accent-dark bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return <Target className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'deadline': return <AlertCircle className="w-4 h-4" />;
      case 'milestone': return <Flag className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task._id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task => {
      if (task._id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(subtask =>
            subtask._id === subtaskId 
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          )
        };
      }
      return task;
    }));
  };

  const handleDateClick = (date: Date, time?: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot({ date, time });
    const dateStr = date.toISOString().split('T')[0];
    setNewTask({
      ...newTask,
      dueDate: dateStr,
      dueTime: time || '09:00'
    });
    setShowTaskModal(true);
  };

  const handleCreateTask = () => {
    const task: Task = {
      _id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: 'pending',
      dueDate: new Date(`${newTask.dueDate}T${newTask.dueTime}`),
      estimatedDuration: newTask.estimatedDuration,
      actualDuration: 0,
      tags: newTask.tags,
      subtasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTasks([...tasks, task]);
    setShowTaskModal(false);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      dueTime: '',
      estimatedDuration: 1,
      reminder: '15min',
      tags: []
    });
    dispatch({ type: 'ADD_TOAST', payload: { message: 'Task created successfully!', type: 'success' } });
  };

  const weekDays = getWeekDays(currentDate);
  const monthDays = getMonthDays(currentDate);
  const timeSlots = getTimeSlots();

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Planner</h1>
            <p className="text-gray-600 mt-1">Plan and organize your tasks and schedule</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              {[
                { id: 'day', label: 'Day' },
                { id: 'week', label: 'Week' },
                { id: 'month', label: 'Month' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as any)}
                  className={`px-3 py-2 text-sm font-medium ${
                    viewMode === mode.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <button 
              onClick={() => {
                const today = new Date();
                setSelectedDate(today);
                setNewTask({
                  ...newTask,
                  dueDate: today.toISOString().split('T')[0],
                  dueTime: '09:00'
                });
                setShowTaskModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-300 p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getTime() - (viewMode === 'week' ? 7 : 1) * 24 * 60 * 60 * 1000))}
                    className="p-2 text-gray-600 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {viewMode === 'week' && `${formatDate(weekDays[0])} - ${formatDate(weekDays[6])}`}
                    {viewMode === 'day' && formatDate(currentDate)}
                    {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getTime() + (viewMode === 'week' ? 7 : 1) * 24 * 60 * 60 * 1000))}
                    className="p-2 text-gray-600 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Today
                </button>
              </div>

              {/* Calendar Grid */}
              {viewMode === 'week' && (
                <div className="grid grid-cols-7 gap-1">
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                      {day}
                    </div>
                  ))}
                  
                  {/* Day Cells */}
                  {weekDays.map((day, index) => {
                    const dayTasks = getTasksForDate(day);
                    const dayEvents = getEventsForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    const isSelected = day.toDateString() === selectedDate.toDateString();
                    
                    return (
                      <div
                        key={index}
                        onClick={() => handleDateClick(day)}
                        className={`min-h-24 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
                          isToday ? 'bg-blue-50 border-blue-200' : ''
                        } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${isToday ? 'text-accent-dark' : 'text-gray-900'}`}>
                            {day.getDate()}
                          </span>
                          {dayTasks.length > 0 && (
                            <span className="text-xs text-gray-600">{dayTasks.length}</span>
                          )}
                        </div>
                        
                        {/* Tasks */}
                        <div className="space-y-1">
                          {dayTasks.slice(0, 2).map(task => (
                            <div
                              key={task._id}
                              className="text-xs p-1 rounded truncate"
                              style={{ backgroundColor: task.project?.color + '20' }}
                            >
                              {task.title}
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className="text-xs text-gray-600">
                              +{dayTasks.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {viewMode === 'day' && (
                <div className="space-y-2">
                  {timeSlots.map((time) => {
                    const tasksAtTime = tasks.filter(task => {
                      if (!task.dueDate) return false;
                      const taskDate = new Date(task.dueDate);
                      const taskTime = `${taskDate.getHours().toString().padStart(2, '0')}:${taskDate.getMinutes().toString().padStart(2, '0')}`;
                      return taskDate.toDateString() === currentDate.toDateString() && taskTime === time;
                    });
                    
                    return (
                      <div key={time} className="flex gap-2 border-b border-gray-300 pb-2">
                        <div className="w-16 text-sm text-gray-600 pt-1">{time}</div>
                        <div 
                          className="flex-1 min-h-12 border border-gray-300 rounded-lg p-2 cursor-pointer hover:bg-gray-50"
                          onClick={() => handleDateClick(currentDate, time)}
                        >
                          {tasksAtTime.map(task => (
                            <div key={task._id} className="mb-1 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                              <div className="font-medium">{task.title}</div>
                              <div className="text-xs text-gray-600">{task.estimatedDuration}h · {task.priority}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {viewMode === 'month' && (
                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                      {day}
                    </div>
                  ))}
                  
                  {monthDays.map((day, index) => {
                    const dayTasks = getTasksForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isSelected = day.toDateString() === selectedDate.toDateString();
                    
                    return (
                      <div
                        key={index}
                        onClick={() => handleDateClick(day)}
                        className={`min-h-20 p-1 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
                          isToday ? 'bg-blue-50 border-blue-200' : ''
                        } ${isSelected ? 'ring-2 ring-blue-500' : ''} ${
                          !isCurrentMonth ? 'opacity-40' : ''
                        }`}
                      >
                        <div className="text-xs font-medium mb-1 ${
                          isToday ? 'text-accent-dark' : isCurrentMonth ? 'text-gray-900' : 'text-gray-600'
                        }">
                          {day.getDate()}
                        </div>
                        <div className="space-y-0.5">
                          {dayTasks.slice(0, 2).map(task => (
                            <div
                              key={task._id}
                              className="text-[10px] p-0.5 rounded truncate bg-blue-100 text-blue-700"
                            >
                              {task.title}
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className="text-[10px] text-gray-600">+{dayTasks.length - 2}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Assistant */}
            {canUseAI() && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-5 h-5" />
                  <h3 className="font-semibold">AI Planner</h3>
                </div>
                <p className="text-sm text-purple-100 mb-3">
                  Get smart suggestions for your schedule and task prioritization.
                </p>
                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-2 text-sm font-medium transition-colors">
                  Ask AI
                </button>
              </div>
            )}

            {/* Today's Tasks */}
            <div className="bg-white rounded-lg border border-gray-300 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Today's Tasks</h3>
              <div className="space-y-2">
                {getTasksForDate(new Date()).slice(0, 5).map(task => (
                  <div
                    key={task._id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <button
                      onClick={() => toggleTaskStatus(task._id)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        task.status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {task.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.project && (
                          <span className="text-xs text-gray-600">{task.project.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {getTasksForDate(new Date()).length === 0 && (
                  <p className="text-sm text-gray-600 text-center py-4">No tasks for today</p>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg border border-gray-300 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Upcoming Events</h3>
              <div className="space-y-2">
                {events.slice(0, 5).map(event => (
                  <div key={event._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <div className={`w-2 h-2 rounded-full ${event.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-600">
                        {formatDate(event.start)} at {formatTime(event.start)}
                      </p>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-sm text-gray-600 text-center py-4">No upcoming events</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-300 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending Tasks</span>
                  <span className="text-sm font-medium">{tasks.filter(t => t.status === 'pending').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="text-sm font-medium">{tasks.filter(t => t.status === 'in-progress').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed Today</span>
                  <span className="text-sm font-medium">{tasks.filter(t => t.status === 'completed').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Overdue</span>
                  <span className="text-sm font-medium text-red-600">
                    {tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-2 text-gray-600 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter task title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  rows={3}
                  placeholder="Add task description"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    value={newTask.dueTime}
                    onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Priority and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newTask.estimatedDuration}
                    onChange={(e) => setNewTask({ ...newTask, estimatedDuration: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Reminder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Bell className="w-4 h-4 inline mr-1" />
                  Reminder
                </label>
                <select
                  value={newTask.reminder}
                  onChange={(e) => setNewTask({ ...newTask, reminder: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="15min">15 minutes before</option>
                  <option value="30min">30 minutes before</option>
                  <option value="1hour">1 hour before</option>
                  <option value="1day">1 day before</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  placeholder="Enter tags separated by commas"
                  onChange={(e) => setNewTask({ ...newTask, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTask.title || !newTask.dueDate || !newTask.dueTime}
                className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerPage;
