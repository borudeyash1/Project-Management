import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, UserPlus, Search, Filter, MoreVertical, Edit, Trash2, 
  Eye, MessageSquare, Phone, Mail, Calendar, MapPin, Clock,
  Star, Award, TrendingUp, Target, BarChart3, Crown, Zap,
  Bot, Plus, CheckCircle, AlertCircle, XCircle, UserCheck,
  Settings, Shield, Key, Bell, Globe, Lock, Unlock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import UserDisplay from './UserDisplay';
import InviteMemberModal from './InviteMemberModal';
import teamService, { TeamResponse, TeamMemberResponse } from '../services/teamService';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'pending' | 'away';
  joinDate: Date;
  lastActive: Date;
  timezone: string;
  location: string;
  phone?: string;
  bio?: string;
  skills: string[];
  subscription?: {
    plan: 'free' | 'pro' | 'ultra';
  };
  projects: Array<{
    _id: string;
    name: string;
    role: string;
    progress: number;
    color: string;
  }>;
  performance: {
    rating: number;
    tasksCompleted: number;
    totalTasks: number;
    completionRate: number;
    productivityScore: number;
    averageRating: number;
  };
  permissions: {
    canCreateProjects: boolean;
    canManageTeam: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
    canInviteMembers: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  averageProductivity: number;
  topPerformers: TeamMember[];
  recentActivity: Array<{
    _id: string;
    type: 'joined' | 'left' | 'role_changed' | 'project_assigned';
    member: string;
    description: string;
    timestamp: Date;
  }>;
}

