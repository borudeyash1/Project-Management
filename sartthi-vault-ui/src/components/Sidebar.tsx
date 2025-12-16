import React, { useState } from 'react';
import { Home, Clock, Star, Trash2, Cloud, ChevronLeft, ChevronRight } from 'lucide-react';
import StorageMeter from './StorageMeter';
import ProfileMenu from './ProfileMenu/ProfileMenu';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  usedGB: number;
  totalGB: number;
  user?: {
    rawUser?: any; // To pass full user object if needed
    fullName: string;
    email: string;
    photo?: string;
  };
}

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  usedGB,
  totalGB,
  user = { fullName: 'User', email: 'user@example.com' }
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'home', label: 'My Vault', icon: <Home size={20} /> },
    { id: 'recent', label: 'Recent', icon: <Clock size={20} /> },
    { id: 'starred', label: 'Starred', icon: <Star size={20} /> },
    { id: 'trash', label: 'Trash', icon: <Trash2 size={20} /> },
  ];

  return (
    <div
      className={`bg-sidebar-bg border-r border-border-subtle flex flex-col h-full transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* Header with Logo and Collapse Button */}
      <div className="p-4 flex items-center justify-between border-b border-border-subtle">
        {!isCollapsed && (
          <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
            <img src="/logo.png" alt="Sartthi Vault" className="h-6" />
            <span className="text-[18px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-tight truncate pl-0.5">
              Vault
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/20 mx-auto">
            <Cloud size={24} />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-hover-bg rounded-lg transition-colors text-text-muted hover:text-text-primary ml-2"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* User Profile */}
      <div className={`p-4 border-b border-border-subtle ${isCollapsed ? 'flex justify-center' : ''}`}>
        {!isCollapsed ? (
          <ProfileMenu user={{ fullName: user.fullName || 'User', email: user.email }} />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm">
            {(user.fullName || user.email).charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${activeView === item.id
              ? 'bg-accent-green/10 text-accent-green font-medium shadow-sm'
              : 'text-text-muted hover:bg-hover-bg hover:text-text-primary'
              } ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? item.label : ''}
          >
            <span className={`transition-colors flex-shrink-0 ${activeView === item.id ? 'text-accent-green' : 'text-text-muted group-hover:text-text-primary'}`}>
              {item.icon}
            </span>
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Storage Meter */}
      <div className={`p-4 border-t border-border-subtle bg-sidebar-bg/50 backdrop-blur-sm ${isCollapsed ? 'px-2' : 'p-6'}`}>
        <StorageMeter usedGB={usedGB} totalGB={totalGB} isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

export default Sidebar;
