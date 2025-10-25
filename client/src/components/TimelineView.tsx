import React, { useState, useEffect, useRef } from 'react';
<<<<<<< HEAD
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
=======
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
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
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
  dueDate: Date;
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

<<<<<<< HEAD
  // Simplified interaction states
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'left' | 'right' | null>(null);
  const [resizingTask, setResizingTask] = useState<Task | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastClickedTask, setLastClickedTask] = useState<string | null>(null);

=======
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
  // Status categories (swimlanes)
  const statusCategories = [
    { id: 'pending', name: 'New Ideas and Requests', color: '#F3F4F6' },
    { id: 'assigned', name: 'Assigned', color: '#DBEAFE' },
    { id: 'in-progress', name: 'In Progress/Active', color: '#FEF3C7' },
    { id: 'qa', name: 'QA/QC', color: '#E0E7FF' },
    { id: 'completed', name: 'Recently Completed', color: '#D1FAE5' }
  ];

  // Generate date range based on view mode
  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
<<<<<<< HEAD

=======
    
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
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
<<<<<<< HEAD

=======
    
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    return { start, end };
  };

  // Generate array of dates for the timeline
  const generateDates = () => {
    const { start, end } = getDateRange();
    const dates = [];
    const current = new Date(start);
<<<<<<< HEAD

=======
    
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
<<<<<<< HEAD

=======
    
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    return dates;
  };

  const dates = generateDates();
  const today = new Date();

  // Get tasks for each status category
  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterAssignee !== 'all' && task.assignee._id !== filterAssignee) return false;
      if (filterProject !== 'all' && (task as any).projectId !== filterProject && task.project?._id !== filterProject) return false;
<<<<<<< HEAD

=======
      
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
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
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.dueDate);
    const timelineStart = dates[0];
    const timelineEnd = dates[dates.length - 1];
