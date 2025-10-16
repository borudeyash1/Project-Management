import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';

const Header = () => {
  const { state, dispatch } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const userMenuRef = useRef(null);
  const quickAddRef = useRef(null);

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const toggleModal = (modalName) => {
    dispatch({ type: 'TOGGLE_MODAL', payload: modalName });
  };

  const handleLogout = () => {
    dispatch({ type: 'SET_SECTION', payload: 'login' });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(event.target)) {
        setShowQuickAdd(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-border">
      <div className="h-14 flex items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            className="h-8 w-8 rounded-md flex items-center justify-center text-white font-semibold tracking-tight shadow-sm hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 bg-yellow-500"
            onClick={() => dispatch({ type: 'SET_SECTION', payload: 'dashboard' })}
          >
            PX
          </button>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold tracking-tight">Proxima</div>
            <div className="text-[11px] text-slate-500">
              {state.currentWorkspace === 'NovaTech' ? 'Personal Mode' : `Workspace Mode — ${state.currentWorkspace}`}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 ml-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                className="w-full rounded-lg border border-border bg-yellow-100/50 pl-9 pr-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
                placeholder="Search projects, tasks, people..."
              />
            </div>
            <select 
              className="rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              value={state.mode || 'Personal'}
              onChange={(e)=>{
                const val = e.target.value; 
                dispatch({ type: 'SET_MODE', payload: val });
                if (val === 'Personal') dispatch({ type: 'SET_SECTION', payload: 'dashboard' });
                else { dispatch({ type: 'SET_WORKSPACE', payload: val }); dispatch({ type: 'SET_SECTION', payload: 'workspaceOwner' }); }
              }}
            >
              <option value="Personal">Personal mode</option>
              {state.workspaces.map(w => (
                <option key={w.name} value={w.name}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 shadow-sm bg-yellow-500"
            onClick={() => setShowQuickAdd(!showQuickAdd)}
          >
            <Plus className="w-4 h-4" />
            Quick add
          </button>
          <button 
            className="relative p-2 rounded-lg hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
            onClick={() => showToast('No new notifications', 'info')}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-yellow-500"></span>
          </button>
          <div className="relative" ref={userMenuRef}>
            <button 
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" 
                className="h-7 w-7 rounded-full object-cover" 
                alt="User"
              />
              <span className="hidden sm:block text-sm">Alex</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-lg p-2">
                <button 
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50 text-sm"
                  onClick={() => showToast('Profile', 'info')}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button 
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50 text-sm"
                  onClick={() => showToast('Settings', 'info')}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button 
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 text-sm"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Menu */}
      {showQuickAdd && (
        <div 
          ref={quickAddRef}
          className="absolute z-40 top-14 right-24 w-64 bg-white border border-border rounded-lg shadow-lg p-2"
        >
          <button 
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50 text-sm"
            onClick={() => showToast('New task', 'info')}
          >
            <div className="w-4 h-4">☑️</div>
            New Task
          </button>
          <button 
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50 text-sm"
            onClick={() => showToast('New project', 'info')}
          >
            <div className="w-4 h-4">📁</div>
            New Project
          </button>
          <button 
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50 text-sm"
            onClick={() => showToast('New client', 'info')}
          >
            <div className="w-4 h-4">👤</div>
            New Client
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
