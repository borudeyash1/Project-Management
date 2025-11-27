import React from 'react';
import { LinkedInEmailData } from '../../services/emailParsers/linkedinParser';
import './LinkedInPreview.css';

interface LinkedInPreviewProps {
  data: LinkedInEmailData;
  emailSubject: string;
  emailDate: string;
}

const LinkedInPreview: React.FC<LinkedInPreviewProps> = ({ data, emailSubject, emailDate }) => {
  const handleAction = () => {
    if (data.actionUrl) {
      window.open(data.actionUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleProfileClick = () => {
    if (data.actionUrl) {
      window.open(data.actionUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const renderConnectionRequest = () => (
    <div className="linkedin-connection-request">
      <div className="connection-header">
        <div 
          className="profile-avatar" 
          onClick={handleProfileClick}
          style={{ cursor: 'pointer' }}
        >
          {data.senderPhoto ? (
            <img src={data.senderPhoto} alt={data.senderName} />
          ) : (
            <div className="avatar-placeholder">
              {data.senderName?.charAt(0).toUpperCase() || 'L'}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h3 
            className="sender-name" 
            onClick={handleProfileClick}
            style={{ cursor: 'pointer' }}
          >
            {data.senderName || 'LinkedIn User'}
          </h3>
          {data.senderTitle && (
            <p className="sender-title">{data.senderTitle}</p>
          )}
          {data.companyName && (
            <p className="sender-company">@ {data.companyName}</p>
          )}
        </div>
      </div>

      <div className="connection-message">
        <p>{data.message || `${data.senderName} wants to connect with you on LinkedIn`}</p>
      </div>

      <div className="connection-actions">
        <button 
          className="btn-accept" 
          onClick={handleAction}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Accept
        </button>
        <button 
          className="btn-view" 
          onClick={handleAction}
        >
          View Profile
        </button>
      </div>
    </div>
  );

  const renderMessage = () => (
    <div className="linkedin-message">
      <div className="message-header">
        <div 
          className="profile-avatar small" 
          onClick={handleProfileClick}
          style={{ cursor: 'pointer' }}
        >
          {data.senderPhoto ? (
            <img src={data.senderPhoto} alt={data.senderName} />
          ) : (
            <div className="avatar-placeholder">
              {data.senderName?.charAt(0).toUpperCase() || 'L'}
            </div>
          )}
        </div>
        <div className="message-info">
          <h4 
            className="sender-name" 
            onClick={handleProfileClick}
            style={{ cursor: 'pointer' }}
          >
            {data.senderName || 'LinkedIn User'}
          </h4>
          {data.senderTitle && <p className="sender-title">{data.senderTitle}</p>}
        </div>
      </div>

      <div className="message-content">
        <p>{data.message || 'New message from LinkedIn'}</p>
      </div>

      <button className="btn-reply" onClick={handleAction}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        Reply on LinkedIn
      </button>
    </div>
  );

  const renderJobAlert = () => (
    <div className="linkedin-job-alert">
      <div className="job-header">
        <div className="job-icon">💼</div>
        <div className="job-badge">Job Recommendation</div>
      </div>

      <div className="job-details">
        <h3 
          className="job-title" 
          onClick={handleAction}
          style={{ cursor: 'pointer' }}
        >
          {data.jobTitle || 'Job Opportunity'}
        </h3>
        {data.jobCompany && (
          <p className="job-company">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            {data.jobCompany}
          </p>
        )}
        {data.jobLocation && (
          <p className="job-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {data.jobLocation}
          </p>
        )}
      </div>

      <button className="btn-view-job" onClick={handleAction}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        View Job Details
      </button>
    </div>
  );

  const renderGeneric = () => (
    <div className="linkedin-generic">
      <div className="generic-content">
        <h3>{emailSubject}</h3>
        {data.message && <p>{data.message}</p>}
      </div>

      <button className="btn-view" onClick={handleAction}>
        View on LinkedIn
      </button>
    </div>
  );

  return (
    <div className="linkedin-preview">
      {/* LinkedIn Header */}
      <div className="linkedin-header">
        <div className="linkedin-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#0A66C2">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </div>
        <div className="linkedin-title">
          <span className="platform-name">LinkedIn</span>
          <span className="email-date">{new Date(emailDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Content based on type */}
      <div className="linkedin-content">
        {data.type === 'connection_request' && renderConnectionRequest()}
        {data.type === 'message' && renderMessage()}
        {data.type === 'job_alert' && renderJobAlert()}
        {(data.type === 'notification' || data.type === 'invitation' || data.type === 'generic') && renderGeneric()}
      </div>

      {/* Footer */}
      <div className="linkedin-footer">
        <p className="footer-text">
          This email was sent by LinkedIn. 
          <span 
            className="footer-link" 
            onClick={() => window.open('https://www.linkedin.com', '_blank')}
          >
            Visit LinkedIn
          </span>
        </p>
      </div>
    </div>
  );
};

export default LinkedInPreview;
