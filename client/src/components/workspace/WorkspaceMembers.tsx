import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Filter,
  UserPlus,
  Mail,
  MoreVertical,
  Crown,
  Shield,
  User as UserIcon,
  Trash2,
  Edit
} from 'lucide-react';
import UserDisplay from '../UserDisplay';

interface Member {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'member';
  position: string;
  avatar?: string;
  subscription?: {
    plan: 'free' | 'pro' | 'ultra';
  };
  joinedAt: Date;
  status: 'active' | 'inactive';
}

const WorkspaceMembers: React.FC = () => {
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const currentWorkspace = state.workspaces.find(w => w._id === state.currentWorkspace);
  const isOwner = currentWorkspace?.owner === state.userProfile._id;

  // Mock members data - replace with actual API call
  const members: Member[] = [
    {
      _id: state.userProfile._id,
      name: state.userProfile.fullName,
      email: state.userProfile.email,
      role: 'owner',
      position: 'Workspace Owner',
      subscription: state.userProfile.subscription,
      joinedAt: new Date('2024-01-01'),
      status: 'active'
    },
    {
      _id: '2',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      position: 'Project Manager',
      subscription: { plan: 'pro' },
      joinedAt: new Date('2024-02-15'),
      status: 'active'
    },
    {
      _id: '3',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'member',
      position: 'Frontend Developer',
      subscription: { plan: 'free' },
      joinedAt: new Date('2024-03-10'),
      status: 'active'
    }
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return { icon: Crown, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Owner' };
      case 'admin':
        return { icon: Shield, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Admin' };
      case 'manager':
        return { icon: UserIcon, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Manager' };
      default:
        return { icon: UserIcon, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Member' };
    }
  };

  const filteredMembers = members.filter(member => {
    const name = member.name?.toLowerCase?.() || '';
    const email = member.email?.toLowerCase?.() || '';
    const query = searchQuery.toLowerCase();

    const matchesSearch = name.includes(query) || email.includes(query);
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Members</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage workspace members and their roles
          </p>
        </div>
        {isOwner && (
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <UserPlus className="w-4 h-4" />
            Invite Members
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Roles</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="member">Member</option>
        </select>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const roleBadge = getRoleBadge(member.role);
          const RoleIcon = roleBadge.icon;

          return (
            <div
              key={member._id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <UserDisplay
                  name={member.name}
                  plan={member.subscription?.plan || 'free'}
                  avatar={member.avatar}
                  size="md"
                  badgePosition="overlay"
                  showBadge={true}
                />
                {isOwner && member.role !== 'owner' && (
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{member.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${roleBadge.bg}`}>
                    <RoleIcon className={`w-3 h-3 ${roleBadge.color}`} />
                    <span className={`text-xs font-medium ${roleBadge.color}`}>
                      {roleBadge.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {member.position}
                  </span>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Joined {member.joinedAt.toLocaleDateString()}
                </div>
              </div>

              {isOwner && member.role !== 'owner' && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Edit className="w-3 h-3" />
                    Edit Role
                  </button>
                  <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Members</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{members.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {members.filter(m => m.status === 'active').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Admins</div>
          <div className="text-2xl font-bold text-purple-600">
            {members.filter(m => m.role === 'admin').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</div>
          <div className="text-2xl font-bold text-orange-600">0</div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceMembers;
