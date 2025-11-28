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
  _id: string;
  name: string;
  email: string;
  role: string;
  addedAt: Date;
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
  onChangeProjectManager
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

  // Fetch workspace members from API
  useEffect(() => {
    const fetchWorkspaceMembers = async () => {
      if (!workspaceId) return;
      
      setLoading(true);
      try {
        const response = await apiService.get(`/messages/workspace/${workspaceId}/members`);
        if (response.data.success && response.data.data) {
          // Map the response to WorkspaceMember format
          const members = response.data.data.map((m: any) => ({
            _id: m.user._id || m.user,
            name: m.user.fullName || m.user.name || 'Unknown',
            email: m.user.email || '',
            role: m.role || 'member'
          }));
          setWorkspaceMembers(members);
        }
      } catch (error) {
        console.error('Failed to load workspace members:', error);
        // Fallback to workspace members from context if API fails
        const workspace = state.workspaces.find(w => w._id === workspaceId);
        if (workspace?.members) {
          const contextMembers = workspace.members.map((m: any) => ({
            _id: m.user._id || m.user,
            name: m.user?.fullName || m.user?.name || 'Unknown',
            email: m.user?.email || '',
            role: m.role || 'member'
          }));
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
    (wm) => !projectTeam.some(pt => pt._id === wm._id)
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

  const currentPM = projectTeam.find(m => m._id === projectManager);

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
      'devops': 'DevOps'
    };
    return roleMap[role] || role;
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
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{currentPM.name}</h4>
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                    {t('project.team.projectManager')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{currentPM.email}</p>
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
            projectTeam.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent-dark dark:text-accent-light" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{member.name}</h4>
                      {member.role === 'project-manager' && (
                        <Crown className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{member.email}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t('project.team.added', { date: new Date(member.addedAt).toLocaleDateString() })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    member.role === 'project-manager'
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {getRoleDisplay(member.role)}
                  </span>

                  {(isOwner || isProjectManager) && member._id !== projectManager && (
                    <button
                      onClick={() => onRemoveMember(member._id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      title={t('project.team.removeMember')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {isOwner && member.role !== 'project-manager' && (
                    <button
                      onClick={() => onChangeProjectManager(member._id)}
                      className="px-3 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800"
                      title={t('project.team.makePM')}
                    >
                      <Crown className="w-3 h-3 inline mr-1" />
                      {t('project.team.makePM')}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
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
