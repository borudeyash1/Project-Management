import React from 'react';
import './EmailSkeleton.css';

const EmailSkeleton: React.FC = () => {
  return (
    <div className="email-skeleton">
      {/* Header Skeleton */}
      <div className="skeleton-header">
        <div className="skeleton-bar skeleton-logo"></div>
        <div className="skeleton-bar skeleton-title"></div>
      </div>

      {/* Content Skeleton */}
      <div className="skeleton-content">
        {/* Avatar and Info */}
        <div className="skeleton-row">
          <div className="skeleton-circle"></div>
          <div className="skeleton-text-group">
            <div className="skeleton-bar skeleton-name"></div>
            <div className="skeleton-bar skeleton-subtitle"></div>
          </div>
        </div>

        {/* Message Content */}
        <div className="skeleton-message">
          <div className="skeleton-bar skeleton-line-full"></div>
          <div className="skeleton-bar skeleton-line-full"></div>
          <div className="skeleton-bar skeleton-line-medium"></div>
        </div>

        {/* Details Section */}
        <div className="skeleton-details">
          <div className="skeleton-bar skeleton-line-short"></div>
          <div className="skeleton-bar skeleton-line-short"></div>
          <div className="skeleton-bar skeleton-line-short"></div>
        </div>

        {/* Action Button */}
        <div className="skeleton-button"></div>
      </div>

      {/* Footer Skeleton */}
      <div className="skeleton-footer">
        <div className="skeleton-bar skeleton-footer-text"></div>
      </div>
    </div>
  );
};

export default EmailSkeleton;
