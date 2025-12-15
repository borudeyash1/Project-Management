import React, { useState, useEffect } from 'react';

import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, ChevronRight, Users, Calendar, Clock, Target, 
  BarChart3, MessageSquare, Settings, Plus, Filter, Search,
  Edit, Trash2, Eye, CheckCircle, AlertCircle, Star, Flag, UserPlus,
  TrendingUp, Activity, FileText, Image, Link, Download,
  Upload, Share2, MoreVertical, Play, Pause, Square,
  Zap, Bot, Crown, Award, Trophy, Medal, Heart, Bookmark,
  Copy, Move, Archive, Tag, MapPin, Phone, Mail, Globe,
  Building, Home, Briefcase, DollarSign, CreditCard,
  Lock, Shield, Key, Bell, EyeOff, Monitor, Smartphone,
  Sun, Moon, Palette, Settings as SettingsIcon, User,
  Calendar as CalendarIcon, Clock as ClockIcon, Target as TargetIcon,
  Building as BuildingIcon, LayoutGrid, List,
  TrendingDown, ArrowUp, ArrowDown, Minus, X, Check,
  RefreshCw, Save, Send, Reply, Forward, Archive as ArchiveIcon,
  Trash, Undo, Redo, Copy as CopyIcon,
  Bold, Italic, Underline, AlignLeft, AlignCenter,
  AlignRight, List as ListIcon, Quote,
  Code, Link as LinkIcon, Image as ImageIcon, Video,
  Music, File, Folder
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import apiService from '../services/api';

import AddTeamMemberModal from './AddTeamMemberModal';
import InviteMemberModal from './InviteMemberModal';
import TaskCreationModal from './TaskCreationModal';
import TaskDetailModal from './TaskDetailModal';
import TaskReviewModal from './TaskReviewModal';
import ProjectInfoTab from './project-tabs/ProjectInfoTab';
import ProjectTeamTab from './project-tabs/ProjectTeamTab';
import ProjectProgressTab from './project-tabs/ProjectProgressTab';
import ProjectRequestsTab from './project-tabs/ProjectRequestsTab';
import ProjectTaskAssignmentTab from './project-tabs/ProjectTaskAssignmentTab';
import EmployeeTasksTab from './project-tabs/EmployeeTasksTab';
import WorkspaceInbox from './workspace/WorkspaceInbox';
import ProjectAttendanceManagerTab from './project-tabs/ProjectAttendanceManagerTab';
import ProjectAttendanceEmployeeTab from './project-tabs/ProjectAttendanceEmployeeTab';

interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate: Date;
  progress: number;
  budget: number;
  spent: number;
  client: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  team: TeamMember[];
  tasks: Task[];
  milestones: Milestone[];
  documents: Document[];
  timeline: TimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  color: string;
  isPublic: boolean;
  permissions: ProjectPermissions;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'member' | 'viewer';
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: Date;
  permissions: TeamMemberPermissions;
  workload: number; // percentage
  tasksAssigned: number;
  tasksCompleted: number;
  rating: number;
  lastActive: Date;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  taskType?: 'task' | 'bug' | 'feature' | 'improvement' | 'research' | 'documentation';
  category?: 'development' | 'design' | 'testing' | 'deployment' | 'meeting' | 'review' | 'other';
  status: 'pending' | 'in-progress' | 'review' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: TeamMember;
  dueDate: Date;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  tags: string[];
  subtasks: Subtask[];
  comments: Comment[];
  attachments: Attachment[];
  links: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  dependencies: string[];
  isMilestone: boolean;
  milestoneId?: string;
  rating?: number;
  reviewComments?: string;
  completedAt?: Date;
}

interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  assignee: TeamMember;
  dueDate: Date;
}

interface Comment {
  _id: string;
  content: string;
  author: TeamMember;
  createdAt: Date;
  replies: Comment[];
}

interface Attachment {
  _id: string;
  name: string;
  url: string;
  type: 'file' | 'image' | 'link';
  size: number;
  uploadedBy: TeamMember;
  uploadedAt: Date;
}

