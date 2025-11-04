import React from 'react';
import { Crown, Star, Circle } from 'lucide-react';

interface SubscriptionBadgeProps {
  plan: 'free' | 'pro' | 'ultra';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({ 
  plan, 
  size = 'md', 
  showTooltip = true,
  className = '' 
}) => {
  const getBadgeConfig = () => {
    switch (plan) {
      case 'pro':
        return {
          icon: Star,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          tooltip: 'Pro User - Advanced features unlocked',
          glow: 'shadow-blue-500/25'
        };
      case 'ultra':
        return {
          icon: Crown,
          color: 'text-purple-500',
          bgColor: 'bg-purple-100',
          tooltip: 'Ultra User - All premium features unlocked',
          glow: 'shadow-purple-500/25'
        };
      case 'free':
      default:
        return {
          icon: Circle,
          color: 'text-gray-400',
          bgColor: 'bg-gray-100',
          tooltip: 'Free User',
          glow: 'shadow-gray-500/10'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4 p-0.5';
      case 'lg':
        return 'w-8 h-8 p-1.5';
      case 'md':
      default:
        return 'w-6 h-6 p-1';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-5 h-5';
      case 'md':
      default:
        return 'w-4 h-4';
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;
  const sizeClasses = getSizeClasses();
  const iconSize = getIconSize();

  // Don't show badge for free users
  if (plan === 'free') {
    return null;
  }

  const badge = (
    <div 
      className={`
        inline-flex items-center justify-center rounded-full
        ${sizeClasses} ${config.bgColor} ${config.glow}
        shadow-lg border-2 border-white
        transition-all duration-200 hover:scale-110
        ${className}
      `}
    >
      <Icon 
        className={`${iconSize} ${config.color} fill-current`}
      />
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <div className="relative group">
      {badge}
      
      {/* Tooltip - appears below */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {config.tooltip}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
      </div>
    </div>
  );
};

export default SubscriptionBadge;
