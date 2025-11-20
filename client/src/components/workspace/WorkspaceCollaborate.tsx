import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserPlus,
  Mail,
  Shield,
  Eye,
  Edit,
  Trash2,
  Settings,
  Search,
  MoreVertical,
  Check,
  X,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Collaborator {
  _id: string;
  email: string;
  name?: string;
  privilege: 'view-only' | 'edit' | 'comment' | 'admin';
  status: 'pending' | 'active' | 'inactive';
  invitedBy: string;
  invitedAt: Date;
  lastActive?: Date;
}

const WorkspaceCollaborate: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedPrivilege, setSelectedPrivilege] = useState<'view-only' | 'edit' | 'comment' | 'admin'>('view-only');
  const [inviteMessage, setInviteMessage] = useState('');

  const currentWorkspace = state.workspaces.find(w => w._id === state.currentWorkspace);
  const isOwner = currentWorkspace?.owner === state.userProfile._id;

  // Mock collaborators data
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      _id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      privilege: 'edit',
      status: 'active',
      invitedBy: state.userProfile._id,
      invitedAt: new Date('2024-01-15'),
      lastActive: new Date('2024-03-20')
    },
    {
      _id: '2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      privilege: 'view-only',
      status: 'active',
      invitedBy: state.userProfile._id,
      invitedAt: new Date('2024-02-10'),
      lastActive: new Date('2024-03-19')
    },
    {
      _id: '3',
      email: 'bob.wilson@example.com',
      privilege: 'comment',
      status: 'pending',
      invitedBy: state.userProfile._id,
      invitedAt: new Date('2024-03-18')
    }
  ]);

  const privileges = [
    {
      value: 'view-only',
      label: 'View Only',
      description: 'Can view all workspace content but cannot make changes',
      icon: Eye,
      permissions: ['View projects', 'View tasks', 'View documents', 'View team members']
    },
    {
      value: 'comment',
      label: 'Comment',
      description: 'Can view and add comments but cannot edit',
      icon: Mail,
      permissions: ['All View permissions', 'Add comments', 'Reply to discussions']
    },
    {
      value: 'edit',
      label: 'Edit',
      description: 'Can view, comment, and edit content',
      icon: Edit,
      permissions: ['All Comment permissions', 'Edit tasks', 'Edit documents', 'Create tasks']
    },
    {
      value: 'admin',
      label: 'Admin',
      description: 'Full access except workspace deletion',
      icon: Shield,
      permissions: ['All Edit permissions', 'Manage team', 'Manage settings', 'Invite collaborators']
    }
  ];

  const filteredCollaborators = collaborators.filter(collab =>
    collab.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collab.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInviteCollaborator = () => {
    if (!inviteEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    // Check if already invited
    if (collaborators.some(c => c.email === inviteEmail)) {
      alert('This email has already been invited');
      return;
    }

    const newCollaborator: Collaborator = {
      _id: Date.now().toString(),
      email: inviteEmail,
      privilege: selectedPrivilege,
      status: 'pending',
      invitedBy: state.userProfile._id,
      invitedAt: new Date()
    };

    setCollaborators([...collaborators, newCollaborator]);
    
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        type: 'success',
        message: `Invitation sent to ${inviteEmail} with ${selectedPrivilege} access`
      }
    });

    // Reset form
    setInviteEmail('');
    setSelectedPrivilege('view-only');
    setInviteMessage('');
    setShowInviteModal(false);
  };

  const handleRemoveCollaborator = (collaboratorId: string) => {
    if (window.confirm('Are you sure you want to remove this collaborator?')) {
      setCollaborators(collaborators.filter(c => c._id !== collaboratorId));
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          type: 'success',
          message: 'Collaborator removed successfully'
        }
      });
    }
  };

  const getPrivilegeColor = (privilege: string) => {
    switch (privilege) {
      case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-600';
      case 'edit': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-accent-light';
      case 'comment': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-600';
      case 'view-only': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-600';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-600';
      case 'inactive': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = [
    { label: 'Total Collaborators', value: collaborators.length, color: 'text-accent-dark' },
    { label: 'Active', value: collaborators.filter(c => c.status === 'active').length, color: 'text-green-600' },
    { label: 'Pending', value: collaborators.filter(c => c.status === 'pending').length, color: 'text-yellow-600' },
    { label: 'Admins', value: collaborators.filter(c => c.privilege === 'admin').length, color: 'text-red-600' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Collaborators</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Invite external collaborators to your workspace
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite Collaborator
          </button>
        )}
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

      {/* Search */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
        <input
          type="text"
          placeholder="Search collaborators..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
        />
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
                {isOwner && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCollaborators.map((collaborator) => (
                <tr key={collaborator._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-accent-dark dark:text-accent-light font-medium">
                          {collaborator.name ? collaborator.name.charAt(0).toUpperCase() : collaborator.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {collaborator.name || 'Pending'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-200">
                          {collaborator.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPrivilegeColor(collaborator.privilege)}`}>
                      {collaborator.privilege}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(collaborator.status)}`}>
                      {collaborator.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-200">
                    {collaborator.invitedAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-200">
                    {collaborator.lastActive ? collaborator.lastActive.toLocaleDateString() : '-'}
                  </td>
                  {isOwner && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveCollaborator(collaborator._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-600 dark:hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredCollaborators.length === 0 && (
        <div className="text-center py-12">
          <UserPlus className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No collaborators found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Get started by inviting your first collaborator'}
          </p>
          {isOwner && !searchQuery && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Invite Collaborator
            </button>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-600">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Invite Collaborator
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Invite someone to collaborate on your workspace
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-200" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="collaborator@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-accent"
                  />
                </div>

                {/* Privilege Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-3">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Access Privilege *
                  </label>
                  <div className="space-y-3">
                    {privileges.map((privilege) => {
                      const Icon = privilege.icon;
                      return (
                        <label
                          key={privilege.value}
                          className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-colors border-2 ${
                            selectedPrivilege === privilege.value
                              ? 'border-accent bg-blue-50 dark:bg-blue-900/30'
                              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="privilege"
                            value={privilege.value}
                            checked={selectedPrivilege === privilege.value}
                            onChange={(e) => setSelectedPrivilege(e.target.value as any)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="w-5 h-5 text-gray-600 dark:text-gray-200" />
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {privilege.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              {privilege.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {privilege.permissions.map((perm, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                                >
                                  <Check className="w-3 h-3 inline mr-1" />
                                  {perm}
                                </span>
                              ))}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Add a personal message to the invitation..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-accent"
                  />
                </div>

                {/* Info Alert */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-accent-dark dark:text-accent-light mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-700">
                    <p className="font-medium mb-1">About Collaborators</p>
                    <p>
                      Collaborators are external users who can access your workspace with specific permissions.
                      They will receive an email invitation to join.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-300 dark:border-gray-600">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-700 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteCollaborator}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
              >
                <UserPlus className="w-4 h-4" />
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceCollaborate;
