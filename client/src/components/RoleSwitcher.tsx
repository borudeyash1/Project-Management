import React from 'react';
import { Crown, Shield, User } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: 'owner' | 'project-manager' | 'employee';
  onRoleChange: (role: 'owner' | 'project-manager' | 'employee') => void;
  currentUserId: string;
  onUserChange: (userId: string, userName: string, role: string) => void;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ 
  currentRole, 
  onRoleChange,
  currentUserId,
  onUserChange 
}) => {
  const roles = [
    { id: 'owner', label: 'Workspace Owner', icon: Crown, color: 'text-yellow-600 bg-yellow-100', userId: 'user_owner_123', userName: 'John Doe (Owner)' },
    { id: 'project-manager', label: 'Project Manager', icon: Shield, color: 'text-purple-600 bg-purple-100', userId: 'user_pm_456', userName: 'Jane Smith (PM)' },
    { id: 'employee', label: 'Employee', icon: User, color: 'text-accent-dark bg-blue-100', userId: 'user_emp_789', userName: 'Bob Wilson (Employee)' }
  ];

  const handleRoleSwitch = (role: any) => {
    const roleData = roles.find(r => r.id === role.id);
    if (roleData) {
      onRoleChange(role.id);
      onUserChange(roleData.userId, roleData.userName, role.id);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-4">
        <div className="text-xs font-semibold text-gray-600 mb-2 uppercase">
          Testing Mode - Switch Role
        </div>
        <div className="space-y-2">
          {roles.map((role) => {
            const Icon = role.icon;
            const isActive = currentRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleSwitch(role)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? `${role.color} border-2 border-gray-900 font-semibold`
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{role.label}</span>
                {isActive && (
                  <span className="ml-auto text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Current User: {roles.find(r => r.id === currentRole)?.userName}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            ID: {currentUserId}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSwitcher;
