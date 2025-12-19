import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Users, Building2, Plus, Eye, EyeOff, Bot, Zap, Lock, CheckCircle, Loader2, Clock, X, Compass, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useDock } from '../context/DockContext';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import CreateAIWorkspaceModal from './CreateAIWorkspaceModal';
import { PlanStatus } from './FeatureRestriction';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import api from '../services/api';
import { SubscriptionPlanData } from '../services/api';
import GlassmorphicPageHeader from './ui/GlassmorphicPageHeader';
import GlassmorphicCard from './ui/GlassmorphicCard';

interface Workspace {
  _id: string;
  name: string;
  description?: string;
  type: 'team' | 'enterprise';
  region?: string;
  memberCount: number;
  owner: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
  };
  settings: {
    isPublic: boolean;
    allowMemberInvites: boolean;
    requireApprovalForJoining: boolean;
  };
  createdAt: Date;
  hasPendingJoinRequest?: boolean;
}

const WorkspaceDiscover: React.FC = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { state, dispatch } = useApp();
  const { dockPosition } = useDock();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState<Workspace[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAICreateModal, setShowAICreateModal] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlanData[]>([]);
  const [requestingWorkspaceId, setRequestingWorkspaceId] = useState<string | null>(null);
  const [cancellingWorkspaceId, setCancellingWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const planData = await api.getSubscriptionPlans();
        setSubscriptionPlans(planData);
      } catch (error) {
        console.error('Failed to load subscription plans', error);
      }
    };

    const loadWorkspaces = async () => {
      try {
        console.log('[WorkspaceDiscover] Starting to load workspaces...');

        // Load discover workspaces for display
        const apiWorkspaces = await api.getDiscoverWorkspaces();
        console.log('[WorkspaceDiscover] API returned workspaces:', apiWorkspaces);
        console.log('[WorkspaceDiscover] Number of workspaces:', apiWorkspaces?.length || 0);

        const normalized: Workspace[] = (apiWorkspaces || []).map((ws: any) => ({
          _id: ws._id,
          name: ws.name,
          description: ws.description,
          type: ws.type,
          region: ws.region,
          memberCount: ws.memberCount ?? 0,
          owner: ws.owner,
          settings: ws.settings || {
            isPublic: false,
            allowMemberInvites: true,
            requireApprovalForJoining: true
          },
          createdAt: ws.createdAt ? new Date(ws.createdAt) : new Date(),
          hasPendingJoinRequest: ws.hasPendingJoinRequest || false
        }));

        console.log('[WorkspaceDiscover] Normalized workspaces:', normalized);
        setWorkspaces(normalized);
        setFilteredWorkspaces(normalized);

        // Also refresh the global workspaces state to update dock navigation
        try {
          console.log('[WorkspaceDiscover] Refreshing user workspaces...');
          const userWorkspaces = await api.getWorkspaces();
          console.log('[WorkspaceDiscover] User workspaces:', userWorkspaces);
          dispatch({ type: 'SET_WORKSPACES', payload: userWorkspaces });
        } catch (error) {
          console.error('[WorkspaceDiscover] Failed to refresh user workspaces', error);
        }
      } catch (error) {
        console.error('[WorkspaceDiscover] Failed to load workspaces for discovery', error);
        console.error('[WorkspaceDiscover] Error details:', {
          message: (error as Error).message,
          stack: (error as Error).stack
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
    loadWorkspaces();
  }, []);

  // Filter workspaces based on search and filters
  useEffect(() => {
    let filtered = workspaces;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(workspace =>
        workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workspace.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(workspace => workspace.type === selectedType);
    }

    // Region filter
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(workspace => workspace.region === selectedRegion);
    }

    setFilteredWorkspaces(filtered);
  }, [searchTerm, selectedType, selectedRegion, workspaces]);

  // Check if user is already a member of the workspace
  const isUserMember = (workspaceId: string) => {
    return state.workspaces.some(w => w._id === workspaceId);
  };

  // Check if user is the owner of the workspace
  const isUserOwner = (workspace: Workspace) => {
    const ownerId = typeof workspace.owner === 'string' ? workspace.owner : workspace.owner._id;
    return ownerId === state.userProfile._id;
  };

  const handleJoinRequest = async (workspaceId: string) => {
    setRequestingWorkspaceId(workspaceId);
    try {
      await api.sendJoinRequest(workspaceId);

      // Refresh workspaces to update membership status
      const userWorkspaces = await api.getWorkspaces();
      dispatch({ type: 'SET_WORKSPACES', payload: userWorkspaces });

      // Reload discover workspaces to get updated join request status
      const apiWorkspaces = await api.getDiscoverWorkspaces();
      const normalized: Workspace[] = (apiWorkspaces || []).map((ws: any) => ({
        _id: ws._id,
        name: ws.name,
        description: ws.description,
        type: ws.type,
        region: ws.region,
        memberCount: ws.memberCount ?? 0,
        owner: ws.owner,
        settings: ws.settings || {
          isPublic: false,
          allowMemberInvites: true,
          requireApprovalForJoining: true
        },
        createdAt: ws.createdAt ? new Date(ws.createdAt) : new Date(),
        hasPendingJoinRequest: ws.hasPendingJoinRequest || false
      }));
      setWorkspaces(normalized);
      setFilteredWorkspaces(normalized);

      // Show success message
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Join request sent successfully!',
          duration: 3000
        }
      });
    } catch (error) {
      console.error('Error joining workspace:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to send join request. Please try again.',
          duration: 3000
        }
      });
    } finally {
      setRequestingWorkspaceId(null);
    }
  };

  const handleCancelJoinRequest = async (workspaceId: string) => {
    setCancellingWorkspaceId(workspaceId);
    try {
      await api.cancelJoinRequest(workspaceId);

      // Reload discover workspaces to get updated join request status
      const apiWorkspaces = await api.getDiscoverWorkspaces();
      const normalized: Workspace[] = (apiWorkspaces || []).map((ws: any) => ({
        _id: ws._id,
        name: ws.name,
        description: ws.description,
        type: ws.type,
        region: ws.region,
        memberCount: ws.memberCount ?? 0,
        owner: ws.owner,
        settings: ws.settings || {
          isPublic: false,
          allowMemberInvites: true,
          requireApprovalForJoining: true
        },
        createdAt: ws.createdAt ? new Date(ws.createdAt) : new Date(),
        hasPendingJoinRequest: ws.hasPendingJoinRequest || false
      }));
      setWorkspaces(normalized);
      setFilteredWorkspaces(normalized);

      // Show success message
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Join request cancelled successfully!',
          duration: 3000
        }
      });
    } catch (error) {
      console.error('Error cancelling join request:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to cancel join request. Please try again.',
          duration: 3000
        }
      });
    } finally {
      setCancellingWorkspaceId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'enterprise':
        return <Building2 className="w-4 h-4" />;
      case 'team':
        return <Users className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      case 'team':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20'}`}>

      {/* Header */}
      <div
        className="pt-6 px-6 transition-all duration-300"
        style={{
          paddingLeft: dockPosition === 'left' ? '100px' : '24px',
          paddingRight: dockPosition === 'right' ? '100px' : '24px'
        }}
      >
        <GlassmorphicPageHeader
          title={t('workspace.discoverWorkspaces')}
          subtitle={t('workspace.findWorkspaces')}
          icon={Compass}
          decorativeGradients={{
            topRight: 'rgba(59, 130, 246, 0.2)',
            bottomLeft: 'rgba(147, 51, 234, 0.2)'
          }}
        />

        {/* Action Bar */}
        <GlassmorphicCard className="p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Globe className="w-4 h-4" />
            <span>Discover public workspaces or join by invitation</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('workspace.customWorkspace')}
            </button>
            <button
              onClick={() => setShowAICreateModal(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg font-semibold ${isDarkMode
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-purple-200 hover:bg-purple-50'
                }`}
            >
              <Bot className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-purple-600'}`} />
              <span>{t('workspace.aiPoweredWorkspace')}</span>
            </button>
          </div>
        </GlassmorphicCard>

        {/* Plan Status */}
        <div className="mb-6">
          <PlanStatus />
        </div>

        {/* Search and Filters */}
        <GlassmorphicCard className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('workspace.searchWorkspaces')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${isDarkMode
                    ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${isDarkMode
                  ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
            >
              <Filter className="w-4 h-4" />
              {t('workspace.filters')}
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Workspace Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${isDarkMode
                      ? 'bg-gray-800/50 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                    }`}
                >
                  <option value="all">All Types</option>
                  <option value="team">Team</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${isDarkMode
                      ? 'bg-gray-800/50 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                    }`}
                >
                  <option value="all">All Regions</option>
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia">Asia</option>
                  <option value="South America">South America</option>
                  <option value="Africa">Africa</option>
                  <option value="Oceania">Oceania</option>
                </select>
              </div>
            </div>
          )}
        </GlassmorphicCard>

        {/* Workspaces Grid */}
        <div className="mb-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <GlassmorphicCard key={index} className="p-6 animate-pulse">
                  <div className="h-4 bg-gray-400/20 rounded mb-2"></div>
                  <div className="h-3 bg-gray-400/20 rounded mb-4"></div>
                  <div className="h-3 bg-gray-400/20 rounded w-2/3"></div>
                </GlassmorphicCard>
              ))}
            </div>
          ) : filteredWorkspaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkspaces.map((workspace) => (
                <GlassmorphicCard key={workspace._id} className="p-6 hover:shadow-lg transition-all duration-300 group">
                  {/* Workspace Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-accent transition-colors">{workspace.name}</h3>
                        {workspace.settings.isPublic ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{workspace.description}</p>
                    </div>
                  </div>

                  {/* Workspace Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(workspace.type)}`}>
                        {getTypeIcon(workspace.type)}
                        {workspace.type.charAt(0).toUpperCase() + workspace.type.slice(1)}
                      </span>
                      {workspace.region && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">{workspace.region}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{workspace.memberCount} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <img
                          src={workspace.owner.avatarUrl || `https://ui-avatars.com/api/?name=${workspace.owner.fullName}&background=random`}
                          alt={workspace.owner.fullName}
                          className="w-4 h-4 rounded-full"
                        />
                        <span>{workspace.owner.fullName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Smart Action Button */}
                  <div className="mt-auto">
                    {isUserOwner(workspace) ? (
                      <button
                        onClick={() => navigate(`/workspace/${workspace._id}/overview`)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Manage Workspace
                      </button>
                    ) : isUserMember(workspace._id) ? (
                      <button
                        onClick={() => navigate(`/workspace/${workspace._id}/overview`)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Visit Workspace
                      </button>
                    ) : workspace.hasPendingJoinRequest ? (
                      <button
                        onClick={() => handleCancelJoinRequest(workspace._id)}
                        disabled={cancellingWorkspaceId === workspace._id}
                        className={`w-full px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium ${cancellingWorkspaceId === workspace._id
                          ? 'bg-red-500 text-white cursor-not-allowed'
                          : 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-md active:scale-95 shadow-lg shadow-orange-500/20'
                          }`}
                      >
                        {cancellingWorkspaceId === workspace._id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4" />
                            Pending
                            <X className="w-4 h-4 ml-auto" />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinRequest(workspace._id)}
                        disabled={requestingWorkspaceId === workspace._id}
                        className={`w-full px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium ${requestingWorkspaceId === workspace._id
                          ? 'bg-blue-500 text-white cursor-not-allowed'
                          : 'bg-accent text-gray-900 dark:text-gray-100 hover:bg-accent-hover hover:shadow-md active:scale-95 shadow-lg shadow-accent/20'
                          }`}
                      >
                        {requestingWorkspaceId === workspace._id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Join Request'
                        )}
                      </button>
                    )}
                  </div>
                </GlassmorphicCard>
              ))}
            </div>
          ) : (
            <GlassmorphicCard className="p-12 text-center">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <Building2 className="w-16 h-16 mx-auto opacity-50" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">{t('workspace.noWorkspacesFound')}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('workspace.tryAdjustingFilters')}
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedRegion('all');
                }}
                className="text-accent dark:text-accent-light hover:underline font-medium"
              >
                {t('workspace.clearAllFilters')}
              </button>
            </GlassmorphicCard>
          )}
        </div>
      </div>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <CreateWorkspaceModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* AI Create Workspace Modal */}
      {showAICreateModal && (
        <CreateAIWorkspaceModal
          isOpen={showAICreateModal}
          onClose={() => setShowAICreateModal(false)}
        />
      )}
    </div>
  );
};

export default WorkspaceDiscover;
