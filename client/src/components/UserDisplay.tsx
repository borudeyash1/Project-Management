import React from 'react';
import SubscriptionBadge from './SubscriptionBadge';

interface UserDisplayProps {
  name: string;
  plan: 'free' | 'pro' | 'ultra';
  avatar?: string;
  size?: 'sm' | 'md' | 'lg';
  showAvatar?: boolean;
  showBadge?: boolean;
  className?: string;
  badgePosition?: 'right' | 'overlay';
}

const UserDisplay: React.FC<UserDisplayProps> = ({
  name,
  plan,
  avatar,
  size = 'md',
  showAvatar = true,
  showBadge = true,
  className = '',
  badgePosition = 'right'
}) => {
  const getAvatarSize = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6 text-xs';
      case 'lg':
        return 'w-12 h-12 text-lg';
      case 'md':
      default:
        return 'w-8 h-8 text-sm';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      case 'md':
      default:
        return 'text-base';
    }
  };

  const getBadgeSize = () => {
    switch (size) {
      case 'sm':
        return 'sm';
      case 'lg':
        return 'lg';
      case 'md':
      default:
        return 'md';
    }
  };

  const avatarSize = getAvatarSize();
  const textSize = getTextSize();
  const badgeSize = getBadgeSize();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showAvatar && (
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className={`${avatarSize} rounded-full border-2 border-white shadow-sm`}
            />
          ) : (
            <div className={`${avatarSize} rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm`}>
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          
          {/* Badge overlay on avatar */}
          {showBadge && badgePosition === 'overlay' && (
            <div className="absolute -bottom-1 -right-1">
              <SubscriptionBadge 
                plan={plan} 
                size={badgeSize}
                showTooltip={true}
              />
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center gap-2 min-w-0">
        <span className={`${textSize} font-medium text-gray-900 truncate`}>
          {name}
        </span>
        
        {/* Badge next to name */}
        {showBadge && badgePosition === 'right' && (
          <SubscriptionBadge 
            plan={plan} 
            size={badgeSize}
            showTooltip={true}
          />
        )}
      </div>
    </div>
  );
};

export default UserDisplay;
