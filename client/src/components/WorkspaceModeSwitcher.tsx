import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Building, Home, ChevronDown, Users, Settings, Crown } from 'lucide-react';

interface WorkspaceModeSwitcherProps {
  className?: string;
}

const WorkspaceModeSwitcher: React.FC<WorkspaceModeSwitcherProps> = ({ className = '' }) => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleModeChange = (mode: string, workspaceId?: string) => {
    dispatch({ type: 'SET_MODE', payload: mode });
    if (workspaceId) {
      dispatch({ type: 'SET_WORKSPACE', payload: workspaceId });
      
      // Navigate to workspace view
      const workspace = state.workspaces.find(w => w._id === workspaceId);
      if (workspace) {
        // Navigate to workspace overview
        navigate(`/workspace/${workspaceId}/overview`);
        
        // Show success message
        dispatch({ 
          type: 'ADD_TOAST', 
          payload: { 
            message: `Switched to ${workspace.name}`, 
            type: 'success' 
          } 
        });
      }
    } else if (mode === 'Personal') {
      // Navigate to personal mode
      navigate('/home');
      
      dispatch({ 
        type: 'ADD_TOAST', 
        payload: { 
          message: 'Switched to Personal Mode', 
          type: 'success' 
        } 
      });
    }
    setIsOpen(false);
  };

  const getCurrentModeDisplay = () => {
    if (state.mode === 'Personal') {
      return {
        icon: Home,
        label: 'Personal Mode',
        description: 'Individual workspace'
      };
    } else {
      const workspace = state.workspaces.find(w => w._id === state.currentWorkspace);
      return {
        icon: Building,
        label: workspace?.name || 'Workspace',
        description: 'Team workspace'
      };
    }
  };

  const currentMode = getCurrentModeDisplay();
  const CurrentIcon = currentMode.icon;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <CurrentIcon className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-900">{currentMode.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {/* Personal Mode */}
            <button
              onClick={() => handleModeChange('Personal')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                state.mode === 'Personal' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Home className="w-4 h-4" />
              <div>
                <div className="font-medium">Personal Mode</div>
                <div className="text-xs text-gray-600">Individual workspace</div>
              </div>
              {state.mode === 'Personal' && (
                <div className="ml-auto w-2 h-2 bg-accent rounded-full" />
              )}
            </button>

            {/* Divider */}
            <div className="my-2 border-t border-gray-200" />

            {/* Workspace Modes */}
            <div className="space-y-1">
              <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Workspaces
              </div>
              {state.workspaces.map(workspace => (
                <button
                  key={workspace._id}
                  onClick={() => handleModeChange('Workspace', workspace._id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    state.mode === 'Workspace' && state.currentWorkspace === workspace._id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{workspace.name}</span>
                      {workspace.owner === state.userProfile._id && (
                        <Crown className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      {workspace.memberCount} members • {workspace.type}
                    </div>
                  </div>
                  {state.mode === 'Workspace' && state.currentWorkspace === workspace._id && (
                    <div className="ml-auto w-2 h-2 bg-accent rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Quick Actions
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    dispatch({ type: 'TOGGLE_MODAL', payload: 'createWorkspace' });
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <Building className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Create Workspace</div>
                    <div className="text-xs text-gray-600">Start a new team workspace</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    // Navigate to workspace discovery
                    window.location.href = '/workspace';
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Discover Workspaces</div>
                    <div className="text-xs text-gray-600">Find and join teams</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default WorkspaceModeSwitcher;
