import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  currentSection: 'login',
  currentWorkspace: 'NovaTech',
  currentProject: 'NovaTech Website',
  cwStep: 1,
  toasts: [],
  modals: {
    createWorkspace: false,
    pricing: false,
    requestChange: false
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
  workspaces: [],
  pendingWorkspaceRequests: [],
  mode: 'Personal',
  projects: [
    {
      id: 1,
      name: 'NovaTech Website',
      client: 'NovaTech',
      status: 'Active',
      due: 'Oct 25',
      priority: 'High',
      assignees: [
        { name: 'Sam', avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=100&auto=format&fit=crop' },
        { name: 'Priya', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=100&auto=format&fit=crop' }
      ]
    },
    {
      id: 2,
      name: 'Mobile App',
      client: 'Acme',
      status: 'On Hold',
      due: 'Nov 10',
      priority: 'Medium',
      assignees: [
        { name: 'Alex', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop' },
        { name: 'Priya', avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=100&auto=format&fit=crop' }
      ]
    },
    {
      id: 3,
      name: 'HR Policy Revamp',
      client: 'Internal',
      status: 'Completed',
      due: 'Sep 18',
      priority: 'Low',
      assignees: [
        { name: 'Alex', avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=100&auto=format&fit=crop' }
      ]
    }
  ],
  tasks: [
    {
      id: 1,
      title: 'Design hero section',
      project: 'NovaTech Website',
      category: 'UI',
      assignee: { name: 'Sam', avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=100&auto=format&fit=crop' },
      status: 'In Progress',
      due: 'Oct 20'
    },
    {
      id: 2,
      title: 'Implement responsive grid',
      project: 'NovaTech Website',
      category: 'Frontend',
      assignee: { name: 'Priya', avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=100&auto=format&fit=crop' },
      status: 'Backlog',
      due: 'Oct 23'
    },
    {
      id: 3,
      title: 'Final QA pass',
      project: 'NovaTech Website',
      category: 'QA',
      assignee: { name: 'Alex', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop' },
      status: 'At Risk',
      due: 'Oct 27'
    }
  ]
};

function appReducer(state, action) {
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
    case 'ADD_WORKSPACE':
      return { ...state, workspaces: [...state.workspaces, action.payload] };
    case 'ADD_PENDING_REQUEST':
      return { ...state, pendingWorkspaceRequests: [...state.pendingWorkspaceRequests, action.payload] };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