<<<<<<< HEAD

    const startOffset = Math.max(0, (startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const endOffset = Math.min(dates.length - 1, (endDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));

=======
    
    const startOffset = Math.max(0, (startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const endOffset = Math.min(dates.length - 1, (endDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    return {
      left: `${(startOffset / dates.length) * 100}%`,
      width: `${((endOffset - startOffset) / dates.length) * 100}%`,
      startOffset,
      endOffset
    };
  };

  // Check if task is overdue
  const isOverdue = (task: Task) => {
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
<<<<<<< HEAD
    // Check if drag started from a resize handle
    const target = e.target as HTMLElement;
    if (target.className.includes('cursor-w-resize') ||
        target.className.includes('cursor-e-resize') ||
        isResizing) {
      e.preventDefault();
      return;
    }

=======
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task._id);
  };

  const handleDragOver = (e: React.DragEvent, date: Date, status: string) => {
    e.preventDefault();
    setDraggedOverDate(date);
    setDraggedOverStatus(status);
<<<<<<< HEAD
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggedOverDate(null);
      setDraggedOverStatus(null);
    }
=======
  };

  const handleDragLeave = () => {
    setDraggedOverDate(null);
    setDraggedOverStatus(null);
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
  };

  const handleDrop = (e: React.DragEvent, date: Date, status: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      const updates: Partial<Task> = {
        status: status as 'pending' | 'in-progress' | 'completed' | 'blocked',
        startDate: date,
        updatedAt: new Date()
      };
<<<<<<< HEAD

=======
      
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
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
  };

<<<<<<< HEAD
  // Drag resize handlers with proper date adjustment
  const handleResizeStart = (e: React.MouseEvent, task: Task, direction: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizingTask(task);

    const startX = e.clientX;
    const originalStartDate = new Date(task.startDate);
    const originalDueDate = new Date(task.dueDate);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!timelineRef.current) return;

      const timelineRect = timelineRef.current.getBoundingClientRect();
      const timelineWidth = timelineRect.width - 256; // Subtract left panel width
      const mouseDelta = moveEvent.clientX - startX;
      const dayWidth = timelineWidth / dates.length;
      const daysDelta = Math.round(mouseDelta / dayWidth);

      let newStartDate = new Date(originalStartDate);
      let newDueDate = new Date(originalDueDate);

      if (direction === 'left') {
        // Adjusting start date
        newStartDate.setDate(originalStartDate.getDate() + daysDelta);
        // Ensure start date doesn't go beyond due date
        if (newStartDate >= originalDueDate) {
          newStartDate = new Date(originalDueDate);
          newStartDate.setDate(newStartDate.getDate() - 1);
        }
      } else if (direction === 'right') {
        // Adjusting due date
        newDueDate.setDate(originalDueDate.getDate() + daysDelta);
        // Ensure due date doesn't go before start date
        if (newDueDate <= originalStartDate) {
          newDueDate = new Date(originalStartDate);
          newDueDate.setDate(newDueDate.getDate() + 1);
        }
      }

      // Update task with new dates
      onTaskUpdate(task._id, {
        startDate: newStartDate,
        dueDate: newDueDate,
        updatedAt: new Date()
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
      setResizingTask(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Simplified click handlers
  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
    if (isResizing) return;

    e.preventDefault();
    e.stopPropagation();

    if (lastClickedTask === task._id) {
      setClickCount(prev => prev + 1);
    } else {
      setClickCount(1);
      setLastClickedTask(task._id);
    }

    if (clickTimer) {
      clearTimeout(clickTimer);
    }

    const timer = setTimeout(() => {
      if (clickCount === 1) {
        // Single click - open modal
        setSelectedTask(task);
        setShowTaskModal(true);
      } else if (clickCount >= 2) {
        // Double click - toggle completion
        const newStatus = task.status === 'completed' ? 'in-progress' : 'completed';
        onTaskUpdate(task._id, {
          status: newStatus,
          updatedAt: new Date()
        });
      }
      setClickCount(0);
      setLastClickedTask(null);
    }, 300);

    setClickTimer(timer);
  };

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
    };
  }, [clickTimer]);

  // Navigation functions
  const navigateTimeline = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);

=======
  // Navigation functions
  const navigateTimeline = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
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
<<<<<<< HEAD

=======
    
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Timeline View</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTimeline('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Today
              </button>
              <button
                onClick={() => navigateTimeline('next')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
<<<<<<< HEAD

=======
          
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">View:</span>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'week' | 'month' | 'quarter')}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="quarter">Quarter</option>
              </select>
            </div>
<<<<<<< HEAD

=======
            
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
<<<<<<< HEAD

=======
            
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
            <button
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>
<<<<<<< HEAD

=======
        
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
        {/* Date Header */}
        <div className="flex">
          <div className="w-64 flex-shrink-0"></div>
          <div className="flex-1 flex">
            {dates.map((date, index) => (
              <div
                key={index}
                className={`flex-1 text-center py-2 text-sm font-medium ${
<<<<<<< HEAD
                  date.toDateString() === today.toDateString()
                    ? 'bg-blue-100 text-blue-900 border-l-2 border-blue-500'
=======
                  date.toDateString() === today.toDateString() 
                    ? 'bg-blue-100 text-blue-900 border-l-2 border-blue-500' 
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
                    : 'text-gray-700'
                }`}
              >
                <div>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div className="text-xs text-gray-500">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
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
                  className="border-b border-gray-200 p-4 min-h-[120px]"
                  style={{ backgroundColor: category.color }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {categoryTasks.length}
                    </span>
                  </div>
<<<<<<< HEAD

                  {/* Drop zone for dragging tasks */}
                  <div
                    className={`h-16 border-2 border-dashed rounded-lg flex items-center justify-center text-sm transition-colors ${
                      draggedOverStatus === category.id && draggedTask
                        ? 'border-blue-400 bg-blue-50 text-blue-600'
                        : 'border-gray-300 text-gray-400'
                    }`}
                    onDragOver={(e) => handleDragOver(e, new Date(), category.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, new Date(), category.id)}
                  >
                    {draggedOverStatus === category.id && draggedTask ? (
                      <span className="font-medium">Drop "{draggedTask.title}" here</span>
                    ) : (
                      'Drop tasks here'
                    )}
=======
                  
                  {/* Drop zone for dragging tasks */}
                  <div
                    className="h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm"
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
                    Drop tasks here
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
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
              <div className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10">
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full"></div>
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
                    const isOverdueTask = isOverdue(task);
<<<<<<< HEAD

                    return (
                      <div
                        key={task._id}
                        draggable={!isResizing}
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => handleTaskClick(e, task)}
                        className={`absolute top-4 h-8 rounded-lg hover:shadow-md transition-all duration-200 flex items-center text-white text-sm font-medium group relative ${
                          isResizing ? 'cursor-default' : 'cursor-move'
                        } ${isOverdueTask ? 'ring-2 ring-red-400' : ''
                        } ${task.status === 'completed' ? 'opacity-75' : ''
                        } ${draggedTask?._id === task._id ? 'opacity-50 transform scale-105 shadow-lg' : ''}`}
                        style={{
                          left: position.left,
                          width: position.width,
                          backgroundColor: task.status === 'completed' ? '#374151' : task.project.color,
                          minWidth: '80px'
                        }}
                      >
                        {/* Left resize handle */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-3 cursor-w-resize opacity-0 group-hover:opacity-100 bg-white bg-opacity-50 hover:bg-opacity-80 transition-opacity z-20 flex items-center justify-center rounded-l"
                          onMouseDown={(e) => handleResizeStart(e, task, 'left')}
                          title="Drag to adjust start date"
                        >
                          <div className="w-0.5 h-4 bg-white bg-opacity-80 rounded"></div>
                        </div>

                        {/* Task content - this area is draggable */}
                        <div
                          className="flex items-center px-2 truncate flex-1 cursor-move"
                          onMouseDown={(e) => {
                            // Ensure this area can start drag
                            e.stopPropagation();
                          }}
                        >
                          <GripVertical className="w-3 h-3 mr-2 opacity-70" />
                          <span className={`truncate ${task.status === 'completed' ? 'line-through' : ''}`}>
                            {task.title}
                          </span>
                        </div>

                        {/* Task info */}
                        <div className="flex items-center gap-1 mr-2">
                          <div
                            className="w-4 h-4 rounded-full bg-white bg-opacity-30 flex items-center justify-center text-xs font-medium"
=======
                    
                    return (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskModal(true);
                        }}
                        className={`absolute top-4 h-8 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 flex items-center px-2 text-white text-sm font-medium ${
                          isOverdueTask ? 'ring-2 ring-red-400' : ''
                        }`}
                        style={{
                          left: position.left,
                          width: position.width,
                          backgroundColor: task.project.color,
                          minWidth: '60px'
                        }}
                      >
                        <GripVertical className="w-3 h-3 mr-1 opacity-70" />
                        <span className="truncate flex-1">{task.title}</span>
                        <div className="flex items-center gap-1 ml-2">
                          <div
                            className="w-4 h-4 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-xs"
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
                            title={task.assignee.name}
                          >
                            {task.assignee.name.charAt(0)}
                          </div>
<<<<<<< HEAD
                          {task.status === 'completed' && (
                            <div title="Completed">
                              <CheckCircle className="w-3 h-3 text-green-300" />
                            </div>
                          )}
                          {isOverdueTask && <AlertCircle className="w-3 h-3 text-red-300" />}
                        </div>

                        {/* Right resize handle */}
                        <div
                          className="absolute right-0 top-0 bottom-0 w-3 cursor-e-resize opacity-0 group-hover:opacity-100 bg-white bg-opacity-50 hover:bg-opacity-80 transition-opacity z-20 flex items-center justify-center rounded-r"
                          onMouseDown={(e) => handleResizeStart(e, task, 'right')}
                          title="Drag to adjust due date"
                        >
                          <div className="w-0.5 h-4 bg-white bg-opacity-80 rounded"></div>
=======
                          {isOverdueTask && <AlertCircle className="w-3 h-3 text-red-200" />}
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
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

<<<<<<< HEAD
      {/* Instructions */}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-xs z-50">
        Single click: Open details • Double click: Toggle completion • Drag left/right edges: Adjust dates
      </div>

      {/* Resize indicator */}
      {isResizing && resizingTask && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm z-50 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Adjusting {resizeDirection === 'left' ? 'start' : 'due'} date for "{resizingTask.title}"
          </div>
        </div>
      )}

=======
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
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
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-gray-600">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedTask.status}
<<<<<<< HEAD
                    onChange={(e) => onTaskUpdate(selectedTask._id, {
                      status: e.target.value as 'pending' | 'in-progress' | 'completed' | 'blocked'
=======
                    onChange={(e) => onTaskUpdate(selectedTask._id, { 
                      status: e.target.value as 'pending' | 'in-progress' | 'completed' | 'blocked' 
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={selectedTask.priority}
<<<<<<< HEAD
                    onChange={(e) => onTaskUpdate(selectedTask._id, {
                      priority: e.target.value as 'low' | 'medium' | 'high' | 'critical'
=======
                    onChange={(e) => onTaskUpdate(selectedTask._id, { 
                      priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' 
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={selectedTask.startDate.toISOString().split('T')[0]}
<<<<<<< HEAD
                    onChange={(e) => onTaskUpdate(selectedTask._id, {
                      startDate: new Date(e.target.value)
=======
                    onChange={(e) => onTaskUpdate(selectedTask._id, { 
                      startDate: new Date(e.target.value) 
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={selectedTask.dueDate.toISOString().split('T')[0]}
<<<<<<< HEAD
                    onChange={(e) => onTaskUpdate(selectedTask._id, {
                      dueDate: new Date(e.target.value)
=======
                    onChange={(e) => onTaskUpdate(selectedTask._id, { 
                      dueDate: new Date(e.target.value) 
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
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
                  Delete Task
                </button>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
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
