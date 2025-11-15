import React, { useState } from 'react';
import { Users, UserPlus, Trash2, Crown, Shield, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
  role: 'project-manager' | 'member';
  addedAt: Date;
}

interface ProjectTeamTabProps {
  projectId: string;
  workspaceId: string;
  projectTeam: TeamMember[];
  projectManager?: string;
  isOwner: boolean;
  isProjectManager: boolean;
  onAddMember: (memberId: string, role: 'project-manager' | 'member') => void;
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
  const { state } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'project-manager' | 'member'>('member');

  // Get workspace members from AppContext
  // For now, use mock data. In production, this would come from workspace.members
  const workspace = state.workspaces.find(w => w._id === workspaceId);
  const workspaceMembers: WorkspaceMember[] = [
    { _id: 'user_emp_789', name: 'Bob Wilson', email: 'bob.wilson@company.com', role: 'developer' },
    { _id: 'user_emp_101', name: 'Alice Johnson', email: 'alice.johnson@company.com', role: 'designer' },
    { _id: 'user_emp_102', name: 'Charlie Brown', email: 'charlie.brown@company.com', role: 'developer' },
    { _id: 'user_emp_103', name: 'Diana Prince', email: 'diana.prince@company.com', role: 'tester' }
  ];
  
  // Filter out members already in project
  const availableMembers = workspaceMembers.filter(
    (wm) => !projectTeam.some(pt => pt._id === wm._id)
  );

  const handleAddMember = () => {
    if (!selectedMemberId) return;
    
    onAddMember(selectedMemberId, selectedRole);
    setShowAddModal(false);
    setSelectedMemberId('');
    setSelectedRole('member');
  };

  const currentPM = projectTeam.find(m => m._id === projectManager);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Project Team</h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage team members for this project ({projectTeam.length} members)
            </p>
          </div>
          {(isOwner || isProjectManager) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </button>
          )}
        </div>

        {/* Project Manager Section */}
        {currentPM && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{currentPM.name}</h4>
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                    Project Manager
                  </span>
                </div>
                <p className="text-sm text-gray-600">{currentPM.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Team Members List */}
        <div className="space-y-3">
          {projectTeam.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No team members yet</p>
              <p className="text-sm mt-1">Add members from your workspace to get started</p>
            </div>
          ) : (
            projectTeam.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      {member.role === 'project-manager' && (
                        <Crown className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <p className="text-xs text-gray-500">
                      Added {new Date(member.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    member.role === 'project-manager'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {member.role === 'project-manager' ? 'Manager' : 'Member'}
                  </span>

                  {(isOwner || isProjectManager) && member._id !== projectManager && (
                    <button
                      onClick={() => onRemoveMember(member._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {isOwner && member.role !== 'project-manager' && (
                    <button
                      onClick={() => onChangeProjectManager(member._id)}
                      className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      title="Make Project Manager"
                    >
                      <Crown className="w-3 h-3 inline mr-1" />
                      Make PM
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Team Member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Member Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Member from Workspace
                </label>
                {availableMembers.length === 0 ? (
                  <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                    All workspace members are already in this project
                  </p>
                ) : (
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a member...</option>
                    {availableMembers.map((member: any) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'project-manager' | 'member')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={!isOwner && selectedRole === 'project-manager'}
                >
                  <option value="member">Member</option>
                  {isOwner && !currentPM && (
                    <option value="project-manager">Project Manager</option>
                  )}
                </select>
                {!isOwner && (
                  <p className="text-xs text-gray-500 mt-1">
                    Only workspace owner can assign project manager
                  </p>
                )}
                {currentPM && selectedRole === 'project-manager' && (
                  <p className="text-xs text-orange-600 mt-1">
                    This project already has a project manager
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleAddMember}
                  disabled={!selectedMemberId || availableMembers.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Member
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
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
