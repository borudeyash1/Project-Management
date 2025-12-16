import React, { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import WorkspaceInternalNav from './WorkspaceInternalNav';
import { useApp } from '../../context/AppContext';

const WorkspaceLayout: React.FC = () => {
  const { state, dispatch } = useApp();
  const { workspaceId } = useParams<{ workspaceId: string }>();

  // Sync URL workspaceId with global state
  useEffect(() => {
    if (workspaceId && workspaceId !== state.currentWorkspace && state.workspaces.length > 0) {
      const workspaceExists = state.workspaces.some(w => w._id === workspaceId);
      if (workspaceExists) {
        console.log('[WorkspaceLayout] Syncing URL workspace ID to state:', workspaceId);
        dispatch({ type: 'SET_WORKSPACE', payload: workspaceId });
      }
    }
  }, [workspaceId, state.currentWorkspace, state.workspaces, dispatch]);

  // Use URL param as priority for rendering to avoid flash of wrong workspace
  const displayWorkspaceId = workspaceId || state.currentWorkspace;
  const currentWorkspace = state.workspaces.find(w => w._id === displayWorkspaceId);

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No Workspace Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-200">
            Please select a workspace from the sidebar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Workspace Internal Navigation */}
      <WorkspaceInternalNav />

      {/* Workspace Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <Outlet />
      </div>
    </div>
  );
};

export default WorkspaceLayout;
