import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPlus, Users, User, Trash2, X, Search, Mail, Calendar } from 'lucide-react';

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

interface WorkspaceMembersTabProps {
  workspaceId: string;
}

const WorkspaceMembersTab: React.FC<WorkspaceMembersTabProps> = ({ workspaceId }) => {
  const { dispatch } = useApp();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Please enter an email or username',
          duration: 3000
        }
      });
      return;
    }

    const newMember: Member = {
      _id: `member_${Date.now()}`,
      userId: 'user_id',
      name: inviteEmail.split('@')[0] || inviteEmail,
      email: inviteEmail.includes('@') ? inviteEmail : `${inviteEmail}@example.com`,
      role: 'Member',
      joinedAt: new Date(),
      status: 'pending'
    };

    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    
    // Store members in sessionStorage for AddTeamMemberModal to access
    try {
      const membersForStorage = updatedMembers.map(m => ({
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
    
    setShowInviteModal(false);
    setInviteEmail('');

    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        message: 'Member invitation sent successfully!',
        duration: 3000
      }
    });
  };

  const handleRemoveMember = (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this member from the workspace?')) {
      setMembers(members.filter(m => m._id !== memberId));
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Member removed from workspace',
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
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Workspace Members</h3>
            <p className="text-sm text-gray-600 mt-1">
              Invite members to join projects in this workspace. Members will appear in project teammate lists.
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search members by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {filteredMembers.length === 0 && !searchQuery ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No members yet</p>
              <p className="text-sm mt-1">Invite team members to collaborate on projects</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No members found matching "{searchQuery}"</p>
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div key={member._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    member.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {member.status}
                  </span>
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Box */}
        {members.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{members.length}</strong> member{members.length !== 1 ? 's' : ''} in this workspace. 
              Members can be assigned to projects and will receive notifications about project updates.
            </p>
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invite Member</h3>
              <button onClick={() => setShowInviteModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username or Email
                </label>
                <input
                  type="text"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter username or email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The user will receive an invitation to join this workspace
                </p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteMember}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

export default WorkspaceMembersTab;
