import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, Key, Lock, Unlock, Eye, EyeOff, Edit, Trash2, 
  Plus, Search, Filter, MoreVertical, Crown, Star, Award, 
  UserCheck, UserX, Settings, CheckCircle, XCircle, AlertCircle,
  Building, User, Mail, Phone, Calendar, Clock, Target,
  BarChart3, TrendingUp, Activity, MessageSquare, FileText,
  Download, Upload, Link, Tag, Flag, Zap, Bot, Sparkles,
  Code, Palette, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'workspace-owner' | 'project-manager' | 'developer' | 'designer' | 'tester' | 'analyst' | 'custom';
  designation: string;
  permissions: Permission[];
  joinedAt: Date;
  lastActive: Date;
  isOnline: boolean;
  performance: {
    rating: number;
    tasksCompleted: number;
    onTimeDelivery: number;
    qualityScore: number;
  };
  workspaceId: string;
  projectRoles: ProjectRole[];
}

interface Permission {
  _id: string;
  name: string;
  description: string;
  category: 'project' | 'task' | 'user' | 'workspace' | 'analytics' | 'settings';
  level: 'read' | 'write' | 'admin';
}

interface ProjectRole {
  projectId: string;
  projectName: string;
  role: string;
  permissions: string[];
  assignedAt: Date;
  assignedBy: string;
}

interface CustomRole {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: Date;
  createdBy: string;
  workspaceId: string;
  isDefault: boolean;
}

interface Workspace {
  _id: string;
  name: string;
  description: string;
  owner: string;
  members: string[];
  settings: {
    allowMemberInvites: boolean;
    requireApprovalForJoins: boolean;
    allowCustomRoles: boolean;
    defaultPermissions: string[];
  };
}