interface Milestone {
  _id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  tasks: string[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Document {
  _id: string;
  name: string;
  type: 'file' | 'folder' | 'image';
  url?: string;
  size?: number;
  uploadedBy: TeamMember;
  uploadedAt: Date;
  parentId?: string;
  children?: Document[];
}

interface TimelineEvent {
  _id: string;
  type: 'task' | 'milestone' | 'comment' | 'status-change';
  title: string;
  description: string;
  date: Date;
  user: TeamMember;
  metadata?: any;
}

interface ProjectPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canManageTeam: boolean;
  canManageTasks: boolean;
  canViewAnalytics: boolean;
  canManageDocuments: boolean;
}

interface TeamMemberPermissions {
  canEditTasks: boolean;
  canCreateTasks: boolean;
  canDeleteTasks: boolean;
  canManageTeam: boolean;
  canViewAnalytics: boolean;
}

const ProjectViewDetailed: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { canUseAdvancedAnalytics, canManageTeam } = useFeatureAccess();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();  // ← ADD THIS LINE
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeView, setActiveView] = useState<
    | 'overview'
    | 'info'
    | 'team'
    | 'tasks'
    | 'timeline'
    | 'progress'
    | 'workload'
    | 'attendance'
    | 'reports'
    | 'documents'
    | 'inbox'
    | 'settings'
    | 'analytics'
  >('overview');
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showManageProject, setShowManageProject] = useState(false);
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showInviteMemberModal, setShowInviteMemberModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'team']));
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showTaskReview, setShowTaskReview] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'my' | 'overdue' | 'review'>('all');
  const [requests, setRequests] = useState<any[]>([]); // Workload/deadline requests
  const [projectTasks, setProjectTasks] = useState<any[]>([]); // Tasks for assignment (loaded from backend)
  
  // Project Settings State
  const [officeLatitude, setOfficeLatitude] = useState('');
  const [officeLongitude, setOfficeLongitude] = useState('');
  const [projectProgress, setProjectProgress] = useState(0);
  const [projectStatus, setProjectStatus] = useState<'draft' | 'active' | 'paused' | 'completed' | 'archived'>('active');

  // Derive role from actual workspace and project membership
  const project = state.projects.find(p => p._id === projectId);
  const workspace = state.workspaces.find(w => w._id === project?.workspace);
  const isWorkspaceOwner = workspace?.owner === state.userProfile._id;
  
  // Check if user is project manager - handle both populated and unpopulated user field
  const isProjectManager = React.useMemo(() => {
    if (!project?.teamMembers) return false;
    
    return project.teamMembers.some((m: any) => {
      const memberUserId = typeof m.user === 'object' ? m.user._id : m.user;
      const isCurrentUser = memberUserId === state.userProfile._id;
      const hasManagerRole = m.role === 'project-manager' || m.role === 'manager';
      const hasManagerPermissions = m.permissions?.canManageMembers || m.permissions?.canManageProject;
      
      return isCurrentUser && (hasManagerRole || hasManagerPermissions);
    });
  }, [project?.teamMembers, state.userProfile._id]);
  
  const currentUserRole = isWorkspaceOwner ? 'owner' : isProjectManager ? 'manager' : 'employee';
  const currentTestUserId = state.userProfile._id;

  // Detect active view from URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/info')) setActiveView('info');
    else if (path.includes('/team')) setActiveView('team');
    else if (path.includes('/tasks')) setActiveView('tasks');
    else if (path.includes('/timeline')) setActiveView('timeline');
    else if (path.includes('/progress')) setActiveView('progress');
    else if (path.includes('/workload')) setActiveView('workload');
    else if (path.includes('/attendance')) setActiveView('attendance');
    else if (path.includes('/reports')) setActiveView('reports');
    else if (path.includes('/documents')) setActiveView('documents');
    else if (path.includes('/inbox')) setActiveView('inbox');
    else if (path.includes('/settings')) setActiveView('settings');
    else setActiveView('overview');
  }, [location.pathname]);

  // Load project data from API if not in state (handles page refresh)
  useEffect(() => {
    const loadProjectFromAPI = async () => {
      if (!projectId) return;
      
      // If project already in state, use it
      if (state.projects.length > 0) {
        const project = state.projects.find(p => p._id === projectId);
        if (project) {
          const enrichedProject = {
            ...project,
            tasks: (project as any).tasks || state.tasks.filter(t => t.project === projectId) || [],
            team: (project as any).team && (project as any).team.length > 0 ? (project as any).team : [],
            documents: (project as any).documents || [],
            timeline: (project as any).timeline || [],
            milestones: (project as any).milestones || []
          };
          setActiveProject(enrichedProject as any);
          return;
        }
      }
      
      // If not in state (page refresh), fetch from API
      try {
        console.log('📥 [PROJECT LOAD] Fetching project from API:', projectId);
        const response = await apiService.get(`/projects/${projectId}`);
        
        if (response.data.success) {
          const fetchedProject = response.data.data;
          console.log('✅ [PROJECT LOAD] Project fetched:', fetchedProject.name);
          
          // Add to app state
          dispatch({
            type: 'ADD_PROJECT',
            payload: fetchedProject
          });
          
          // Set as active project
          const enrichedProject = {
            ...fetchedProject,
            tasks: fetchedProject.tasks || [],
            team: fetchedProject.teamMembers || [],
            documents: fetchedProject.documents || [],
            timeline: fetchedProject.timeline || [],
            milestones: fetchedProject.milestones || []
          };
          setActiveProject(enrichedProject as any);
          
          // Also fetch workspace if not in state
          if (fetchedProject.workspace && state.workspaces.length === 0) {
            console.log('📥 [WORKSPACE LOAD] Fetching workspace:', fetchedProject.workspace);
            try {
              const wsResponse = await apiService.get(`/workspaces/${fetchedProject.workspace}`);
              if (wsResponse.data.success) {
                dispatch({
                  type: 'SET_WORKSPACE',
                  payload: wsResponse.data.data
                });
              }
            } catch (wsError) {
              console.error('❌ [WORKSPACE LOAD] Failed:', wsError);
            }
          }
        }
      } catch (error) {
        console.error('❌ [PROJECT LOAD] Failed to fetch project:', error);
        // Show error toast
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            id: Date.now().toString(),
            type: 'error',
            message: 'Failed to load project. Please try again.',
            duration: 4000
          }
        });
      }
    };
    
    loadProjectFromAPI();
  }, [projectId, state.projects.length]);

  // Helper to map backend Task to UI task shape used in tabs
  const mapBackendTaskToUi = (task: any, team: any[]): any => {
    const assigneeId = task.assignee || '';
    const assigneeMember = team?.find((m: any) => m.user === assigneeId || m._id === assigneeId);

    // Status and priority now match directly - no mapping needed
    const uiStatus = task.status || 'pending';
    const uiPriority = task.priority || 'medium';

    return {
      _id: task._id,
      title: task.title,
      description: task.description || '',
      taskType: task.taskType || 'general',
      assignedTo: assigneeId,
      assignedToName: assigneeMember?.name || assigneeMember?.fullName || 'Unassigned',
      status: uiStatus,
      priority: uiPriority,
      startDate: task.startDate ? new Date(task.startDate) : new Date(),
      dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
      progress: typeof task.progress === 'number' ? task.progress : 0,
      files: task.files || [],
      links: task.links || [],
      subtasks: task.subtasks || [],
      rating: task.rating,
      ratingDetails: task.ratingDetails,
      verifiedBy: task.verifiedBy,
      verifiedAt: task.verifiedAt,
      isFinished: uiStatus === 'verified' || uiStatus === 'completed',
      requiresFile: task.requiresFile || false,
      requiresLink: task.requiresLink || false,
    };
  };

  // Load tasks for active project from backend
  useEffect(() => {
    const loadTasks = async () => {
      if (!activeProject?._id) return;
      try {
        const backendTasks = await apiService.getTasks(activeProject._id);
        const uiTasks = (backendTasks || []).map((t: any) =>
          mapBackendTaskToUi(t, (activeProject as any)?.team || []),
        );
        setProjectTasks(uiTasks);
      } catch (error) {
        console.error('[ProjectViewDetailed] Failed to load project tasks:', error);
      }
    };

    loadTasks();
  }, [activeProject?._id, (activeProject as any)?.team]);

  // Load requests for active project from backend
  useEffect(() => {
    const loadRequests = async () => {
      if (!activeProject?._id) return;
      try {
        console.log('📥 [LOAD REQUESTS] Loading requests for project:', activeProject._id);
        const response = await apiService.get(`/projects/${activeProject._id}/requests`);
        console.log('✅ [LOAD REQUESTS] Loaded requests:', response.data.data?.length || 0);
        setRequests(response.data.data || []);
      } catch (error) {
        console.error('❌ [LOAD REQUESTS] Failed to load requests:', error);
        setRequests([]);
      }
    };

    loadRequests();
  }, [activeProject?._id]);

  // Set projects from state
  useEffect(() => {
    if (state.projects.length > 0) {
      setProjects(state.projects as any);
    }
  }, [state.projects]);

  // Mock data - BACKUP if no projects in state
  useEffect(() => {
    if (state.projects.length === 0) {
      const mockProjects: Project[] = [
        {
          _id: '1',
          name: 'E-commerce Platform',
          description: 'Building a comprehensive e-commerce platform with modern features',
          status: 'active',
          priority: 'high',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-30'),
          progress: 65,
          budget: 50000,
          spent: 32500,
          client: {
            _id: 'c1',
            name: 'TechCorp Inc.',
            email: 'contact@techcorp.com',
            avatar: ''
          },
          team: [
            {
              _id: 'u1',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'manager',
              status: 'active',
              joinedAt: new Date('2024-01-01'),
              permissions: {
                canEditTasks: true,
                canCreateTasks: true,
                canDeleteTasks: true,
                canManageTeam: true,
                canViewAnalytics: true
              },
              workload: 80,
              tasksAssigned: 12,
              tasksCompleted: 8,
              rating: 4.5,
              lastActive: new Date()
            },
            {
              _id: 'u2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              role: 'member',
              status: 'active',
              joinedAt: new Date('2024-01-15'),
              permissions: {
                canEditTasks: true,
                canCreateTasks: true,
                canDeleteTasks: false,
                canManageTeam: false,
                canViewAnalytics: false
              },
              workload: 60,
              tasksAssigned: 8,
              tasksCompleted: 6,
              rating: 4.2,
              lastActive: new Date()
            }
          ],
          tasks: [],
          milestones: [],
          documents: [],
          timeline: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          createdBy: 'u1',
          tags: ['e-commerce', 'web', 'react'],
          color: '#3B82F6',
          isPublic: false,
          permissions: {
            canEdit: true,
            canDelete: true,
            canManageTeam: true,
            canManageTasks: true,
            canViewAnalytics: true,
            canManageDocuments: true
          }
        },
        {
          _id: '2',
          name: 'Mobile App Development',
          description: 'Native mobile app for iOS and Android platforms',
          status: 'active',
          priority: 'medium',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-08-31'),
          progress: 40,
          budget: 75000,
          spent: 30000,
          client: {
            _id: 'c2',
            name: 'MobileFirst Ltd.',
            email: 'hello@mobilefirst.com',
            avatar: ''
          },
          team: [],
          tasks: [],
          milestones: [],
          documents: [],
          timeline: [],
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date(),
          createdBy: 'u1',
          tags: ['mobile', 'ios', 'android'],
          color: '#10B981',
          isPublic: false,
          permissions: {
            canEdit: true,
            canDelete: true,
            canManageTeam: true,
            canManageTasks: true,
            canViewAnalytics: true,
            canManageDocuments: true
          }
        }
      ];

      setProjects(mockProjects);
      setActiveProject(mockProjects[0]);
    }
  }, [state.projects.length]);

  // Initialize project status and progress from activeProject
  useEffect(() => {
    if (activeProject) {
      setProjectStatus(activeProject.status);
      setProjectProgress(activeProject.progress);
    }
  }, [activeProject]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Task Assignment Handlers (PM only) - backed by backend Task model
  const handleCreateTask = async (task: any) => {
    if (!activeProject?._id) return;
    try {
      console.log('📝 [CREATE TASK] Creating task:', task);
      
      const payload = {
        title: task.title,
        description: task.description,
        project: activeProject._id,
        workspace: (activeProject as any)?.workspace || state.currentWorkspace,
        assignee: task.assignedTo || undefined,
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        taskType: task.taskType || 'general',
        startDate: task.startDate || new Date(),
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours || 0,
        progress: task.progress || 0,
        subtasks: task.subtasks || [],
        links: task.links || [],
        requiresLink: task.requiresLink || false,
        requiresFile: task.requiresFile || false
      };

      console.log('📤 [CREATE TASK] Payload:', payload);
      const createdBackendTask = await apiService.createTask(payload);
      console.log('✅ [CREATE TASK] Task created:', createdBackendTask);
      
      const uiTask = mapBackendTaskToUi(createdBackendTask, (activeProject as any)?.teamMembers || (activeProject as any)?.team || []);
      setProjectTasks([...projectTasks, uiTask]);

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Task created and assigned successfully!',
          duration: 3000,
        },
      });
    } catch (error) {
      console.error('[CREATE TASK] Failed to create task:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to create task. Please try again.',
          duration: 4000,
        },
      });
    }
  };

  const handleUpdateTask = async (taskId: string, updates: any) => {
    if (!activeProject?._id) return;
    try {
      const existing = projectTasks.find(t => t._id === taskId);
      const merged = { ...existing, ...updates };

      const payload: any = {
        title: merged.title,
        description: merged.description,
        assignee: merged.assignedTo || undefined,
        status: merged.status,
        priority: merged.priority,
        startDate: merged.startDate,
        dueDate: merged.dueDate,
        estimatedHours: merged.estimatedHours,
        progress: merged.progress,
        subtasks: merged.subtasks,
        links: merged.links,
        files: merged.files,
        taskType: merged.taskType,
        requiresFile: merged.requiresFile,
        requiresLink: merged.requiresLink,
      };

      const updatedBackendTask = await apiService.updateTask(taskId, payload);
      const uiTask = mapBackendTaskToUi(updatedBackendTask, (activeProject as any)?.team || []);

      setProjectTasks(projectTasks.map(t => (t._id === taskId ? { ...t, ...uiTask } : t)));

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Task updated successfully!',
          duration: 3000,
        },
      });
    } catch (error) {
      console.error('[ProjectViewDetailed] Failed to update task:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to update task. Please try again.',
          duration: 4000,
        },
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiService.deleteTask(taskId);
      setProjectTasks(projectTasks.filter(t => t._id !== taskId));

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Task deleted successfully!',
          duration: 3000,
        },
      });
    } catch (error) {
      console.error('[ProjectViewDetailed] Failed to delete task:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to delete task. Please try again.',
          duration: 4000,
        },
      });
    }
  };

  const handleReassignTask = (taskId: string, newAssignee: string) => {
    const task = projectTasks.find(t => t._id === taskId);
    const member = (activeProject as any)?.team?.find((m: any) => m._id === newAssignee);
    handleUpdateTask(taskId, { assignedTo: newAssignee, assignedToName: member?.name || 'Unknown' });
  };

  // Request Handlers
  const handleCreateRequest = async (request: any) => {
    try {
      console.log('📤 [CREATE REQUEST] Submitting request:', request);
      
      // Call API to create request
      const response = await apiService.post(`/projects/${projectId}/requests`, request);
      
      console.log('✅ [CREATE REQUEST] Response:', response.data);
      
      // Add to local state only if we got valid data
      if (response.data && response.data.data) {
        setRequests([...requests, response.data.data]);
      }
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Request submitted to Project Manager!',
          duration: 3000
        }
      });
    } catch (error) {
      console.error('❌ [CREATE REQUEST] Failed:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to submit request',
          duration: 3000
        }
      });
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      console.log('✅ [APPROVE REQUEST] Approving request:', requestId);
      
      await apiService.put(`/projects/${activeProject?._id}/requests/${requestId}/approve`);
      
      setRequests(requests.map(r => r._id === requestId ? { ...r, status: 'approved' } : r));
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Request approved!',
          duration: 3000
        }
      });
    } catch (error) {
      console.error('❌ [APPROVE REQUEST] Failed:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to approve request',
          duration: 3000
        }
      });
    }
  };

  const handleRejectRequest = async (requestId: string, reason: string) => {
    try {
      console.log('❌ [REJECT REQUEST] Rejecting request:', requestId);
      
      await apiService.put(`/projects/${activeProject?._id}/requests/${requestId}/reject`, { reason });
      
      setRequests(requests.map(r => r._id === requestId ? { ...r, status: 'rejected', rejectionReason: reason } : r));
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'info',
          message: 'Request rejected!',
          duration: 3000
        }
      });
    } catch (error) {
      console.error('❌ [REJECT REQUEST] Failed:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to reject request',
          duration: 3000
        }
      });
    }
  };

  const handleManualReassign = async (taskId: string, newAssigneeId: string) => {
    try {
      console.log('👥 [MANUAL REASSIGN] Reassigning task:', taskId, 'to:', newAssigneeId);
      
      await apiService.put(`/tasks/${taskId}/reassign`, { assignedTo: newAssigneeId });
      
      // Task list will refresh on next component mount
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Task reassigned successfully!',
          duration: 3000
        }
      });
    } catch (error) {
      console.error('❌ [MANUAL REASSIGN] Failed:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to reassign task',
          duration: 3000
        }
      });
    }
  };

  const handleManualDeadlineChange = async (taskId: string, newDeadline: string) => {
    try {
      console.log('⏰ [MANUAL DEADLINE] Changing deadline for task:', taskId, 'to:', newDeadline);
      
      await apiService.put(`/tasks/${taskId}`, { dueDate: newDeadline });
      
      // Task list will refresh on next component mount
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Deadline updated successfully!',
          duration: 3000
        }
      });
    } catch (error) {
      console.error('❌ [MANUAL DEADLINE] Failed:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to update deadline',
          duration: 3000
        }
      });
    }
  };

  // Role Switcher Handler (Testing only)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
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

  const renderProjectHeader = () => (
    <div className="bg-white border-b border-gray-300 px-6 py-4">
      {/* Role Selector for Testing */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: activeProject?.color }} />
            <button
              onClick={() => setShowProjectSelector(!showProjectSelector)}
              className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-accent-dark"
            >
              {activeProject?.name}
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activeProject?.status || '')}`}>
            {activeProject?.status}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(activeProject?.priority || '')}`}>
            {activeProject?.priority}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {(currentUserRole === 'owner' || currentUserRole === 'manager') && (
            <button
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Project Selector Dropdown */}
      {showProjectSelector && (
        <>
          {/* Backdrop to close on click outside */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowProjectSelector(false)}
          />
          <div className="absolute top-16 left-6 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Switch Project</h3>
                <button
                  onClick={() => setShowProjectSelector(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {projects.map((project) => (
                  <button
                    key={project._id}
                    onClick={() => {
                      setActiveProject(project);
                      setShowProjectSelector(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 ${
                      activeProject?._id === project._id ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: project.color }} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-600">{project.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderTabNavigation = () => {
    // Check if current user is workspace owner or project manager
    const isWorkspaceOwner = activeProject?.createdBy === state.userProfile?._id;
    const isProjectManager = (activeProject as any)?.projectManager === state.userProfile?._id || 
                            (activeProject as any)?.team?.some((m: any) => m._id === state.userProfile?._id && m.role === 'project-manager');
    const canManageTeam = isWorkspaceOwner || isProjectManager || currentUserRole === 'owner' || currentUserRole === 'manager';

    const allTabs = [
      { id: 'overview', label: 'Overview', icon: LayoutGrid, visible: true },
      { id: 'info', label: 'Project Info', icon: FileText, visible: true },
      { id: 'team', label: 'Team', icon: Users, visible: canManageTeam }, // Only owner/PM can see
      { id: 'tasks', label: 'Tasks & Board', icon: CheckCircle, visible: true },
      { id: 'timeline', label: 'Timeline', icon: Calendar, visible: true },
      { id: 'progress', label: 'Progress Tracker', icon: TrendingUp, visible: true },
      { id: 'workload', label: 'Workload', icon: Activity, visible: true },
      { id: 'attendance', label: 'Attendance', icon: ClockIcon, visible: true },
      { id: 'reports', label: 'Reports', icon: BarChart3, visible: true },
      { id: 'documents', label: 'Documents', icon: Folder, visible: true },
      { id: 'inbox', label: 'Inbox', icon: Mail, visible: true },
      { id: 'settings', label: 'Settings', icon: Settings, visible: canManageTeam }
    ];

    const tabs = allTabs.filter(tab => tab.visible);

    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <nav className="flex space-x-4 px-6 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeView === tab.id
                    ? 'border-accent-dark text-accent-dark'
                    : isDarkMode
                    ? 'border-transparent text-gray-600 hover:text-gray-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    );
  };

  const renderProjectOverview = () => (
  <div className="space-y-6">
    {/* Project Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        {/* ... */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Progress</p>
              <p className="text-2xl font-bold text-gray-900">{activeProject?.progress}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-accent-dark" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${activeProject?.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(activeProject?.budget || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Spent: {formatCurrency(activeProject?.spent || 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{activeProject?.team?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {activeProject?.team?.filter(m => m.status === 'active').length || 0} active
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{activeProject?.tasks?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {activeProject?.tasks?.filter(t => t.status === 'completed').length || 0} completed
          </p>
        </div>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h3>
            <p className="text-gray-700">{activeProject?.description}</p>
          </div>

          {/* Timeline */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Start Date</p>
                  <p className="text-sm text-gray-600">{formatDate(activeProject?.startDate || new Date())}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">End Date</p>
                  <p className="text-sm text-gray-600">{formatDate(activeProject?.endDate || new Date())}</p>
                </div>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${activeProject?.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-accent-dark" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Task "User Authentication" was completed</p>
                  <p className="text-xs text-gray-600">2 hours ago by John Doe</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">New task "Payment Integration" was created</p>
                  <p className="text-xs text-gray-600">4 hours ago by Jane Smith</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">New team member "Bob Wilson" was added</p>
                  <p className="text-xs text-gray-600">1 day ago by John Doe</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Client Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <Building className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {typeof activeProject?.client === 'string' 
                    ? activeProject?.client 
                    : activeProject?.client?.name || 'No Client'}
                </h4>
                <p className="text-sm text-gray-600">
                  {typeof activeProject?.client === 'object' && activeProject?.client?.email 
                    ? activeProject?.client?.email 
                    : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Project Tags */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {activeProject?.tags && activeProject.tags.length > 0 ? (
                activeProject.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-600">No tags</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowCreateTask(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Create Task
              </button>
              <button
                onClick={() => setShowTeamManagement(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <Users className="w-4 h-4" />
                Manage Team
              </button>
              <button
                onClick={() => setShowAnalytics(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <BarChart3 className="w-4 h-4" />
                View Analytics
              </button>
              <button
                onClick={() => setShowManageProject(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <Settings className="w-4 h-4" />
                Project Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeamSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Team Members</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInviteMemberModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600 text-gray-700 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeProject?.team.map((member) => (
          <div key={member._id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{member.name}</h4>
                <p className="text-sm text-gray-600">{member.email}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {member.status}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Role</span>
                <span className="font-medium text-gray-900 capitalize">{member.role}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Workload</span>
                <span className="font-medium text-gray-900">{member.workload}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tasks</span>
                <span className="font-medium text-gray-900">{member.tasksCompleted}/{member.tasksAssigned}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-600 fill-current" />
                  <span className="font-medium text-gray-900">{member.rating}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <MessageSquare className="w-4 h-4" />
                Chat
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Eye className="w-4 h-4" />
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className="w-80 bg-white border-l border-gray-300 min-h-screen">
      <div className="p-6">
        <div className="space-y-6">
          {/* Project Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('project.sidebar.projectInfo')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('project.sidebar.status')}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activeProject?.status || '')}`}>
                  {activeProject?.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('project.sidebar.priority')}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(activeProject?.priority || '')}`}>
                  {activeProject?.priority}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('project.sidebar.progress')}</span>
                <span className="font-medium text-gray-900">{activeProject?.progress}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('project.sidebar.budget')}</span>
                <span className="font-medium text-gray-900">{formatCurrency(activeProject?.budget || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('project.sidebar.spent')}</span>
                <span className="font-medium text-gray-900">{formatCurrency(activeProject?.spent || 0)}</span>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('project.sidebar.teamMembers')}</h3>
            <div className="space-y-3">
              {activeProject?.team?.slice(0, 5).map((member) => (
                <div key={member._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{member.role}</p>
                  </div>
                  <button className="text-accent-dark hover:text-blue-700">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {activeProject && activeProject.team && activeProject.team.length > 5 && (
                <p className="text-sm text-gray-600 text-center">
                  {t('project.sidebar.moreMembers', { count: activeProject.team.length - 5 })}
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('project.sidebar.quickStats')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('project.sidebar.totalTasks')}</span>
                <span className="font-medium text-gray-900">{activeProject?.tasks?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('project.sidebar.completed')}</span>
                <span className="font-medium text-gray-900">
                  {activeProject?.tasks?.filter(t => t.status === 'completed').length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('project.sidebar.inProgress')}</span>
                <span className="font-medium text-gray-900">
                  {activeProject?.tasks?.filter(t => t.status === 'in-progress').length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('project.sidebar.overdue')}</span>
                <span className="font-medium text-red-600">
                  {activeProject?.tasks?.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTasksView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Project Tasks</h3>
        <button
          onClick={() => setShowCreateTask(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900">{activeProject?.tasks.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold text-accent-dark">
            {activeProject?.tasks.filter(t => t.status === 'in-progress').length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {activeProject?.tasks.filter(t => t.status === 'completed').length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Blocked</p>
          <p className="text-2xl font-bold text-red-600">
            {activeProject?.tasks.filter(t => t.status === 'blocked').length || 0}
          </p>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4 flex-wrap">
            <button 
              onClick={() => setTaskFilter('all')}
              className={`px-3 py-1 text-sm font-medium rounded-lg ${
                taskFilter === 'all' ? 'text-accent-dark bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Tasks ({activeProject?.tasks.length || 0})
            </button>
            <button 
              onClick={() => setTaskFilter('my')}
              className={`px-3 py-1 text-sm font-medium rounded-lg ${
                taskFilter === 'my' ? 'text-accent-dark bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              My Tasks ({activeProject?.tasks.filter(t => t.assignee?._id === state.userProfile?._id).length || 0})
            </button>
            <button 
              onClick={() => setTaskFilter('overdue')}
              className={`px-3 py-1 text-sm font-medium rounded-lg ${
                taskFilter === 'overdue' ? 'text-accent-dark bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Overdue ({activeProject?.tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length || 0})
            </button>
            {(currentUserRole === 'manager' || currentUserRole === 'owner') && (
              <button 
                onClick={() => setTaskFilter('review')}
                className={`px-3 py-1 text-sm font-medium rounded-lg ${
                  taskFilter === 'review' ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Needs Review ({activeProject?.tasks.filter(t => t.status === 'review').length || 0})
              </button>
            )}
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {(() => {
            let filteredTasks = activeProject?.tasks || [];
            
            if (taskFilter === 'my') {
              filteredTasks = filteredTasks.filter(t => t.assignee?._id === state.userProfile?._id || t.createdBy === state.userProfile?._id);
            } else if (taskFilter === 'overdue') {
              filteredTasks = filteredTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed');
            } else if (taskFilter === 'review') {
              filteredTasks = filteredTasks.filter(t => t.status === 'review');
            }
            
            return filteredTasks.length === 0 ? (
              <div className="p-12 text-center text-gray-600">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="font-medium">No tasks found</p>
                <p className="text-sm mt-1">{taskFilter === 'all' ? 'Create your first task to get started' : 'No tasks match this filter'}</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
              <div 
                key={task._id} 
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  task.status === 'completed' ? 'opacity-60' : ''
                }`}
                onClick={() => {
                  setSelectedTask(task);
                  if (task.status === 'review' && currentUserRole === 'manager') {
                    setShowTaskReview(true);
                  } else {
                    setShowTaskDetail(true);
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <input 
                    type="checkbox" 
                    className="mt-1 rounded" 
                    checked={task.status === 'completed'}
                    onClick={(e) => e.stopPropagation()}
                    readOnly
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h4>
                      {task.taskType && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                          {task.taskType === 'bug' ? '🐛' : task.taskType === 'feature' ? '✨' : task.taskType === 'improvement' ? '🔧' : task.taskType === 'research' ? '🔍' : task.taskType === 'documentation' ? '📝' : '📋'} {task.taskType}
                        </span>
                      )}
                      {task.category && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-100 text-cyan-800">
                          {task.category === 'design' ? '🎨' : task.category === 'testing' ? '🧪' : task.category === 'deployment' ? '🚀' : task.category === 'meeting' ? '👥' : task.category === 'review' ? '👀' : '💻'} {task.category}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        task.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        task.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'review' ? 'bg-purple-100 text-purple-800' :
                        task.status === 'blocked' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                      {task.status === 'review' && (currentUserRole === 'manager' || currentUserRole === 'owner') && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 animate-pulse">
                          Needs Review
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {task.assignee?.name || 'Unassigned'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(task.dueDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {task.estimatedHours}h estimated
                      </span>
                      {task.progress > 0 && (
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {task.progress}% done
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskDetail(true);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {currentUserRole === 'manager' && (
                      <button 
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              ))
            );
          })()}
        </div>
      </div>
    </div>
  );

  const renderTimelineView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Project Timeline</h3>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
            Day
          </button>
          <button className="px-3 py-1 text-sm font-medium text-accent-dark bg-blue-50 rounded-lg">
            Week
          </button>
          <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
            Month
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="space-y-6">
          {!activeProject?.timeline || activeProject?.timeline.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="font-medium">No activity yet</p>
              <p className="text-sm mt-1">Activity will appear here as work progresses</p>
            </div>
          ) : (
            activeProject?.timeline.map((event, index) => (
              <div key={event._id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    event.type === 'task' ? 'bg-blue-100' :
                    event.type === 'milestone' ? 'bg-green-100' :
                    event.type === 'comment' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    {event.type === 'task' && <CheckCircle className="w-5 h-5 text-accent-dark" />}
                    {event.type === 'milestone' && <Flag className="w-5 h-5 text-green-600" />}
                    {event.type === 'comment' && <MessageSquare className="w-5 h-5 text-purple-600" />}
                    {event.type === 'status-change' && <Activity className="w-5 h-5 text-gray-600" />}
                  </div>
                  {index < (activeProject?.timeline.length || 0) - 1 && (
                    <div className="w-0.5 h-full bg-gray-300 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <span className="text-sm text-gray-600">{formatDate(event.date)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{event.user?.name || 'System'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Milestones</h4>
        <div className="space-y-4">
          {!activeProject?.milestones || activeProject?.milestones.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No milestones defined</p>
          ) : (
            activeProject?.milestones.map((milestone) => (
              <div key={milestone._id} className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{milestone.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>Due: {formatDate(milestone.dueDate)}</span>
                    <span>{milestone.progress}% complete</span>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                  milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {milestone.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderDocumentsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Documents</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover">
            <Plus className="w-4 h-4" />
            New Folder
          </button>
        </div>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Files</p>
          <p className="text-2xl font-bold text-gray-900">{activeProject?.documents.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Storage Used</p>
          <p className="text-2xl font-bold text-gray-900">
            {((activeProject?.documents.reduce((acc, doc) => acc + (doc.size || 0), 0) || 0) / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Recent Uploads</p>
          <p className="text-2xl font-bold text-gray-900">
            {activeProject?.documents.filter(d => {
              const dayAgo = new Date();
              dayAgo.setDate(dayAgo.getDate() - 1);
              return new Date(d.uploadedAt) > dayAgo;
            }).length || 0}
          </p>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button className="px-3 py-1 text-sm font-medium text-accent-dark bg-blue-50 rounded-lg">
              All Files
            </button>
            <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
              Images
            </button>
            <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
              Documents
            </button>
            <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
              Recent
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeProject?.documents.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="font-medium">No documents yet</p>
              <p className="text-sm mt-1">Upload files to share with your team</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProject?.documents.map((doc) => (
                <div key={doc._id} className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {doc.type === 'folder' && <FileText className="w-5 h-5 text-accent-dark" />}
                        {doc.type === 'file' && <File className="w-5 h-5 text-accent-dark" />}
                        {doc.type === 'image' && <Image className="w-5 h-5 text-accent-dark" />}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm">{doc.name}</h5>
                        <p className="text-xs text-gray-600">
                          {doc.size ? `${(doc.size / 1024).toFixed(2)} KB` : 'Folder'}
                        </p>
                      </div>
                    </div>
                    <button className="p-1 text-gray-600 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-600">
                    <p>Uploaded by {doc.uploadedBy?.name || 'Unknown'}</p>
                    <p>{formatDate(doc.uploadedAt)}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      <Download className="w-3 h-3 inline mr-1" />
                      Download
                    </button>
                    <button className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      <Share2 className="w-3 h-3 inline mr-1" />
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAnalyticsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Project Analytics</h3>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
            Last 7 Days
          </button>
          <button className="px-3 py-1 text-sm font-medium text-accent-dark bg-blue-50 rounded-lg">
            Last 30 Days
          </button>
          <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
            All Time
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Completion Rate</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{activeProject?.progress}%</p>
          <p className="text-sm text-green-600 mt-1">+5% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Team Velocity</p>
            <Activity className="w-5 h-5 text-accent-dark" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {activeProject?.tasks.filter(t => t.status === 'completed').length || 0}
          </p>
          <p className="text-sm text-accent-dark mt-1">Tasks completed</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Budget Usage</p>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {activeProject?.budget && activeProject?.spent 
              ? Math.round((activeProject.spent / activeProject.budget) * 100)
              : 0}%
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {formatCurrency(activeProject?.spent || 0)} of {formatCurrency(activeProject?.budget || 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Team Workload</p>
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {activeProject?.team.length 
              ? Math.round(activeProject.team.reduce((acc, m) => acc + m.workload, 0) / activeProject.team.length)
              : 0}%
          </p>
          <p className="text-sm text-gray-600 mt-1">Average workload</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Task Status Distribution</h4>
          <div className="space-y-3">
            {['pending', 'in-progress', 'review', 'completed', 'blocked'].map((status) => {
              const count = activeProject?.tasks.filter(t => t.status === status).length || 0;
              const total = activeProject?.tasks.length || 1;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="capitalize text-gray-700">{status.replace('-', ' ')}</span>
                    <span className="font-medium text-gray-900">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        status === 'completed' ? 'bg-green-600' :
                        status === 'in-progress' ? 'bg-accent' :
                        status === 'blocked' ? 'bg-red-600' :
                        status === 'review' ? 'bg-purple-600' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Team Performance</h4>
          <div className="space-y-4">
            {activeProject?.team.map((member) => (
              <div key={member._id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{member.name}</span>
                  <span className="font-medium text-gray-900">
                    {member.tasksCompleted}/{member.tasksAssigned} tasks
                  </span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full"
                    style={{ 
                      width: `${member.tasksAssigned > 0 
                        ? Math.round((member.tasksCompleted / member.tasksAssigned) * 100)
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Budget Breakdown</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Total Budget</span>
              <span className="font-semibold text-gray-900">{formatCurrency(activeProject?.budget || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Spent</span>
              <span className="font-semibold text-red-600">{formatCurrency(activeProject?.spent || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Remaining</span>
              <span className="font-semibold text-green-600">
                {formatCurrency((activeProject?.budget || 0) - (activeProject?.spent || 0))}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="w-full bg-gray-300 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-600 to-red-600 h-3 rounded-full"
                  style={{ 
                    width: `${activeProject?.budget && activeProject?.spent 
                      ? Math.min(Math.round((activeProject.spent / activeProject.budget) * 100), 100)
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Activity Summary</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-accent-dark" />
                <span className="text-sm font-medium text-gray-900">Tasks Created</span>
              </div>
              <span className="text-lg font-bold text-accent-dark">{activeProject?.tasks.length || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Tasks Completed</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {activeProject?.tasks.filter(t => t.status === 'completed').length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">Team Members</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{activeProject?.team.length || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">Documents</span>
              </div>
              <span className="text-lg font-bold text-orange-600">{activeProject?.documents.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    // Debug: Check if activeProject exists
    if (!activeProject) {
      return (
        <div className="bg-white rounded-lg border border-gray-300 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Project Found</h3>
          <p className="text-gray-600">Unable to load project data. Please try again.</p>
        </div>
      );
    }

    const isWorkspaceOwner = activeProject?.createdBy === state.userProfile?._id;
    const isProjectManager = (activeProject as any)?.projectManager === state.userProfile?._id || 
                            (activeProject as any)?.team?.some((m: any) => m._id === state.userProfile?._id && m.role === 'project-manager');
    const canEdit = isWorkspaceOwner || isProjectManager || currentUserRole === 'owner' || currentUserRole === 'manager';

    switch (activeView) {
      case 'overview':
        return renderProjectOverview();
      
      case 'info':
        return (
          <ProjectInfoTab
            project={activeProject}
            canEdit={canEdit}
            onUpdate={(updates) => {
              if (activeProject) {
                dispatch({
                  type: 'UPDATE_PROJECT',
                  payload: {
                    projectId: activeProject._id,
                    updates
                  }
                });
                setActiveProject({ ...activeProject, ...updates });
              }
            }}
          />
        );
      
      case 'team':
        return (
          <ProjectTeamTab
            projectId={activeProject?._id || ''}
            workspaceId={(activeProject as any)?.workspace || state.currentWorkspace || ''}
            projectTeam={(activeProject as any)?.teamMembers || []}
            projectManager={(activeProject as any)?.projectManager}
            isOwner={isWorkspaceOwner}
            isProjectManager={isProjectManager}
            onAddMember={async (memberId, role) => {
              try {
                console.log('🔄 [ADD MEMBER] Sending request:', { memberId, role, projectId: activeProject?._id });
                const response = await apiService.post(`/projects/${activeProject?._id}/members`, { userId: memberId, role });
                console.log('✅ [ADD MEMBER] Response received:', response.data);
                
                if (response.data.success) {
                  const updatedProject = response.data.data;
                  console.log('📊 [ADD MEMBER] Updated project team members:', updatedProject.teamMembers);
                  console.log('👤 [ADD MEMBER] Last member:', updatedProject.teamMembers[updatedProject.teamMembers.length - 1]);
                  
                  // Force immediate refresh by creating new object with new array reference
                  const refreshedProject = {
                    ...updatedProject,
                    teamMembers: [...updatedProject.teamMembers] // New array reference forces React re-render
                  };
                  
                  setActiveProject(refreshedProject);
                  dispatch({ type: 'UPDATE_PROJECT', payload: { projectId: activeProject?._id || '', updates: { teamMembers: refreshedProject.teamMembers } } });
                  dispatch({ type: 'ADD_TOAST', payload: { id: Date.now().toString(), type: 'success', message: `Member added successfully!`, duration: 3000 } });
                  
                  console.log('🔄 [ADD MEMBER] State updated, refreshing UI with', refreshedProject.teamMembers.length, 'members');
                }
              } catch (error) {
                console.error('❌ [ADD MEMBER] Failed to add team member:', error);
                console.error('❌ [ADD MEMBER] Error response:', (error as any).response?.data);
                dispatch({ type: 'ADD_TOAST', payload: { id: Date.now().toString(), type: 'error', message: 'Failed to add team member.', duration: 4000 } });
              }
            }}
            onRemoveMember={async (memberId) => {
              try {
                console.log('🗑️ [REMOVE MEMBER] Removing member:', memberId, 'from project:', activeProject?._id);
                console.log('🗑️ [REMOVE MEMBER] Current user ID:', state.userProfile._id);
                
                // Call API to remove member from database
                const response = await apiService.delete(`/projects/${activeProject?._id}/members/${memberId}`);
                console.log('✅ [REMOVE MEMBER] Response:', response.data);
                
                if (response.data.success) {
                  // Check if removed user is current user
                  if (memberId === state.userProfile._id) {
                    console.log('⚠️ [REMOVE MEMBER] Current user was removed from project, redirecting...');
                    dispatch({ 
                      type: 'ADD_TOAST', 
                      payload: { 
                        id: Date.now().toString(), 
                        type: 'info', 
                        message: 'You have been removed from this project', 
                        duration: 4000 
                      } 
                    });
                    
                    // Clear active project
                    setActiveProject(null);
                    
                    // Redirect to workspace
                    navigate('/workspace');
                    return;
                  }
                  
                  const updatedProject = response.data.data;
                  
                  // Force immediate refresh with new object reference
                  const refreshedProject = {
                    ...updatedProject,
                    teamMembers: [...updatedProject.teamMembers]
                  };
                  
                  setActiveProject(refreshedProject);
                  dispatch({
                    type: 'UPDATE_PROJECT',
                    payload: {
                      projectId: activeProject?._id || '',
                      updates: { teamMembers: refreshedProject.teamMembers }
                    }
                  });
                  dispatch({ 
                    type: 'ADD_TOAST', 
                    payload: { 
                      id: Date.now().toString(), 
                      type: 'success', 
                      message: 'Member removed successfully', 
                      duration: 3000 
                    } 
                  });
                  
                  console.log('🔄 [REMOVE MEMBER] State updated, team now has', refreshedProject.teamMembers.length, 'members');
                }
              } catch (error) {
                console.error('❌ [REMOVE MEMBER] Failed:', error);
                console.error('❌ [REMOVE MEMBER] Error details:', (error as any).response?.data);
                dispatch({ 
                  type: 'ADD_TOAST', 
                  payload: { 
                    id: Date.now().toString(), 
                    type: 'error', 
                    message: 'Failed to remove team member', 
                    duration: 4000 
                  } 
                });
              }
            }}
            onChangeProjectManager={(memberId) => {
              // Change project manager
              dispatch({
                type: 'UPDATE_PROJECT',
                payload: {
                  projectId: activeProject?._id || '',
                  updates: { projectManager: memberId }
                }
              });
            }}
            onUpdateMemberRole={async (memberId, newRole) => {
              try {
                console.log('🔄 [UPDATE ROLE] Starting role update...');
                console.log('🔄 [UPDATE ROLE] Member ID:', memberId);
                console.log('🔄 [UPDATE ROLE] New Role:', newRole);
                console.log('🔄 [UPDATE ROLE] Project ID:', activeProject?._id);
                console.log('🔄 [UPDATE ROLE] API URL:', `/projects/${activeProject?._id}/members/${memberId}/role`);
                console.log('🔄 [UPDATE ROLE] Request body:', { role: newRole });
                
                const response = await apiService.put(`/projects/${activeProject?._id}/members/${memberId}/role`, { role: newRole });
                console.log('✅ [UPDATE ROLE] Response received:', response.data);
                console.log('✅ [UPDATE ROLE] Response success:', response.data.success);
                console.log('✅ [UPDATE ROLE] Updated project:', response.data.data);
                
                if (response.data.success) {
                  const updatedProject = response.data.data;
                  console.log('✅ [UPDATE ROLE] Team members count:', updatedProject.teamMembers?.length);
                  
                  // Force immediate refresh with new object reference
                  const refreshedProject = {
                    ...updatedProject,
                    teamMembers: [...updatedProject.teamMembers]
                  };
                  
                  console.log('🔄 [UPDATE ROLE] Setting active project with refreshed data');
                  setActiveProject(refreshedProject);
                  dispatch({ 
                    type: 'UPDATE_PROJECT', 
                    payload: { 
                      projectId: activeProject?._id || '', 
                      updates: { teamMembers: refreshedProject.teamMembers } 
                    } 
                  });
                  dispatch({ 
                    type: 'ADD_TOAST', 
                    payload: { 
                      id: Date.now().toString(), 
                      type: 'success', 
                      message: `Member role updated to: ${newRole}`, 
                      duration: 3000 
                    } 
                  });
                  
                  console.log('🔄 [UPDATE ROLE] State updated, UI should refresh now');
                  
                  // Force reload project from server to ensure sync
                  console.log('🔄 [UPDATE ROLE] Force reloading project from server...');
                  const reloadResponse = await apiService.get(`/projects/${activeProject?._id}`);
                  if (reloadResponse.data.success) {
                    const reloadedProject = {
                      ...reloadResponse.data.data,
                      teamMembers: [...reloadResponse.data.data.teamMembers]
                    };
                    setActiveProject(reloadedProject);
                    console.log('✅ [UPDATE ROLE] Project reloaded successfully');
                  }
                }
              } catch (error) {
                console.error('❌ [UPDATE ROLE] Failed:', error);
                console.error('❌ [UPDATE ROLE] Error response:', (error as any).response?.data);
                console.error('❌ [UPDATE ROLE] Error status:', (error as any).response?.status);
                dispatch({ 
                  type: 'ADD_TOAST', 
                  payload: { 
                    id: Date.now().toString(), 
                    type: 'error', 
                    message: 'Failed to update member role', 
                    duration: 4000 
                  } 
                });
              }
            }}
          />
        );
      
      case 'tasks':
        // PM/Owner sees task assignment interface, employees see their tasks
        if (currentUserRole === 'owner' || currentUserRole === 'manager' || isProjectManager) {
          return (
            <ProjectTaskAssignmentTab
              projectId={activeProject?._id || ''}
              projectTeam={(activeProject as any)?.teamMembers || []}
              tasks={projectTasks}
              isProjectManager={true}
              currentUserId={state.userProfile?._id}
              onCreateTask={handleCreateTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onReassignTask={handleReassignTask}
            />
          );
        }
        // Employee view - only their assigned tasks
        return (
          <EmployeeTasksTab
            tasks={projectTasks}
            currentUserId={currentTestUserId}
            onUpdateTask={handleUpdateTask}
          />
        );
      
      case 'attendance': {
        const isManagerView = isWorkspaceOwner || isProjectManager || currentUserRole === 'owner' || currentUserRole === 'manager';
        
        // Map teamMembers to the format expected by attendance component
        const teamForAttendance = ((activeProject as any)?.teamMembers || []).map((tm: any) => {
          const user = typeof tm.user === 'object' ? tm.user : { _id: tm.user, fullName: 'Unknown', email: '' };
          return {
            _id: user._id,
            name: user.fullName || user.name || 'Unknown User',
            email: user.email || '',
            role: tm.role || 'member'
          };
        });
        
        if (isManagerView) {
          return (
            <ProjectAttendanceManagerTab
              projectId={activeProject?._id || ''}
              team={teamForAttendance}
            />
          );
        }
        return (
          <ProjectAttendanceEmployeeTab
            projectId={activeProject?._id || ''}
          />
        );
      }
      
      case 'timeline':
        return renderTimelineView();
      
      case 'progress':
        return <ProjectProgressTab project={activeProject} />;
      
      case 'workload':
        // Show Requests tab for employees and PM
        return (
          <ProjectRequestsTab
            projectId={activeProject?._id || ''}
            currentUserId={currentTestUserId}
            isProjectManager={isProjectManager || isWorkspaceOwner}
            requests={requests}
            tasks={projectTasks}
            teamMembers={project?.teamMembers || []}
            onCreateRequest={handleCreateRequest}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            onManualReassign={handleManualReassign}
            onManualDeadlineChange={handleManualDeadlineChange}
          />
        );
      
      case 'reports':
        return renderAnalyticsView(); // Reuse analytics for reports
      
      case 'documents':
        return renderDocumentsView();
      
      case 'inbox':
        return <WorkspaceInbox />;
      
      case 'settings':
        return (
          <div className="space-y-6">
            {/* Project Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Project Status</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Manage project status and completion progress
              </p>
              
              <div className="space-y-4">
                {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Status
                  </label>
                  <select
                    value={projectStatus}
                    onChange={(e) => setProjectStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                    <option value="archived">Archived</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {projectStatus === 'active' && 'Project is currently active and in progress'}
                    {projectStatus === 'completed' && 'Project has been completed'}
                    {projectStatus === 'paused' && 'Project is temporarily paused'}
                    {projectStatus === 'archived' && 'Project is archived and inactive'}
                  </p>
                </div>
              
                {/* Progress Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Completion Progress
                    </label>
                    <span className="text-lg font-bold text-accent">
                      {projectProgress}%
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={projectProgress}
                    onChange={(e) => setProjectProgress(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
                    style={{
                      background: `linear-gradient(to right, #FFD700 0%, #FFD700 ${projectProgress}%, #e5e7eb ${projectProgress}%, #e5e7eb 100%)`
                    }}
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                {/* Status Indicator */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    projectProgress === 0 ? 'bg-gray-400' :
                    projectProgress < 25 ? 'bg-red-500' :
                    projectProgress < 50 ? 'bg-orange-500' :
                    projectProgress < 75 ? 'bg-yellow-500' :
                    projectProgress < 100 ? 'bg-blue-500' :
                    'bg-green-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {projectProgress === 0 ? 'Not Started' :
                     projectProgress < 25 ? 'Just Started' :
                     projectProgress < 50 ? 'In Progress' :
                     projectProgress < 75 ? 'More Than Half' :
                     projectProgress < 100 ? 'Almost Complete' :
                     'Completed'}
                  </span>
                </div>
                
                <button
                  onClick={async () => {
                    try {
                      console.log('💾 [SAVE PROJECT] Saving project status:', projectStatus);
                      console.log('💾 [SAVE PROJECT] Saving project progress:', projectProgress);
                      console.log('💾 [SAVE PROJECT] Project ID:', activeProject?._id);
                      
                      const response = await apiService.put(`/projects/${activeProject?._id}`, {
                        status: projectStatus,
                        progress: projectProgress
                      });
                      
                      console.log('✅ [SAVE PROJECT] Response:', response.data);
                      
                      // Update local project state
                      if (activeProject) {
                        setActiveProject({
                          ...activeProject,
                          status: projectStatus,
                          progress: projectProgress
                        });
                      }
                      
                      dispatch({
                        type: 'ADD_TOAST',
                        payload: {
                          id: Date.now().toString(),
                          type: 'success',
                          message: 'Project status and progress updated successfully',
                          duration: 3000
                        }
                      });
                    } catch (error) {
                      console.error('❌ [SAVE PROJECT] Failed:', error);
                      console.error('❌ [SAVE PROJECT] Error details:', (error as any).response?.data);
                      dispatch({
                        type: 'ADD_TOAST',
                        payload: {
                          id: Date.now().toString(),
                          type: 'error',
                          message: 'Failed to update project',
                          duration: 3000
                        }
                      });
                    }
                  }}
                  className="w-full px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover font-medium"
                >
                  Save Status & Progress
                </button>
              </div>
            </div>

            {/* Attendance Office Location */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Attendance Office Location</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Set your primary office location. This will be used as a reference for automatic attendance
                verification for this project.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={officeLatitude}
                    onChange={(e) => setOfficeLatitude(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm"
                    placeholder="e.g. 28.6139"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={officeLongitude}
                    onChange={(e) => setOfficeLongitude(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm"
                    placeholder="e.g. 77.2090"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('📍 [LOCATION] Requesting location permission...');
                      
                      if (!navigator.geolocation) {
                        console.error('❌ [LOCATION] Geolocation not supported');
                        dispatch({
                          type: 'ADD_TOAST',
                          payload: {
                            id: Date.now().toString(),
                            type: 'error',
                            message: 'Geolocation is not supported by this browser',
                            duration: 3000
                          }
                        });
                        return;
                      }
                      
                      dispatch({
                        type: 'ADD_TOAST',
                        payload: {
                          id: Date.now().toString(),
                          type: 'info',
                          message: 'Requesting location permission...',
                          duration: 2000
                        }
                      });
                      
                      // Request with high accuracy and timeout
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          console.log('✅ [LOCATION] Location detected:', pos.coords);
                          const lat = pos.coords.latitude.toFixed(6);
                          const lng = pos.coords.longitude.toFixed(6);
                          
                          setOfficeLatitude(lat);
                          setOfficeLongitude(lng);
                          
                          console.log('✅ [LOCATION] Set latitude:', lat, 'longitude:', lng);
                          
                          dispatch({
                            type: 'ADD_TOAST',
                            payload: {
                              id: Date.now().toString(),
                              type: 'success',
                              message: 'Location detected successfully',
                              duration: 3000
                            }
                          });
                        },
                        (error) => {
                          console.error('❌ [LOCATION] Error:', error);
                          console.error('❌ [LOCATION] Error code:', error.code);
                          console.error('❌ [LOCATION] Error message:', error.message);
                          
                          let errorMessage = 'Unable to detect location. ';
                          
                          switch(error.code) {
                            case error.PERMISSION_DENIED:
                              errorMessage += 'Please allow location permission in your browser settings.';
                              break;
                            case error.POSITION_UNAVAILABLE:
                              errorMessage += 'Location information is unavailable.';
                              break;
                            case error.TIMEOUT:
                              errorMessage += 'Location request timed out.';
                              break;
                            default:
                              errorMessage += 'An unknown error occurred.';
                          }
                          
                          dispatch({
                            type: 'ADD_TOAST',
                            payload: {
                              id: Date.now().toString(),
                              type: 'error',
                              message: errorMessage,
                              duration: 5000
                            }
                          });
                        },
                        {
                          enableHighAccuracy: true,
                          timeout: 10000,
                          maximumAge: 0
                        }
                      );
                    }}
                    className="w-full px-3 py-2 bg-accent text-gray-900 rounded-lg text-sm hover:bg-accent-hover font-medium"
                  >
                    📍 Use My Current Location
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!officeLatitude || !officeLongitude) {
                        dispatch({
                          type: 'ADD_TOAST',
                          payload: {
                            id: Date.now().toString(),
                            type: 'error',
                            message: 'Please enter both latitude and longitude',
                            duration: 3000
                          }
                        });
                        return;
                      }
                      
                      try {
                        console.log('💾 [SAVE LOCATION] Saving office location...');
                        console.log('💾 [SAVE LOCATION] Latitude:', officeLatitude);
                        console.log('💾 [SAVE LOCATION] Longitude:', officeLongitude);
                        console.log('💾 [SAVE LOCATION] Project ID:', activeProject?._id);
                        
                        const locationData = {
                          officeLocation: {
                            latitude: parseFloat(officeLatitude),
                            longitude: parseFloat(officeLongitude)
                          }
                        };
                        
                        console.log('💾 [SAVE LOCATION] Request data:', locationData);
                        
                        const response = await apiService.put(`/projects/${activeProject?._id}`, locationData);
                        
                        console.log('✅ [SAVE LOCATION] Response:', response.data);
                        
                        dispatch({
                          type: 'ADD_TOAST',
                          payload: {
                            id: Date.now().toString(),
                            type: 'success',
                            message: 'Office location saved successfully',
                            duration: 3000
                          }
                        });
                      } catch (error) {
                        console.error('❌ [SAVE LOCATION] Failed:', error);
                        console.error('❌ [SAVE LOCATION] Error details:', (error as any).response?.data);
                        console.error('❌ [SAVE LOCATION] Error status:', (error as any).response?.status);
                        dispatch({
                          type: 'ADD_TOAST',
                          payload: {
                            id: Date.now().toString(),
                            type: 'error',
                            message: 'Failed to save office location',
                            duration: 3000
                          }
                        });
                      }
                    }}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 font-medium"
                  >
                    💾 Save Location
                  </button>
                </div>
              </div>
              
              {officeLatitude && officeLongitude && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Current Location:</strong> {officeLatitude}, {officeLongitude}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${officeLatitude},${officeLongitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                  >
                    🗺️ View on Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return renderProjectOverview();
    }
  };

  // Keep existing handlers for task review
  const handleApproveTask = (taskId: string, rating: number, comments: string) => {
    const updates = {
      status: 'completed',
      rating: rating,
      reviewComments: comments,
      completedAt: new Date()
    };
    
    handleUpdateTask(taskId, updates);
    
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        message: `Task approved with ${rating} stars!`,
        duration: 3000
      }
    });
  };

  const handleRejectTask = (taskId: string, reason: string) => {
    const updates = {
      status: 'in-progress',
      reviewComments: `Rejected: ${reason}`
    };
    
    handleUpdateTask(taskId, updates);
    
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'info',
        message: 'Task sent back for revision',
        duration: 3000
      }
    });
  };

  const handleAddTeamMember = (memberId: string, role: string) => {
    // Mock implementation - replace with actual API call
    const newMember: TeamMember = {
      _id: memberId,
      name: 'New Member', // This would come from the workspace member data
      email: 'newmember@company.com',
      role: role as any,
      status: 'active',
      joinedAt: new Date(),
      permissions: {
        canEditTasks: role === 'owner' || role === 'manager',
        canCreateTasks: true,
        canDeleteTasks: role === 'owner' || role === 'manager',
        canManageTeam: role === 'owner',
        canViewAnalytics: role === 'owner' || role === 'manager'
      },
      workload: 0,
      tasksAssigned: 0,
      tasksCompleted: 0,
      rating: 0,
      lastActive: new Date()
    };

    if (activeProject) {
      setActiveProject({
        ...activeProject,
        team: [...activeProject.team, newMember]
      });
    }

    setShowAddMemberModal(false);
    dispatch({ 
      type: 'ADD_TOAST', 
      payload: { 
        type: 'success', 
        message: `Member added to project with role: ${role}` 
      } 
    });
  };

  return (
    <div className={`h-full flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {renderProjectHeader()}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderMainContent()}
          </div>
        </div>

        {/* Sidebar */}
        {renderSidebar()}
      </div>

      {/* Add Team Member Modal */}
      <AddTeamMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onAddMember={handleAddTeamMember}
        currentTeamIds={activeProject?.team.map(m => m._id) || []}
        workspaceId={state.currentWorkspace || sessionStorage.getItem('currentWorkspaceId') || undefined}
      />

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={showInviteMemberModal}
        onClose={() => setShowInviteMemberModal(false)}
        onInvite={(email, role, message) => {
          // Handle invite logic here
          dispatch({ 
            type: 'ADD_TOAST', 
            payload: { 
              type: 'success', 
              message: `Invitation sent to ${email} with role: ${role}` 
            } 
          });
          setShowInviteMemberModal(false);
        }}
      />

      {/* Task Creation Modal */}
      <TaskCreationModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onCreateTask={handleCreateTask}
        projectTeam={(activeProject as any)?.teamMembers || (activeProject as any)?.team || []}
        projectId={activeProject?._id || ''}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={showTaskDetail}
        onClose={() => {
          setShowTaskDetail(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        currentUserRole={currentUserRole}
        currentUserId={currentTestUserId}
      />

      {/* Task Review Modal */}
      <TaskReviewModal
        isOpen={showTaskReview}
        onClose={() => {
          setShowTaskReview(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onApprove={handleApproveTask}
        onReject={handleRejectTask}
      />
    </div>
  );
};

export default ProjectViewDetailed;
