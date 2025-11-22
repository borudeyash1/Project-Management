import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Users, Building2, Plus, Eye, EyeOff, Bot, Zap, Lock, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import CreateAIWorkspaceModal from './CreateAIWorkspaceModal';
import { PlanStatus } from './FeatureRestriction';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import api from '../services/api';
import { SubscriptionPlanData } from '../services/api';

interface Workspace {
  _id: string;
  name: string;
  description?: string;
  type: 'personal' | 'team' | 'enterprise';
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
}

const WorkspaceDiscover: React.FC = () => {
  const { state, dispatch } = useApp();
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
        // Load discover workspaces for display
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
          createdAt: ws.createdAt ? new Date(ws.createdAt) : new Date()
        }));

        setWorkspaces(normalized);
        setFilteredWorkspaces(normalized);

        // Also refresh the global workspaces state to update dock navigation
        try {
          const userWorkspaces = await api.getWorkspaces();
          dispatch({ type: 'SET_WORKSPACES', payload: userWorkspaces });
        } catch (error) {
          console.error('Failed to refresh user workspaces', error);
        }
      } catch (error) {
        console.error('Failed to load workspaces for discovery', error);
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
    try {
      await api.sendJoinRequest(workspaceId);
      
      // Refresh workspaces to update membership status
      const userWorkspaces = await api.getWorkspaces();
      dispatch({ type: 'SET_WORKSPACES', payload: userWorkspaces });
      
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
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white border border-border rounded-xl">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Discover Workspaces</h1>
              <p className="text-sm text-gray-600 mt-1">
                Find and join workspaces that match your interests
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Custom Workspace
              </button>
              <button
                onClick={() => setShowAICreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                <Bot className="w-4 h-4" />
                AI-Powered Workspace
              </button>
            </div>
          </div>
        </div>

        {/* Plan Status */}
        <div className="p-6 border-b border-border">
          <PlanStatus />
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="personal">Personal</option>
                  <option value="team">Team</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
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
        </div>

        {/* Workspaces Grid */}
        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-100 rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-400 rounded mb-2"></div>
                  <div className="h-3 bg-gray-400 rounded mb-4"></div>
                  <div className="h-3 bg-gray-400 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredWorkspaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkspaces.map((workspace) => (
                <div key={workspace._id} className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow">
                  {/* Workspace Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{workspace.name}</h3>
                        {workspace.settings.isPublic ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{workspace.description}</p>
                    </div>
                  </div>

                  {/* Workspace Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(workspace.type)}`}>
                        {getTypeIcon(workspace.type)}
                        {workspace.type.charAt(0).toUpperCase() + workspace.type.slice(1)}
                      </span>
                      {workspace.region && (
                        <span className="text-xs text-gray-600">{workspace.region}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
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
                        <span>by {workspace.owner.fullName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Smart Action Button */}
                  {isUserOwner(workspace) ? (
                    <button
                      onClick={() => navigate(`/workspace/${workspace._id}/overview`)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Manage Workspace
                    </button>
                  ) : isUserMember(workspace._id) ? (
                    <button
                      onClick={() => navigate(`/workspace/${workspace._id}/overview`)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Visit Workspace
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinRequest(workspace._id)}
                      className="w-full px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
                    >
                      Send Join Request
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-600 mb-4">
                <Building2 className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters to find more workspaces.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedRegion('all');
                }}
                className="text-accent-dark hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
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
