import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import ProjectInternalNav from './ProjectInternalNav';
import { apiService } from '../../services/api';
import { useTranslation } from 'react-i18next';

const ProjectLayout: React.FC = () => {
  const { state, dispatch } = useApp();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'none'>('none');
  const [prevPath, setPrevPath] = useState('');

  const project = state.projects.find(p => p._id === projectId);
  const workspace = state.workspaces.find(w => w._id === project?.workspace);

  // Get all projects in the same workspace for the dropdown
  const workspaceProjects = state.projects.filter(p => p.workspace === project?.workspace);

  // Tab order for determining slide direction (timeline removed)
  const tabOrder = [
    'overview', 'info', 'team', 'tasks',
    'progress', 'workload', 'reports', 'design', 'inbox', 'settings'
  ];

  // Redirect timeline to overview
  useEffect(() => {
    if (location.pathname.includes('/timeline')) {
      const newPath = location.pathname.replace('/timeline', '/overview');
      navigate(newPath, { replace: true });
    }
  }, [location.pathname, navigate]);

  // Determine slide direction based on navigation
  useEffect(() => {
    const currentTab = location.pathname.split('/').pop() || '';
    const previousTab = prevPath.split('/').pop() || '';

    const currentIndex = tabOrder.indexOf(currentTab);
    const previousIndex = tabOrder.indexOf(previousTab);

    if (currentIndex !== -1 && previousIndex !== -1) {
      if (currentIndex > previousIndex) {
        setSlideDirection('right'); // Moving forward, slide from right
      } else if (currentIndex < previousIndex) {
        setSlideDirection('left'); // Moving backward, slide from left
      } else {
        setSlideDirection('none');
      }
    } else {
      setSlideDirection('none');
    }

    setPrevPath(location.pathname);
  }, [location.pathname]);

  // Load project from API if not in state (handles page refresh)
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        console.log('❌ [PROJECT LAYOUT] No project ID provided');
        setLoading(false);
        return;
      }

      // Wait for user to be authenticated
      if (!state.userProfile?._id) {
        console.log('⏳ [PROJECT LAYOUT] Waiting for user authentication...');
        return; // Don't set loading to false, keep waiting
      }

      // Check if project already in state
      const existingProject = state.projects.find(p => p._id === projectId);
      if (existingProject) {
        console.log('✅ [PROJECT LAYOUT] Project found in state:', existingProject.name);
        setLoading(false);
        return;
      }

      // Fetch from API
      try {
        console.log('📥 [PROJECT LAYOUT] Fetching project from API:', projectId);
        const response = await apiService.get(`/projects/${projectId}`);

        if (response.success) {
          const fetchedProject = response.data;
          console.log('✅ [PROJECT LAYOUT] Project loaded:', fetchedProject.name);

          // Add to state
          dispatch({
            type: 'ADD_PROJECT',
            payload: fetchedProject
          });

          // Fetch workspace if needed
          if (fetchedProject.workspace && !state.workspaces.find(w => w._id === fetchedProject.workspace)) {
            console.log('📥 [PROJECT LAYOUT] Fetching workspace:', fetchedProject.workspace);
            try {
              const wsResponse = await apiService.get(`/workspaces/${fetchedProject.workspace}`);
              if (wsResponse.success) {
                console.log('✅ [PROJECT LAYOUT] Workspace loaded:', wsResponse.data.name);
                dispatch({
                  type: 'ADD_WORKSPACE',
                  payload: wsResponse.data
                });
              }
            } catch (wsError) {
              console.error('❌ [PROJECT LAYOUT] Failed to load workspace:', wsError);
            }
          }

          setLoading(false);
        } else {
          console.error('❌ [PROJECT LAYOUT] API returned success: false');
          setLoading(false);
        }
      } catch (error: any) {
        console.error('❌ [PROJECT LAYOUT] Failed to load project:', error);
        console.error('❌ [PROJECT LAYOUT] Error details:', error.response?.data);
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, state.userProfile?._id, state.projects, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-200">
            The project you're looking for doesn't exist
          </p>
        </div>
      </div>
    );
  }

  // Animation classes based on direction
  const getAnimationClass = () => {
    if (slideDirection === 'right') {
      return 'animate-slideInFromRight';
    } else if (slideDirection === 'left') {
      return 'animate-slideInFromLeft';
    }
    return 'animate-fadeIn';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Project Header with Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back to Workspace Button */}
            <button
              onClick={() => navigate(`/workspace/${workspace?._id}/overview`)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('projects.backToWorkspace')}
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-200">{workspace?.name}</span>
              <span className="text-gray-600">/</span>

              {/* Project Selector Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  {project.name}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-2 max-h-64 overflow-y-auto">
                    {workspaceProjects.map((proj) => (
                      <button
                        key={proj._id}
                        onClick={() => navigate(`/project/${proj._id}/overview`)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${proj._id === projectId
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-accent-dark dark:text-accent-light'
                          : 'text-gray-700 dark:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                      >
                        <div className="font-medium">{proj.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                          {proj.status} • {proj.progress}% complete
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Status Badge */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${project.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-600' :
              project.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-accent-light' :
                project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-600' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-200'
              }`}>
              {project.status}
            </span>
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${project.priority === 'critical' ? 'border-red-300 text-red-600' :
              project.priority === 'high' ? 'border-orange-300 text-orange-600' :
                project.priority === 'medium' ? 'border-yellow-300 text-yellow-600' :
                  'border-green-300 text-green-600'
              }`}>
              {project.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Project Internal Navigation */}
      <ProjectInternalNav />

      {/* Project Content with Directional Slide Animation */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div key={location.pathname} className={getAnimationClass()}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProjectLayout;
