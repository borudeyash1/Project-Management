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
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-4 py-2 bg-gray-100 rounded-lg min-w-[200px] text-center">
                <span className="text-sm font-semibold text-gray-900">
                  {dates[0]?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  {viewMode === 'quarter' && ` - ${dates[dates.length - 1]?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
                </span>
              </div>
              <button
                onClick={goToToday}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateTimeline('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
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
            
            <button
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Task
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
                    ? 'bg-blue-100 text-blue-900 border-l-2 border-blue-500' 
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
                    
                    return (
                      <div
                        key={`${task._id}-${task.startDate}-${task.dueDate}`}
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
                            title={task.assignee.name}
                          >
                            {task.assignee.name.charAt(0)}
                          </div>
                          {isOverdueTask && <AlertCircle className="w-3 h-3 text-red-200" />}
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
                    onChange={(e) => onTaskUpdate(selectedTask._id, { 
                      status: e.target.value as 'pending' | 'in-progress' | 'completed' | 'blocked' 
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
                    onChange={(e) => onTaskUpdate(selectedTask._id, { 
                      priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' 
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
                    onChange={(e) => onTaskUpdate(selectedTask._id, { 
                      startDate: new Date(e.target.value) 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={selectedTask.dueDate.toISOString().split('T')[0]}
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
