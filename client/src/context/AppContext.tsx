import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, User, Workspace, Project, Task, Toast } from '../types';
import apiService from '../services/api';

// Initial state
const emptySubscription = {
  plan: 'free' as const,
  status: 'inactive' as const,
  startDate: new Date(),
  autoRenew: false,
  billingCycle: 'monthly' as const,
  features: {
    maxWorkspaces: 1,
    maxProjects: 1,
    maxTeamMembers: 1,
    maxStorage: 1,
    aiAssistance: false,
    advancedAnalytics: false,
    customIntegrations: false,
    prioritySupport: false,
    whiteLabeling: false,
    apiAccess: false
  },
  isPro: false,
  trialEndsAt: undefined
};

const emptyUser: User = {
  _id: '',
  fullName: '',
  email: '',
  username: '',
  isEmailVerified: false,
  isActive: false,
  subscription: emptySubscription,
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
};

const initialState: AppState = {
  currentSection: '',
  currentWorkspace: '',
  currentProject: '',
  cwStep: 1,
  toasts: [],
  isAuthLoading: true,
  subscription: emptySubscription,
  roles: {
    currentUserRole: 'Member',
    permissions: {
      canCreateProject: false,
      canManageEmployees: false,
      canViewPayroll: false,
      canExportReports: false
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
  userProfile: emptyUser,
  settings: emptyUser.settings,
  taskDrawer: {
    isOpen: false,
    title: 'Task'
  },
  quickAddMenu: false,
  userMenu: false,
  sidebar: {
    collapsed: false
  },
  workspaces: [],
  pendingWorkspaceRequests: [],
  mode: 'Personal',
  clients: [],
  projects: [],
  tasks: []
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
  | { type: 'LOGOUT' }
  | { type: 'SET_AUTH_LOADING'; payload: boolean };

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
    case 'SET_AUTH_LOADING':
      return { ...state, isAuthLoading: action.payload };
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

  useEffect(() => {
    const bootstrapSession = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        dispatch({ type: 'SET_USER', payload: emptyUser });
        dispatch({ type: 'SET_WORKSPACES', payload: [] });
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
        return;
      }

      try {
        const userResponse = await apiService.getCurrentUser();
        dispatch({ type: 'SET_USER', payload: userResponse });

        const workspaces = await apiService.getWorkspaces();

        if (workspaces.length > 0) {
          dispatch({ type: 'SET_WORKSPACES', payload: workspaces });
          dispatch({ type: 'SET_WORKSPACE', payload: workspaces[0]._id });
          dispatch({ type: 'SET_MODE', payload: 'Workspace' });
        } else {
          dispatch({ type: 'SET_WORKSPACES', payload: [] });
        }
      } catch (error) {
        console.error('[AppProvider] Failed to bootstrap session', error);
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            await apiService.refreshToken();
            const refreshedUser = await apiService.getCurrentUser();
            dispatch({ type: 'SET_USER', payload: refreshedUser });
            const workspaces = await apiService.getWorkspaces();

            if (workspaces.length > 0) {
              dispatch({ type: 'SET_WORKSPACES', payload: workspaces });
              dispatch({ type: 'SET_WORKSPACE', payload: workspaces[0]._id });
              dispatch({ type: 'SET_MODE', payload: 'Workspace' });
            } else {
              dispatch({ type: 'SET_WORKSPACES', payload: [] });
            }
            return;
          } catch (refreshError) {
            console.error('[AppProvider] Refresh attempt failed', refreshError);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            dispatch({ type: 'SET_USER', payload: emptyUser });
            dispatch({ type: 'SET_WORKSPACES', payload: [] });
            dispatch({ type: 'SET_MODE', payload: 'Personal' });
            return;
          }
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        dispatch({ type: 'SET_USER', payload: emptyUser });
        dispatch({ type: 'SET_WORKSPACES', payload: [] });
        dispatch({ type: 'SET_MODE', payload: 'Personal' });
      } finally {
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
      }
    };

    bootstrapSession();
  }, []);

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
