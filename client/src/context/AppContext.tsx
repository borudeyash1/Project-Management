import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, User, Workspace, Project, Task, Toast } from '../types';

// Initial state
const initialState: AppState = {
  currentSection: 'login',
  currentWorkspace: 'NovaTech',
  currentProject: 'NovaTech Website',
  cwStep: 1,
  toasts: [],
  subscription: {
    plan: 'free' as const,
    status: 'active' as const,
    startDate: new Date(),
    autoRenew: false,
    billingCycle: 'monthly' as const,
    features: {
      maxWorkspaces: 1,
      maxProjects: 3,
      maxTeamMembers: 5,
      maxStorage: 1,
      aiAssistance: true,
      advancedAnalytics: false,
      customIntegrations: false,
      prioritySupport: false,
      whiteLabeling: false,
      apiAccess: false
    },
    isPro: false,
    trialEndsAt: undefined
  },
  roles: {
    currentUserRole: 'Member',
    permissions: {
      canCreateProject: true,
      canManageEmployees: false,
      canViewPayroll: false,
      canExportReports: true
    }
  },
  modals: {
    createWorkspace: false,
    createProject: false,
    workloadDeadline: false,
    taskDetails: false,
    taskRating: false,
    polls: false,
    leaderboard: false,
    payroll: false,
    exportReports: false,
    manageProject: false,
    documentsHub: false,
    timesheet: false,
    inviteEmployee: false,
    client: false,
    pricing: false,
    requestChange: false,
    notifications: false
  },
  userProfile: {
    _id: '1',
    fullName: 'Alex Johnson',
    email: 'alex@example.com',
    username: 'alexjohnson',
    phone: '+1 555-0102',
    designation: 'Product Manager',
    department: 'Product',
    location: 'Remote',
    about: 'Loves building delightful product experiences.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    isEmailVerified: true,
    isActive: true,
    subscription: {
      plan: 'free' as const,
      status: 'active' as const,
      startDate: new Date(),
      autoRenew: false,
      billingCycle: 'monthly' as const,
      features: {
        maxWorkspaces: 1,
        maxProjects: 3,
        maxTeamMembers: 5,
        maxStorage: 1,
        aiAssistance: true,
        advancedAnalytics: false,
        customIntegrations: false,
        prioritySupport: false,
        whiteLabeling: false,
        apiAccess: false
      },
      isPro: false,
      trialEndsAt: undefined
    },
    settings: {
      themeColor: 'yellow',
      darkMode: false,
      notifications: {
        inApp: true,
        email: true,
        push: false
      },
      calendar: {
        syncGoogle: false,
        syncOutlook: false,
        defaultView: 'month'
      },
      privacy: {
        profileVisibility: 'workspace',
        twoFactorAuth: false
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  settings: {
    themeColor: 'yellow',
    darkMode: false,
    notifications: {
      inApp: true,
      email: true,
      push: false
    },
    calendar: {
      syncGoogle: false,
      syncOutlook: false,
      defaultView: 'month'
    },
    privacy: {
      profileVisibility: 'workspace',
      twoFactorAuth: false
    }
  },
  taskDrawer: {
    isOpen: false,
    title: 'Task'
  },
  quickAddMenu: false,
  userMenu: false,
  sidebar: {
    collapsed: false
  },
  workspaces: [
    { 
      _id: '1',
      name: 'NovaTech', 
      type: 'team', 
      owner: '1',
      members: [],
      settings: {
        isPublic: false,
        allowMemberInvites: true,
        requireApprovalForJoining: true,
        defaultProjectPermissions: {
          canCreate: false,
          canManage: false,
          canView: true
        }
      },
      subscription: {
        plan: 'free',
        maxMembers: 5,
        maxProjects: 3,
        features: {
          advancedAnalytics: false,
          customFields: false,
          apiAccess: false,
          prioritySupport: false
        }
      },
      isActive: true,
      memberCount: 24,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    { 
      _id: '2',
      name: 'Alpha Corp', 
      type: 'team', 
      owner: '1',
      members: [],
      settings: {
        isPublic: false,
        allowMemberInvites: true,
        requireApprovalForJoining: true,
        defaultProjectPermissions: {
          canCreate: false,
          canManage: false,
          canView: true
        }
      },
      subscription: {
        plan: 'free',
        maxMembers: 5,
        maxProjects: 3,
        features: {
          advancedAnalytics: false,
          customFields: false,
          apiAccess: false,
          prioritySupport: false
        }
      },
      isActive: true,
      memberCount: 52,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  pendingWorkspaceRequests: [],
  mode: 'Personal',
  clients: [
    {
      _id: 'client_1',
      name: 'TechCorp Solutions',
      email: 'contact@techcorp.com',
      phone: '+1 555-0123',
      company: 'TechCorp Solutions Inc.',
      industry: 'Technology',
      website: 'https://techcorp.com',
      address: '123 Tech Street, San Francisco, CA 94105',
      contactPerson: 'John Smith',
      status: 'active',
      projectsCount: 3,
      totalRevenue: 150000,
      notes: 'Premium client, high priority',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    },
    {
      _id: 'client_2',
      name: 'DesignHub Agency',
      email: 'hello@designhub.io',
      phone: '+1 555-0456',
      company: 'DesignHub Creative Agency',
      industry: 'Design & Marketing',
      website: 'https://designhub.io',
      address: '456 Creative Ave, New York, NY 10001',
      contactPerson: 'Sarah Johnson',
      status: 'active',
      projectsCount: 2,
      totalRevenue: 85000,
      notes: 'Long-term partnership',
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date()
    },
    {
      _id: 'client_3',
      name: 'StartupX',
      email: 'team@startupx.com',
      phone: '+1 555-0789',
      company: 'StartupX Inc.',
      industry: 'E-commerce',
      website: 'https://startupx.com',
      address: '789 Innovation Blvd, Austin, TX 78701',
      contactPerson: 'Mike Chen',
      status: 'active',
      projectsCount: 1,
      totalRevenue: 45000,
      notes: 'Fast-growing startup, flexible deadlines',
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date()
    },
    {
      _id: 'client_4',
      name: 'Global Finance Corp',
      email: 'projects@globalfinance.com',
      phone: '+1 555-0321',
      company: 'Global Finance Corporation',
      industry: 'Finance & Banking',
      website: 'https://globalfinance.com',
      address: '321 Wall Street, New York, NY 10005',
      contactPerson: 'Emily Davis',
      status: 'active',
      projectsCount: 2,
      totalRevenue: 200000,
      notes: 'Enterprise client, strict compliance requirements',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date()
    },
    {
      _id: 'client_5',
      name: 'HealthTech Innovations',
      email: 'info@healthtech.io',
      phone: '+1 555-0654',
      company: 'HealthTech Innovations LLC',
      industry: 'Healthcare',
      website: 'https://healthtech.io',
      address: '654 Medical Plaza, Boston, MA 02108',
      contactPerson: 'Dr. Robert Wilson',
      status: 'inactive',
      projectsCount: 1,
      totalRevenue: 30000,
      notes: 'Project on hold, potential future work',
      createdAt: new Date('2024-04-15'),
      updatedAt: new Date()
    }
  ],
  projects: [
    {
      _id: '1',
      name: 'E-Commerce Platform Redesign',
      client: 'TechCorp Solutions',
      description: 'Complete redesign of the e-commerce platform with modern UI/UX',
      status: 'active',
      dueDate: new Date('2024-12-31'),
      startDate: new Date('2024-09-01'),
      priority: 'high',
      budget: {
        estimated: 75000,
        actual: 45000,
        currency: 'USD'
      },
      workspace: '1',
      createdBy: '1',
      progress: 65,
      teamMembers: [
        { 
          user: '2', 
          role: 'developer', 
          permissions: {
            canManageTasks: false,
            canManageTeam: false,
            canViewReports: true,
            canManageProject: false
          },
          joinedAt: new Date()
        },
        { 
          user: '3', 
          role: 'designer', 
          permissions: {
            canManageTasks: false,
            canManageTeam: false,
            canViewReports: true,
            canManageProject: false
          },
          joinedAt: new Date()
        }
      ],
      milestones: [],
      tags: ['E-commerce', 'UI/UX', 'React'],
      attachments: [],
      settings: {
        isPublic: false,
        allowMemberInvites: true,
        timeTracking: {
          enabled: true,
          requireApproval: false
        },
        notifications: {
          taskUpdates: true,
          milestoneReminders: true,
          deadlineAlerts: true
        }
      },
      isActive: true,
      teamMemberCount: 5,
      completedTasksCount: 12,
      totalTasksCount: 18,
      createdAt: new Date('2024-09-01'),
      updatedAt: new Date()
    },
    {
      _id: '2',
      name: 'Mobile App Development',
      client: 'TechCorp Solutions',
      description: 'Native iOS and Android app for customer engagement',
      status: 'active',
      dueDate: new Date('2025-02-28'),
      startDate: new Date('2024-10-01'),
      priority: 'critical',
      budget: {
        estimated: 120000,
        actual: 35000,
        currency: 'USD'
      },
      workspace: '1',
      createdBy: '1',
      progress: 30,
      teamMembers: [],
      milestones: [],
      tags: ['Mobile', 'iOS', 'Android', 'React Native'],
      attachments: [],
      settings: {
        isPublic: false,
        allowMemberInvites: true,
        timeTracking: {
          enabled: true,
          requireApproval: true
        },
        notifications: {
          taskUpdates: true,
          milestoneReminders: true,
          deadlineAlerts: true
        }
      },
      isActive: true,
      teamMemberCount: 4,
      completedTasksCount: 5,
      totalTasksCount: 22,
      createdAt: new Date('2024-10-01'),
      updatedAt: new Date()
    },
    {
      _id: '3',
      name: 'Brand Identity Refresh',
      client: 'DesignHub Agency',
      description: 'Complete brand identity redesign including logo, colors, and guidelines',
      status: 'active',
      dueDate: new Date('2024-11-30'),
      startDate: new Date('2024-09-15'),
      priority: 'medium',
      budget: {
        estimated: 35000,
        actual: 28000,
        currency: 'USD'
      },
      workspace: '1',
      createdBy: '1',
      progress: 80,
      teamMembers: [],
      milestones: [],
      tags: ['Branding', 'Design', 'Identity'],
      attachments: [],
      settings: {
        isPublic: false,
        allowMemberInvites: true,
        timeTracking: {
          enabled: true,
          requireApproval: false
        },
        notifications: {
          taskUpdates: true,
          milestoneReminders: true,
          deadlineAlerts: true
        }
      },
      isActive: true,
      teamMemberCount: 3,
      completedTasksCount: 15,
      totalTasksCount: 18,
      createdAt: new Date('2024-09-15'),
      updatedAt: new Date()
    },
    {
      _id: '4',
      name: 'Marketing Website',
      client: 'DesignHub Agency',
      description: 'Modern marketing website with CMS integration',
      status: 'planning',
      dueDate: new Date('2025-01-15'),
      startDate: new Date('2024-11-01'),
      priority: 'low',
      budget: {
        estimated: 25000,
        actual: 0,
        currency: 'USD'
      },
      workspace: '1',
      createdBy: '1',
      progress: 10,
      teamMembers: [],
      milestones: [],
      tags: ['Website', 'Marketing', 'CMS'],
      attachments: [],
      settings: {
        isPublic: false,
        allowMemberInvites: true,
        timeTracking: {
          enabled: true,
          requireApproval: false
        },
        notifications: {
          taskUpdates: true,
          milestoneReminders: true,
          deadlineAlerts: true
        }
      },
      isActive: true,
      teamMemberCount: 2,
      completedTasksCount: 1,
      totalTasksCount: 8,
      createdAt: new Date('2024-10-20'),
      updatedAt: new Date()
    },
    {
      _id: '5',
      name: 'E-commerce MVP',
      client: 'StartupX',
      description: 'Minimum viable product for online marketplace',
      status: 'active',
      dueDate: new Date('2024-12-15'),
      startDate: new Date('2024-10-01'),
      priority: 'high',
      budget: {
        estimated: 45000,
        actual: 22000,
        currency: 'USD'
      },
      workspace: '1',
      createdBy: '1',
      progress: 50,
      teamMembers: [],
      milestones: [],
      tags: ['MVP', 'E-commerce', 'Startup'],
      attachments: [],
      settings: {
        isPublic: false,
        allowMemberInvites: true,
        timeTracking: {
          enabled: true,
          requireApproval: false
        },
        notifications: {
          taskUpdates: true,
          milestoneReminders: true,
          deadlineAlerts: true
        }
      },
      isActive: true,
      teamMemberCount: 4,
      completedTasksCount: 8,
      totalTasksCount: 16,
      createdAt: new Date('2024-10-01'),
      updatedAt: new Date()
    },
    {
      _id: '6',
      name: 'Banking Portal Upgrade',
      client: 'Global Finance Corp',
      description: 'Security upgrade and feature enhancement for online banking',
      status: 'active',
      dueDate: new Date('2025-03-31'),
      startDate: new Date('2024-09-01'),
      priority: 'critical',
      budget: {
        estimated: 150000,
        actual: 60000,
        currency: 'USD'
      },
      workspace: '1',
      createdBy: '1',
      progress: 40,
      teamMembers: [],
      milestones: [],
      tags: ['Banking', 'Security', 'Enterprise'],
      attachments: [],
      settings: {
        isPublic: false,
        allowMemberInvites: false,
        timeTracking: {
          enabled: true,
          requireApproval: true
        },
        notifications: {
          taskUpdates: true,
          milestoneReminders: true,
          deadlineAlerts: true
        }
      },
      isActive: true,
      teamMemberCount: 8,
      completedTasksCount: 18,
      totalTasksCount: 45,
      createdAt: new Date('2024-09-01'),
      updatedAt: new Date()
    },
    {
      _id: '7',
      name: 'Financial Dashboard',
      client: 'Global Finance Corp',
      description: 'Real-time analytics dashboard for financial data',
      status: 'on-hold',
      dueDate: new Date('2025-04-30'),
      startDate: new Date('2024-10-15'),
      priority: 'medium',
      budget: {
        estimated: 50000,
        actual: 8000,
        currency: 'USD'
      },
      workspace: '1',
      createdBy: '1',
      progress: 15,
      teamMembers: [],
      milestones: [],
      tags: ['Dashboard', 'Analytics', 'Finance'],
      attachments: [],
      settings: {
        isPublic: false,
        allowMemberInvites: false,
        timeTracking: {
          enabled: true,
          requireApproval: true
        },
        notifications: {
          taskUpdates: true,
          milestoneReminders: true,
          deadlineAlerts: true
        }
      },
      isActive: true,
      teamMemberCount: 3,
      completedTasksCount: 2,
      totalTasksCount: 12,
      createdAt: new Date('2024-10-15'),
      updatedAt: new Date()
    },
    {
      _id: '8',
      name: 'Patient Portal',
      client: 'HealthTech Innovations',
      description: 'HIPAA-compliant patient management system',
      status: 'completed',
      dueDate: new Date('2024-09-30'),
      startDate: new Date('2024-06-01'),
      priority: 'high',
      budget: {
        estimated: 30000,
        actual: 30000,
        currency: 'USD'
      },
      workspace: '1',
      createdBy: '1',
      progress: 100,
      teamMembers: [],
      milestones: [],
      tags: ['Healthcare', 'HIPAA', 'Portal'],
      attachments: [],
      settings: {
        isPublic: false,
        allowMemberInvites: false,
        timeTracking: {
          enabled: true,
          requireApproval: true
        },
        notifications: {
          taskUpdates: true,
          milestoneReminders: true,
          deadlineAlerts: true
        }
      },
      isActive: false,
      teamMemberCount: 4,
      completedTasksCount: 20,
      totalTasksCount: 20,
      createdAt: new Date('2024-06-01'),
      updatedAt: new Date()
    }
  ],
  tasks: [
    {
      _id: '1',
      title: 'Design hero section',
      project: '1',
      workspace: '1',
      createdBy: '1',
      assignee: '2',
      status: 'in-progress',
      priority: 'high',
      type: 'task',
      dueDate: new Date('2024-10-20'),
      estimatedHours: 8,
      actualHours: 0,
      progress: 60,
      subtasks: [],
      dependencies: [],
      comments: [],
      attachments: [],
      tags: ['UI'],
      watchers: [],
      timeEntries: [],
      customFields: [],
      settings: {
        isPublic: false,
        allowComments: true,
        allowTimeTracking: true,
        requireApproval: false
      },
      isActive: true,
      subtaskCompletionPercentage: 0,
      totalTimeLogged: 0,
      commentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

// Action types
type AppAction =
  | { type: 'SET_SECTION'; payload: string }
  | { type: 'SET_WORKSPACE'; payload: string }
  | { type: 'SET_PROJECT'; payload: string }
  | { type: 'SET_MODE'; payload: string }
  | { type: 'SET_CW_STEP'; payload: number }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: number }
  | { type: 'TOGGLE_MODAL'; payload: keyof AppState['modals'] }
  | { type: 'TOGGLE_TASK_DRAWER'; payload: boolean }
  | { type: 'SET_TASK_DRAWER_TITLE'; payload: string }
  | { type: 'TOGGLE_QUICK_ADD' }
  | { type: 'TOGGLE_USER_MENU' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { projectId: string; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { taskId: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_WORKSPACE'; payload: Workspace }
  | { type: 'UPDATE_WORKSPACE'; payload: Partial<Workspace> & { _id: string } }
  | { type: 'ADD_PENDING_REQUEST'; payload: any }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['settings']> }
  | { type: 'UPDATE_SETTINGS_NESTED'; payload: { path: string[]; value: any } }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_WORKSPACES'; payload: Workspace[] }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'LOGOUT' };

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SECTION':
      return { ...state, currentSection: action.payload };
    case 'SET_WORKSPACE':
      return { ...state, currentWorkspace: action.payload };
    case 'SET_PROJECT':
      return { ...state, currentProject: action.payload };
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_CW_STEP':
      return { ...state, cwStep: action.payload };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((_, index) => index !== action.payload) };
    case 'TOGGLE_MODAL':
      return { 
        ...state, 
        modals: { 
          ...state.modals, 
          [action.payload]: !state.modals[action.payload] 
        } 
      };
    case 'TOGGLE_TASK_DRAWER':
      return { 
        ...state, 
        taskDrawer: { 
          ...state.taskDrawer, 
          isOpen: action.payload 
        } 
      };
    case 'SET_TASK_DRAWER_TITLE':
      return { 
        ...state, 
        taskDrawer: { 
          ...state.taskDrawer, 
          title: action.payload 
        } 
      };
    case 'TOGGLE_QUICK_ADD':
      return { ...state, quickAddMenu: !state.quickAddMenu };
    case 'TOGGLE_USER_MENU':
      return { ...state, userMenu: !state.userMenu };
    case 'TOGGLE_SIDEBAR':
      return { 
        ...state, 
        sidebar: { 
          ...state.sidebar, 
          collapsed: !state.sidebar.collapsed 
        } 
      };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project._id === action.payload.projectId ? { ...project, ...action.payload.updates } : project
        )
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project._id !== action.payload)
      };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task._id === action.payload.taskId ? { ...task, ...action.payload.updates } : task
        )
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task._id !== action.payload)
      };
    case 'ADD_WORKSPACE':
      return { ...state, workspaces: [...state.workspaces, action.payload] };
    case 'UPDATE_WORKSPACE':
      return {
        ...state,
        workspaces: state.workspaces.map(ws =>
          ws._id === action.payload._id ? { ...ws, ...action.payload } : ws
        )
      };
    case 'ADD_PENDING_REQUEST':
      return { ...state, pendingWorkspaceRequests: [...state.pendingWorkspaceRequests, action.payload] };
    case 'UPDATE_PROFILE':
      return { ...state, userProfile: { ...state.userProfile, ...action.payload } };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'UPDATE_SETTINGS_NESTED': {
      const { path, value } = action.payload;
      const newSettings = { ...state.settings };
      let cursor: any = newSettings;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        cursor[key] = { ...cursor[key] };
        cursor = cursor[key];
      }
      cursor[path[path.length - 1]] = value;
      return { ...state, settings: newSettings };
    }
    case 'SET_USER':
      return { ...state, userProfile: action.payload };
    case 'SET_WORKSPACES':
      return { ...state, workspaces: action.payload };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'LOGOUT':
      return { ...initialState };
    default:
      return state;
  }
}

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (index: number) => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const toast: Toast = {
      id: Date.now().toString(),
      message,
      type
    };
    dispatch({ type: 'ADD_TOAST', payload: toast });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      const index = state.toasts.findIndex(t => t.id === toast.id);
      if (index !== -1) {
        dispatch({ type: 'REMOVE_TOAST', payload: index });
      }
    }, 5000);
  };

  const removeToast = (index: number) => {
    dispatch({ type: 'REMOVE_TOAST', payload: index });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, addToast, removeToast }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
