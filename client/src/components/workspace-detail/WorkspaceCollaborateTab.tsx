import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPlus, Users, User, Trash2, X, Mail, Shield } from 'lucide-react';
import api from '../../services/api';

interface WorkspaceMember {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    username?: string;
    avatarUrl?: string;
  };
  role: 'owner' | 'admin' | 'manager' | 'member';
  permissions: {
    canCreateProject: boolean;
    canManageEmployees: boolean;
    canViewPayroll: boolean;
    canExportReports: boolean;
    canManageWorkspace: boolean;
  };
  status: 'active' | 'pending' | 'suspended';
  joinedAt: Date;
}

interface WorkspaceCollaborateTabProps {
  workspaceId: string;
}

const WorkspaceCollaborateTab: React.FC<WorkspaceCollaborateTabProps> = ({ workspaceId }) => {
  const { state, dispatch } = useApp();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'manager'>('manager');
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState({
    canCreateProject: true,
    canManageEmployees: false,
    canViewPayroll: false,
    canExportReports: false,
    canManageWorkspace: false
  });

  const workspace = useMemo(
    () => state.workspaces.find((w) => w._id === workspaceId),
    [state.workspaces, workspaceId]
  );

  // Load workspace members
  useEffect(() => {
    loadMembers();
  }, [workspaceId]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/workspaces/${workspaceId}`);
      if (response.data && response.data.members) {
        setMembers(response.data.members);
      }
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get collaborators (admin/manager roles)
  const collaborators = members.filter(m => 
    m.role === 'admin' || m.role === 'manager'
  );

  // Get regular members who can be promoted
  const promotableMembers = members.filter(m => 
    m.role === 'member' && m.status === 'active'
  );

  // Update permissions based on role
  useEffect(() => {
    if (selectedRole === 'admin') {
      setPermissions({
        canCreateProject: true,
        canManageEmployees: true,
        canViewPayroll: true,
        canExportReports: true,
        canManageWorkspace: true
      });
    } else {
      setPermissions({
        canCreateProject: true,
        canManageEmployees: false,
        canViewPayroll: false,
        canExportReports: false,
        canManageWorkspace: false
      });
    }
  }, [selectedRole]);

  const handlePromoteToCollaborator = async () => {
    if (!selectedMemberId) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Please select a member to promote',
          duration: 3000
        }
      });
      return;
    }

    try {
      await api.put(
        `/workspaces/${workspaceId}/members/${selectedMemberId}/role`,
        { 
          role: selectedRole,
          permissions: permissions
        }
      );

      await loadMembers();
      
      setShowAddModal(false);
      setSelectedMemberId('');
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Member promoted to collaborator successfully!',
          duration: 3000
        }
      });
    } catch (error: any) {
      console.error('Failed to promote member:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: error?.message || 'Failed to promote member',
          duration: 3000
        }
      });
    }
  };

  const handleDemoteCollaborator = async (memberId: string, memberName: string) => {
    if (!window.confirm(`Remove ${memberName}'s collaborator role? They will become a regular member.`)) {
      return;
    }

    try {
      await api.put(
        `/workspaces/${workspaceId}/members/${memberId}/role`,
        { role: 'member' }
      );

      await loadMembers();
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Collaborator demoted to member',
          duration: 3000
        }
      });
    } catch (error: any) {
      console.error('Failed to demote collaborator:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: error?.message || 'Failed to demote collaborator',
          duration: 3000
        }
      });
    }
  };

  const getUserDisplay = (member: WorkspaceMember) => {
    const user = member.user;
    if (typeof user === 'string') return { name: user, email: '' };
    return {
      name: user.fullName || user.username || user.email || 'Unknown',
      email: user.email || ''
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Workspace Collaborators</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Promote workspace members to collaborators with admin or manager permissions.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={promotableMembers.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-4 h-4" />
            Add Collaborator
          </button>
        </div>

        {/* Collaborator List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-300">
              Loading collaborators...
            </div>
          ) : collaborators.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-300">
              <Users className="w-12 h-12 mx-auto mb-3" />
              <p className="font-medium">No collaborators yet</p>
              <p className="text-sm mt-1">Promote workspace members to help manage this workspace</p>
            </div>
          ) : (
            collaborators.map((collab) => {
              const { name, email } = getUserDisplay(collab);
              const isOwner = workspace?.owner === (typeof collab.user === 'string' ? collab.user : collab.user._id);
              
              return (
                <div key={collab._id} className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      collab.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <User className={`w-5 h-5 ${
                        collab.role === 'admin' ? 'text-purple-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      collab.role === 'admin'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {collab.role === 'admin' ? 'Administrator' : 'Manager'}
                    </span>
                    {!isOwner && (
                      <button
                        onClick={() => handleDemoteCollaborator(collab._id, name)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                        title="Remove collaborator role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Role Descriptions */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Collaborator Roles
          </h4>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <span className="font-medium">Administrator:</span> Full workspace management permissions
            </div>
            <div>
              <span className="font-medium">Manager:</span> Can create projects with limited administrative access
            </div>
          </div>
        </div>
      </div>

      {/* Add Collaborator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Promote to Collaborator</h3>
              <button onClick={() => {
                setShowAddModal(false);
                setSelectedMemberId('');
              }}>
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Member Selection Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Workspace Member
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Choose a member to promote...</option>
                  {promotableMembers.map((member) => {
                    const { name, email } = getUserDisplay(member);
                    return (
                      <option key={member._id} value={member._id}>
                        {name} ({email})
                      </option>
                    );
                  })}
                </select>
                {promotableMembers.length === 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    No members available to promote
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Collaborator Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'manager')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="manager">Manager - Limited permissions</option>
                  <option value="admin">Administrator - Full permissions</option>
                </select>
              </div>

              {/* Permissions Preview */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions:</p>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                  {Object.entries(permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${
                        value ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-600'
                      }`}>
                        {value && <span className="text-green-600 dark:text-green-400 font-bold text-xs">✓</span>}
                      </div>
                      <span>{key.replace(/^can/, '').replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedMemberId('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePromoteToCollaborator}
                  disabled={!selectedMemberId}
                  className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Promote Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceCollaborateTab;
