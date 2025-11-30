import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Clock, Users, BarChart3, Settings, MessageSquare, 
  Plus, Filter, Search, MoreVertical, Edit, Trash2, Eye, 
  CheckCircle, AlertCircle, TrendingUp, FileText, Download, 
  Upload, Link, Tag, Flag, User, Clock3, Target, Zap, 
  ArrowRight, ArrowLeft, ChevronDown, ChevronUp, Star, 
  Heart, Bookmark, Share2, Copy, Move, Archive, Play, 
  Pause, Square, Circle, Triangle, Hexagon, Layers, 
  Activity, PieChart, LineChart, TrendingDown, Minus, 
  Maximize, Minimize, RotateCcw, Save, RefreshCw, 
  CheckSquare, Timer, UserCheck, UserX, MessageCircle, 
  ThumbsUp, ThumbsDown, Award, Trophy, Medal, Bot, 
  Sparkles, Lightbulb, Globe, Shield, Key, Lock, 
  Unlock, EyeOff, Bell, Mail, Phone, MapPin, 
  Building, Home, Crown, DollarSign, CreditCard,
  Database, Server, Cloud, Wifi, Monitor, Smartphone,
  Tablet, Headphones, Camera, Mic, Volume2, VolumeX,
  MicOff, CameraOff, CalendarDays, CalendarCheck,
  CalendarX, CalendarPlus, CalendarMinus, CalendarRange,
  CalendarSearch, CalendarClock, CalendarHeart,
  X, Check, ChevronRight, ChevronLeft, Calendar as CalendarIcon,
  Target as TargetIcon, Building as BuildingIcon, LayoutGrid, List,
  GripVertical
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  startDate: Date;
  dueDate?: Date; // Made optional to match TaskManagement
  createdAt: Date;
  updatedAt: Date;
  milestones: Milestone[];
  subtasks: Subtask[];
  tags: string[];
  estimatedHours: number;
  actualHours: number;
  project: {
    _id: string;
    name: string;
    color: string;
  };
  timeTracking: TimeEntry[];
  notes: Note[];
  dependencies: string[];
}

interface Milestone {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: Date;
  completedAt?: Date;
  assignee: string;
  taskId: string;
}

interface Subtask {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: Date;
  assignee: string;
  parentTaskId: string;
}

interface TimeEntry {
  _id: string;
  taskId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  description: string;
  createdAt: Date;
}

interface Note {
  _id: string;
  content: string;
  type: 'manual' | 'ai-generated';
  author: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: Date;
  taskId: string;
  tags: string[];
  isImportant: boolean;
}

