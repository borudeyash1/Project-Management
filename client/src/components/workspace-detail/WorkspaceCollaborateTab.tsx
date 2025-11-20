import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPlus, Users, User, Trash2, X, Mail, Shield } from 'lucide-react';

interface Collaborator {
  _id: string;
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  status: 'pending' | 'accepted';
  invitedAt: Date;
}

interface WorkspaceCollaborateTabProps {
  workspaceId: string;
}

const WorkspaceCollaborateTab: React.FC<WorkspaceCollaborateTabProps> = ({ workspaceId }) => {
  const { dispatch } = useApp();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [emailOrId, setEmailOrId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor'>('editor');

  const handleAddCollaborator = () => {
    if (!emailOrId.trim()) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Please enter an email or user ID',
          duration: 3000
        }
      });
      return;
    }

    const newCollaborator: Collaborator = {
      _id: `collab_${Date.now()}`,
      userId: 'user_id',
      email: emailOrId,
      name: emailOrId.split('@')[0] || emailOrId,
      role: selectedRole,
      status: 'pending',
      invitedAt: new Date()
    };
    
    setCollaborators([...collaborators, newCollaborator]);
    setEmailOrId('');
    setSelectedRole('editor');
    setShowAddModal(false);
    
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        message: 'Collaborator invitation sent!',
        duration: 3000
      }
    });
  };

  const handleRemoveCollaborator = (collabId: string) => {
    if (window.confirm('Are you sure you want to remove this collaborator?')) {
      setCollaborators(collaborators.filter(c => c._id !== collabId));
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Collaborator removed',
          duration: 3000
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Workspace Collaborators</h3>
            <p className="text-sm text-gray-600 mt-1">
              Invite others to help manage this workspace. Collaborators can edit workspace settings and manage members.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Collaborator
          </button>
        </div>

        {/* Collaborator List */}
        <div className="space-y-3">
          {collaborators.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="font-medium">No collaborators yet</p>
              <p className="text-sm mt-1">Invite someone to help manage this workspace</p>
            </div>
          ) : (
            collaborators.map((collab) => (
              <div key={collab._id} className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-accent-dark" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{collab.name}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {collab.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    collab.status === 'accepted' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {collab.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    collab.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {collab.role}
                  </span>
                  <button
                    onClick={() => handleRemoveCollaborator(collab._id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Role Descriptions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Collaborator Roles
          </h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div>
              <span className="font-medium">Admin:</span> Can manage all workspace settings, members, and collaborators
            </div>
            <div>
              <span className="font-medium">Editor:</span> Can manage members and projects, but cannot change workspace settings
            </div>
          </div>
        </div>
      </div>

      {/* Add Collaborator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Collaborator</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5 text-gray-600 hover:text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email or User ID
                </label>
                <input
                  type="text"
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  placeholder="Enter email or user ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'editor')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCollaborator}
                  className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
                >
                  Send Invite
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
