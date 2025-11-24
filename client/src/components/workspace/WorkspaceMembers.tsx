import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import {
  Search,
  UserPlus,
  Mail,
  MoreVertical,
  Crown,
  Shield,
  User as UserIcon,
  Trash2,
  Edit,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';
import UserDisplay from '../UserDisplay';

interface Member {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'member';
  position: string;
  avatar?: string;
  subscription?: {
    plan: 'free' | 'pro' | 'ultra';
  };
  joinedAt: Date;
  status: 'active' | 'inactive';
}

interface JoinRequest {
  id: string;
  name: string;
  email: string;
  message?: string;
  requestedAt: Date;
  status: 'pending' | 'accepted' | 'declined';
}

const WorkspaceMembers: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [directoryQuery, setDirectoryQuery] = useState('');
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([
    {
      id: 'jr_1',
      name: 'Priya Khanna',
      email: 'priya.khanna@example.com',
      message: 'Working on Q1 OKRs, please add me to collaborate.',
      requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'pending'
    },
    {
      id: 'jr_2',
      name: 'Rahul Shah',
      email: 'rahul.shah@example.com',
      message: 'Need access to update customer dashboards.',
      requestedAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
      status: 'pending'
    }
  ]);

  const currentWorkspace = state.workspaces.find(w => w._id === state.currentWorkspace);
  const isOwner = currentWorkspace?.owner === state.userProfile._id;

  const [members, setMembers] = useState<Member[]>([
    {
      _id: state.userProfile._id,
      name: state.userProfile.fullName,
      email: state.userProfile.email,
      role: 'owner',
      position: 'Workspace Owner',
      subscription: state.userProfile.subscription,
      joinedAt: new Date('2024-01-01'),
      status: 'active'
    },
    {
      _id: '2',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      position: 'Project Manager',
      subscription: { plan: 'pro' },
      joinedAt: new Date('2024-02-15'),
      status: 'active'
    },
    {
      _id: '3',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'member',
      position: 'Frontend Developer',
      subscription: { plan: 'free' },
      joinedAt: new Date('2024-03-10'),
      status: 'active'
    }
  ]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return { icon: Crown, color: 'text-yellow-600', bg: 'bg-yellow-100', label: t('workspace.members.role.owner') };
      case 'admin':
        return { icon: Shield, color: 'text-purple-600', bg: 'bg-purple-100', label: t('workspace.members.role.admin') };
      case 'manager':
        return { icon: UserIcon, color: 'text-accent-dark', bg: 'bg-blue-100', label: t('workspace.members.role.manager') };
      default:
        return { icon: UserIcon, color: 'text-gray-600', bg: 'bg-gray-100', label: t('workspace.members.role.member') };
    }
  };

  const filteredMembers = members.filter(member => {
    const name = member.name?.toLowerCase?.() || '';
    const email = member.email?.toLowerCase?.() || '';
    const query = searchQuery.toLowerCase();

    const matchesSearch = name.includes(query) || email.includes(query);
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const availableDirectory = useMemo(
    () => [
      { id: 'dir_1', name: 'Priya Khanna', email: 'priya.khanna@example.com' },
      { id: 'dir_2', name: 'Rahul Shah', email: 'rahul.shah@example.com' },
      { id: 'dir_3', name: 'Divya Shetty', email: 'divya.shetty@example.com' },
      { id: 'dir_4', name: 'Sameer Agarwal', email: 'sameer.agarwal@example.com' },
      { id: 'dir_5', name: 'Leo Messi', email: 'oblong_pencil984@simplelogin.com' }
    ],
    []
  );

  const filteredDirectory = useMemo(() => {
    if (!directoryQuery.trim()) return [];
    return availableDirectory
      .filter((user) => {
        const q = directoryQuery.toLowerCase();
        const alreadyMember = members.some((m) => m.email === user.email);
        return (
          !alreadyMember &&
          (user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q))
        );
      })
      .slice(0, 5);
  }, [availableDirectory, directoryQuery, members]);

  useEffect(() => {
    const shouldOpen = sessionStorage.getItem('workspaceMembersOpenInvite');
    if (shouldOpen === 'true') {
      setShowInviteModal(true);
      sessionStorage.removeItem('workspaceMembersOpenInvite');
    }
    const handler = () => setShowInviteModal(true);
    window.addEventListener('workspace:open-invite', handler);
    return () => window.removeEventListener('workspace:open-invite', handler);
  }, []);

  const handleInvite = (email?: string, name?: string) => {
    const target = email || inviteEmail;
    if (!target.trim()) {
      setShowInviteModal(false);
      return;
    }

    const newMember: Member = {
      _id: `pending_${Date.now()}`,
      name: name || target.split('@')[0],
      email: target,
      role: 'member',
      position: 'Pending invite',
      joinedAt: new Date(),
      status: 'active'
    };

    setMembers((prev) => [...prev, newMember]);
    setInviteEmail('');
    setDirectoryQuery('');
    setShowInviteModal(false);
  };

  const handleAcceptRequest = (request: JoinRequest) => {
    setJoinRequests((prev) =>
      prev.map((req) => (req.id === request.id ? { ...req, status: 'accepted' } : req))
    );
    handleInvite(request.email, request.name);
  };

  const handleDeclineRequest = (requestId: string) => {
    setJoinRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: 'declined' } : req))
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('workspace.members.title')}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {t('workspace.members.subtitle')}
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {t('workspace.members.inviteMembers')}
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            placeholder={t('workspace.members.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
        >
          <option value="all">{t('workspace.members.filter.all')}</option>
          <option value="owner">{t('workspace.members.filter.owner')}</option>
          <option value="admin">{t('workspace.members.filter.admin')}</option>
          <option value="manager">{t('workspace.members.filter.manager')}</option>
          <option value="member">{t('workspace.members.filter.member')}</option>
        </select>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const roleBadge = getRoleBadge(member.role);
          const RoleIcon = roleBadge.icon;

          return (
            <div
              key={member._id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <UserDisplay
                  name={member.name}
                  plan={member.subscription?.plan || 'free'}
                  avatar={member.avatar}
                  size="md"
                  badgePosition="overlay"
                  showBadge={true}
                />
                {isOwner && member.role !== 'owner' && (
                  <button className="text-gray-600 hover:text-gray-600 dark:hover:text-gray-700">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-200">{member.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${roleBadge.bg}`}>
                    <RoleIcon className={`w-3 h-3 ${roleBadge.color}`} />
                    <span className={`text-xs font-medium ${roleBadge.color}`}>
                      {roleBadge.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-200">
                    {member.position}
                  </span>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-200">
                  {t('workspace.members.joined')} {member.joinedAt.toLocaleDateString(i18n.language)}
                </div>
              </div>

              {isOwner && member.role !== 'owner' && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Edit className="w-3 h-3" />
                    {t('workspace.members.editRole')}
                  </button>
                  <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      {/* Join Requests */}
      {isOwner && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('workspace.members.joinRequests.title')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-200">
                {t('workspace.members.joinRequests.subtitle')}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              {joinRequests.filter((req) => req.status === 'pending').length} {t('workspace.members.joinRequests.pending')}
            </span>
          </div>
          {joinRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-600">
              <AlertCircle className="w-10 h-10 mb-2 text-gray-700" />
              <p className="font-medium">{t('workspace.members.joinRequests.noRequests')}</p>
              <p className="text-sm">{t('workspace.members.joinRequests.noRequestsSubtitle')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {joinRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{request.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {request.email}
                    </p>
                    {request.message && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{request.message}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      {t('workspace.members.joinRequests.requested')} {request.requestedAt.toLocaleString(i18n.language)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : request.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {request.status}
                    </span>
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAcceptRequest(request)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                        >
                          <UserCheck className="w-4 h-4" />
                          {t('workspace.members.joinRequests.accept')}
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                          <UserX className="w-4 h-4" />
                          {t('workspace.members.joinRequests.decline')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {isOwner && showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('workspace.members.inviteModal.title')}</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-600 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-1">
                  {t('workspace.members.inviteModal.emailLabel')}
                </label>
                <input
                  type="text"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t('workspace.members.inviteModal.emailPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-1">
                  {t('workspace.members.inviteModal.directoryLabel')}
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={directoryQuery}
                    onChange={(e) => setDirectoryQuery(e.target.value)}
                    placeholder={t('workspace.members.inviteModal.directoryPlaceholder')}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                  {filteredDirectory.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredDirectory.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleInvite(user.email, user.name)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-200">{user.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  {t('workspace.members.inviteModal.directoryHelp')}
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('workspace.members.inviteModal.cancel')}
              </button>
              <button
                onClick={() => handleInvite()}
                className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
              >
                {t('workspace.members.inviteModal.sendInvite')}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t('workspace.members.stats.totalMembers')}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{members.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t('workspace.members.stats.active')}</div>
          <div className="text-2xl font-bold text-green-600">
            {members.filter(m => m.status === 'active').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t('workspace.members.stats.admins')}</div>
          <div className="text-2xl font-bold text-purple-600">
            {members.filter(m => m.role === 'admin').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t('workspace.members.stats.pendingRequests')}</div>
          <div className="text-2xl font-bold text-orange-600">
            {joinRequests.filter((req) => req.status === 'pending').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceMembers;
