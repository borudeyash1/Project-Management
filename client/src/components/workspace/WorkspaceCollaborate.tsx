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
    canManageMembers: boolean;
    canManageProjects: boolean;
    canManageClients: boolean;
    canUpdateWorkspaceDetails: boolean;
    canManageCollaborators: boolean;
    canManageInternalProjectSettings: boolean;
    canAccessProjectManagerTabs: boolean;
  };
  status: 'active' | 'pending' | 'suspended';
  joinedAt: Date;
}

const WorkspaceCollaborate: React.FC = () => {
  const { state, dispatch } = useApp();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'manager' | 'custom'>('manager');
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState({
    canManageMembers: false,
    canManageProjects: false,
    canManageClients: false,
    canUpdateWorkspaceDetails: false,
    canManageCollaborators: false,
    canManageInternalProjectSettings: false,
    canAccessProjectManagerTabs: false
  });

  const workspace = useMemo(
    () => state.workspaces.find((w) => w._id === state.currentWorkspace),
    [state.workspaces, state.currentWorkspace]
  );

  const currentWorkspaceId = state.currentWorkspace;

  // Load workspace members
  useEffect(() => {
    if (currentWorkspaceId) {
      loadMembers();
    }
  }, [currentWorkspaceId]);

  const loadMembers = async () => {
    if (!currentWorkspaceId) return;
    
    try {
      setIsLoading(true);
      const response = await api.get(`/workspaces/${currentWorkspaceId}`);
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
      // Administrator - Full permissions
      setPermissions({
        canManageMembers: true,
        canManageProjects: true,
        canManageClients: true,
        canUpdateWorkspaceDetails: true,
        canManageCollaborators: true,
        canManageInternalProjectSettings: true,
        canAccessProjectManagerTabs: true
      });
    } else if (selectedRole === 'manager') {
      // Manager - Limited permissions
      setPermissions({
        canManageMembers: false,
        canManageProjects: true,
        canManageClients: true,
        canUpdateWorkspaceDetails: false,
        canManageCollaborators: false,
        canManageInternalProjectSettings: true,
        canAccessProjectManagerTabs: true
      });
    }
    // For 'custom' role, don't change permissions - let user select manually
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

    if (!currentWorkspaceId) return;

    try {
      await api.put(
        `/workspaces/${currentWorkspaceId}/members/${selectedMemberId}/role`,
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

    if (!currentWorkspaceId) return;

    try {
      await api.put(
        `/workspaces/${currentWorkspaceId}/members/${memberId}/role`,
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

  const stats = [
    { label: 'Total Collaborators', value: collaborators.length, color: 'text-accent-dark' },
    { label: 'Active', value: collaborators.filter(c => c.status === 'active').length, color: 'text-green-600' },
    { label: 'Pending', value: collaborators.filter(c => c.status === 'pending').length, color: 'text-yellow-600' },
    { label: 'Admins', value: collaborators.filter(c => c.role === 'admin').length, color: 'text-red-600' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Collaborators</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Promote workspace members to collaborators with admin or manager permissions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={promotableMembers.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus className="w-4 h-4" />
          Invite Collaborator
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{stat.label}</div>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Collaborators List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Collaborator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Privilege
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Invited
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-600 dark:text-gray-300">
                    Loading collaborators...
                  </td>
                </tr>
              ) : collaborators.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <div className="text-center">
                      <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No collaborators yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Promote workspace members to help manage this workspace
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                collaborators.map((collab) => {
                  const { name, email } = getUserDisplay(collab);
                  const isOwner = workspace?.owner === (typeof collab.user === 'string' ? collab.user : collab.user._id);
                  
                  return (
                    <tr key={collab._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            collab.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            <User className={`w-5 h-5 ${
                              collab.role === 'admin' ? 'text-purple-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          collab.role === 'admin'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {collab.role === 'admin' ? 'admin' : 'view-only'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          collab.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : collab.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {collab.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {new Date(collab.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {new Date(collab.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!isOwner && (
                          <button
                            onClick={() => handleDemoteCollaborator(collab._id, name)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Remove collaborator role"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Collaborator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-600">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Promote to Collaborator
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedMemberId('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
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
                  onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'manager' | 'custom')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="manager">Manager - Limited permissions</option>
                  <option value="admin">Administrator - Full permissions</option>
                  <option value="custom">Custom - Select your own permissions</option>
                </select>
              </div>

              {/* Permissions Preview/Selection */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {selectedRole === 'custom' ? 'Select Permissions:' : 'Permissions:'}
                </p>
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                  {Object.entries(permissions).map(([key, value]) => {
                    const labels: Record<string, string> = {
                      canManageMembers: 'Manage Members',
                      canManageProjects: 'Manage Projects',
                      canManageClients: 'Manage Clients',
                      canUpdateWorkspaceDetails: 'Update Workspace Details',
                      canManageCollaborators: 'Manage Collaborators',
                      canManageInternalProjectSettings: 'Manage Internal Project Settings',
                      canAccessProjectManagerTabs: 'Access Project Manager Tabs'
                    };
                    
                    if (selectedRole === 'custom') {
                      // Interactive checkboxes for custom role
                      return (
                        <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setPermissions({
                              ...permissions,
                              [key]: e.target.checked
                            })}
                            className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                          />
                          <span>{labels[key] || key}</span>
                        </label>
                      );
                    } else {
                      // Read-only display for admin/manager
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${
                            value ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-600'
                          }`}>
                            {value && <span className="text-green-600 dark:text-green-400 font-bold text-xs">✓</span>}
                          </div>
                          <span>{labels[key] || key}</span>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-300 dark:border-gray-600">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedMemberId('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handlePromoteToCollaborator}
                disabled={!selectedMemberId}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-4 h-4" />
                Promote Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceCollaborate;
