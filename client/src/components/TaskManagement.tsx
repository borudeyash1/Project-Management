import React, { useState, useEffect } from 'react';
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
  Target as TargetIcon, Building as BuildingIcon, LayoutGrid, List
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDock } from '../context/DockContext';
import TaskTimeline from './TaskTimeline';
import TaskTimelineView from './TaskTimelineView';
import KanbanBoard from './KanbanBoard';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';
import { useRefreshData } from '../hooks/useRefreshData';
import { useCallback } from 'react';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    initials?: string;
  };
  startDate: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  milestones: Milestone[];
  attachments: Attachment[];
  comments: Comment[];
  tags: string[];
  labels: Label[];
  customTags: CustomTag[];
  estimatedHours: number;
  actualHours: number;
  rating?: number;
  projectId: string;
  project: {
    _id: string;
    name: string;
    color: string;
  };
  subtasks: Subtask[];
  dependencies: string[];
  timeTracking: TimeEntry[];
  notes: Note[];
  isCompleted: boolean;
  completedAt?: Date;
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

interface Label {
  _id: string;
  name: string;
  color: string;
}

interface CustomTag {
  _id: string;
  name: string;
  color: string;
  text: string;
}

interface Column {
  _id: string;
  name: string;
  color: string;
  position: number;
  taskLimit?: number;
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

interface Attachment {
  _id: string;
  name: string;
  url: string;
  type: 'file' | 'link';
  uploadedBy: string;
  uploadedAt: Date;
  taskId: string;
  size?: number;
  mimeType?: string;
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: Date;
  taskId: string;
  mentions: string[];
  attachments?: Attachment[];
}

interface TimeEntry {
  _id: string;
  taskId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  description: string;
  createdAt: Date;
}

interface Project {
  _id: string;
  name: string;
  color: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  isOnline: boolean;
}

const TaskManagement: React.FC = () => {
  const { state, dispatch } = useApp();
  const { dockPosition } = useDock();
  const { t, i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const [activeView, setActiveView] = useState('taskboard');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [showTimeTracking, setShowTimeTracking] = useState(false);
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📋 [TASKS] Fetching tasks...');
      
      // Fetch tasks from API
      const response = await apiService.get('/tasks');
      const tasksData = response.data || response || [];
      
      // Filter out tasks with invalid/missing data to prevent errors
      const validTasks = tasksData.filter((task: any) => {
        // Must have basic required fields
        if (!task._id || !task.title) return false;
        
        // If assignee exists, it must have required fields
        if (task.assignee && !task.assignee._id) return false;
        
        // If project exists, it must have ALL required fields
        if (task.project) {
          if (!task.project._id || !task.project.name || !task.project.color) {
            return false;
          }
        }
        
        return true;
      });
      
      console.log('✅ [TASKS] Tasks loaded:', validTasks.length, '(filtered from', tasksData.length, ')');
      setTasks(validTasks);
      dispatch({ type: 'SET_TASKS', payload: validTasks });
      
      // Set default columns if not already set
      if (columns.length === 0) {
        const defaultColumns: Column[] = [
          { _id: 'todo', name: 'To Do', color: '#6B7280', position: 0 },
          { _id: 'in-progress', name: 'In Progress', color: '#3B82F6', position: 1 },
          { _id: 'review', name: 'Review', color: '#F59E0B', position: 2 },
          { _id: 'done', name: 'Done', color: '#10B981', position: 3 }
        ];
        setColumns(defaultColumns);
      }
    } catch (error) {
      console.error('❌ [TASKS] Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [dispatch, columns.length]);

  // Initialize tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Enable refresh button
  useRefreshData(fetchTasks, [fetchTasks]);

  // Column management functions
  const handleColumnUpdate = (columnId: string, updates: Partial<Column>) => {
    setColumns(prevColumns =>
      prevColumns.map(column =>
        column._id === columnId
          ? { ...column, ...updates }
          : column
      )
    );
  };

  const handleColumnCreate = (columnData: Partial<Column>) => {
    const newColumn: Column = {
      _id: `column_${Date.now()}`,
      name: columnData.name || t('common.newColumn'),
      color: columnData.color || '#3B82F6',
      position: columnData.position || columns.length,
      taskLimit: columnData.taskLimit
    };

    setColumns(prevColumns => [...prevColumns, newColumn]);
  };

  const handleColumnDelete = (columnId: string) => {
    setColumns(prevColumns => prevColumns.filter(column => column._id !== columnId));
  };

  // Note management functions
  const handleNoteCreate = (taskId: string, content: string, type: 'manual' | 'ai-generated') => {
    const newNote: Note = {
      _id: `note_${Date.now()}`,
      content,
      type,
      author: {
        _id: 'current-user',
        name: 'Current User',
        avatarUrl: ''
      },
      createdAt: new Date(),
      taskId,
      tags: [],
      isImportant: false
    };

    setTasks((prevTasks: Task[]) =>
      prevTasks.map((task: Task) =>
        task._id === taskId
          ? { ...task, notes: [...task.notes, newNote] }
          : task
      )
    );
  };

  const handleNoteUpdate = (noteId: string, content: string) => {
    setTasks((prevTasks: Task[]) =>
      prevTasks.map((task: Task) => ({
        ...task,
        notes: task.notes.map((note: Note) =>
          note._id === noteId
            ? { ...note, content }
            : note
        )
      }))
    );
  };

  const handleNoteDelete = (noteId: string) => {
    setTasks((prevTasks: Task[]) =>
      prevTasks.map((task: Task) => ({
        ...task,
        notes: task.notes.filter((note: Note) => note._id !== noteId)
      }))
    );
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
  // Optimistic update - update UI immediately
  setTasks((prevTasks: Task[]) =>
    prevTasks.map((task: Task) =>
      task._id === taskId
        ? { ...task, ...updates }
        : task
    )
  );

  // Persist to database
  try {
    // Convert updates to API-compatible format
    const apiUpdates: any = { ...updates };
    if (apiUpdates.project && typeof apiUpdates.project === 'object') {
      apiUpdates.project = apiUpdates.project._id;
    }
    if (apiUpdates.assignee && typeof apiUpdates.assignee === 'object') {
      apiUpdates.assignee = apiUpdates.assignee._id;
    }
    
    await apiService.updateTask(taskId, apiUpdates);
  } catch (error) {
    console.error('Failed to update task:', error);
    // Optionally: revert the optimistic update or show error toast
    setToastMessage('Failed to update task');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }
};

  const handleTaskCreate = (taskData: Partial<Task>) => {
    const newTask: Task = {
      _id: `task_${Date.now()}`,
      title: taskData.title || t('tasks.newTask'),
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      assignee: taskData.assignee || { _id: 'unassigned', name: t('tasks.unassigned'), email: '', avatarUrl: '' },
      startDate: taskData.startDate || new Date(),
      dueDate: taskData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdAt: new Date(),
      updatedAt: new Date(),
      milestones: [],
      attachments: [],
      comments: [],
      tags: [],
      labels: [],
      customTags: [],
      estimatedHours: 0,
      actualHours: 0,
      projectId: taskData.projectId || '1',
      project: taskData.project || { _id: '1', name: t('projects.defaultProject'), color: '#3B82F6' },
      subtasks: [],
      dependencies: [],
      timeTracking: [],
      notes: [],
      isCompleted: false
    };

    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
  };

  // Mock data - replace with actual API calls
  const mockTasks: Task[] = [
    {
      _id: '1',
      title: 'Design User Interface',
      description: 'Create wireframes and mockups for the main dashboard with modern design principles',
      status: 'in-progress',
      priority: 'high',
      assignee: { _id: 'u1', name: 'John Doe', email: 'john@example.com', avatarUrl: '', initials: 'JD' },
      startDate: new Date('2024-03-01'),
      dueDate: new Date('2024-03-20'),
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-15'),
      labels: [
        { _id: 'l1', name: 'Design', color: '#F59E0B' },
        { _id: 'l2', name: 'UI', color: '#10B981' },
        { _id: 'l3', name: 'Frontend', color: '#8B5CF6' }
      ],
      customTags: [],
      isCompleted: false,
      milestones: [
        { _id: 'm1', title: 'Wireframes', description: 'Create basic wireframes', status: 'completed', dueDate: new Date('2024-03-05'), assignee: 'u1', taskId: '1' },
        { _id: 'm2', title: 'Mockups', description: 'Design detailed mockups', status: 'in-progress', dueDate: new Date('2024-03-15'), assignee: 'u1', taskId: '1' },
        { _id: 'm3', title: 'Prototype', description: 'Create interactive prototype', status: 'pending', dueDate: new Date('2024-03-20'), assignee: 'u1', taskId: '1' }
      ],
      attachments: [
        { _id: 'a1', name: 'wireframes.pdf', url: '/files/wireframes.pdf', type: 'file', uploadedBy: 'u1', uploadedAt: new Date('2024-03-05'), taskId: '1', size: 1024000, mimeType: 'application/pdf' },
        { _id: 'a2', name: 'Design System', url: 'https://figma.com/design-system', type: 'link', uploadedBy: 'u1', uploadedAt: new Date('2024-03-10'), taskId: '1' }
      ],
      comments: [
        { _id: 'c1', content: 'Great work on the wireframes! Looking forward to the mockups.', author: { _id: 'pm1', name: 'Mike Johnson', avatarUrl: '' }, createdAt: new Date('2024-03-05'), taskId: '1', mentions: ['u1'] },
        { _id: 'c2', content: 'Thanks! Working on the mockups now. @mike any specific requirements?', author: { _id: 'u1', name: 'John Doe', avatarUrl: '' }, createdAt: new Date('2024-03-06'), taskId: '1', mentions: ['pm1'] }
      ],
      tags: ['design', 'ui', 'frontend'],
      estimatedHours: 40,
      actualHours: 25,
      rating: 4.5,
      projectId: '1',
      project: { _id: '1', name: 'E-commerce Platform', color: '#3B82F6' },
      subtasks: [
        { _id: 'st1', title: 'Create color palette', description: 'Define primary and secondary colors', status: 'completed', dueDate: new Date('2024-03-08'), assignee: 'u1', parentTaskId: '1' },
        { _id: 'st2', title: 'Design components', description: 'Create reusable UI components', status: 'in-progress', dueDate: new Date('2024-03-18'), assignee: 'u1', parentTaskId: '1' }
      ],
      dependencies: ['2'],
      timeTracking: [
        { _id: 'te1', taskId: '1', userId: 'u1', startTime: new Date('2024-03-01T09:00:00'), endTime: new Date('2024-03-01T17:00:00'), duration: 480, description: 'Initial wireframe creation', createdAt: new Date('2024-03-01') },
        { _id: 'te2', taskId: '1', userId: 'u1', startTime: new Date('2024-03-02T09:00:00'), endTime: new Date('2024-03-02T15:00:00'), duration: 360, description: 'Wireframe refinement', createdAt: new Date('2024-03-02') }
      ],
      notes: [
        { _id: 'n1', content: 'Started working on the wireframes. Need to focus on mobile responsiveness.', type: 'manual', author: { _id: 'u1', name: 'John Doe', avatarUrl: '' }, createdAt: new Date('2024-03-01'), taskId: '1', tags: ['wireframes', 'mobile'], isImportant: false },
        { _id: 'n2', content: 'AI Analysis: Task is progressing well with 67% completion. Consider adding more interactive elements to improve user engagement.', type: 'ai-generated', author: { _id: 'ai', name: 'AI Assistant', avatarUrl: '' }, createdAt: new Date('2024-03-15'), taskId: '1', tags: ['analysis', 'suggestion'], isImportant: true }
      ]
    },
    {
      _id: '2',
      title: 'Backend API Development',
      description: 'Develop RESTful APIs for the application with proper authentication and validation',
      status: 'pending',
      priority: 'high',
      assignee: { _id: 'u2', name: 'Jane Smith', email: 'jane@example.com', avatarUrl: '', initials: 'JS' },
      startDate: new Date('2024-03-05'),
      dueDate: new Date('2024-03-25'),
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-15'),
      labels: [
        { _id: 'l4', name: 'Backend', color: '#EF4444' },
        { _id: 'l5', name: 'API', color: '#3B82F6' }
      ],
      customTags: [],
      isCompleted: false,
      milestones: [
        { _id: 'm4', title: 'Database Design', description: 'Design database schema', status: 'completed', dueDate: new Date('2024-03-10'), assignee: 'u2', taskId: '2' },
        { _id: 'm5', title: 'API Endpoints', description: 'Create API endpoints', status: 'pending', dueDate: new Date('2024-03-20'), assignee: 'u2', taskId: '2' },
        { _id: 'm6', title: 'Testing', description: 'Write unit tests', status: 'pending', dueDate: new Date('2024-03-25'), assignee: 'u2', taskId: '2' }
      ],
      attachments: [],
      comments: [],
      tags: ['backend', 'api', 'development'],
      estimatedHours: 60,
      actualHours: 15,
      projectId: '1',
      project: { _id: '1', name: 'E-commerce Platform', color: '#3B82F6' },
      subtasks: [],
      dependencies: [],
      timeTracking: [],
      notes: []
    },
    {
      _id: '3',
      title: 'Mobile App Testing',
      description: 'Comprehensive testing of the mobile application across different devices',
      status: 'completed',
      priority: 'medium',
      assignee: { _id: 'u3', name: 'Bob Wilson', email: 'bob@example.com', avatarUrl: '', initials: 'BW' },
      startDate: new Date('2024-02-20'),
      dueDate: new Date('2024-03-15'),
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-03-15'),
      labels: [
        { _id: 'l6', name: 'Testing', color: '#10B981' },
        { _id: 'l7', name: 'QA', color: '#8B5CF6' }
      ],
      customTags: [
        { _id: 'ct1', name: 'Ca', color: '#3B82F6', text: 'Ca' }
      ],
      isCompleted: true,
      completedAt: new Date('2024-03-15'),
      milestones: [
        { _id: 'm7', title: 'Unit Testing', description: 'Write unit tests', status: 'completed', dueDate: new Date('2024-03-05'), assignee: 'u3', taskId: '3' },
        { _id: 'm8', title: 'Integration Testing', description: 'Test API integration', status: 'completed', dueDate: new Date('2024-03-10'), assignee: 'u3', taskId: '3' },
        { _id: 'm9', title: 'Device Testing', description: 'Test on various devices', status: 'completed', dueDate: new Date('2024-03-15'), assignee: 'u3', taskId: '3' }
      ],
      attachments: [
        { _id: 'a3', name: 'test-report.pdf', url: '/files/test-report.pdf', type: 'file', uploadedBy: 'u3', uploadedAt: new Date('2024-03-15'), taskId: '3', size: 2048000, mimeType: 'application/pdf' }
      ],
      comments: [
        { _id: 'c3', content: 'All tests passed! Ready for production.', author: { _id: 'u3', name: 'Bob Wilson', avatarUrl: '' }, createdAt: new Date('2024-03-15'), taskId: '3', mentions: [] }
      ],
      tags: ['testing', 'mobile', 'qa'],
      estimatedHours: 30,
      actualHours: 28,
      rating: 4.8,
      projectId: '2',
      project: { _id: '2', name: 'Mobile App', color: '#10B981' },
      subtasks: [],
      dependencies: [],
      timeTracking: [],
      notes: [
        { _id: 'n3', content: 'All tests completed successfully. Ready for production deployment.', type: 'manual', author: { _id: 'u3', name: 'Bob Wilson', avatarUrl: '' }, createdAt: new Date('2024-03-15'), taskId: '3', tags: ['testing', 'completion'], isImportant: true }
      ]
    }
  ];

  const mockColumns: Column[] = [
    {
      _id: 'backlog',
      name: 'Backlog',
      color: '#6B7280',
      position: 0,
      taskLimit: 50
    },
    {
      _id: 'in-progress',
      name: 'In Progress',
      color: '#3B82F6',
      position: 1,
      taskLimit: 20
    },
    {
      _id: 'review-internal',
      name: 'Review (internal)',
      color: '#F59E0B',
      position: 2,
      taskLimit: 15
    },
    {
      _id: 'check-comments',
      name: 'Check comments, make edits',
      color: '#8B5CF6',
      position: 3,
      taskLimit: 10
    },
    {
      _id: 'qa-client',
      name: 'QA (client)',
      color: '#10B981',
      position: 4,
      taskLimit: 8
    },
    {
      _id: 'publication',
      name: 'Publication',
      color: '#EF4444',
      position: 5,
      taskLimit: 5
    }
  ];

  const projects: Project[] = [
    { _id: '1', name: 'E-commerce Platform', color: '#3B82F6', status: 'active', progress: 65 },
    { _id: '2', name: 'Mobile App', color: '#10B981', status: 'active', progress: 40 },
    { _id: '3', name: 'Marketing Campaign', color: '#F59E0B', status: 'paused', progress: 20 }
  ];

  const teamMembers: TeamMember[] = [
    { _id: 'u1', name: 'John Doe', email: 'john@example.com', avatarUrl: '', role: 'Designer', isOnline: true },
    { _id: 'u2', name: 'Jane Smith', email: 'jane@example.com', avatarUrl: '', role: 'Developer', isOnline: true },
    { _id: 'u3', name: 'Bob Wilson', email: 'bob@example.com', avatarUrl: '', role: 'QA Engineer', isOnline: false },
    { _id: 'pm1', name: 'Mike Johnson', email: 'mike@example.com', avatarUrl: '', role: 'Project Manager', isOnline: true }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-200 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
  const icon = (() => {
    switch (priority) {
      case 'low': return <Circle className="w-3 h-3" />;
      case 'medium': return <Square className="w-3 h-3" />;
      case 'high': return <Triangle className="w-3 h-3" />;
      case 'critical': return <AlertCircle className="w-3 h-3" />;
      default: return <Circle className="w-3 h-3" />;
    }
  })();
  
  return <span className="pointer-events-none">{icon}</span>;
};

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task._id);

    // Add visual feedback to the dragged element
    const target = e.target as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDraggedOverColumn(status);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset visual feedback
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      console.log(`Moving task ${draggedTask._id} to ${status}`);

      // Update the task status in the state
      setTasks((prevTasks: Task[]) =>
        prevTasks.map((task: Task) =>
          task._id === draggedTask._id
            ? { ...task, status: status as 'pending' | 'in-progress' | 'completed', updatedAt: new Date() }
            : task
        )
      );

      // Show success toast
      setToastMessage(`Task "${draggedTask.title}" moved to ${status.replace('-', ' ')}`);
      setShowToast(true);

      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const startTimeTracking = (taskId: string) => {
    const newEntry: TimeEntry = {
      _id: `te_${Date.now()}`,
      taskId,
      userId: 'current-user', // In real app, get from auth context
      startTime: new Date(),
      duration: 0,
      description: '',
      createdAt: new Date()
    };
    setCurrentTimeEntry(newEntry);
    setShowTimeTracking(true);
  };

  const stopTimeTracking = () => {
    if (currentTimeEntry) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentTimeEntry.startTime.getTime()) / 60000);
      console.log(`Time tracked: ${duration} minutes`);
      setCurrentTimeEntry(null);
      setShowTimeTracking(false);
    }
  };

  const renderTaskBoard = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('tasks.views.board')}</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('tasks.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="all">{t('common.allStatus')}</option>
            <option value="pending">{t('common.pending')}</option>
            <option value="in-progress">{t('common.inProgress')}</option>
            <option value="completed">{t('common.completed')}</option>
          </select>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="all">{t('projects.allProjects')}</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>{project.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateTask(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('tasks.newTask')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['pending', 'in-progress', 'completed'].map(status => (
          <div
            key={status}
            className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[500px] transition-all duration-200 ${draggedOverColumn === status
              ? 'ring-2 ring-blue-500 bg-blue-50 border-2 border-blue-300'
              : 'border border-gray-200 dark:border-gray-700'
              }`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                {t(`common.${status.replace('-', '')}`)}
              </h3>
              <span className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full">
                {tasks.filter((t: Task) => t.status === status).length}
              </span>
            </div>

            <div className="space-y-3">
              {draggedOverColumn === status && draggedTask && draggedTask.status !== status && (
                <div className="bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg p-4 text-center text-accent-dark text-sm font-medium">
                  {t('tasks.dropHere', { title: draggedTask.title })}
                </div>
              )}
              {tasks
                .filter((task: Task) => task.status === status)
                .map((task: Task) => {
                  // Status-based colors
                  const getStatusColor = () => {
                    switch (status) {
                      case 'pending':
                      case 'todo':
                        return '#FF69B4'; // Pink for pending
                      case 'in-progress':
                        return '#60A5FA'; // Blue for in progress
                      case 'review':
                        return '#FBBF24'; // Yellow for review
                      case 'done':
                      case 'completed':
                        return '#4ADE80'; // Green for done
                      default:
                        return '#FF69B4';
                    }
                  };

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
                      className="relative cursor-pointer transition-all duration-300 hover:-translate-x-1.5 hover:-translate-y-1.5"
                      style={{
                        transform: 'translate(-6px, -6px)',
                        background: getStatusColor(),
                        border: '3px solid #000000',
                        boxShadow: '12px 12px 0 #000000',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Card Header */}
                      <div 
                        className="w-full px-3 py-2 bg-white border-b-[3px] border-black"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-sm text-black truncate flex-1">{task.title}</h4>
                          <div className="flex items-center gap-1 ml-2">
                            {getPriorityIcon(task.priority)}
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-3 space-y-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {/* Description */}
                        {task.description && (
                          <p className="text-xs font-semibold text-black line-clamp-2">{task.description}</p>
                        )}

                        {/* Project Badge - Only show if project exists */}
                        {task.project && task.project.name && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-black bg-white px-2 py-1 rounded border-2 border-black">
                              {task.project.name}
                            </span>
                          </div>
                        )}

                        {/* Assignee */}
                        <div className="flex items-center gap-2">
                          <img
                            src={task.assignee?.avatarUrl || `https://ui-avatars.com/api/?name=${task.assignee?.name || 'U'}&background=random`}
                            alt={task.assignee?.name || 'User'}
                            className="w-6 h-6 rounded-full border-2 border-black"
                          />
                          <span className="text-xs font-bold text-black">{task.assignee?.name || 'Unassigned'}</span>
                        </div>

                        {/* Due Date */}
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs font-bold text-black">
                            <span>📅</span>
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}

                        {/* Tags - Only show if exists */}
                        {(task.tags?.length || 0) > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(task.tags || []).slice(0, 3).map((tag: string) => (
                              <span key={tag} className="px-2 py-1 bg-white text-black text-xs font-bold border-2 border-black rounded">
                                #{tag}
                              </span>
                            ))}
                            {(task.tags?.length || 0) > 3 && (
                              <span className="px-2 py-1 bg-white text-black text-xs font-bold border-2 border-black rounded">
                                +{(task.tags?.length || 0) - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              {tasks.filter((task: Task) => task.status === status).length === 0 && !draggedOverColumn && (
                <div className="text-center text-gray-600 dark:text-gray-400 text-sm py-8">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p>{t('tasks.noTasksInStatus', { status: t(`common.${status.replace('-', '')}`) })}</p>
                  <p className="text-xs mt-1">{t('tasks.dragOrCreate')}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTaskAnalytics = () => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('reports.totalTasks')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{tasks.length}</p>
            </div>
            <CheckSquare className="w-8 h-8 text-accent-dark" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('common.completed')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('common.inProgress')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {tasks.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('tasks.overdue')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {tasks.filter(t => (t.dueDate ? new Date(t.dueDate) : new Date(8640000000000000)) < new Date() && t.status !== 'completed').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('reports.taskCompletion')}</h3>
          <div className="space-y-3">
            {['pending', 'in-progress', 'completed'].map(status => {
              const count = tasks.filter(t => t.status === status).length;
              const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;

              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${status === 'pending' ? 'bg-gray-400' :
                      status === 'in-progress' ? 'bg-accent-light' :
                        status === 'completed' ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {t(`common.${status.replace('-', '')}`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-300 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${status === 'pending' ? 'bg-gray-400' :
                          status === 'in-progress' ? 'bg-accent-light' :
                            status === 'completed' ? 'bg-green-400' : 'bg-red-400'
                          }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('reports.projectMetrics')}</h3>
          <div className="space-y-3">
            {(() => {
              // Extract unique projects from tasks
              const projectsMap = new Map();
              tasks.forEach(task => {
                if (task.project && task.project._id) {
                  projectsMap.set(task.project._id, task.project);
                }
              });
              const projects = Array.from(projectsMap.values());
              
              return projects.map(project => {
                const count = tasks.filter(t => t.project?._id === project._id).length;
                const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;

                return (
                  <div key={project._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color || '#6B7280' }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-300 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: project.color || '#6B7280'
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTaskList = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('tasks.views.list')}</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('tasks.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <button
            onClick={() => setShowCreateTask(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('tasks.newTask')}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('planner.list.columns.task')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('planner.list.columns.status')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('planner.list.columns.priority')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('planner.list.columns.assignee')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('planner.list.columns.dueDate')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map(task => (
              <tr key={task._id} className="hover:bg-gray-50 dark:bg-gray-700">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.project?.color || '#6B7280' }} />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</div>
                      <div className="text-xs text-gray-500">{task.project?.name || 'No Project'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(task.status)}`}>
                    {t(`common.${task.status.replace('-', '')}`)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 capitalize text-sm text-gray-700">
                    {getPriorityIcon(task.priority)}
                    {task.priority === 'critical' ? t('tracker.dashboard.critical') : t(`common.${task.priority}`)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={task.assignee?.avatarUrl || `https://ui-avatars.com/api/?name=${task.assignee?.name || 'User'}&background=random`}
                      alt={task.assignee?.name || 'User'}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-700">{task.assignee?.name || 'Unassigned'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setShowTaskModal(true);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-400"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTaskCalendar = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('tasks.views.calendar')}</h2>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {new Date().toLocaleString(i18n.language, { month: 'long', year: 'numeric' })}
          </span>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-500">
        {t('widgets.calendar')} {t('common.view')}
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('tasks.templates')}</h2>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover transition-colors">
          <Plus className="w-4 h-4" />
          {t('tasks.createTemplate')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'bugReport', category: 'development' },
          { name: 'featureRequest', category: 'product' },
          { name: 'codeReview', category: 'development' },
          { name: 'designReview', category: 'design' },
          { name: 'testingTask', category: 'qa' },
          { name: 'documentation', category: 'general' }
        ].map((template, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t(`tasks.templateList.${template.name}.name`)}</h3>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                {t(`tasks.categories.${template.category}`)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t(`tasks.templateList.${template.name}.description`)}</p>
            <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-700 transition-colors">
              {t('tasks.useTemplate')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTaskModal = () => {
    if (!selectedTask) return null;

    const handleSubtaskToggle = (subtaskId: string) => {
      const updatedSubtasks = (selectedTask.subtasks || []).map(st =>
        st._id === subtaskId
          ? { ...st, status: st.status === 'completed' ? 'pending' : 'completed' as 'pending' | 'in-progress' | 'completed' }
          : st
      );
      
      // Update the task in the tasks array
      handleTaskUpdate(selectedTask._id, { subtasks: updatedSubtasks });
      
      // Update selectedTask to reflect changes immediately
      setSelectedTask({
        ...selectedTask,
        subtasks: updatedSubtasks
      });
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] overflow-y-auto py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedTask.title}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  if (window.confirm(t('planner.taskDetail.deleteConfirm'))) {
                    handleTaskDelete(selectedTask._id);
                    setToastMessage(t('tasks.deleteSuccess'));
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                  }
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('tasks.sections.description')}</h4>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedTask.description || 'No description'}</p>
              </div>

              {/* Subtasks */}
              {(selectedTask.subtasks || []).length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('tasks.sections.subtasks')}</h4>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {(selectedTask.subtasks || []).filter(s => s.status === 'completed').length}/{(selectedTask.subtasks || []).length}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(selectedTask.subtasks || []).map(subtask => (
                      <div key={subtask._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <input
                          type="checkbox"
                          checked={subtask.status === 'completed'}
                          onChange={() => handleSubtaskToggle(subtask._id)}
                          className="w-4 h-4 text-accent-dark rounded focus:ring-accent cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${subtask.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                            {subtask.title}
                          </p>
                          {subtask.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">{subtask.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('common.status')}:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tasks.priority')}:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tasks.assignee')}:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <img
                      src={selectedTask.assignee?.avatarUrl || `https://ui-avatars.com/api/?name=${selectedTask.assignee?.name || 'Unassigned'}&background=random`}
                      alt={selectedTask.assignee?.name || 'Unassigned'}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{selectedTask.assignee?.name || 'Unassigned'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tasks.dueDate')}:</span>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <CalendarIcon className="w-4 h-4" />
                    {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString(i18n.language) : '-'}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tasks.timeTracking')}:</span>
                  <div className="mt-1 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('tasks.estimatedTime')}:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{selectedTask.estimatedHours || 0}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('tasks.actualTime')}:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{selectedTask.actualHours || 0}h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateTaskModal = () => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] overflow-y-auto py-8">
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-800 dark:bg-gray-800 z-10">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 dark:text-white">{t('planner.taskModal.title')}</h2>
            <button
              onClick={() => setShowCreateTask(false)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const assigneeId = formData.get('assignee') as string;
              const assignee = teamMembers.find(m => m._id === assigneeId);
              const tagsString = formData.get('tags') as string;
              const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(t => t) : [];

              const taskData = {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'critical',
                status: formData.get('status') as string,
                projectId: formData.get('project') as string,
                assignee: assignee || teamMembers[0],
                startDate: formData.get('startDate') ? new Date(formData.get('startDate') as string) : new Date(),
                dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : undefined,
                estimatedHours: formData.get('estimatedHours') ? parseFloat(formData.get('estimatedHours') as string) : 0,
                tags: tags
              };
              handleTaskCreate(taskData);
              setShowCreateTask(false);
              setToastMessage(t('tasks.createSuccess'));
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            }}
            className="p-6 space-y-4"
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                {t('planner.taskModal.fields.title')}
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder={t('tasks.enterTitle')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                {t('planner.taskModal.fields.description')}
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder={t('tasks.enterDescription')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
              />
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  {t('planner.taskModal.fields.priority')}
                </label>
                <select
                  name="priority"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
                >
                  <option value="low">{t('common.low')}</option>
                  <option value="medium">{t('common.medium')}</option>
                  <option value="high">{t('common.high')}</option>
                  <option value="critical">{t('tracker.dashboard.critical')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  {t('planner.taskModal.fields.status')}
                </label>
                <select
                  name="status"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
                >
                  <option value="pending">{t('common.pending')}</option>
                  <option value="in-progress">{t('common.inProgress')}</option>
                  <option value="completed">{t('common.completed')}</option>
                  <option value="blocked">{t('tasks.blocked')}</option>
                </select>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                {t('planner.taskModal.fields.assignees')}
              </label>
              <select
                name="assignee"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
              >
                <option value="">{t('tasks.selectAssignee')}</option>
                {teamMembers.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name} - {member.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Project and Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  {t('tracker.project')}
                </label>
                <select
                  name="project"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
                >
                  <option value="">{t('tasks.noProject')}</option>
                  {state.projects.map(project => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  {t('planner.taskModal.fields.dueDate')}
                </label>
                <input
                  type="date"
                  name="dueDate"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
                />
              </div>
            </div>

            {/* Start Date and Estimated Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  {t('tasks.startDate')}
                </label>
                <input
                  type="date"
                  name="startDate"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  {t('planner.taskModal.fields.estimatedTime')}
                </label>
                <input
                  type="number"
                  name="estimatedHours"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                {t('planner.taskModal.fields.tags')}
              </label>
              <input
                type="text"
                name="tags"
                placeholder={t('tasks.tagsPlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-300 dark:border-gray-600">
              <button
                type="button"
                onClick={() => setShowCreateTask(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-700 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover"
              >
                {t('planner.taskModal.fields.create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditTaskModal = () => {
    if (!selectedTask) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] overflow-y-auto py-8">
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-800 dark:bg-gray-800 z-10">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 dark:text-white">{t('tasks.editTask')}</h2>
            <button
              onClick={() => setShowEditTask(false)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const assigneeId = formData.get('assignee') as string;
              const assignee = teamMembers.find(m => m._id === assigneeId);
              const tagsString = formData.get('tags') as string;
              const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(t => t) : [];

              const updates = {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'critical',
                status: formData.get('status') as string,
                projectId: formData.get('project') as string,
                assignee: assignee || selectedTask.assignee,
                startDate: formData.get('startDate') ? new Date(formData.get('startDate') as string) : selectedTask.startDate,
                dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : undefined,
                estimatedHours: formData.get('estimatedHours') ? parseFloat(formData.get('estimatedHours') as string) : selectedTask.estimatedHours,
                tags: tags
              };
              handleTaskUpdate(selectedTask._id, updates);
              setShowEditTask(false);
              setToastMessage(t('tasks.updateSuccess'));
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            }}
            className="p-6 space-y-4"
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                {t('planner.taskModal.fields.title')}
              </label>
              <input
                type="text"
                name="title"
                required
                defaultValue={selectedTask.title}
                placeholder={t('tasks.enterTitle')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                {t('planner.taskModal.fields.description')}
              </label>
              <textarea
                name="description"
                rows={4}
                defaultValue={selectedTask.description}
                placeholder={t('tasks.enterDescription')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
              />
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  {t('planner.taskModal.fields.priority')}
                </label>
                <select
                  name="priority"
                  required
                  defaultValue={selectedTask.priority}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
                >
                  <option value="low">{t('common.low')}</option>
                  <option value="medium">{t('common.medium')}</option>
                  <option value="high">{t('common.high')}</option>
                  <option value="critical">{t('tracker.dashboard.critical')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  {t('planner.taskModal.fields.status')}
                </label>
                <select
                  name="status"
                  required
                  defaultValue={selectedTask.status}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
                >
                  <option value="pending">{t('common.pending')}</option>
                  <option value="in-progress">{t('common.inProgress')}</option>
                  <option value="completed">{t('common.completed')}</option>
                  <option value="blocked">{t('tasks.blocked')}</option>
                </select>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                {t('planner.taskModal.fields.assignees')}
              </label>
              <select
                name="assignee"
                required
                defaultValue={selectedTask.assignee._id}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
              >
                {teamMembers.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name} - {member.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Project and Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  {t('tracker.project')}
                </label>
                <select
                  name="project"
                  defaultValue={selectedTask.projectId}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
                >
                  <option value="">{t('tasks.noProject')}</option>
                  {state.projects.map(project => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  {t('planner.taskModal.fields.dueDate')}
                </label>
                <input
                  type="date"
                  name="dueDate"
                  defaultValue={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : ''}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
                />
              </div>
            </div>

            {/* Start Date and Estimated Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  {t('tasks.startDate')}
                </label>
                <input
                  type="date"
                  name="startDate"
                  defaultValue={new Date(selectedTask.startDate).toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  {t('planner.taskModal.fields.estimatedTime')}
                </label>
                <input
                  type="number"
                  name="estimatedHours"
                  min="0"
                  step="0.5"
                  defaultValue={selectedTask.estimatedHours}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                {t('planner.taskModal.fields.tags')}
              </label>
              <input
                type="text"
                name="tags"
                defaultValue={selectedTask.tags.join(', ')}
                placeholder={t('tasks.tagsPlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:text-white"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-300 dark:border-gray-600">
              <button
                type="button"
                onClick={() => setShowEditTask(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-700 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover"
              >
                {t('buttons.saveChanges')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderTimeTrackingModal = () => {
    if (!showTimeTracking) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] overflow-y-auto py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('tasks.timeTracking')}</h3>
            <button
              onClick={() => setShowTimeTracking(false)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {currentTimeEntry ? '00:00:00' : '00:00:00'}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('tracker.timeSpent')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.description')}</label>
              <textarea
                placeholder={t('tracker.whatAreYouWorkingOn')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={stopTimeTracking}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('planner.stopTimer')}
              </button>
              <button
                onClick={() => setShowTimeTracking(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-700 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const views = [
    { id: 'taskboard', label: t('tasks.views.board'), icon: LayoutGrid, description: t('tasks.views.descriptions.board') },
    { id: 'tasklist', label: t('tasks.views.list'), icon: List, description: t('tasks.views.descriptions.list') },
    { id: 'taskcalendar', label: t('tasks.views.calendar'), icon: CalendarIcon, description: t('tasks.views.descriptions.calendar') },
    { id: 'taskanalytics', label: t('reports.analytics'), icon: BarChart3, description: t('tasks.views.descriptions.analytics') },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'taskboard':
        return renderTaskBoard();
      case 'tasklist':
        return renderTaskList();
      case 'timeline':
        return (
          <TaskTimelineView
            tasks={tasks as any}
            onTaskUpdate={handleTaskUpdate}
            onTaskCreate={handleTaskCreate}
            onTaskDelete={handleTaskDelete}
          />
        );
      case 'tasktimeline':
        return (
          <TaskTimeline
            tasks={tasks as any}
            onTaskUpdate={handleTaskUpdate}
            onNoteCreate={handleNoteCreate}
            onNoteUpdate={handleNoteUpdate}
            onNoteDelete={handleNoteDelete}
          />
        );
      case 'kanban':
        return (
          <KanbanBoard
            tasks={tasks as any}
            columns={columns}
            onTaskUpdate={handleTaskUpdate as any}
            onTaskCreate={handleTaskCreate as any}
            onTaskDelete={handleTaskDelete as any}
            onColumnUpdate={handleColumnUpdate as any}
            onColumnCreate={handleColumnCreate as any}
            onColumnDelete={handleColumnDelete as any}
          />
        );
      case 'taskcalendar':
        return renderTaskCalendar();
      case 'taskanalytics':
        return renderTaskAnalytics();
      case 'templates':
        return renderTemplates();
      default:
        return renderTaskBoard();
    }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-border">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('tasks.title')}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('tasks.subtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateTask(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tasks.newTask')}
              </button>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div>
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeView === view.id
                    ? 'border-accent text-accent-dark'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  title={view.description}
                >
                  <Icon className="w-4 h-4" />
                  {view.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-all duration-300"
        style={{
          paddingLeft: dockPosition === 'left' ? '100px' : undefined,
          paddingRight: dockPosition === 'right' ? '100px' : undefined
        }}
      >
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-accent mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && renderCreateTaskModal()}

      {/* Edit Task Modal */}
      {showEditTask && selectedTask && renderEditTaskModal()}

      {/* Task Modal */}
      {showTaskModal && renderTaskModal()}

      {/* Time Tracking Modal */}
      {renderTimeTrackingModal()}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setShowToast(false)}
            className="ml-2 text-white hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