const ProjectRolesAndPermissions: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('members');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with actual API calls
  const users: User[] = [
    {
      _id: '1',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      avatarUrl: '',
      role: 'workspace-owner',
      designation: 'Workspace Owner',
      permissions: [
        { _id: 'p1', name: 'Full Access', description: 'Complete access to all features', category: 'workspace', level: 'admin' },
        { _id: 'p2', name: 'Manage Users', description: 'Add, remove, and modify user permissions', category: 'user', level: 'admin' },
        { _id: 'p3', name: 'Manage Projects', description: 'Create, edit, and delete projects', category: 'project', level: 'admin' }
      ],
      joinedAt: new Date('2024-01-01'),
      lastActive: new Date('2024-03-15'),
      isOnline: true,
      performance: { rating: 4.9, tasksCompleted: 8, onTimeDelivery: 100, qualityScore: 4.8 },
      workspaceId: 'ws1',
      projectRoles: [
        { projectId: 'p1', projectName: 'E-commerce Platform', role: 'Project Manager', permissions: ['manage-tasks', 'assign-tasks', 'view-analytics'], assignedAt: new Date('2024-01-01'), assignedBy: '1' }
      ]
    },
    {
      _id: '2',
      name: 'John Doe',
      email: 'john@example.com',
      avatarUrl: '',
      role: 'designer',
      designation: 'UI/UX Designer',
      permissions: [
        { _id: 'p4', name: 'View Projects', description: 'View project details and tasks', category: 'project', level: 'read' },
        { _id: 'p5', name: 'Edit Tasks', description: 'Update task status and add comments', category: 'task', level: 'write' },
        { _id: 'p6', name: 'Upload Files', description: 'Upload and share files', category: 'task', level: 'write' }
      ],
      joinedAt: new Date('2024-01-01'),
      lastActive: new Date('2024-03-15'),
      isOnline: true,
      performance: { rating: 4.5, tasksCompleted: 12, onTimeDelivery: 95, qualityScore: 4.2 },
      workspaceId: 'ws1',
      projectRoles: [
        { projectId: 'p1', projectName: 'E-commerce Platform', role: 'Designer', permissions: ['view-tasks', 'edit-tasks', 'upload-files'], assignedAt: new Date('2024-01-01'), assignedBy: '1' }
      ]
    },
    {
      _id: '3',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatarUrl: '',
      role: 'developer',
      designation: 'Backend Developer',
      permissions: [
        { _id: 'p7', name: 'View Projects', description: 'View project details and tasks', category: 'project', level: 'read' },
        { _id: 'p8', name: 'Edit Tasks', description: 'Update task status and add comments', category: 'task', level: 'write' },
        { _id: 'p9', name: 'View Analytics', description: 'View project analytics and reports', category: 'analytics', level: 'read' }
      ],
      joinedAt: new Date('2024-01-01'),
      lastActive: new Date('2024-03-14'),
      isOnline: true,
      performance: { rating: 4.8, tasksCompleted: 15, onTimeDelivery: 98, qualityScore: 4.6 },
      workspaceId: 'ws1',
      projectRoles: [
        { projectId: 'p1', projectName: 'E-commerce Platform', role: 'Developer', permissions: ['view-tasks', 'edit-tasks', 'view-analytics'], assignedAt: new Date('2024-01-01'), assignedBy: '1' }
      ]
    },
    {
      _id: '4',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      avatarUrl: '',
      role: 'tester',
      designation: 'QA Engineer',
      permissions: [
        { _id: 'p10', name: 'View Projects', description: 'View project details and tasks', category: 'project', level: 'read' },
        { _id: 'p11', name: 'Edit Tasks', description: 'Update task status and add comments', category: 'task', level: 'write' },
        { _id: 'p12', name: 'Create Reports', description: 'Create and export test reports', category: 'analytics', level: 'write' }
      ],
      joinedAt: new Date('2024-01-15'),
      lastActive: new Date('2024-03-13'),
      isOnline: false,
      performance: { rating: 4.3, tasksCompleted: 8, onTimeDelivery: 90, qualityScore: 4.1 },
      workspaceId: 'ws1',
      projectRoles: [
        { projectId: 'p1', projectName: 'E-commerce Platform', role: 'QA Engineer', permissions: ['view-tasks', 'edit-tasks', 'create-reports'], assignedAt: new Date('2024-01-15'), assignedBy: '1' }
      ]
    }
  ];

  const customRoles: CustomRole[] = [
    {
      _id: 'cr1',
      name: 'Senior Developer',
      description: 'Advanced developer with additional permissions',
      permissions: [
        { _id: 'p13', name: 'Code Review', description: 'Review and approve code changes', category: 'task', level: 'write' },
        { _id: 'p14', name: 'Mentor Team', description: 'Guide and mentor junior developers', category: 'user', level: 'write' },
        { _id: 'p15', name: 'Technical Decisions', description: 'Make technical architecture decisions', category: 'project', level: 'write' }
      ],
      createdAt: new Date('2024-02-01'),
      createdBy: '1',
      workspaceId: 'ws1',
      isDefault: false
    },
    {
      _id: 'cr2',
      name: 'Content Manager',
      description: 'Manages content creation and publishing',
      permissions: [
        { _id: 'p16', name: 'Content Creation', description: 'Create and edit content', category: 'task', level: 'write' },
        { _id: 'p17', name: 'Publishing', description: 'Publish and schedule content', category: 'project', level: 'write' },
        { _id: 'p18', name: 'Content Analytics', description: 'View content performance metrics', category: 'analytics', level: 'read' }
      ],
      createdAt: new Date('2024-02-15'),
      createdBy: '1',
      workspaceId: 'ws1',
      isDefault: false
    }
  ];

  const allPermissions: Permission[] = [
    // Project permissions
    { _id: 'p1', name: 'Create Projects', description: 'Create new projects', category: 'project', level: 'write' },
    { _id: 'p2', name: 'Edit Projects', description: 'Modify project details', category: 'project', level: 'write' },
    { _id: 'p3', name: 'Delete Projects', description: 'Delete projects', category: 'project', level: 'admin' },
    { _id: 'p4', name: 'View Projects', description: 'View project information', category: 'project', level: 'read' },
    { _id: 'p5', name: 'Manage Project Settings', description: 'Configure project settings', category: 'project', level: 'admin' },
    
    // Task permissions
    { _id: 'p6', name: 'Create Tasks', description: 'Create new tasks', category: 'task', level: 'write' },
    { _id: 'p7', name: 'Edit Tasks', description: 'Modify task details', category: 'task', level: 'write' },
    { _id: 'p8', name: 'Delete Tasks', description: 'Delete tasks', category: 'task', level: 'admin' },
    { _id: 'p9', name: 'Assign Tasks', description: 'Assign tasks to team members', category: 'task', level: 'write' },
    { _id: 'p10', name: 'View Tasks', description: 'View task information', category: 'task', level: 'read' },
    
    // User permissions
    { _id: 'p11', name: 'Invite Users', description: 'Invite new team members', category: 'user', level: 'write' },
    { _id: 'p12', name: 'Remove Users', description: 'Remove team members', category: 'user', level: 'admin' },
    { _id: 'p13', name: 'Manage User Roles', description: 'Assign and modify user roles', category: 'user', level: 'admin' },
    { _id: 'p14', name: 'View User Profiles', description: 'View team member profiles', category: 'user', level: 'read' },
    
    // Workspace permissions
    { _id: 'p15', name: 'Manage Workspace', description: 'Configure workspace settings', category: 'workspace', level: 'admin' },
    { _id: 'p16', name: 'View Workspace', description: 'View workspace information', category: 'workspace', level: 'read' },
    
    // Analytics permissions
    { _id: 'p17', name: 'View Analytics', description: 'View project analytics', category: 'analytics', level: 'read' },
    { _id: 'p18', name: 'Export Reports', description: 'Export analytics reports', category: 'analytics', level: 'write' },
    { _id: 'p19', name: 'Create Reports', description: 'Create custom reports', category: 'analytics', level: 'write' },
    
    // Settings permissions
    { _id: 'p20', name: 'Manage Settings', description: 'Configure application settings', category: 'settings', level: 'admin' },
    { _id: 'p21', name: 'View Settings', description: 'View application settings', category: 'settings', level: 'read' }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'workspace-owner': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'project-manager': return <Star className="w-4 h-4 text-accent" />;
      case 'developer': return <Code className="w-4 h-4 text-green-500" />;
      case 'designer': return <Palette className="w-4 h-4 text-purple-500" />;
      case 'tester': return <CheckCircle className="w-4 h-4 text-orange-500" />;
      case 'analyst': return <BarChart3 className="w-4 h-4 text-indigo-500" />;
      default: return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'workspace-owner': return 'bg-yellow-100 text-yellow-800';
      case 'project-manager': return 'bg-blue-100 text-blue-800';
      case 'developer': return 'bg-green-100 text-green-800';
      case 'designer': return 'bg-purple-100 text-purple-800';
      case 'tester': return 'bg-orange-200 text-orange-800';
      case 'analyst': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPermissionLevelColor = (level: string) => {
    switch (level) {
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'write': return 'bg-blue-100 text-blue-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderMembersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="all">All Roles</option>
            <option value="workspace-owner">Workspace Owner</option>
            <option value="project-manager">Project Manager</option>
            <option value="developer">Developer</option>
            <option value="designer">Designer</option>
            <option value="tester">Tester</option>
            <option value="analyst">Analyst</option>
            <option value="custom">Custom</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors">
            <Plus className="w-4 h-4" />
            Invite Member
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users
          .filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = filterRole === 'all' || user.role === filterRole;
            const matchesStatus = filterStatus === 'all' || 
                                 (filterStatus === 'online' && user.isOnline) ||
                                 (filterStatus === 'offline' && !user.isOnline);
            return matchesSearch && matchesRole && matchesStatus;
          })
          .map(user => (
            <div
              key={user._id}
              onClick={() => {
                setSelectedUser(user);
                setShowUserModal(true);
              }}
              className="bg-white p-6 rounded-lg border border-gray-300 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                      alt={user.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getRoleIcon(user.role)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Role:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.designation}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Performance:</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-900">{user.performance.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tasks Completed:</span>
                  <span className="text-sm font-medium text-gray-900">{user.performance.tasksCompleted}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">On-Time Delivery:</span>
                  <span className="text-sm font-medium text-gray-900">{user.performance.onTimeDelivery}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Active:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(user.lastActive).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderRolesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Custom Roles</h3>
        <button
          onClick={() => setShowRoleModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {customRoles.map(role => (
          <div key={role._id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent-dark" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{role.name}</h4>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-gray-600 hover:text-gray-600">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-gray-600 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Permissions:</span>
                <div className="mt-2 space-y-1">
                  {role.permissions.map(permission => (
                    <div key={permission._id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{permission.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPermissionLevelColor(permission.level)}`}>
                        {permission.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm text-gray-600">
                  {new Date(role.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Users with this role:</span>
                <span className="text-sm font-medium text-gray-900">
                  {users.filter(u => u.role === 'custom').length}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Permission Categories</h3>
        <button
          onClick={() => setShowPermissionModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Permission
        </button>
      </div>

      {['project', 'task', 'user', 'workspace', 'analytics', 'settings'].map(category => (
        <div key={category} className="bg-white rounded-lg border border-gray-300 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900 capitalize">{category} Permissions</h4>
            <p className="text-sm text-gray-600">
              Manage permissions related to {category} operations
            </p>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPermissions
                .filter(permission => permission.category === category)
                .map(permission => (
                  <div key={permission._id} className="p-3 border border-gray-300 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{permission.name}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPermissionLevelColor(permission.level)}`}>
                        {permission.level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{permission.description}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderUserModal = () => {
    if (!selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img
                src={selectedUser.avatarUrl || `https://ui-avatars.com/api/?name=${selectedUser.name}&background=random`}
                alt={selectedUser.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h2>
                <p className="text-gray-600">{selectedUser.email}</p>
              </div>
            </div>
            <button
              onClick={() => setShowUserModal(false)}
              className="text-gray-600 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">User Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Role:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.designation}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Joined:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(selectedUser.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Last Active:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(selectedUser.lastActive).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-sm text-gray-600">
                        {selectedUser.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Overall Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-900">{selectedUser.performance.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Tasks Completed:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedUser.performance.tasksCompleted}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">On-Time Delivery:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedUser.performance.onTimeDelivery}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Quality Score:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedUser.performance.qualityScore}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Project Roles</h3>
              <div className="space-y-3">
                {selectedUser.projectRoles.map(projectRole => (
                  <div key={projectRole.projectId} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{projectRole.projectName}</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {projectRole.role}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {projectRole.permissions.map(permission => (
                        <span key={permission} className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded-full">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Global Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedUser.permissions.map(permission => (
                  <div key={permission._id} className="p-3 border border-gray-300 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-900">{permission.name}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPermissionLevelColor(permission.level)}`}>
                        {permission.level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{permission.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors">
                Edit Permissions
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Change Role
              </button>
              <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                Remove User
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'members', label: 'Team Members', icon: Users, description: 'Manage team members and their roles' },
    { id: 'roles', label: 'Custom Roles', icon: Shield, description: 'Create and manage custom roles' },
    { id: 'permissions', label: 'Permissions', icon: Key, description: 'Configure permission categories' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'members':
        return renderMembersTab();
      case 'roles':
        return renderRolesTab();
      case 'permissions':
        return renderPermissionsTab();
      default:
        return renderMembersTab();
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white border border-border rounded-xl">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Roles & Permissions</h1>
              <p className="text-sm text-gray-600 mt-1">Manage team roles, permissions, and access control.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{users.length}</span> members
              </div>
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
                      ? 'border-accent text-accent-dark'
                      : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  title={tab.description}
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
          {renderContent()}
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && renderUserModal()}
    </div>
  );
};

export default ProjectRolesAndPermissions;
