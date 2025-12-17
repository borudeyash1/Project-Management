import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Crown, Shield, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

interface WorkspaceMember {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface TeamMember {
  _id?: string;
  user: {
    _id: string;
    fullName?: string;
    name?: string;
    email: string;
    avatarUrl?: string;
  } | string; // Can be ObjectId string or populated object
  role: string;
  joinedAt?: Date;
  permissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canManageMembers: boolean;
    canViewReports: boolean;
  };
}

interface ProjectTeamTabProps {
  projectId: string;
  workspaceId: string;
  projectTeam: TeamMember[];
  projectManager?: string;
  isOwner: boolean;
  isProjectManager: boolean;
  onAddMember: (memberId: string, role: string) => void;
  onRemoveMember: (memberId: string) => void;
  onChangeProjectManager: (memberId: string) => void;
  onUpdateMemberRole?: (memberId: string, newRole: string) => void;
}


const ProjectTeamTab: React.FC<ProjectTeamTabProps> = ({
  projectId,
  workspaceId,
  projectTeam,
  projectManager,
  isOwner,
  isProjectManager,
  onAddMember,
  onRemoveMember,
  onChangeProjectManager,
  onUpdateMemberRole
}) => {
  const { t } = useTranslation();
  const { state } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [customRole, setCustomRole] = useState('');
  const [showCustomRoleInput, setShowCustomRoleInput] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRoleFor, setEditingRoleFor] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('');
  const [editCustomRole, setEditCustomRole] = useState('');
  const [showEditCustomRoleInput, setShowEditCustomRoleInput] = useState(false);

  // Check if current user is the workspace owner
  const isWorkspaceOwner = React.useMemo(() => {
    console.log('🔍 [WORKSPACE OWNER CHECK]', {
      currentWorkspace: state.currentWorkspace,
      userProfile: state.userProfile,
      isOwnerProp: isOwner
    });
    
    if (!state.currentWorkspace || typeof state.currentWorkspace === 'string') {
      console.log('⚠️ [WORKSPACE OWNER] No workspace or workspace is string');
      return isOwner; // Fallback to isOwner prop
    }
    
    const workspace = state.currentWorkspace as any;
    const ownerId = typeof workspace.owner === 'string' 
      ? workspace.owner 
      : workspace.owner?._id;
    
    const result = ownerId === state.userProfile._id;
    console.log('✅ [WORKSPACE OWNER] Result:', result, 'ownerId:', ownerId, 'userId:', state.userProfile._id);
    return result;
  }, [state.currentWorkspace, state.userProfile, isOwner]);

  // Helper function to extract user data from team member
  const getUserData = (member: TeamMember) => {
    if (!member || !member.user) {
      return {
        _id: '',
        name: 'Unknown User',
        email: '',
        avatarUrl: ''
      };
    }
    
    if (typeof member.user === 'string') {
      return {
        _id: member.user,
        name: 'Unknown User',
        email: '',
        avatarUrl: ''
      };
    }
    
    return {
      _id: member.user._id,
      name: member.user.fullName || member.user.name || 'Unknown User',
      email: member.user.email || '',
      avatarUrl: member.user.avatarUrl || ''
    };
  };

  // Fetch workspace members from API
  useEffect(() => {
    const fetchWorkspaceMembers = async () => {
      if (!workspaceId) return;
      
      setLoading(true);
      try {
        const response = await apiService.get(`/messages/workspace/${workspaceId}/members`);
        if (response.data.success && response.data.data) {
          // Map the response to WorkspaceMember format with null checks
          const members = response.data.data
            .filter((m: any) => m && (m._id || m.user?._id)) // Filter out null/invalid entries
            .map((m: any) => ({
              _id: m._id || m.user?._id || '',
              name: m.fullName || m.name || 'Unknown',
              email: m.email || '',
              role: m.role || 'member'
            }));
          
          console.log('✅ [PROJECT TEAM] Loaded workspace members:', members.length);
          setWorkspaceMembers(members);
        }
      } catch (error) {
        console.error('Failed to load workspace members:', error);
        // Fallback to workspace members from context if API fails
        const workspace = state.workspaces.find(w => w._id === workspaceId);
        if (workspace?.members) {
          const contextMembers = workspace.members
            .filter((m: any) => m && m.status === 'active' && (m.user || m._id)) // Filter out null entries
            .map((m: any) => ({
              _id: (typeof m.user === 'object' ? m.user?._id : m.user) || m._id || '',
              name: m.user?.fullName || m.user?.name || 'Unknown',
              email: m.user?.email || '',
              role: m.role || 'member'
            }));
          console.log('⚠️ [PROJECT TEAM] Using fallback workspace members:', contextMembers.length);
          setWorkspaceMembers(contextMembers);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceMembers();
  }, [workspaceId, state.workspaces]);
  
  // Filter out members already in project
  const availableMembers = workspaceMembers.filter(
    (wm) => !projectTeam.some(pt => {
      const userData = getUserData(pt);
      return userData._id === wm._id;
    })
  );

  const handleAddMember = () => {
    if (!selectedMemberId) return;
    
    // Use custom role if "custom" is selected, otherwise use selected role
    const finalRole = selectedRole === 'custom' ? customRole.trim() : selectedRole;
    
    if (!finalRole) {
      alert('Please enter a role name');
      return;
    }
    
    onAddMember(selectedMemberId, finalRole);
    setShowAddModal(false);
    setSelectedMemberId('');
    setSelectedRole('member');
    setCustomRole('');
    setShowCustomRoleInput(false);
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    setShowCustomRoleInput(value === 'custom');
    if (value !== 'custom') {
      setCustomRole('');
    }
  };

  const currentPM = projectTeam.find(m => {
    const userData = getUserData(m);
    return userData._id === projectManager;
  });

  // Role display helper
  const getRoleDisplay = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'member': t('project.team.member'),
      'project-manager': t('project.team.projectManager'),
      'developer': 'Developer',
      'designer': 'Designer',
      'tester': 'Tester',
      'analyst': 'Analyst',
      'qa-engineer': 'QA Engineer',
      'devops': 'DevOps',
      'owner': 'Owner',
      'manager': 'Manager',
      'viewer': 'Viewer'
    };
    
    // Return mapped role or capitalize custom role
    if (roleMap[role]) {
      return roleMap[role];
    }
    
    // Capitalize custom role (e.g., "technical-lead" -> "Technical Lead")
    return role
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('project.team.title')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {t('project.team.subtitle', { count: projectTeam.length })}
            </p>
          </div>
          {(isOwner || isProjectManager) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
            >
              <UserPlus className="w-4 h-4" />
              {t('project.team.addMember')}
            </button>
          )}
        </div>

        {/* Project Manager Section */}
        {currentPM && (
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{getUserData(currentPM).name}</h4>
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                    {t('project.team.projectManager')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{getUserData(currentPM).email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Team Members List */}
        <div className="space-y-3">
          {projectTeam.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-300">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-600 dark:text-gray-400" />
              <p className="font-medium">{t('project.team.noMembers')}</p>
              <p className="text-sm mt-1">{t('project.team.noMembersSubtitle')}</p>
            </div>
          ) : (
            projectTeam.map((member, index) => {
              const userData = getUserData(member);
              const joinedDate = member.joinedAt ? new Date(member.joinedAt) : new Date();
              const isValidDate = !isNaN(joinedDate.getTime());
              
              return (
                <div
                  key={userData._id || index}
                  className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-accent-dark dark:text-accent-light" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{userData.name}</h4>
                        {member.role === 'project-manager' && (
                          <Crown className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{userData.email}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {isValidDate 
                          ? t('project.team.added', { date: joinedDate.toLocaleDateString() })
                          : 'Recently added'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Role Badge - Editable for workspace owners */}
                    {isWorkspaceOwner && editingRoleFor === userData._id && member.role !== 'owner' ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={newRole}
                            onChange={(e) => {
                              setNewRole(e.target.value);
                              setShowEditCustomRoleInput(e.target.value === 'custom');
                              if (e.target.value !== 'custom') {
                                setEditCustomRole('');
                              }
                            }}
                            className="px-3 py-1 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            autoFocus
                          >
                            <option value="member">Member</option>
                            <option value="project-manager">Project Manager</option>
                            <option value="developer">Developer</option>
                            <option value="designer">Designer</option>
                            <option value="tester">Tester</option>
                            <option value="analyst">Analyst</option>
                            <option value="qa-engineer">QA Engineer</option>
                            <option value="devops">DevOps</option>
                            <option value="custom">Custom Role</option>
                          </select>
                          <button
                            onClick={() => {
                              if (onUpdateMemberRole) {
                                const finalRole = newRole === 'custom' ? editCustomRole.trim() : newRole;
                                if (!finalRole) {
                                  alert('Please enter a role name');
                                  return;
                                }
                                onUpdateMemberRole(userData._id, finalRole);
                                setEditingRoleFor(null);
                                setNewRole('');
                                setEditCustomRole('');
                                setShowEditCustomRoleInput(false);
                              }
                            }}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                          <button
                            onClick={() => {
                              setEditingRoleFor(null);
                              setNewRole('');
                              setEditCustomRole('');
                              setShowEditCustomRoleInput(false);
                            }}
                            className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                          Cancel
                          </button>
                        </div>
                        {showEditCustomRoleInput && (
                          <input
                            type="text"
                            value={editCustomRole}
                            onChange={(e) => setEditCustomRole(e.target.value)}
                            placeholder="Enter custom role (e.g., Technical Lead)"
                            className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          />
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (isWorkspaceOwner && member.role !== 'owner') {
                            setEditingRoleFor(userData._id);
                            setNewRole(member.role);
                            setEditCustomRole('');
                            setShowEditCustomRoleInput(false);
                          }
                        }}
                        disabled={!isWorkspaceOwner || member.role === 'owner'}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border-2 transition-all ${
                          member.role === 'project-manager'
                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                        } ${isWorkspaceOwner && member.role !== 'owner' ? 'cursor-pointer hover:shadow-md hover:scale-105 hover:border-accent' : 'cursor-default opacity-60'}`}
                        title={member.role === 'owner' ? '🔒 Owner role cannot be changed' : (isWorkspaceOwner ? '✏️ Click to edit role' : '')}
                      >
                        <span className="flex items-center gap-1">
                          {getRoleDisplay(member.role)}
                          {isWorkspaceOwner && member.role !== 'owner' && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                          {member.role === 'owner' && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                        </span>
                      </button>
                    )}

                    {/* Delete button - Only visible to workspace owner */}
                    {isWorkspaceOwner && userData._id !== projectManager && (
                      <button
                        onClick={() => onRemoveMember(userData._id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title={t('project.team.removeMember')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {isOwner && member.role !== 'project-manager' && (
                      <button
                        onClick={() => onChangeProjectManager(userData._id)}
                        className="px-3 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800"
                        title={t('project.team.makePM')}
                      >
                        <Crown className="w-3 h-3 inline mr-1" />
                        {t('project.team.makePM')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('project.team.modal.title')}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Member Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('project.team.modal.selectMember')}
                </label>
                {loading ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    Loading members...
                  </p>
                ) : availableMembers.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    {t('project.team.modal.allMembersAdded')}
                  </p>
                ) : (
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    size={Math.min(availableMembers.length + 1, 8)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-accent"
                  >
                    <option value="">{t('project.team.modal.chooseMember')}</option>
                    {availableMembers.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-accent"
                >
                  <option value="member">Member</option>
                  <option value="developer">Developer</option>
                  <option value="designer">Designer</option>
                  <option value="tester">Tester</option>
                  <option value="analyst">Analyst</option>
                  <option value="qa-engineer">QA Engineer</option>
                  <option value="devops">DevOps</option>
                  <option value="custom">Custom Role</option>
                  {isOwner && !currentPM && (
                    <option value="project-manager">Project Manager</option>
                  )}
                </select>
                
                {/* Custom Role Input */}
                {showCustomRoleInput && (
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="Enter custom role (e.g., Technical Lead, Scrum Master)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-accent mt-2"
                  />
                )}
                
                {!isOwner && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {t('project.team.modal.ownerOnly')}
                  </p>
                )}
                {currentPM && selectedRole === 'project-manager' && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    {t('project.team.modal.pmExists')}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleAddMember}
                  disabled={!selectedMemberId || availableMembers.length === 0 || (selectedRole === 'custom' && !customRole.trim())}
                  className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {t('project.team.modal.add')}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('project.team.modal.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTeamTab;