interface TimelineViewProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskCreate: (task: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete
}) => {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverDate, setDraggedOverDate] = useState<Date | null>(null);
  const [draggedOverStatus, setDraggedOverStatus] = useState<string | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Resize state
  const [resizing, setResizing] = useState<{
    taskId: string;
    edge: 'start' | 'end';
    initialX: number;
    initialDate: Date;
  } | null>(null);
  
  // Drag state for moving entire task
  const [draggingTask, setDraggingTask] = useState<{
    taskId: string;
    initialX: number;
    currentX: number;
    initialStartDate: Date;
    initialDueDate: Date | undefined;
  } | null>(null);

  // Status categories (swimlanes)
  const statusCategories = [
    { id: 'pending', name: t('tasks.newIdeasRequests'), color: '#F3F4F6' },
    { id: 'assigned', name: t('tasks.assigned'), color: '#DBEAFE' },
    { id: 'in-progress', name: t('tasks.inProgressActive'), color: '#FEF3C7' },
    { id: 'qa', name: t('tasks.qaQc'), color: '#E0E7FF' },
    { id: 'completed', name: t('tasks.recentlyCompleted'), color: '#D1FAE5' }
  ];

  // Generate date range based on view mode
  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    
    switch (viewMode) {
      case 'week':
        start.setDate(start.getDate() - start.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case 'month':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(start.getMonth() / 3);
        start.setMonth(quarter * 3, 1);
        end.setMonth(quarter * 3 + 2, 31);
        break;
    }
    
    return { start, end };
  };

  // Generate array of dates for the timeline
  const generateDates = () => {
    const { start, end } = getDateRange();
    const dates = [];
    const current = new Date(start);
    
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const dates = generateDates();
  const today = new Date();

  // Get tasks for each status category
  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => {
      // Filter out tasks without dates
      if (!task.startDate || !task.dueDate) {
        return false;
      }
      
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterAssignee !== 'all' && task.assignee._id !== filterAssignee) return false;
      if (filterProject !== 'all' && (task as any).projectId !== filterProject && task.project?._id !== filterProject) return false;
      
      // Map task status to timeline status
      switch (status) {
        case 'pending': return task.status === 'pending';
        case 'assigned': return task.status === 'pending' && task.assignee._id !== 'unassigned';
        case 'in-progress': return task.status === 'in-progress';
        case 'qa': return task.status === 'in-progress' && task.tags.includes('qa');
        case 'completed': return task.status === 'completed';
        default: return false;
      }
    });
  };

  // Calculate task position and width on timeline
  const getTaskPosition = (task: Task) => {
    if (!task.dueDate) return null; // Skip tasks without due dates
    
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.dueDate);
    const timelineStart = dates[0];
    const timelineEnd = dates[dates.length - 1];
    
    const startOffset = Math.max(0, (startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const endOffset = Math.min(dates.length - 1, (endDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      left: `${(startOffset / dates.length) * 100}%`,
      width: `${((endOffset - startOffset) / dates.length) * 100}%`,
      startOffset,
      endOffset
    };
  };

  // Check if task is overdue
  const isOverdue = (task: Task) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < today && task.status !== 'completed';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#10B981';
      case 'medium': return '#3B82F6';
      case 'high': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task._id);
  };

  const handleDragOver = (e: React.DragEvent, date: Date, status: string) => {
    e.preventDefault();
    setDraggedOverDate(date);
    setDraggedOverStatus(status);
  };

  const handleDragLeave = () => {
    setDraggedOverDate(null);
    setDraggedOverStatus(null);
  };

  const handleDrop = (e: React.DragEvent, date: Date, status: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      const updates: Partial<Task> = {
        status: status as 'pending' | 'in-progress' | 'completed' | 'blocked',
        startDate: date,
        updatedAt: new Date()
      };
      
      onTaskUpdate(draggedTask._id, updates);
    }
    setDraggedTask(null);
    setDraggedOverDate(null);
    setDraggedOverStatus(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverDate(null);
    setDraggedOverStatus(null);
    setDraggingTask(null);
  };

  // Navigation functions
  const navigateTimeline = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, task: Task, edge: 'start' | 'end') => {
    e.stopPropagation();
    if (!task.dueDate) return; // Can't resize tasks without due dates
    
    setResizing({
      taskId: task._id,
      edge,
      initialX: e.clientX,
      initialDate: edge === 'start' ? task.startDate : task.dueDate
    });
  };

  // Task bar drag handlers (for moving entire task)
  const handleTaskBarDragStart = (e: React.MouseEvent, task: Task) => {
    // Only start drag if not clicking on resize handles
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) return;
    if (!task.dueDate) return;
    
    e.preventDefault();
    setDraggingTask({
      taskId: task._id,
      initialX: e.clientX,
      currentX: e.clientX,
      initialStartDate: task.startDate,
      initialDueDate: task.dueDate
    });
  };

  useEffect(() => {
    if (!resizing && !draggingTask) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return;
      
      const dayWidth = timelineRef.current.offsetWidth / dates.length;
      
      // Handle resize
      if (resizing) {
        const deltaX = e.clientX - resizing.initialX;
        const daysDelta = Math.round(deltaX / dayWidth);
        
        if (daysDelta === 0) return;
        
        const newDate = new Date(resizing.initialDate);
        newDate.setDate(newDate.getDate() + daysDelta);
        
        const task = tasks.find(t => t._id === resizing.taskId);
        if (!task || !task.dueDate) return;
        
        // Validate: start date must be before end date
        if (resizing.edge === 'start' && newDate >= task.dueDate) return;
        if (resizing.edge === 'end' && newDate <= task.startDate) return;
        
        const updates = resizing.edge === 'start' 
          ? { startDate: newDate }
          : { dueDate: newDate };
          
        onTaskUpdate(resizing.taskId, updates);
      }
      
      // Handle task bar drag - just update currentX for visual feedback
      if (draggingTask) {
        setDraggingTask(prev => prev ? { ...prev, currentX: e.clientX } : null);
      }
    };

    const handleMouseUp = () => {
      // On mouse up, calculate final position and update task dates
      if (draggingTask && draggingTask.initialDueDate && timelineRef.current) {
        const dayWidth = timelineRef.current.offsetWidth / dates.length;
        const deltaX = draggingTask.currentX - draggingTask.initialX;
        const daysDelta = Math.round(deltaX / dayWidth);
        
        if (daysDelta !== 0) {
          const newStartDate = new Date(draggingTask.initialStartDate);
          newStartDate.setDate(newStartDate.getDate() + daysDelta);
          
          const newDueDate = new Date(draggingTask.initialDueDate);
          newDueDate.setDate(newDueDate.getDate() + daysDelta);
          
          onTaskUpdate(draggingTask.taskId, {
            startDate: newStartDate,
            dueDate: newDueDate
          });
          
          setTimeout(() => {
            setDraggingTask(null);
          }, 0);
        } else {
          setDraggingTask(null);
        }
      } else if (draggingTask) {
        setDraggingTask(null);
      }
      
      if (resizing) {
        setResizing(null);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, draggingTask, dates, tasks, onTaskUpdate, timelineRef]);

  // Get colorful priority gradient
  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case 'low': 
        return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
      case 'medium': 
        return 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
      case 'high': 
        return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
      case 'critical': 
        return 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
      default: 
        return 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)';
    }
  };

  // Calculate task progress percentage
  const calculateProgress = (task: Task) => {
    if (task.status === 'completed') return 100;
    if (task.status === 'blocked') return 0;
    if (task.status === 'in-progress' && task.dueDate) {
      // Calculate based on time elapsed
      const total = task.dueDate.getTime() - task.startDate.getTime();
      const elapsed = Date.now() - task.startDate.getTime();
      return Math.min(100, Math.max(0, (elapsed / total) * 100));
    }
    return 0;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-300 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">{t('tasks.views.timeline')}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTimeline('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={t('buttons.previous')}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-4 py-2 bg-gray-100 rounded-lg min-w-[200px] text-center">
                <span className="text-sm font-semibold text-gray-900">
                  {dates[0]?.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
                  {viewMode === 'quarter' && ` - ${dates[dates.length - 1]?.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}`}
                </span>
              </div>
              <button
                onClick={goToToday}
                className="px-3 py-2 text-sm bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
              >
                {t('common.today')}
              </button>
              <button
                onClick={() => navigateTimeline('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={t('buttons.next')}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t('common.view')}:</span>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'week' | 'month' | 'quarter')}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="week">{t('calendar.week')}</option>
                <option value="month">{t('calendar.month')}</option>
                <option value="quarter">{t('calendar.quarter') || 'Quarter'}</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t('common.status')}:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="all">{t('common.all')}</option>
                <option value="pending">{t('common.pending')}</option>
                <option value="in-progress">{t('common.inProgress')}</option>
                <option value="completed">{t('common.completed')}</option>
                <option value="blocked">{t('common.blocked')}</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
            >
              <Plus className="w-4 h-4" />
              {t('tasks.newTask')}
            </button>
          </div>
        </div>
        
        {/* Date Header */}
        <div className="flex">
          <div className="w-64 flex-shrink-0"></div>
          <div className="flex-1 flex">
            {dates.map((date, index) => (
              <div
                key={index}
                className={`flex-1 text-center py-2 text-sm font-medium ${
                  date.toDateString() === today.toDateString() 
                    ? 'bg-blue-100 text-blue-900 border-l-2 border-accent' 
                    : 'text-gray-700'
                }`}
              >
                <div>{date.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}</div>
                <div className="text-xs text-gray-600">
                  {date.toLocaleDateString(i18n.language, { weekday: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-auto" ref={timelineRef}>
        <div className="flex">
          {/* Status Categories */}
          <div className="w-64 flex-shrink-0 border-r border-gray-200">
            {statusCategories.map((category) => {
              const categoryTasks = getTasksByStatus(category.id);
              return (
                <div
                  key={category.id}
                  className="border-b border-gray-300 p-4 min-h-[120px]"
                  style={{ backgroundColor: category.color }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
                    <span className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {categoryTasks.length}
                    </span>
                  </div>
                  
                  {/* Drop zone for dragging tasks */}
                  <div
                    className="h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-600 text-sm"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedTask) {
                        onTaskUpdate(draggedTask._id, { 
                          status: category.id as 'pending' | 'in-progress' | 'completed' | 'blocked' 
                        });
                      }
                    }}
                  >
                    {t('tasks.dropTasksHere')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Grid */}
          <div className="flex-1 relative">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex">
              {dates.map((_, index) => (
                <div
                  key={index}
                  className="flex-1 border-r border-gray-200"
                />
              ))}
            </div>

            {/* Today Line */}
            {dates.some(date => date.toDateString() === today.toDateString()) && (
              <div className="absolute top-0 bottom-0 w-0.5 bg-accent z-10">
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-accent rounded-full"></div>
              </div>
            )}

            {/* Task Bars */}
            {statusCategories.map((category, categoryIndex) => {
              const categoryTasks = getTasksByStatus(category.id);
              return (
                <div
                  key={category.id}
                  className="absolute w-full h-[120px]"
                  style={{ top: `${categoryIndex * 120}px` }}
                >
                  {categoryTasks.map((task) => {
                    const position = getTaskPosition(task);
                    if (!position) return null; // Skip tasks without valid positions
                    
                    const isOverdueTask = isOverdue(task);
                    
                    const isDragging = draggingTask?.taskId === task._id;
                    const dragOffset = isDragging && timelineRef.current 
                      ? ((draggingTask.currentX - draggingTask.initialX) / timelineRef.current.offsetWidth) * 100 
                      : 0;
                    
                    return (
                      <div
                        key={`${task._id}-${task.startDate?.getTime()}-${task.dueDate?.getTime()}`}
                        onMouseDown={(e) => handleTaskBarDragStart(e, task)}
                        onClick={() => {
                          if (!draggingTask && !resizing) {
                            setSelectedTask(task);
                            setShowTaskModal(true);
                          }
                        }}
                        className={`absolute top-4 h-10 rounded-lg flex items-center px-2 text-white text-sm font-medium overflow-hidden ${
                          isOverdueTask ? 'ring-2 ring-red-400' : ''
                        } ${
                          resizing?.taskId === task._id ? 'shadow-2xl scale-105 z-30 cursor-ew-resize' : 
                          isDragging ? 'shadow-2xl scale-105 z-30 cursor-grabbing transition-none' : 
                          'cursor-grab hover:shadow-lg transition-all duration-200'
                        }`}
                        style={{
                          left: position.left,
                          width: position.width,
                          background: getPriorityGradient(task.priority),
                          minWidth: '80px',
                          transform: isDragging ? `translateX(${dragOffset}%)` : 'none'
                        }}
                      >
                        {/* Progress overlay */}
                        <div 
                          className="absolute top-0 left-0 h-full bg-white/20 rounded-l-lg transition-all duration-300 pointer-events-none"
                          style={{ width: `${calculateProgress(task)}%` }}
                        />
                        
                        {/* Left resize handle */}
                        <div
                          className="resize-handle absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/40 group z-20"
                          onMouseDown={(e) => handleResizeStart(e, task, 'start')}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-white/70 rounded-r opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                        
                        {/* Task content */}
                        <div className="relative flex items-center px-2 flex-1 min-w-0">
                          <GripVertical className="w-3 h-3 mr-1 opacity-70 flex-shrink-0 pointer-events-none" />
                          <span className="truncate flex-1 pointer-events-none">{task.title}</span>
                          <div className="flex items-center gap-1 ml-2 flex-shrink-0 pointer-events-none">
                            <div
                              className="w-5 h-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center text-xs font-semibold"
                              title={task.assignee.name}
                            >
                              {task.assignee.name.charAt(0)}
                            </div>
                            {isOverdueTask && <AlertCircle className="w-3 h-3 text-red-200" />}
                          </div>
                        </div>
                        
                        {/* Right resize handle */}
                        <div
                          className="resize-handle absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/40 group z-20"
                          onMouseDown={(e) => handleResizeStart(e, task, 'end')}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-white/70 rounded-l opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedTask.project.color }}
                />
                <h3 className="text-lg font-semibold text-gray-900">{selectedTask.title}</h3>
              </div>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-gray-600 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.description')}</label>
                <p className="text-gray-600">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.status')}</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => onTaskUpdate(selectedTask._id, { 
                      status: e.target.value as 'pending' | 'in-progress' | 'completed' | 'blocked' 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="pending">{t('common.pending')}</option>
                    <option value="in-progress">{t('common.inProgress')}</option>
                    <option value="completed">{t('common.completed')}</option>
                    <option value="blocked">{t('common.blocked')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('tasks.priority')}</label>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) => onTaskUpdate(selectedTask._id, { 
                      priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="low">{t('common.low')}</option>
                    <option value="medium">{t('common.medium')}</option>
                    <option value="high">{t('common.high')}</option>
                    <option value="critical">{t('tracker.dashboard.critical')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('tasks.startDate')}</label>
                  <input
                    type="date"
                    value={selectedTask.startDate.toISOString().split('T')[0]}
                    onChange={(e) => onTaskUpdate(selectedTask._id, { 
                      startDate: new Date(e.target.value) 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('tasks.dueDate')}</label>
                  <input
                    type="date"
                    value={selectedTask.dueDate ? selectedTask.dueDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => onTaskUpdate(selectedTask._id, { 
                      dueDate: new Date(e.target.value) 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    onTaskDelete(selectedTask._id);
                    setShowTaskModal(false);
                  }}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                  {t('tasks.deleteTask')}
                </button>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                >
                  {t('buttons.saveChanges')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineView;
