import React, { useState } from 'react';
import { 
  Users, 
  Building2, 
  BarChart3, 
  UserPlus, 
  Settings, 
  Share2, 
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  Bot,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import CreateAIProjectModal from './CreateAIProjectModal';
import ClientModal from './ClientModal';
import InviteEmployeeModal from './InviteEmployeeModal';
import WorkspaceJoinRequests from './WorkspaceJoinRequests';

interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  projects: number;
  totalValue: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

interface Employee {
  _id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  status: 'active' | 'pending' | 'suspended';
  joinedAt: Date;
  lastActive: Date;
  projects: number;
  avatarUrl?: string;
}

interface Project {
  _id: string;
  name: string;
  client: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  dueDate: Date;
  teamSize: number;
  budget: number;
  createdAt: Date;
}

const WorkspaceOwner: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAICreateProject, setShowAICreateProject] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [clientToFreeze, setClientToFreeze] = useState<Client | null>(null);
  const [freezeConfirmText, setFreezeConfirmText] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Mock data - replace with actual API calls
  const clients: Client[] = [
    {
      _id: '1',
      name: 'John Smith',
      email: 'john@techcorp.com',
      phone: '+1-555-0123',
      company: 'TechCorp Solutions',
      address: '123 Tech Street, San Francisco, CA',
      projects: 3,
      totalValue: 45000,
      status: 'active',
      createdAt: new Date('2024-01-15')
    },
    {
      _id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@designstudio.com',
      phone: '+1-555-0456',
      company: 'Design Studio Pro',
      address: '456 Design Ave, New York, NY',
      projects: 2,
      totalValue: 28000,
      status: 'active',
      createdAt: new Date('2024-02-20')
    }
  ];

  const employees: Employee[] = [
    {
      _id: '1',
      fullName: 'Mike Chen',
      email: 'mike@workspace.com',
      role: 'manager',
      status: 'active',
      joinedAt: new Date('2024-01-10'),
      lastActive: new Date(),
      projects: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
    },
    {
      _id: '2',
      fullName: 'Emily Davis',
      email: 'emily@workspace.com',
      role: 'member',
      status: 'active',
      joinedAt: new Date('2024-02-15'),
      lastActive: new Date(),
      projects: 3,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
    },
    {
      _id: '3',
      fullName: 'Alex Rodriguez',
      email: 'alex@workspace.com',
      role: 'member',
      status: 'pending',
      joinedAt: new Date('2024-03-01'),
      lastActive: new Date(),
      projects: 0
    }
  ];

  const projects: Project[] = [
    {
      _id: '1',
      name: 'Website Redesign',
      client: 'TechCorp Solutions',
      status: 'active',
      priority: 'high',
      progress: 75,
      dueDate: new Date('2024-12-15'),
      teamSize: 4,
      budget: 25000,
      createdAt: new Date('2024-10-01')
    },
    {
      _id: '2',
      name: 'Mobile App Development',
      client: 'Design Studio Pro',
      status: 'planning',
      priority: 'medium',
      progress: 25,
      dueDate: new Date('2025-02-28'),
      teamSize: 6,
      budget: 45000,
      createdAt: new Date('2024-11-01')
    }
  ];

  const pendingRequests = employees.filter(emp => emp.status === 'pending');

  const handleAcceptRequest = (employeeId: string) => {
    // TODO: Implement API call to accept request
    console.log('Accepting request for:', employeeId);
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        message: 'Employee request accepted!',
        duration: 3000
      }
    });
  };

  const handleRejectRequest = (employeeId: string) => {
    // TODO: Implement API call to reject request
    console.log('Rejecting request for:', employeeId);
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        message: 'Employee request rejected.',
        duration: 3000
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    dispatch({ type: 'TOGGLE_MODAL', payload: 'client' });
  };

  const handleFreezeClient = (client: Client) => {
    setClientToFreeze(client);
    setFreezeConfirmText('');
    setShowFreezeModal(true);
  };

  const handleConfirmFreeze = async () => {
    if (freezeConfirmText.toUpperCase() !== 'FREEZE') {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Please type FREEZE to confirm',
          duration: 3000,
        },
      });
      return;
    }

    if (!clientToFreeze) return;

    try {
      const newStatus = clientToFreeze.status === 'active' ? 'inactive' : 'active';
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: newStatus === 'inactive' ? 'Client frozen successfully' : 'Client unfrozen successfully',
          duration: 3000,
        },
      });
      
      setShowFreezeModal(false);
      setClientToFreeze(null);
      setFreezeConfirmText('');
    } catch (error: any) {
      console.error('Failed to update client status', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: error?.message || 'Failed to update client status',
          duration: 3000,
        },
      });
    }
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setDeleteConfirmText('');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmText.toUpperCase() !== 'DELETE') {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Please type DELETE to confirm',
          duration: 3000,
        },
      });
      return;
    }

    if (!projectToDelete) return;

    try {
      // Call API to delete project
      const response = await fetch(`/api/projects/${projectToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete project');
      }
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Project deleted successfully',
          duration: 3000,
        },
      });
      
      setShowDeleteModal(false);
      setProjectToDelete(null);
      setDeleteConfirmText('');
      
      // Refresh the page to update projects list
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to delete project', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: error?.message || 'Failed to delete project',
          duration: 3000,
        },
      });
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-semibold text-gray-900">{projects.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-accent-dark" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12% from last month</span>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-semibold text-gray-900">{clients.filter(c => c.status === 'active').length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+8% from last month</span>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-semibold text-gray-900">{employees.filter(e => e.status === 'active').length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-yellow-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>{pendingRequests.length} pending requests</span>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+15% from last month</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Plus className="w-4 h-4 text-accent-dark" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">New project "Mobile App Development" created</p>
              <p className="text-xs text-gray-600">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Alex Rodriguez joined the workspace</p>
              <p className="text-xs text-gray-600">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Project "Website Redesign" updated</p>
              <p className="text-xs text-gray-600">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Clients</h3>
          <p className="text-sm text-gray-600">Manage your client relationships</p>
        </div>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'client' })}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Client
                </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client._id} className={`bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow ${client.status === 'inactive' ? 'grayscale opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">{client.name}</h4>
                <p className="text-sm text-gray-600">{client.company}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                  {client.status}
                </span>
                <button className="text-gray-600 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{client.address}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">{client.projects} projects</span>
                <span className="text-gray-600">${client.totalValue.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-accent-dark hover:text-blue-700">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEmployees = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <p className="text-sm text-gray-600">Manage your team and permissions</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'inviteEmployee' })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite Employee
        </button>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-3">Pending Join Requests</h4>
          <div className="space-y-3">
            {pendingRequests.map((employee) => (
              <div key={employee._id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={employee.avatarUrl || `https://ui-avatars.com/api/?name=${employee.fullName}&background=random`}
                    alt={employee.fullName}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{employee.fullName}</p>
                    <p className="text-xs text-gray-600">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAcceptRequest(employee._id)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectRequest(employee._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Employees */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.filter(e => e.status === 'active').map((employee) => (
          <div key={employee._id} className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={employee.avatarUrl || `https://ui-avatars.com/api/?name=${employee.fullName}&background=random`}
                  alt={employee.fullName}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{employee.fullName}</h4>
                  <p className="text-sm text-gray-600">{employee.email}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                {employee.role}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Joined {employee.joinedAt.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
                <span>{employee.projects} projects</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Last active {employee.lastActive.toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button className="text-accent-dark hover:text-blue-700 text-sm">
                View Profile
              </button>
              <div className="flex items-center gap-2">
                <button className="text-gray-600 hover:text-gray-600">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
          <p className="text-sm text-gray-600">Manage your projects and track progress</p>
        </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'createProject' })}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Custom Project
                  </button>
                  <button
                    onClick={() => setShowAICreateProject(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors"
                  >
                    <Bot className="w-4 h-4" />
                    AI-Powered Project
                  </button>
                </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project._id} className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
                <p className="text-sm text-gray-600">{project.client}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{project.teamSize} members</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>${project.budget.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Due {project.dueDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>Created {project.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button className="text-accent-dark hover:text-blue-700 text-sm">
                View Project
              </button>
              <div className="flex items-center gap-2">
                <button className="text-gray-600 hover:text-gray-600">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-gray-600 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics & Reports</h3>
        <p className="text-sm text-gray-600 mb-6">View detailed analytics and generate reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Performance</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed Projects</span>
              <span className="font-semibold">{projects.filter(p => p.status === 'completed').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Projects</span>
              <span className="font-semibold">{projects.filter(p => p.status === 'active').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Progress</span>
              <span className="font-semibold">{Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Team Productivity</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Members</span>
              <span className="font-semibold">{employees.filter(e => e.status === 'active').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Projects</span>
              <span className="font-semibold">{projects.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Projects per Member</span>
              <span className="font-semibold">{Math.round(projects.length / employees.filter(e => e.status === 'active').length)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Export Reports</h4>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">Generate comprehensive reports for clients and stakeholders</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="w-8 h-8 text-accent-dark mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Project Report</p>
            <p className="text-xs text-gray-600">Detailed project progress</p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Analytics Report</p>
            <p className="text-xs text-gray-600">Performance metrics</p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Financial Report</p>
            <p className="text-xs text-gray-600">Revenue and costs</p>
          </button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'join-requests', label: 'Join Requests', icon: UserCheck },
    { id: 'clients', label: 'Manage Clients', icon: Users },
    { id: 'employees', label: 'Manage Employees', icon: UserPlus },
    { id: 'projects', label: 'Manage Projects', icon: Building2 },
    { id: 'stats', label: 'Stats & Reports', icon: BarChart3 }
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white border border-border rounded-xl">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Workspace Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your workspace, team, and projects
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-accent text-accent-dark'
                      : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
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
          {activeTab === 'join-requests' && state.currentWorkspace && (
            <>
              {console.log('🔍 [WORKSPACE OWNER] Rendering Join Requests tab for workspace:', state.currentWorkspace)}
              <WorkspaceJoinRequests workspaceId={state.currentWorkspace} />
            </>
          )}
          {activeTab === 'clients' && renderClients()}
          {activeTab === 'employees' && renderEmployees()}
          {activeTab === 'projects' && renderProjects()}
          {activeTab === 'stats' && renderStats()}
        </div>
      </div>

      {/* Modals */}
      <CreateAIProjectModal 
        isOpen={showAICreateProject}
        onClose={() => setShowAICreateProject(false)}
        workspaceId={state.currentWorkspace}
      />
      <ClientModal />
      <InviteEmployeeModal />
    </div>
  );
};

export default WorkspaceOwner;
