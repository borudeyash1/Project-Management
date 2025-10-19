import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  List, 
  LayoutGrid, 
  Users, 
  MessageSquare, 
  Settings, 
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Download,
  Upload,
  Link,
  Tag,
  Flag,
  User,
  Clock3,
  Target,
  Zap,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Star,
  Heart,
  Bookmark,
  Share2,
  Copy,
  Move,
  Archive,
  Play,
  Pause,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Layers,
  Activity,
  PieChart,
  BarChart,
  LineChart,
  TrendingDown,
  Minus,
  Maximize,
  Minimize,
  RotateCcw,
  Save,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: {
    _id: string;
    name: string;
    avatar: string;
  };
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  estimatedHours: number;
  actualHours: number;
  subtasks: Subtask[];
  attachments: Attachment[];
  comments: Comment[];
  isArchived: boolean;
  isStarred: boolean;
  color: string;
  progress: number;
}

interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

interface Attachment {
  _id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'link';
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

interface Comment {
  _id: string;
  text: string;
  author: {
    _id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  replies: Comment[];
}

interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  progress: number;
  team: TeamMember[];
  tasks: Task[];
  milestones: Milestone[];
  budget: number;
  spent: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  isActive: boolean;
  joinedAt: Date;
}

interface Milestone {
  _id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  tasks: string[];
}

const ProjectView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeView, setActiveView] = useState('flowboard');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);

  // Mock data - replace with actual API calls
  const project: Project = {
    _id: '1',
    name: 'Website Redesign Project',
    description: 'Complete redesign of the company website with modern UI/UX and improved performance',
    status: 'active',
    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-12-31'),
    progress: 65,
    budget: 50000,
    spent: 32000,
    createdAt: new Date('2024-09-15'),
    updatedAt: new Date(),
    team: [
      {
        _id: '1',
        name: 'Mike Chen',
        role: 'Project Manager',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
        email: 'mike@company.com',
        isActive: true,
        joinedAt: new Date('2024-09-01')
      },
      {
        _id: '2',
        name: 'Sarah Johnson',
        role: 'UI/UX Designer',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
        email: 'sarah@company.com',
        isActive: true,
        joinedAt: new Date('2024-09-05')
      },
      {
        _id: '3',
        name: 'Alex Rodriguez',
        role: 'Frontend Developer',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        email: 'alex@company.com',
        isActive: true,
        joinedAt: new Date('2024-09-10')
      }
    ],
    tasks: [
      {
        _id: '1',
        title: 'Design Homepage Layout',
        description: 'Create wireframes and mockups for the new homepage design',
        status: 'in-progress',
        priority: 'high',
        assignee: {
          _id: '2',
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
        },
        dueDate: new Date('2024-12-20'),
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-12-15'),
        tags: ['design', 'homepage', 'ui'],
        estimatedHours: 16,
        actualHours: 12,
        subtasks: [
          { _id: '1', title: 'Create wireframes', completed: true, createdAt: new Date('2024-11-01') },
          { _id: '2', title: 'Design mockups', completed: false, createdAt: new Date('2024-11-02') }
        ],
        attachments: [],
        comments: [],
        isArchived: false,
        isStarred: true,
        color: '#3B82F6',
        progress: 75
      },
      {
        _id: '2',
        title: 'Implement User Authentication',
        description: 'Set up secure user authentication system with JWT tokens',
        status: 'todo',
        priority: 'critical',
        assignee: {
          _id: '3',
          name: 'Alex Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        },
        dueDate: new Date('2024-12-25'),
        createdAt: new Date('2024-11-05'),
        updatedAt: new Date('2024-11-05'),
        tags: ['backend', 'security', 'auth'],
        estimatedHours: 24,
        actualHours: 0,
        subtasks: [],
        attachments: [],
        comments: [],
        isArchived: false,
        isStarred: false,
        color: '#EF4444',
        progress: 0
      },
      {
        _id: '3',
        title: 'Write API Documentation',
        description: 'Document all API endpoints and usage examples',
        status: 'done',
        priority: 'medium',
        assignee: {
          _id: '1',
          name: 'Mike Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
        },
        dueDate: new Date('2024-12-10'),
        createdAt: new Date('2024-10-15'),
        updatedAt: new Date('2024-12-10'),
        tags: ['documentation', 'api'],
        estimatedHours: 8,
        actualHours: 8,
        subtasks: [
          { _id: '1', title: 'Document endpoints', completed: true, createdAt: new Date('2024-10-15') },
          { _id: '2', title: 'Add examples', completed: true, createdAt: new Date('2024-10-16') }
        ],
        attachments: [],
        comments: [],
        isArchived: false,
        isStarred: false,
        color: '#10B981',
        progress: 100
      }
    ],
    milestones: [
      {
        _id: '1',
        title: 'Design Phase Complete',
        description: 'All design mockups and wireframes completed',
        dueDate: new Date('2024-12-20'),
        completed: false,
        tasks: ['1']
      },
      {
        _id: '2',
        title: 'Development Phase Complete',
        description: 'All core functionality implemented',
        dueDate: new Date('2024-12-30'),
        completed: false,
        tasks: ['2']
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'backlog': return 'bg-gray-100 text-gray-800';
      case 'todo': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low': return <Circle className="w-3 h-3" />;
      case 'medium': return <Triangle className="w-3 h-3" />;
      case 'high': return <Square className="w-3 h-3" />;
      case 'critical': return <Flag className="w-3 h-3" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverColumn(status);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      // Update task status
      console.log(`Moving task ${draggedTask.title} from ${draggedTask.status} to ${newStatus}`);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: `Task moved to ${newStatus}`,
          duration: 3000
        }
      });
    }
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const renderFlowBoard = () => {
    const columns = [
      { id: 'backlog', title: 'Backlog', color: 'bg-gray-50' },
      { id: 'todo', title: 'To Do', color: 'bg-blue-50' },
      { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-50' },
      { id: 'review', title: 'Review', color: 'bg-purple-50' },
      { id: 'done', title: 'Done', color: 'bg-green-50' }
    ];

    return (
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnTasks = project.tasks.filter(task => task.status === column.id);
          return (
            <div
              key={column.id}
              className={`flex-shrink-0 w-80 ${column.color} rounded-lg p-4 ${
                draggedOverColumn === column.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-move border-l-4"
                    style={{ borderLeftColor: task.color }}
                    onClick={() => {
                      setSelectedTask(task);
                      setShowTaskModal(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                      <div className="flex items-center gap-1">
                        {task.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                        {getPriorityIcon(task.priority)}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={task.assignee.avatar}
                          alt={task.assignee.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-xs text-gray-600">{task.assignee.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{task.estimatedHours}h</span>
                      <span>{task.dueDate.toLocaleDateString()}</span>
                    </div>
                    
                    {task.progress > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{task.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                <button
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => {
                    // Create new task
                    console.log('Create new task');
                  }}
                >
                  <Plus className="w-4 h-4 mx-auto mb-1" />
                  Add Task
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTimeGrid = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayTasks = project.tasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                return taskDate.getDate() === day && 
                       taskDate.getMonth() === currentMonth && 
                       taskDate.getFullYear() === currentYear;
              });
              
              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 border border-gray-200 ${
                    day === today.getDate() ? 'bg-blue-50' : 'bg-white'
                  } hover:bg-gray-50 transition-colors`}
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
                      <div className="space-y-1">
                        {dayTasks.slice(0, 2).map((task) => (
                          <div
                            key={task._id}
                            className="text-xs p-1 rounded truncate cursor-pointer hover:bg-white hover:shadow-sm transition-all"
                            style={{ backgroundColor: task.color + '20', color: task.color }}
                            onClick={() => {
                              setSelectedTask(task);
                              setShowTaskModal(true);
                            }}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderProjectPath = () => {
    const milestones = project.milestones;
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h3>
          
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
            
            {milestones.map((milestone, index) => (
              <div key={milestone._id} className="relative flex items-start mb-8">
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                  milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {milestone.completed ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Circle className="w-5 h-5 text-white" />
                  )}
                </div>
                
                <div className="ml-6 flex-1">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        milestone.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {milestone.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Due: {milestone.dueDate.toLocaleDateString()}</span>
                      <span>{milestone.tasks.length} tasks</span>
                    </div>
                    
                    {milestone.completed && milestone.completedAt && (
                      <div className="mt-2 text-sm text-green-600">
                        Completed: {milestone.completedAt.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-semibold text-gray-900">{project.progress}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{project.tasks.length}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {project.tasks.filter(t => t.status === 'done').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTaskMatrix = () => {
    const filteredTasks = project.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesAssignee = filterAssignee === 'all' || task.assignee._id === filterAssignee;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Task Matrix</h3>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Assignees</option>
              {project.team.map((member) => (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                            style={{ backgroundColor: task.color }}
                          >
                            {task.title.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500">{task.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(task.priority)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={task.assignee.avatar}
                          alt={task.assignee.name}
                          className="h-8 w-8 rounded-full"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{task.assignee.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.dueDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
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
  };

  const renderSmartDashboard = () => {
    const completedTasks = project.tasks.filter(t => t.status === 'done').length;
    const totalTasks = project.tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const tasksByPriority = project.tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-semibold text-gray-900">{totalTasks}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <List className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12% from last month</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{Math.round(completionRate)}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+8% from last month</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-semibold text-gray-900">{project.team.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <Users className="w-4 h-4 mr-1" />
              <span>All active</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Used</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${(project.spent / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-yellow-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{Math.round((project.spent / project.budget) * 100)}% of budget</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Priority</h3>
            <div className="space-y-3">
              {Object.entries(tasksByPriority).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(priority)}
                    <span className="text-sm font-medium text-gray-700 capitalize">{priority}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          priority === 'critical' ? 'bg-red-500' :
                          priority === 'high' ? 'bg-orange-500' :
                          priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(count / totalTasks) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
            <div className="space-y-4">
              {project.team.map((member) => {
                const memberTasks = project.tasks.filter(t => t.assignee._id === member._id);
                const completedTasks = memberTasks.filter(t => t.status === 'done').length;
                const completionRate = memberTasks.length > 0 ? (completedTasks / memberTasks.length) * 100 : 0;

  return (
                  <div key={member._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{Math.round(completionRate)}%</p>
                      <p className="text-xs text-gray-500">{completedTasks}/{memberTasks.length} tasks</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Task "Write API Documentation" completed</p>
                <p className="text-xs text-gray-500">2 hours ago by Mike Chen</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New task "Implement User Authentication" created</p>
                <p className="text-xs text-gray-500">5 hours ago by Mike Chen</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Edit className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Task "Design Homepage Layout" updated</p>
                <p className="text-xs text-gray-500">1 day ago by Sarah Johnson</p>
              </div>
            </div>
        </div>
      </div>
      </div>
    );
  };

  const views = [
    { id: 'flowboard', label: 'FlowBoard', icon: LayoutGrid, description: 'Interactive Kanban-style task management' },
    { id: 'timegrid', label: 'TimeGrid', icon: Calendar, description: 'Calendar view for scheduling and deadlines' },
    { id: 'projectpath', label: 'ProjectPath', icon: Clock, description: 'Timeline and milestone tracking' },
    { id: 'taskmatrix', label: 'TaskMatrix', icon: List, description: 'Detailed list view with advanced filtering' },
    { id: 'smartdashboard', label: 'SmartDashboard', icon: BarChart3, description: 'Analytics and performance insights' }
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white border border-border rounded-xl">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-600 mt-1">{project.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" />
                Settings
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
          {activeView === 'flowboard' && renderFlowBoard()}
          {activeView === 'timegrid' && renderTimeGrid()}
          {activeView === 'projectpath' && renderProjectPath()}
          {activeView === 'taskmatrix' && renderTaskMatrix()}
          {activeView === 'smartdashboard' && renderSmartDashboard()}
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{selectedTask.title}</h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-sm text-gray-900">{selectedTask.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Priority</h3>
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(selectedTask.priority)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Assignee</h3>
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedTask.assignee.avatar}
                      alt={selectedTask.assignee.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-900">{selectedTask.assignee.name}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Due Date</h3>
                  <span className="text-sm text-gray-900">{selectedTask.dueDate.toLocaleDateString()}</span>
                </div>
              </div>
              
              {selectedTask.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${selectedTask.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{selectedTask.progress}% complete</p>
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Edit Task
              </button>
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectView;