const normalizeMember = (member: TeamMemberResponse): TeamMember => {
  const name = member.user.fullName || member.user.username || member.user.email || 'Unknown';
  return {
    _id: member.user._id,
    name,
    email: member.user.email || '',
    avatar: member.user.avatarUrl,
    role: member.role,
    department: member.user.department || 'General',
    status: (member.status === 'inactive' ? 'inactive' : member.status === 'pending' ? 'pending' : member.status === 'on-leave' ? 'away' : 'active') as TeamMember['status'],
    joinDate: member.joinedAt ? new Date(member.joinedAt) : new Date(),
    lastActive: member.user.profile?.lastActive ? new Date(member.user.profile.lastActive) : new Date(),
    timezone: member.user.profile?.timezone || 'UTC',
    location: member.user.profile?.location || 'Remote',
    phone: member.user.profile?.contactNumber,
    bio: member.user.profile?.bio,
    skills: member.user.profile?.skills || [],
    subscription: { plan: 'free' },
    projects: [],
    performance: {
      rating: 0,
      tasksCompleted: 0,
      totalTasks: 0,
      completionRate: 0,
      productivityScore: 0,
      averageRating: 0,
    },
    permissions: {
      canCreateProjects: false,
      canManageTeam: member.role === 'leader' || member.role === 'senior',
      canViewReports: true,
      canManageSettings: member.role === 'leader',
      canInviteMembers: member.role === 'leader' || member.role === 'senior',
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  };
};

const TeamPage: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useApp();
  const { canAddTeamMember, canManageTeam, canUseAI } = useFeatureAccess();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'manager' | 'member' | 'viewer'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending' | 'away'>('all');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [activeTab, setActiveTab] = useState<'members' | 'orgchart' | 'capacity' | 'skills' | 'health'>('members');
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);

  const loadTeams = useCallback(async () => {
    if (!state.currentWorkspace) {
      setLoadingTeams(false);
      return;
    }

    setLoadingTeams(true);
    setTeamError(null);

    try {
      const teams = await teamService.getTeams(state.currentWorkspace);
      if (!teams.length) {
        setTeamMembers([]);
        setTeamStats(null);
        setLoadingTeams(false);
        return;
      }

      const team = teams[0];
      setActiveTeamId(team._id);
      const normalizedMembers = team.members.map(normalizeMember);
      setTeamMembers(normalizedMembers);

      const statsResponse = await teamService.getTeamStats(team._id);
      const avgProductivity = normalizedMembers.length
        ? Math.round(
            normalizedMembers.reduce((sum, member) => sum + member.performance.productivityScore, 0) /
              normalizedMembers.length,
          )
        : 0;

      setTeamStats({
        totalMembers: statsResponse.totalMembers,
        activeMembers: statsResponse.activeMembers,
        pendingInvites: normalizedMembers.filter((member) => member.status === 'pending').length,
        averageProductivity: avgProductivity,
        topPerformers: [...normalizedMembers]
          .sort((a, b) => b.performance.productivityScore - a.performance.productivityScore)
          .slice(0, 3),
        recentActivity: normalizedMembers.slice(0, 3).map((member, index) => ({
          _id: `${member._id}-${index}`,
          type: 'joined',
          member: member.name,
          description: `${member.name} (${member.role}) is active in ${member.department}`,
          timestamp: member.lastActive,
        })),
      });
    } catch (error) {
      console.error('[TeamPage] Failed to load teams', error);
      setTeamError((error as Error).message);
    } finally {
      setLoadingTeams(false);
    }
  }, [state.currentWorkspace]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  if (loadingTeams) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-1">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent border-b-2 border-gray-300"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading your teams...</p>
        </div>
      </div>
    );
  }

  if (teamError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="font-medium">Unable to load teams</p>
          <p className="text-sm">{teamError}</p>
        </div>
      </div>
    );
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'away': return 'text-orange-600 bg-orange-200';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-100';
      case 'manager': return 'text-accent-dark bg-blue-100';
      case 'member': return 'text-green-600 bg-green-100';
      case 'viewer': return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'away': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getFilteredMembers = () => {
    return teamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'all' || member.role === filterRole;
      const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  };

  const filteredMembers = getFilteredMembers();

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-700">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-300 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('team.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t('team.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            {canAddTeamMember() && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <UserPlus className="w-4 h-4" />
                {t('team.inviteMember')}
              </button>
            )}
            {canManageTeam() && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover"
              >
                <Plus className="w-4 h-4" />
                {t('team.addMember')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Cards */}
            {teamStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('team.totalMembers')}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{teamStats.totalMembers}</p>
                    </div>
                    <Users className="w-8 h-8 text-accent" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('team.activeMembers')}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{teamStats.activeMembers}</p>
                    </div>
                    <UserCheck className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('team.pendingInvites')}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{teamStats.pendingInvites}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('team.avgProductivity')}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{teamStats.averageProductivity}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 p-1">
              <div className="flex items-center gap-2">
                {[
                  { id: 'members', label: t('team.tabs.members'), icon: Users },
                  { id: 'orgchart', label: t('team.tabs.orgChart'), icon: Target },
                  { id: 'capacity', label: t('team.tabs.capacity'), icon: BarChart3 },
                  { id: 'skills', label: t('team.tabs.skills'), icon: Award },
                  { id: 'health', label: t('team.tabs.health'), icon: TrendingUp }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-accent text-gray-900 dark:text-gray-100'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder={t('team.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="all">{t('team.allRoles')}</option>
                    <option value="admin">{t('team.roleAdmin')}</option>
                    <option value="manager">Manager</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="all">{t('team.allStatus')}</option>
                    <option value="active">{t('team.online')}</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="away">Away</option>
                  </select>

                  <div className="flex items-center border border-gray-300 rounded-lg">
                    {[
                      { id: 'grid', icon: Target },
                      { id: 'list', icon: Users },
                      { id: 'table', icon: BarChart3 }
                    ].map(mode => {
                      const Icon = mode.icon;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setViewMode(mode.id as any)}
                          className={`p-2 ${viewMode === mode.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100'}`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'members' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('team.members')} ({filteredMembers.length})</h2>
              </div>
              
              {viewMode === 'grid' && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMembers.map(member => (
                    <div key={member._id} className="border border-gray-300 rounded-lg p-4 transition-shadow">
                      <div className="flex items-start gap-3 mb-3">
                        <UserDisplay
                          name={member.name}
                          plan={member.subscription?.plan || 'free'}
                          avatar={member.avatar}
                          size="md"
                          badgePosition="overlay"
                          className="flex-1"
                        />
                        
                        <div className="flex-1 min-w-0 ml-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{member.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                              {member.role}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                              {getStatusIcon(member.status)}
                              {member.status}
                            </span>
                          </div>
                        </div>
                        
                        <button className="text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">{t('team.department')}:</span> {member.department}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">{t('team.lastActive')}:</span> {formatLastActive(member.lastActive)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">{t('team.productivity')}:</span> {member.performance.productivityScore}%
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="flex-1 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700"
                        >
                          <Eye className="w-4 h-4 inline mr-1" />
                          {t('team.view')}
                        </button>
                        <button className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <div className="divide-y divide-gray-200">
                  {filteredMembers.map(member => (
                    <div key={member._id} className="p-4 hover:bg-gray-50 dark:bg-gray-700">
                      <div className="flex items-center gap-4">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{member.name}</h3>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                              {member.role}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                              {getStatusIcon(member.status)}
                              {member.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{member.email} • {member.department}</p>
                        </div>
                        
                        <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                          <div>{t('team.lastActive')}: {formatLastActive(member.lastActive)}</div>
                          <div>{t('team.productivity')}: {member.performance.productivityScore}%</div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedMember(member)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:bg-gray-700"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:bg-gray-700">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:bg-gray-700">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'table' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('team.members')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('team.role')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('team.status')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('team.department')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('team.productivity')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('team.lastActive')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('team.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredMembers.map(member => (
                        <tr key={member._id} className="hover:bg-gray-50 dark:bg-gray-700">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {member.avatar ? (
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {member.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                              {member.role}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                              {getStatusIcon(member.status)}
                              {member.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{member.department}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-300 rounded-full h-2">
                                <div
                                  className="bg-accent h-2 rounded-full"
                                  style={{ width: `${member.performance.productivityScore}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-900 dark:text-gray-100">{member.performance.productivityScore}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{formatLastActive(member.lastActive)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedMember(member)}
                                className="text-accent-dark hover:text-blue-900"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100">
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            )}

            {/* Organization Chart View */}
            {activeTab === 'orgchart' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('team.orgChart.title')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('team.orgChart.subtitle')}</p>
                <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                  <Target className="w-16 h-16 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                  <p className="text-lg font-medium">{t('team.orgChart.comingSoon')}</p>
                  <p className="text-sm mt-2">{t('team.orgChart.description')}</p>
                </div>
              </div>
            )}

            {/* Capacity Planning View */}
            {activeTab === 'capacity' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('team.capacity.title')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('team.capacity.subtitle')}</p>
                <div className="space-y-4">
                  {filteredMembers.map(member => (
                    <div key={member._id} className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{member.name.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{member.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t(`team.role${member.role}`)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">85%</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{t('team.capacity.utilization')}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t('team.capacity.weeklyCapacity')}</span>
                          <span className="font-medium">34h / 40h</span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-2">
                          <div className="bg-accent h-2 rounded-full" style={{ width: '85%' }} />
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {member.projects.map(project => (
                            <div key={project._id} className="text-xs">
                              <div className={`w-full h-1 rounded ${project.color} mb-1`} />
                              <span className="text-gray-600 dark:text-gray-400">{project.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Matrix View */}
            {activeTab === 'skills' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('team.skills.title')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('team.skills.subtitle')}</p>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-medium text-gray-900 dark:text-gray-100">{t('team.skills.teamMember')}</th>
                        {[
                          { key: 'react', label: 'React' },
                          { key: 'node', label: 'Node.js' },
                          { key: 'python', label: 'Python' },
                          { key: 'design', label: 'Design' },
                          { key: 'devops', label: 'DevOps' },
                          { key: 'testing', label: 'Testing' }
                        ].map(skill => (
                          <th key={skill.key} className="text-center p-3 font-medium text-gray-900 dark:text-gray-100">{t(`team.skills.${skill.key}`)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map(member => (
                        <tr key={member._id} className="border-b border-gray-300 hover:bg-gray-50 dark:bg-gray-700">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {member.avatar ? (
                                <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{member.name.charAt(0)}</span>
                                </div>
                              )}
                              <span className="font-medium text-gray-900 dark:text-gray-100">{member.name}</span>
                            </div>
                          </td>
                          {[
                            { key: 'react', label: 'React' },
                            { key: 'node', label: 'Node.js' },
                            { key: 'python', label: 'Python' },
                            { key: 'design', label: 'Design' },
                            { key: 'devops', label: 'DevOps' },
                            { key: 'testing', label: 'Testing' }
                          ].map(skill => {
                            const hasSkill = member.skills.some(s => s.toLowerCase().includes(skill.label.toLowerCase()));
                            const level = hasSkill ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2);
                            return (
                              <td key={skill.key} className="p-3 text-center">
                                <div className="flex justify-center gap-1">
                                  {[1, 2, 3, 4].map(star => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${star <= level ? 'text-yellow-500 fill-current' : 'text-gray-700'}`}
                                    />
                                  ))}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Team Health View */}
            {activeTab === 'health' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('team.health.title')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('team.health.subtitle')}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('team.health.burnoutRisk')}</h3>
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-green-600">25</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }} />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{t('team.health.lowRisk')}</p>
                  </div>

                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('team.health.satisfaction')}</h3>
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-accent-dark">4.2</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-5 h-5 ${star <= 4 ? 'text-yellow-500 fill-current' : 'text-gray-700'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{t('team.health.highSatisfaction')}</p>
                  </div>

                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('team.health.retentionRisk')}</h3>
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">95%</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{t('team.health.stable')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('team.health.individualScores')}</h3>
                  {filteredMembers.map(member => {
                    const healthScore = Math.floor(Math.random() * 30) + 70;
                    const riskLevel = healthScore >= 80 ? 'low' : healthScore >= 60 ? 'medium' : 'high';
                    const colorClass = riskLevel === 'low' ? 'bg-green-500' : riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500';
                    
                    return (
                      <div key={member._id} className="flex items-center gap-4 p-3 border border-gray-300 rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{member.name.charAt(0)}</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{member.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t(`team.role${member.role}`)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{healthScore}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{t('team.health.healthScore')}</div>
                          </div>
                          <div className="w-24 bg-gray-300 rounded-full h-2">
                            <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${healthScore}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Assistant */}
            {canUseAI() && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-5 h-5" />
                  <h3 className="font-semibold">{t('team.aiAssistant.title')}</h3>
                </div>
                <p className="text-sm text-purple-100 mb-3">
                  {t('team.aiAssistant.description')}
                </p>
                <button className="w-full bg-white dark:bg-gray-800 bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-2 text-sm font-medium transition-colors">
                  {t('team.aiAssistant.ask')}
                </button>
              </div>
            )}

            {/* Recent Activity */}
            {teamStats && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('team.recentActivity')}</h3>
                <div className="space-y-3">
                  {teamStats.recentActivity.map(activity => (
                    <div key={activity._id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-gray-100">{activity.description}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{formatLastActive(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Performers */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('team.topPerformers')}</h3>
              <div className="space-y-3">
                {teamMembers
                  .sort((a, b) => b.performance.productivityScore - a.performance.productivityScore)
                  .slice(0, 3)
                  .map((member, index) => (
                    <div key={member._id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{member.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{t(`team.role${member.role}`)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.performance.productivityScore}%</p>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{member.performance.averageRating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {selectedMember.avatar ? (
                    <img
                      src={selectedMember.avatar}
                      alt={selectedMember.name}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center">
                      <span className="text-2xl font-medium text-gray-600 dark:text-gray-400">
                        {selectedMember.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedMember.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedMember.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedMember.role)}`}>
                        {t(`team.role${selectedMember.role}`)}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMember.status)}`}>
                        {getStatusIcon(selectedMember.status)}
                        {t(`team.${selectedMember.status.toLowerCase()}`)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">{t('profile.personalInfo')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('team.department')}</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedMember.department}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('profile.location')}</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedMember.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timezone</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedMember.timezone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedMember.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Performance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Productivity Score</label>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedMember.performance.productivityScore}%</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Completion Rate</label>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedMember.performance.completionRate}%</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tasks Completed</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedMember.performance.tasksCompleted}/{selectedMember.performance.totalTasks}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Average Rating</label>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-900 dark:text-gray-100 ml-1">{selectedMember.performance.averageRating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Current Projects</h4>
                <div className="space-y-3">
                  {selectedMember.projects.map(project => (
                    <div key={project._id} className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${project.color}`} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{project.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{project.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.progress}%</p>
                        <div className="w-16 bg-gray-300 rounded-full h-2 mt-1">
                          <div
                            className="bg-accent h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-300 flex justify-end gap-2">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover">
                Edit Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={(email, role, message) => {
          // Handle invite logic here
          dispatch({ 
            type: 'ADD_TOAST', 
            payload: { 
              type: 'success', 
              message: `Invitation sent to ${email} with role: ${role}` 
            } 
          });
          setShowInviteModal(false);
        }}
      />
    </div>
  );
};

export default TeamPage;
