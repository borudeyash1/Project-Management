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
    isPro: false,
    trialEndsAt: undefined,
    plan: 'free'
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
      isPro: false,
      trialEndsAt: undefined,
      plan: 'free'
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
  projects: [
    {
      _id: '1',
      name: 'NovaTech Website',
      client: 'NovaTech',
      status: 'active',
      dueDate: new Date('2024-10-25'),
      priority: 'high',
      workspace: '1',
      createdBy: '1',
      progress: 75,
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
      tags: [],
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
      completedTasksCount: 0,
      totalTasksCount: 0,
      createdAt: new Date(),
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
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'ADD_WORKSPACE'; payload: Workspace }
  | { type: 'ADD_PENDING_REQUEST'; payload: any }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['settings']> }
  | { type: 'UPDATE_SETTINGS_NESTED'; payload: { path: string[]; value: any } }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_WORKSPACES'; payload: Workspace[] }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_TASKS'; payload: Task[] };

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
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'ADD_WORKSPACE':
      return { ...state, workspaces: [...state.workspaces, action.payload] };
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
    default:
      return state;
  }
}

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
