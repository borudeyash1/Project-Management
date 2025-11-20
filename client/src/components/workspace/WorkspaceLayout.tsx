import React from 'react';
import { Outlet } from 'react-router-dom';
import WorkspaceInternalNav from './WorkspaceInternalNav';
import { useApp } from '../../context/AppContext';

const WorkspaceLayout: React.FC = () => {
  const { state } = useApp();
  
  const currentWorkspace = state.workspaces.find(w => w._id === state.currentWorkspace);

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
