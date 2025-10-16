import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutGrid, 
  Kanban, 
  Calendar, 
  Target, 
  Bell, 
  CalendarDays, 
  Settings, 
  BadgeDollarSign, 
  Briefcase, 
  Building2,
  ChevronsLeftRight
} from 'lucide-react';

const Sidebar = () => {
  const { state, dispatch } = useApp();

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const toggleModal = (modalName) => {
    dispatch({ type: 'TOGGLE_MODAL', payload: modalName });
  };

  const go = (section) => dispatch({ type: 'SET_SECTION', payload: section });

  const enterWorkspace = (name) => {
    dispatch({ type: 'SET_WORKSPACE', payload: name });
    dispatch({ type: 'SET_SECTION', payload: 'workspaceOwner' });
  };

  return (
    <aside className={`${state.sidebar.collapsed ? 'w-16' : 'w-64'} border-r border-border bg-white hidden md:flex flex-col transition-all`}>
      <div className="p-3">
        <button 
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        >
          <span className={state.sidebar.collapsed ? 'hidden' : ''}>Collapse</span>
          <ChevronsLeftRight className="w-4 h-4" />
        </button>
      </div>
      <nav className="px-2 pb-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 px-2 mb-2">Main</div>
        <button 
          className="nav-link w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100/60 text-sm"
          onClick={() => dispatch({ type: 'SET_SECTION', payload: 'dashboard' })}
        >
          <LayoutGrid className="w-5 h-5 text-slate-600" />
          <span className={state.sidebar.collapsed ? 'hidden' : ''}>Dashboard</span>
        </button>
        <button 
          className="nav-link w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100/60 text-sm"
          onClick={() => go('projects')}
        >
          <Kanban className="w-5 h-5 text-slate-600" />
          <span className={state.sidebar.collapsed ? 'hidden' : ''}>Projects</span>
        </button>
        <button 
          className="nav-link w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100/60 text-sm"
          onClick={() => go('planner')}
        >
          <Calendar className="w-5 h-5 text-slate-600" />
          <span className={state.sidebar.collapsed ? 'hidden' : ''}>Planner</span>
        </button>
        <button 
          className="nav-link w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100/60 text-sm"
          onClick={() => go('tracker')}
        >
          <Target className="w-5 h-5 text-slate-600" />
          <span className={state.sidebar.collapsed ? 'hidden' : ''}>Tracker</span>
        </button>
        <button 
          className="nav-link w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100/60 text-sm"
          onClick={() => go('reminders')}
        >
          <Bell className="w-5 h-5 text-slate-600" />
          <span className={state.sidebar.collapsed ? 'hidden' : ''}>Reminders</span>
        </button>
        <button 
          className="nav-link w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100/60 text-sm"
          onClick={() => go('reminders')}
        >
          <CalendarDays className="w-5 h-5 text-slate-600" />
          <span className={state.sidebar.collapsed ? 'hidden' : ''}>Calendar</span>
        </button>

        <div className="text-[10px] uppercase tracking-wider text-slate-500 px-2 mt-4 mb-2">Account</div>
        <button 
          className="nav-link w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100/60 text-sm"
          onClick={() => showToast('Settings', 'info')}
        >
          <Settings className="w-5 h-5 text-slate-600" />
          <span className={state.sidebar.collapsed ? 'hidden' : ''}>Settings</span>
        </button>
        <button 
          className="nav-link w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100/60 text-sm"
          onClick={() => toggleModal('pricing')}
        >
          <BadgeDollarSign className="w-5 h-5 text-slate-600" />
          <span className={state.sidebar.collapsed ? 'hidden' : ''}>Pricing</span>
        </button>

        <div className="text-[10px] uppercase tracking-wider text-slate-500 px-2 mt-4 mb-2">Workspaces</div>
        <button 
          className="nav-link w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100/60 text-sm"
          onClick={() => dispatch({ type: 'SET_SECTION', payload: 'workspace' })}
        >
          <Briefcase className="w-5 h-5 text-slate-600" />
          <span className={state.sidebar.collapsed ? 'hidden' : ''}>Discover & Join</span>
        </button>
        <div className="mt-1 space-y-1">
          {state.workspaces.map((workspace, index) => (
            <button
              key={index}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100/60 text-sm"
              onClick={() => enterWorkspace(workspace.name)}
            >
              <Building2 className="w-5 h-5 text-slate-600" />
              <span className={state.sidebar.collapsed ? 'hidden' : ''}>{workspace.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
