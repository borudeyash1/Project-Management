import React, { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import WorkspaceInternalNav from './WorkspaceInternalNav';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

const WorkspaceLayout: React.FC = () => {
  const { state, dispatch } = useApp();
  const { workspaceId } = useParams();
  const [loading, setLoading] = useState(true);
  
  const currentWorkspace = state.workspaces.find(w => w._id === (workspaceId || state.currentWorkspace));

  // Load workspace from API if not in state (handles page refresh)
  useEffect(() => {
    const loadWorkspace = async () => {
      const targetWorkspaceId = workspaceId || state.currentWorkspace;
      
      if (!targetWorkspaceId) {
        console.log('❌ [WORKSPACE LAYOUT] No workspace ID provided');
        setLoading(false);
        return;
      }

      // Wait for user to be authenticated
      if (!state.userProfile?._id) {
        console.log('⏳ [WORKSPACE LAYOUT] Waiting for user authentication...');
        return;
      }

      // Check if workspace already in state
      const existingWorkspace = state.workspaces.find(w => w._id === targetWorkspaceId);
      if (existingWorkspace) {
        console.log('✅ [WORKSPACE LAYOUT] Workspace found in state:', existingWorkspace.name);
        setLoading(false);
        return;
      }

      // Fetch from API
      try {
        console.log('📥 [WORKSPACE LAYOUT] Fetching workspace from API:', targetWorkspaceId);
        const response = await apiService.get(`/workspaces/${targetWorkspaceId}`);
        
        if (response.data.success) {
          const fetchedWorkspace = response.data.data;
          console.log('✅ [WORKSPACE LAYOUT] Workspace loaded:', fetchedWorkspace.name);
          
          // Add to state
          dispatch({
            type: 'ADD_WORKSPACE',
            payload: fetchedWorkspace
          });
          
          // Set as current workspace
          dispatch({
            type: 'SET_WORKSPACE',
            payload: fetchedWorkspace._id
          });
          
          setLoading(false);
        } else {
          console.error('❌ [WORKSPACE LAYOUT] API returned success: false');
          setLoading(false);
        }
      } catch (error: any) {
        console.error('❌ [WORKSPACE LAYOUT] Failed to load workspace:', error);
        console.error('❌ [WORKSPACE LAYOUT] Error details:', error.response?.data);
        setLoading(false);
      }
    };

    loadWorkspace();
  }, [workspaceId, state.currentWorkspace, state.userProfile?._id, state.workspaces, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Workspace Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-200">
            The workspace you're looking for doesn't exist
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
