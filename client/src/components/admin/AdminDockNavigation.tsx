import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Package,
  Shield,
  LogOut
} from 'lucide-react';
import { AdminDock, AdminDockIcon, AdminDockDivider } from '../ui/AdminDock';

interface AdminNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const AdminDockNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const adminNavItems: AdminNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'devices', label: 'Devices', icon: Shield, path: '/admin/devices' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'releases', label: 'Releases', icon: Package, path: '/admin/releases' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' }
  ];

  const handleItemClick = (item: AdminNavItem) => {
    navigate(item.path);
  };

  const handleLogout = () => {
    console.log('🔒 [ADMIN DOCK] Logging out...');
    
    // Clear all admin session data from localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    
    // Clear any admin-related session storage
    sessionStorage.clear();
    
    console.log('✅ [ADMIN DOCK] Session cleared, redirecting to login');
    
    // Redirect to admin login
    navigate('/my-admin/login', { replace: true });
  };

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/admin/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <AdminDock direction="middle">
      {/* Admin Navigation Items */}
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        
        return (
          <AdminDockIcon
            key={item.id}
            onClick={() => handleItemClick(item)}
            active={active}
            tooltip={item.label}
          >
            <Icon className="w-5 h-5" />
          </AdminDockIcon>
        );
      })}

      {/* Divider */}
      <AdminDockDivider />

      {/* Logout */}
      <AdminDockIcon
        onClick={handleLogout}
        tooltip="Logout"
        className="!bg-red-100 dark:!bg-red-900/30 !text-red-600 dark:!text-red-400 hover:!bg-red-200 dark:hover:!bg-red-900/50"
      >
        <LogOut className="w-5 h-5" />
      </AdminDockIcon>
    </AdminDock>
  );
};

export default AdminDockNavigation;
