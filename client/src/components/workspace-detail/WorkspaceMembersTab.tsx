import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useDock } from '../../context/DockContext';
import { UserPlus, Users, User, Trash2, X, Search, Mail, Calendar, UserCheck, UserX, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';
import RemoveMemberModal from '../RemoveMemberModal';
import { useRefreshData } from '../../hooks/useRefreshData';
import GlassmorphicCard from '../ui/GlassmorphicCard';

interface Member {
  _id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  joinedAt: Date;
  status: 'active' | 'pending';
}

interface JoinRequest {
  id: string;
  name: string;
  email: string;
  message?: string;
  requestedAt: Date;
  status: 'pending' | 'accepted' | 'declined';
}

interface WorkspaceMembersTabProps {
  workspaceId: string;
}

const WorkspaceMembersTab: React.FC<WorkspaceMembersTabProps> = ({ workspaceId }) => {
  const { state, dispatch } = useApp();
  const { isDarkMode } = useTheme();
  const { dockPosition } = useDock();
  const { t, i18n } = useTranslation();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [directoryUsers, setDirectoryUsers] = useState<{
    _id: string;
    fullName: string;
    email: string;
    username: string;
    avatarUrl?: string;
  }[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  const workspace: any = useMemo(
    () => state.workspaces.find((w) => w._id === workspaceId),
    [state.workspaces, workspaceId]
  );

  const currentUserId = state.userProfile._id;
  const isOwner = workspace?.owner === currentUserId;
  const isAdmin = (workspace?.members || []).some((member: any) => {
    const user = member.user;
    const id = typeof user === 'string' ? user : user._id;
    return (
      id === currentUserId &&
      (member.role === 'owner' || member.role === 'admin')
    );
  });
  const canManageMembers = isOwner || isAdmin;

  // Initialize local members list from workspace data so the members tab
  // always shows all current workspace members for this workspace.
  useEffect(() => {
    if (!workspace) {
      setMembers([]);
      return;
    }

    const workspaceMembers: Member[] = (workspace.members || []).map((m: any) => {
      const user = m.user;
      const userId = typeof user === 'string' ? user : user?._id;
      const name =
        typeof user === 'string'
          ? user
          : user?.fullName || user?.username || user?.email || 'Member';
      const email = typeof user === 'string' ? '' : user?.email || '';

      return {
        _id: userId,
        userId,
        name,
        email,
        avatar: typeof user === 'string' ? undefined : user?.avatarUrl,
        role: m.role || 'member',
        joinedAt: m.joinedAt ? new Date(m.joinedAt) : new Date(),
        status: m.status === 'pending' || m.status === 'active' ? m.status : 'active',
      } as Member;
    });

    setMembers(workspaceMembers);
    persistMembersForModals(workspaceMembers);
  }, [workspace]);

  const filteredDirectoryUsers = useMemo(() => {
    if (!userSearch.trim()) return [];
    const lowered = userSearch.toLowerCase();
    return directoryUsers
      .filter((user) => {
        const name = user.fullName || user.username || user.email;
        const match =
          name.toLowerCase().includes(lowered) ||
          user.email.toLowerCase().includes(lowered) ||
          user.username.toLowerCase().includes(lowered);
        const alreadyMember = members.some((member) => member.email === user.email);
        return match && !alreadyMember;
      })
      .slice(0, 5)
      .map((user) => ({
        id: user._id,
        name: user.fullName || user.username || user.email,
        email: user.email
      }));
  }, [directoryUsers, userSearch, members]);

  useEffect(() => {
    if (!userSearch.trim()) {
      setDirectoryUsers([]);
      return;
    }

    let cancelled = false;

    const runSearch = async () => {
      try {
        setIsSearchingUsers(true);
        const results = await api.searchUsers(userSearch.trim());
        if (!cancelled) {
          setDirectoryUsers(results);
        }
      } catch (error) {
        console.error('User search failed', error);
      } finally {
        if (!cancelled) {
          setIsSearchingUsers(false);
        }
      }
    };

    runSearch();

    return () => {
      cancelled = true;
    };
  }, [userSearch]);

  const persistMembersForModals = (payload: Member[]) => {
    try {
      const membersForStorage = payload.map((m) => ({
        _id: m._id,
        name: m.name,
        email: m.email,
        workspaceRole: m.role || 'Member',
        department: 'General'
      }));
      sessionStorage.setItem(`workspace_${workspaceId}_members`, JSON.stringify(membersForStorage));
    } catch (e) {
      console.error('Error storing members:', e);
    }
  };

  // Load join requests from API
  useEffect(() => {
    if (!canManageMembers || !workspaceId) return;

    const loadJoinRequests = async () => {
      try {
        console.log('🔍 [MEMBERS TAB] Fetching join requests for workspace:', workspaceId);
        const requests = await api.getJoinRequests(workspaceId);
        console.log('✅ [MEMBERS TAB] Received join requests:', requests);

        // Transform API response to match component interface
        const transformedRequests: JoinRequest[] = requests.map((req: any) => ({
          id: req._id,
          name: req.user?.fullName || req.user?.email || 'Unknown User',
          email: req.user?.email || '',
          message: req.message,
          requestedAt: new Date(req.createdAt),
          status: 'pending'
        }));

        setJoinRequests(transformedRequests);
      } catch (error) {
        console.error('❌ [MEMBERS TAB] Failed to load join requests:', error);
      }
    };

    loadJoinRequests();
  }, [workspaceId, canManageMembers]);

  // Enable refresh button
  useRefreshData(() => {
    if (canManageMembers && workspaceId) {
      const loadJoinRequests = async () => {
        try {
          const requests = await api.getJoinRequests(workspaceId);
          const transformedRequests: JoinRequest[] = requests.map((req: any) => ({
            id: req._id,
            name: req.user?.fullName || req.user?.email || 'Unknown User',
            email: req.user?.email || '',
            message: req.message,
            requestedAt: new Date(req.createdAt),
            status: 'pending'
          }));
          setJoinRequests(transformedRequests);
        } catch (error) {
          console.error('Failed to load join requests:', error);
        }
      };
      loadJoinRequests();
    }
  }, [workspaceId, canManageMembers]);

  const handleInviteMember = async (overrideEmail?: string, overrideName?: string, targetUserId?: string) => {
    const inviteTarget = overrideEmail || inviteEmail;
    if (!inviteTarget.trim() && !targetUserId) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: t('workspace.members.toast.enterEmail'),
          duration: 3000
        }
      });
      return;
    }

    try {
      await api.sendWorkspaceInvite(workspaceId, {
        targetUserId,
        identifier: targetUserId ? undefined : inviteTarget,
      });

      setShowInviteModal(false);
      setInviteEmail('');
      setUserSearch('');

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: t('workspace.members.toast.sent'),
          duration: 3000
        }
      });
    } catch (error: any) {
      console.error('Failed to send workspace invite', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: error?.message || 'Failed to send invitation',
          duration: 4000
        }
      });
    }
  };

  const handleAcceptRequest = async (request: JoinRequest) => {
    if (processingRequestId) return; // Prevent double-clicks

    try {
      setProcessingRequestId(request.id);
      console.log('🔍 [APPROVE] Approving join request:', request.id, 'for workspace:', workspaceId);

      await api.approveJoinRequest(workspaceId, request.id);
      console.log('✅ [APPROVE] Join request approved successfully');

      // Remove from local state
      setJoinRequests((prev) => prev.filter((req) => req.id !== request.id));

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: `${request.name} has been added to the workspace`,
          duration: 3000
        }
      });

      // Refresh workspace data to show new member
      console.log('🔄 [APPROVE] Refreshing workspaces...');
      const workspaces = await api.getWorkspaces();
      dispatch({ type: 'SET_WORKSPACES', payload: workspaces });
      console.log('✅ [APPROVE] Workspaces refreshed');
    } catch (error: any) {
      console.error('❌ [APPROVE] Failed to approve join request:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: error?.message || 'Failed to approve request',
          duration: 3000
        }
      });
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    if (processingRequestId) return; // Prevent double-clicks

    try {
      setProcessingRequestId(requestId);
      console.log('🔍 [DECLINE] Declining join request:', requestId, 'for workspace:', workspaceId);

      await api.rejectJoinRequest(workspaceId, requestId);
      console.log('✅ [DECLINE] Join request declined successfully');

      // Remove from local state
      setJoinRequests((prev) => prev.filter((req) => req.id !== requestId));

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'info',
          message: 'Request declined',
          duration: 2500
        }
      });
    } catch (error: any) {
      console.error('❌ [DECLINE] Failed to reject join request:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: error?.message || 'Failed to decline request',
          duration: 3000
        }
      });
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRemoveMember = (member: Member) => {
    setMemberToRemove(member);
    setShowRemoveModal(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      console.log('🔍 [FRONTEND] Removing member:', memberToRemove._id);

      await api.removeMember(workspaceId, memberToRemove.userId);

      console.log('✅ [FRONTEND] Member removed successfully');

      // Remove from local state
      setMembers(members.filter((m) => m._id !== memberToRemove._id));

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: `${memberToRemove.name} has been removed from the workspace`,
          duration: 3000
        }
      });

      // Refresh workspace data
      const workspaces = await api.getWorkspaces();
      dispatch({ type: 'SET_WORKSPACES', payload: workspaces });
    } catch (error: any) {
      console.error('❌ [FRONTEND] Failed to remove member:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: error?.message || 'Failed to remove member',
          duration: 3000
        }
      });
    }
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`space-y-6 transition-all duration-300 ${dockPosition === 'left' ? 'pl-[71px] pr-4 sm:pr-6 py-4 sm:py-6' :
      dockPosition === 'right' ? 'pr-[71px] pl-4 sm:pl-6 py-4 sm:py-6' :
        'p-4 sm:p-6'
      }`}>
      <GlassmorphicCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('workspace.members.title')}</h3>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('workspace.members.subtitle')}
            </p>
          </div>
          {canManageMembers && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              {t('workspace.members.invite')}
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`} />
          <input
            type="text"
            placeholder={t('workspace.members.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
          />
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {filteredMembers.length === 0 && !searchQuery ? (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <Users className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`} />
              <p className="font-medium">{t('workspace.members.noMembers')}</p>
              <p className="text-sm mt-1">{t('workspace.members.noMembersDesc')}</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <Search className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`} />
              <p>{t('workspace.members.noResults')} "{searchQuery}"</p>
            </div>
          ) : (
            filteredMembers.map((member) => (
              <GlassmorphicCard
                key={member._id}
                className="flex items-center justify-between p-4"
                hoverEffect={true}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{member.name}</div>
                    <div className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-sm flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Calendar className="w-3 h-3" />
                    {new Date(member.joinedAt).toLocaleDateString(i18n.language)}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${member.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                    {member.status}
                  </span>
                  {canManageMembers && member.userId !== workspace?.owner && (
                    <button
                      onClick={() => handleRemoveMember(member)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />

                    </button>

                  )}
                </div>
              </GlassmorphicCard>
            ))
          )}
        </div>

        {/* Info Box */}
        {members.length > 0 && (
          <div className={`mt-6 p-4 rounded-lg border ${isDarkMode
            ? 'bg-blue-900/20 border-blue-900/50 text-blue-300'
            : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
            <p className="text-sm">
              {t('workspace.members.info', { count: members.length, s: members.length !== 1 ? 's' : '' })}
            </p>
          </div>
        )}
      </GlassmorphicCard>

      {/* Contact Admin / Owner info for regular members */}
      {!canManageMembers && workspace && (
        <GlassmorphicCard className="p-6">
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('workspace.members.contactAdminTitle')}</h3>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('workspace.members.contactAdminDesc')}
          </p>
          <div className="space-y-3">
            {/* Owner */}
            {workspace.owner && (
              <GlassmorphicCard className="flex items-center justify-between p-3" hoverEffect={false}>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {typeof workspace.owner === 'string'
                      ? t('workspace.members.owner')
                      : workspace.owner.fullName || workspace.owner.email || workspace.owner.username || t('workspace.members.owner')}
                  </p>
                  {typeof workspace.owner !== 'string' && workspace.owner.email && (
                    <p className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Mail className="w-3 h-3" />
                      {workspace.owner.email}
                    </p>
                  )}
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  Owner
                </span>
              </GlassmorphicCard>
            )}

            {/* Admin / collaborator members */}
            {(workspace.members || [])
              .filter((m: any) => m.role === 'admin' || m.role === 'manager')
              .map((m: any) => {
                const user = m.user;
                const displayName =
                  typeof user === 'string'
                    ? user
                    : user.fullName || user.username || user.email || t('workspace.members.collaborator');
                const email = typeof user === 'string' ? undefined : user.email;
                return (
                  <GlassmorphicCard
                    key={typeof user === 'string' ? user : user._id}
                    className="flex items-center justify-between p-3"
                    hoverEffect={false}
                  >
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{displayName}</p>
                      {email && (
                        <p className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Mail className="w-3 h-3" />
                          {email}
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      {m.role === 'admin' ? 'Admin' : 'Manager'}
                    </span>
                  </GlassmorphicCard>
                );
              })}
          </div>
        </GlassmorphicCard>
      )}

      {/* Join Requests (owners/admins only) */}
      {canManageMembers && (
        <GlassmorphicCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('workspace.members.joinRequestsTitle')}</h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('workspace.members.joinRequestsDesc')}
              </p>
            </div>
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {joinRequests.filter((req) => req.status === 'pending').length} {t('workspace.members.pending')}
            </span>
          </div>

          {joinRequests.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <AlertCircle className={`w-10 h-10 mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-700'}`} />
              <p className="font-medium">{t('workspace.members.noRequests')}</p>
              <p className="text-sm">{t('workspace.members.noRequestsDesc')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {joinRequests.map((request) => (
                <GlassmorphicCard
                  key={request.id}
                  className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                      {request.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{request.name}</p>
                      <p className={`text-sm flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Mail className="w-3 h-3" />
                        {request.email}
                      </p>
                      {request.message && <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{request.message}</p>}
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        Requested {request.requestedAt.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${request.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : request.status === 'accepted'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                    >
                      {request.status}
                    </span>
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAcceptRequest(request)}
                          disabled={processingRequestId === request.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingRequestId === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                          {processingRequestId === request.id ? 'Accepting...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request.id)}
                          disabled={processingRequestId === request.id}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {processingRequestId === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                          {processingRequestId === request.id ? 'Declining...' : 'Decline'}
                        </button>
                      </>
                    )}
                  </div>
                </GlassmorphicCard>
              ))}
            </div>
          )}
        </GlassmorphicCard>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('workspace.members.modal.title')}</h3>
              <button onClick={() => setShowInviteModal(false)}>
                <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-600'}`} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('workspace.members.modal.emailLabel')}
                </label>
                <input
                  type="text"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t('workspace.members.modal.emailPlaceholder')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500'
                    : 'border-gray-300'
                    }`}
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  {t('workspace.members.modal.emailDesc')}
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('workspace.members.modal.searchLabel')}
                </label>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`} />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder={t('workspace.members.modal.searchPlaceholder')}
                    className={`w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${isDarkMode
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500'
                      : 'border-gray-300'
                      }`}
                  />
                  {filteredDirectoryUsers.length > 0 && (
                    <div className={`absolute mt-2 w-full border rounded-lg z-10 max-h-48 overflow-y-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                      }`}>
                      {filteredDirectoryUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleInviteMember(user.email, user.name)}
                          className={`w-full px-4 py-2 text-left flex flex-col ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            }`}
                        >
                          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</span>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  {t('workspace.members.modal.searchDesc')}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {t('workspace.members.modal.cancel')}
                </button>
                <button
                  onClick={() => handleInviteMember()}
                  className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
                >
                  {t('workspace.members.modal.send')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      <RemoveMemberModal
        isOpen={showRemoveModal}
        memberName={memberToRemove?.name || ''}
        memberEmail={memberToRemove?.email || ''}
        onConfirm={confirmRemoveMember}
        onCancel={() => {
          setShowRemoveModal(false);
          setMemberToRemove(null);
        }}
      />
    </div>
  );
};

export default WorkspaceMembersTab;
