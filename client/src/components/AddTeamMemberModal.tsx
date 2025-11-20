import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (memberId: string, role: string) => void;
  currentTeamIds: string[]; // IDs of members already in the project
  workspaceId?: string;
}

interface WorkspaceMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  workspaceRole: string;
  department?: string;
}

const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  currentTeamIds,
  workspaceId
}) => {
  const { isDarkMode } = useTheme();
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(null);
  const [selectedRole, setSelectedRole] = useState('member');
  const [customRole, setCustomRole] = useState('');
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);

  // Predefined roles
  const predefinedRoles = [
    { value: 'owner', label: 'Owner', description: 'Full access to project' },
    { value: 'manager', label: 'Manager', description: 'Can manage tasks and team' },
    { value: 'member', label: 'Member', description: 'Can work on assigned tasks' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
    { value: 'custom', label: 'Custom Role', description: 'Define a custom role' }
  ];

  // Load workspace members
  useEffect(() => {
    if (isOpen) {
      if (workspaceId) {
        // Fetch workspace members from the workspace
        // TODO: Replace with actual API call to get workspace members
        // For now, get from sessionStorage or use mock data
        const storedMembers = sessionStorage.getItem(`workspace_${workspaceId}_members`);
        
        let members: WorkspaceMember[] = [];
        
        if (storedMembers) {
          try {
            members = JSON.parse(storedMembers);
          } catch (e) {
            console.error('Error parsing stored members:', e);
          }
        }
        
        // If no stored members, use mock data
        if (members.length === 0) {
          members = [
            {
              _id: 'wm1',
              name: 'Alice Johnson',
              email: 'alice@company.com',
              workspaceRole: 'Developer',
              department: 'Engineering'
            },
            {
              _id: 'wm2',
              name: 'Bob Smith',
              email: 'bob@company.com',
              workspaceRole: 'Designer',
              department: 'Design'
            },
            {
              _id: 'wm3',
              name: 'Carol Williams',
              email: 'carol@company.com',
              workspaceRole: 'QA Engineer',
              department: 'Quality Assurance'
            },
            {
              _id: 'wm4',
              name: 'David Brown',
              email: 'david@company.com',
              workspaceRole: 'Product Manager',
              department: 'Product'
            },
            {
              _id: 'wm5',
              name: 'Emma Davis',
              email: 'emma@company.com',
              workspaceRole: 'Backend Developer',
              department: 'Engineering'
            }
          ];
        }

        // Filter out members already in the project
        const availableMembers = members.filter(
          member => !currentTeamIds.includes(member._id)
        );
        
        setWorkspaceMembers(availableMembers);
      } else {
        // No workspace ID provided, use mock data for backward compatibility
        const mockMembers: WorkspaceMember[] = [
          {
            _id: 'wm1',
            name: 'Alice Johnson',
            email: 'alice@company.com',
            workspaceRole: 'Developer',
            department: 'Engineering'
          },
          {
            _id: 'wm2',
            name: 'Bob Smith',
            email: 'bob@company.com',
            workspaceRole: 'Designer',
            department: 'Design'
          },
          {
            _id: 'wm3',
            name: 'Carol Williams',
            email: 'carol@company.com',
            workspaceRole: 'QA Engineer',
            department: 'Quality Assurance'
          },
          {
            _id: 'wm4',
            name: 'David Brown',
            email: 'david@company.com',
            workspaceRole: 'Product Manager',
            department: 'Product'
          },
          {
            _id: 'wm5',
            name: 'Emma Davis',
            email: 'emma@company.com',
            workspaceRole: 'Backend Developer',
            department: 'Engineering'
          }
        ];

        // Filter out members already in the project
        const availableMembers = mockMembers.filter(
          member => !currentTeamIds.includes(member._id)
        );
        
        setWorkspaceMembers(availableMembers);
      }
    }
  }, [isOpen, currentTeamIds, workspaceId]);

  const filteredMembers = workspaceMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.workspaceRole.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMember = () => {
    if (!selectedMember) return;

    const finalRole = selectedRole === 'custom' ? customRole : selectedRole;
    
    if (!finalRole.trim()) {
      alert('Please enter a custom role');
      return;
    }

    onAddMember(selectedMember._id, finalRole);
    
    // Reset form
    setSelectedMember(null);
    setSelectedRole('member');
    setCustomRole('');
    setSearchTerm('');
  };

  const handleClose = () => {
    setSelectedMember(null);
    setSelectedRole('member');
    setCustomRole('');
    setSearchTerm('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Add Team Member
            </h2>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
              Select a member from your workspace and assign a role
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Search Members */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                Search Workspace Members
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or role..."
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-accent focus:border-accent`}
                />
              </div>
            </div>

            {/* Member List */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                Available Members ({filteredMembers.length})
              </label>
              <div className={`border rounded-lg ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} max-h-64 overflow-y-auto`}>
                {filteredMembers.length === 0 ? (
                  <div className={`p-8 text-center ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                    {searchTerm ? 'No members found matching your search' : 'All workspace members are already in this project'}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredMembers.map((member) => (
                      <button
                        key={member._id}
                        onClick={() => setSelectedMember(member)}
                        className={`w-full p-4 text-left transition-colors ${
                          selectedMember?._id === member._id
                            ? isDarkMode
                              ? 'bg-blue-900/30 border-l-4 border-accent'
                              : 'bg-blue-50 border-l-4 border-accent'
                            : isDarkMode
                            ? 'hover:bg-gray-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                          }`}>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-600'}`}>
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {member.name}
                            </h4>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                              {member.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                              {member.workspaceRole}
                            </p>
                            {member.department && (
                              <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                                {member.department}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Role Selection */}
            {selectedMember && (
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-300 bg-gray-50'}`}>
                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                  Select Role for {selectedMember.name}
                </label>
                <div className="space-y-2">
                  {predefinedRoles.map((role) => (
                    <label
                      key={role.value}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedRole === role.value
                          ? isDarkMode
                            ? 'bg-blue-900/30 border-2 border-accent'
                            : 'bg-blue-50 border-2 border-accent'
                          : isDarkMode
                          ? 'bg-gray-800 border-2 border-gray-700 hover:bg-gray-700'
                          : 'bg-white border-2 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={selectedRole === role.value}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {role.label}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                          {role.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Custom Role Input */}
                {selectedRole === 'custom' && (
                  <div className="mt-4">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                      Enter Custom Role
                    </label>
                    <input
                      type="text"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="e.g., Technical Lead, Consultant, Advisor..."
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-accent focus:border-accent`}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={handleClose}
            className={`px-4 py-2 rounded-lg font-medium ${
              isDarkMode
                ? 'bg-gray-700 text-gray-700 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleAddMember}
            disabled={!selectedMember || (selectedRole === 'custom' && !customRole.trim())}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              !selectedMember || (selectedRole === 'custom' && !customRole.trim())
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-accent text-gray-900 hover:bg-accent-hover'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Add to Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTeamMemberModal;
