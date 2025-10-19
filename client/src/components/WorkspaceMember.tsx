import React, { useState } from 'react';
import { 
  BarChart3, 
  User, 
  MessageSquare, 
  Bot, 
  Calendar, 
  CheckSquare,
  Building2,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  ArrowRight,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Project {
  _id: string;
  name: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  dueDate: Date;
  assignedTasks: number;
  completedTasks: number;
  description: string;
  teamLead: string;
}

interface Task {
  _id: string;
  title: string;
  project: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: Date;
  description: string;
  assignedBy: string;
  createdAt: Date;
  estimatedHours: number;
  actualHours?: number;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'task' | 'project' | 'deadline' | 'general';
  isRead: boolean;
  createdAt: Date;
  projectId?: string;
  taskId?: string;
}

const WorkspaceMember: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data - replace with actual API calls
  const projects: Project[] = [
    {
      _id: '1',
      name: 'Website Redesign',
      status: 'active',
      priority: 'high',
      progress: 75,
      dueDate: new Date('2024-12-15'),
      assignedTasks: 8,
      completedTasks: 6,
      description: 'Complete redesign of the company website with modern UI/UX',
      teamLead: 'Mike Chen'
    },
    {
      _id: '2',
      name: 'Mobile App Development',
      status: 'planning',
      priority: 'medium',
      progress: 25,
      dueDate: new Date('2025-02-28'),
      assignedTasks: 12,
      completedTasks: 3,
      description: 'Develop a cross-platform mobile application',
      teamLead: 'Emily Davis'
    }
  ];

  const tasks: Task[] = [
    {
      _id: '1',
      title: 'Design Homepage Layout',
      project: 'Website Redesign',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date('2024-12-20'),
      description: 'Create wireframes and mockups for the new homepage',
      assignedBy: 'Mike Chen',
      createdAt: new Date('2024-11-15'),
      estimatedHours: 8,
      actualHours: 5
    },
    {
      _id: '2',
      title: 'Implement User Authentication',
      project: 'Mobile App Development',
      status: 'pending',
      priority: 'critical',
      dueDate: new Date('2024-12-25'),
      description: 'Set up secure user authentication system',
      assignedBy: 'Emily Davis',
      createdAt: new Date('2024-11-20'),
      estimatedHours: 12
    },
    {
      _id: '3',
      title: 'Write API Documentation',
      project: 'Website Redesign',
      status: 'completed',
      priority: 'medium',
      dueDate: new Date('2024-12-10'),
      description: 'Document all API endpoints and usage',
      assignedBy: 'Mike Chen',
      createdAt: new Date('2024-11-10'),
      estimatedHours: 6,
      actualHours: 6
    }
  ];

  const notifications: Notification[] = [
    {
      _id: '1',
      title: 'New Task Assigned',
      message: 'You have been assigned a new task: "Design Homepage Layout"',
      type: 'task',
      isRead: false,
      createdAt: new Date('2024-12-19'),
      taskId: '1'
    },
    {
      _id: '2',
      title: 'Project Update',
      message: 'Project "Website Redesign" progress updated to 75%',
      type: 'project',
      isRead: false,
      createdAt: new Date('2024-12-18'),
      projectId: '1'
    },
    {
      _id: '3',
      title: 'Deadline Reminder',
      message: 'Task "Implement User Authentication" is due in 3 days',
      type: 'deadline',
      isRead: true,
      createdAt: new Date('2024-12-17'),
      taskId: '2'
    }
  ];

  const unreadNotifications = notifications.filter(n => !n.isRead);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'on-hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Projects</p>
              <p className="text-2xl font-semibold text-gray-900">{projects.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>2 active projects</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{tasks.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckSquare className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            <CheckSquare className="w-4 h-4 mr-1" />
            <span>{tasks.filter(t => t.status === 'completed').length} completed</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Notifications</p>
              <p className="text-2xl font-semibold text-gray-900">{unreadNotifications.length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-yellow-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span>{unreadNotifications.length} unread</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hours This Week</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+5h from last week</span>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm">View All</button>
        </div>
        <div className="space-y-4">
          {notifications.slice(0, 3).map((notification) => (
            <div key={notification._id} className={`flex items-start gap-3 p-3 rounded-lg ${!notification.isRead ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <div className={`w-2 h-2 rounded-full mt-2 ${!notification.isRead ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notification.createdAt.toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
        <div className="space-y-4">
          {tasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) > new Date()).slice(0, 3).map((task) => (
            <div key={task._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{task.title}</p>
                <p className="text-xs text-gray-600">{task.project}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className="text-xs text-gray-500">
                  Due {task.dueDate.toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              defaultValue="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue="john.doe@workspace.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              defaultValue="+1-555-0123"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
            <input
              type="text"
              defaultValue="Jane Doe - +1-555-0456"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <input
              type="text"
              defaultValue="Engineering"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <input
              type="text"
              defaultValue="Frontend Developer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            rows={4}
            defaultValue="Experienced frontend developer with expertise in React, TypeScript, and modern web technologies."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderInbox = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Team Inbox</h3>
          <p className="text-sm text-gray-600">Chat with your team members</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Recent Conversations</h4>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Website Redesign Team</p>
                    <p className="text-xs text-gray-500">Mike Chen: "Great work on the homepage!"</p>
                  </div>
                  <span className="text-xs text-gray-400">2m</span>
                </div>
              </div>
              <div className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Emily Davis</p>
                    <p className="text-xs text-gray-500">"Can we discuss the API integration?"</p>
                  </div>
                  <span className="text-xs text-gray-400">1h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg h-96 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Website Redesign Team</p>
                  <p className="text-xs text-gray-500">4 members</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex justify-start">
                  <div className="max-w-xs bg-gray-100 rounded-lg p-3">
                    <p className="text-sm text-gray-900">Hey team! How's the homepage design coming along?</p>
                    <p className="text-xs text-gray-500 mt-1">Mike Chen • 2 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <div className="max-w-xs bg-blue-600 text-white rounded-lg p-3">
                    <p className="text-sm">Great work on the homepage!</p>
                    <p className="text-xs text-blue-200 mt-1">You • 1 minute ago</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChatbot = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-sm text-gray-600">Get help with your tasks and deadlines</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Pending Tasks</h4>
              <p className="text-sm text-gray-600">You have {tasks.filter(t => t.status === 'pending').length} pending tasks</p>
              <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm">View Details →</button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Upcoming Deadlines</h4>
              <p className="text-sm text-gray-600">2 tasks due this week</p>
              <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm">View Details →</button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Project Progress</h4>
              <p className="text-sm text-gray-600">Average progress: 50%</p>
              <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm">View Details →</button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Time Tracking</h4>
              <p className="text-sm text-gray-600">26 hours logged this week</p>
              <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm">View Details →</button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors">
              Update Task Status
            </button>
            <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors">
              Log Time
            </button>
            <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors">
              Request Extension
            </button>
            <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm hover:bg-yellow-200 transition-colors">
              Ask Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonalPlanner = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Personal Planner</h3>
          <p className="text-sm text-gray-600">Manage your personal tasks and reminders</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* To-Do List */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Today's Tasks</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-900">Review code changes</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-900">Update project documentation</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
              <span className="text-sm text-gray-500 line-through">Attend team meeting</span>
            </div>
          </div>
        </div>

        {/* Reminders */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Reminders</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Project deadline approaching</p>
                <p className="text-xs text-gray-600">Website Redesign - 3 days left</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Team standup meeting</p>
                <p className="text-xs text-gray-600">Tomorrow at 9:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">My Projects</h3>
          <p className="text-sm text-gray-600">View and manage your assigned projects</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Projects</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="planning">Planning</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckSquare className="w-4 h-4" />
                  <span>{project.completedTasks}/{project.assignedTasks} tasks</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Due {project.dueDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Lead: {project.teamLead}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Bell className="w-4 h-4" />
                  <span>2 notifications</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
                Enter Project
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'inbox', label: 'Inbox', icon: MessageSquare },
    { id: 'chatbot', label: 'Chatbot', icon: Bot },
    { id: 'planner', label: 'Personal Planner', icon: Calendar },
    { id: 'projects', label: 'Projects', icon: Building2 }
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white border border-border rounded-xl">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Employee Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back! Here's what's happening with your projects.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <LogOut className="w-4 h-4" />
                Back to Workspace
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'inbox' && renderInbox()}
          {activeTab === 'chatbot' && renderChatbot()}
          {activeTab === 'planner' && renderPersonalPlanner()}
          {activeTab === 'projects' && renderProjects()}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceMember;
