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
import TaskTimeline from './TaskTimeline';
import TimelineView from './TimelineView';
import KanbanBoard from './KanbanBoard';

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
  const [showTimeTracking, setShowTimeTracking] = useState(false);
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Initialize tasks state with mock data
  useEffect(() => {
    setTasks(mockTasks);
    setColumns(mockColumns);
  }, []);

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
      name: columnData.name || 'New Column',
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

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks((prevTasks: Task[]) => 
      prevTasks.map((task: Task) => 
        task._id === taskId 
          ? { ...task, ...updates }
          : task
      )
    );
  };

  const handleTaskCreate = (taskData: Partial<Task>) => {
    const newTask: Task = {
      _id: `task_${Date.now()}`,
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      assignee: taskData.assignee || { _id: 'unassigned', name: 'Unassigned', email: '', avatarUrl: '' },
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
      project: taskData.project || { _id: '1', name: 'Default Project', color: '#3B82F6' },
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
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low': return <Circle className="w-3 h-3" />;
      case 'medium': return <Square className="w-3 h-3" />;
      case 'high': return <Triangle className="w-3 h-3" />;
      case 'critical': return <AlertCircle className="w-3 h-3" />;
      default: return <Circle className="w-3 h-3" />;
    }
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
            ? { ...task, status: status as 'pending' | 'in-progress' | 'completed' | 'blocked', updatedAt: new Date() }
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
        <h2 className="text-xl font-semibold text-gray-900">Task Board</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>{project.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateTask(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['pending', 'in-progress', 'completed', 'blocked'].map(status => (
          <div
            key={status}
            className={`bg-gray-50 rounded-lg p-4 min-h-[500px] transition-all duration-200 ${
              draggedOverColumn === status 
                ? 'ring-2 ring-blue-500 bg-blue-50 border-2 border-blue-300' 
                : 'border border-gray-200'
            }`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 capitalize">
                {status.replace('-', ' ')}
              </h3>
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                {tasks.filter((t: Task) => t.status === status).length}
              </span>
            </div>
            
            <div className="space-y-3">
              {draggedOverColumn === status && draggedTask && draggedTask.status !== status && (
                <div className="bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg p-4 text-center text-blue-600 text-sm font-medium">
                  Drop "{draggedTask.title}" here
                </div>
              )}
              {tasks
                .filter((task: Task) => task.status === status)
                .map((task: Task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      setSelectedTask(task);
                      setShowTaskModal(true);
                    }}
                    className="bg-white p-4 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300 hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(task.priority)}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: task.project.color }}
                      />
                      <span className="text-xs text-gray-600">{task.project.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={task.assignee.avatarUrl || `https://ui-avatars.com/api/?name=${task.assignee.name}&background=random`}
                          alt={task.assignee.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-xs text-gray-600">{task.assignee.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}
                      </span>
                    </div>
                    
                    {task.milestones.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Milestones</span>
                          <span>
                            {task.milestones.filter((m: Milestone) => m.status === 'completed').length}/
                            {task.milestones.length}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full"
                            style={{
                              width: `${(task.milestones.length > 0 ? (task.milestones.filter((m: Milestone) => m.status === 'completed').length / task.milestones.length) * 100 : 0)}%`
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{task.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              {tasks.filter((task: Task) => task.status === status).length === 0 && !draggedOverColumn && (
                <div className="text-center text-gray-400 text-sm py-8">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p>No {status.replace('-', ' ')} tasks</p>
                  <p className="text-xs">Drag tasks here or create new ones</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTaskList = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Task List</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Assignees</option>
            {teamMembers.map(member => (
              <option key={member._id} value={member._id}>{member.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task: Task) => (
                <tr key={task._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <CheckSquare className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        <div className="text-sm text-gray-500">{task.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: task.project.color }}
                      />
                      <span className="text-sm text-gray-900">{task.project.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={task.assignee.avatarUrl || `https://ui-avatars.com/api/?name=${task.assignee.name}&background=random`}
                        alt={task.assignee.name}
                        className="h-8 w-8 rounded-full mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.assignee.name}</div>
                        <div className="text-sm text-gray-500">{task.assignee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(task.milestones.filter((m: Milestone) => m.status === 'completed').length / task.milestones.length) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {task.milestones.length > 0 
                          ? `${Math.round((task.milestones.filter((m: Milestone) => m.status === 'completed').length / task.milestones.length) * 100)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startTimeTracking(task._id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Timer className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTaskCalendar = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Task Calendar</h2>
        <div className="flex items-center gap-3">
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-lg font-medium text-gray-900">March 2024</span>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-gray-200">
            {Array.from({ length: 35 }, (_, i) => {
            const date = new Date(2024, 2, i - 6); // March 2024
            const dayTasks = tasks.filter(task => 
              (task.dueDate ? new Date(task.dueDate).toDateString() : '') === date.toDateString()
            );
            
            return (
              <div key={i} className="bg-white min-h-[100px] p-2">
                <div className="text-sm text-gray-900 mb-1">{date.getDate()}</div>
                <div className="space-y-1">
                  {dayTasks.map(task => (
                    <div
                      key={task._id}
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskModal(true);
                      }}
                      className="p-1 rounded text-xs cursor-pointer hover:bg-gray-100"
                      style={{ backgroundColor: task.project.color + '20' }}
                    >
                      <div className="font-medium truncate">{task.title}</div>
                      <div className="text-gray-600">{task.assignee.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderTaskAnalytics = () => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{tasks.length}</p>
            </div>
            <CheckSquare className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tasks.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tasks.filter(t => (t.dueDate ? new Date(t.dueDate) : new Date(8640000000000000)) < new Date() && t.status !== 'completed').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h3>
          <div className="space-y-3">
            {['pending', 'in-progress', 'completed', 'blocked'].map(status => {
              const count = tasks.filter(t => t.status === status).length;
              const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'pending' ? 'bg-gray-400' :
                      status === 'in-progress' ? 'bg-blue-400' :
                      status === 'completed' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === 'pending' ? 'bg-gray-400' :
                          status === 'in-progress' ? 'bg-blue-400' :
                          status === 'completed' ? 'bg-green-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Project</h3>
          <div className="space-y-3">
            {projects.map(project => {
              const count = tasks.filter(t => t.projectId === project._id).length;
              const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
              
              return (
                <div key={project._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="text-sm font-medium text-gray-900">{project.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: project.color
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Task Templates</h2>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Bug Report', description: 'Template for reporting and tracking bugs', category: 'Development' },
          { name: 'Feature Request', description: 'Template for requesting new features', category: 'Product' },
          { name: 'Code Review', description: 'Template for code review tasks', category: 'Development' },
          { name: 'Design Review', description: 'Template for design review tasks', category: 'Design' },
          { name: 'Testing Task', description: 'Template for testing tasks', category: 'QA' },
          { name: 'Documentation', description: 'Template for documentation tasks', category: 'General' }
        ].map((template, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{template.name}</h3>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {template.category}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{template.description}</p>
            <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Use Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTaskModal = () => {
    if (!selectedTask) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedTask.project.color }}
              />
              <h2 className="text-xl font-semibold text-gray-900">{selectedTask.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => startTimeTracking(selectedTask._id)}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Timer className="w-4 h-4" />
              </button>
              <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedTask.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Milestones</h3>
                  <div className="space-y-2">
                    {selectedTask.milestones.map(milestone => (
                      <div key={milestone._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={milestone.status === 'completed'}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                          <p className="text-xs text-gray-600">{milestone.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(milestone.status)}`}>
                          {milestone.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Subtasks</h3>
                  <div className="space-y-2">
                    {selectedTask.subtasks.map(subtask => (
                      <div key={subtask._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={subtask.status === 'completed'}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{subtask.title}</p>
                          <p className="text-xs text-gray-600">{subtask.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(subtask.status)}`}>
                          {subtask.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {selectedTask.attachments.map(attachment => (
                      <div key={attachment._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {attachment.type === 'file' ? (
                          <FileText className="w-5 h-5 text-gray-500" />
                        ) : (
                          <Link className="w-5 h-5 text-gray-500" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                          <p className="text-xs text-gray-600">
                            {attachment.type === 'file' && attachment.size 
                              ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB`
                              : 'Link'
                            }
                          </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Comments</h3>
                  <div className="space-y-3">
                    {selectedTask.comments.map(comment => (
                      <div key={comment._id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={comment.author.avatarUrl || `https://ui-avatars.com/api/?name=${comment.author.name}&background=random`}
                          alt={comment.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{comment.author.name}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <textarea
                      placeholder="Add a comment..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                    <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Add Comment
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Task Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedTask.status)}`}>
                        {selectedTask.status.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-700">Priority:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedTask.priority)}`}>
                        {selectedTask.priority}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-700">Assignee:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <img
                          src={selectedTask.assignee.avatarUrl || `https://ui-avatars.com/api/?name=${selectedTask.assignee.name}&background=random`}
                          alt={selectedTask.assignee.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-gray-600">{selectedTask.assignee.name}</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-700">Due Date:</span>
                      <span className="ml-2 text-sm text-gray-600">
                        {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : ''}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-700">Time Tracking:</span>
                      <div className="mt-1 text-sm text-gray-600">
                        <div>Estimated: {selectedTask.estimatedHours}h</div>
                        <div>Actual: {selectedTask.actualHours}h</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Edit Task
                    </button>
                    <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Duplicate Task
                    </button>
                    <button className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                      Delete Task
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTimeTrackingModal = () => {
    if (!showTimeTracking) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Time Tracking</h3>
            <button
              onClick={() => setShowTimeTracking(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {currentTimeEntry ? '00:00:00' : '00:00:00'}
              </div>
              <p className="text-sm text-gray-600">Time spent on task</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                placeholder="What did you work on?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={stopTimeTracking}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Stop Timer
              </button>
              <button
                onClick={() => setShowTimeTracking(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const views = [
    { id: 'taskboard', label: 'TaskBoard', icon: LayoutGrid, description: 'Interactive Kanban-style task management' },
    { id: 'tasklist', label: 'TaskList', icon: List, description: 'Detailed list view with advanced filtering' },
    { id: 'timeline', label: 'Timeline', icon: CalendarIcon, description: 'Gantt-style timeline with horizontal bars and swimlanes' },
    { id: 'tasktimeline', label: 'TaskTimeline', icon: Clock, description: 'Real-time timeline with active/completed tasks and AI notes' },
    { id: 'taskcalendar', label: 'TaskCalendar', icon: CalendarIcon, description: 'Calendar view for scheduling and deadlines' },
    { id: 'taskanalytics', label: 'TaskAnalytics', icon: BarChart3, description: 'Analytics and performance insights' },
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid, description: 'Asana-style Kanban board with advanced features' },
    { id: 'templates', label: 'Templates', icon: FileText, description: 'Pre-built task templates' }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'taskboard':
        return renderTaskBoard();
      case 'tasklist':
        return renderTaskList();
      case 'timeline':
        return (
          <TimelineView
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
    <div className="p-4 sm:p-6">
      <div className="bg-white border border-border rounded-xl">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Task Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage all your tasks across projects and workspaces.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Plus className="w-4 h-4" />
                New Task
              </button>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeView === view.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

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