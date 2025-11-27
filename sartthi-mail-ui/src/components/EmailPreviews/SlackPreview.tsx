import React from 'react';
import { SlackEmailData } from '../../services/emailParsers/slackParser';
import './SlackPreview.css';

interface SlackPreviewProps {
  data: SlackEmailData;
  emailSubject: string;
  emailDate: string;
}

const SlackPreview: React.FC<SlackPreviewProps> = ({ data, emailSubject, emailDate }) => {
  const handleAction = () => {
    if (data.url) {
      window.open(data.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleChannelClick = () => {
    if (data.url) {
      window.open(data.url, '_blank', 'noopener,noreferrer');
    }
  };

  const renderMessage = () => (
    <div className="slack-message">
      <div className="message-header">
        <div className="sender-avatar">
          {data.senderAvatar ? (
            <img src={data.senderAvatar} alt={data.senderName} />
          ) : (
            <div className="avatar-placeholder">
              {data.senderName?.charAt(0).toUpperCase() || 'S'}
            </div>
          )}
        </div>
        <div className="sender-info">
          <span className="sender-name">{data.senderName || 'Slack User'}</span>
          {data.channelName && (
            <span 
              className="channel-name" 
              onClick={handleChannelClick}
              style={{ cursor: 'pointer' }}
            >
              in {data.channelName}
            </span>
          )}
        </div>
        <span className="message-time">
          {new Date(emailDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="message-content">
        <p>{data.messagePreview || data.message || 'New message from Slack'}</p>
      </div>

      <button className="btn-view-slack" onClick={handleAction}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
        </svg>
        View in Slack
      </button>
    </div>
  );

  const renderMention = () => (
    <div className="slack-mention">
      <div className="mention-badge">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="8.5" cy="7" r="4"/>
          <line x1="20" y1="8" x2="20" y2="14"/>
          <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
        <span>You were mentioned</span>
      </div>

      <div className="mention-content">
        <div className="sender-info">
          <div className="sender-avatar">
            {data.senderName?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <span className="sender-name">{data.senderName || 'Someone'}</span>
            {data.channelName && (
              <span 
                className="channel-name" 
                onClick={handleChannelClick}
                style={{ cursor: 'pointer' }}
              >
                in {data.channelName}
              </span>
            )}
          </div>
        </div>

        <div className="mention-message">
          <p>{data.messagePreview || 'mentioned you in a message'}</p>
        </div>
      </div>

      <button className="btn-reply" onClick={handleAction}>
        Reply in Thread
      </button>
    </div>
  );

  const renderChannelInvite = () => (
    <div className="slack-channel-invite">
      <div className="invite-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="8.5" cy="7" r="4"/>
          <line x1="20" y1="8" x2="20" y2="14"/>
          <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
      </div>

      <div className="invite-content">
        <h3>Channel Invitation</h3>
        {data.senderName && (
          <p className="invite-from">
            <strong>{data.senderName}</strong> invited you to join
          </p>
        )}
        {data.channelName && (
          <div 
            className="channel-badge" 
            onClick={handleChannelClick}
            style={{ cursor: 'pointer' }}
          >
            {data.channelName}
          </div>
        )}
        {data.workspaceName && (
          <p className="workspace-name">in {data.workspaceName}</p>
        )}
      </div>

      <div className="invite-actions">
        <button className="btn-accept" onClick={handleAction}>
          Join Channel
        </button>
        <button className="btn-decline">
          Decline
        </button>
      </div>
    </div>
  );

  const renderThreadReply = () => (
    <div className="slack-thread">
      <div className="thread-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>Thread Reply</span>
        {data.threadCount && (
          <span className="thread-count">{data.threadCount} replies</span>
        )}
      </div>

      <div className="thread-content">
        <div className="sender-info">
          <div className="sender-avatar">
            {data.senderName?.charAt(0).toUpperCase() || 'S'}
          </div>
          <span className="sender-name">{data.senderName || 'Someone'}</span>
          <span className="replied-text">replied to a thread</span>
        </div>

        {data.channelName && (
          <span 
            className="channel-name" 
            onClick={handleChannelClick}
            style={{ cursor: 'pointer' }}
          >
            in {data.channelName}
          </span>
        )}

        <div className="thread-message">
          <p>{data.messagePreview || 'New reply in thread'}</p>
        </div>
      </div>

      <button className="btn-view-thread" onClick={handleAction}>
        View Thread
      </button>
    </div>
  );

  return (
    <div className="slack-preview">
      {/* Slack Header */}
      <div className="slack-header">
        <div className="slack-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
          </svg>
        </div>
        <div className="slack-title">
          <span className="platform-name">Slack</span>
          {data.workspaceName && (
            <span className="workspace-badge">{data.workspaceName}</span>
          )}
          <span className="email-date">{new Date(emailDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Content based on type */}
      <div className="slack-content">
        {data.type === 'message' && renderMessage()}
        {data.type === 'mention' && renderMention()}
        {data.type === 'channel_invite' && renderChannelInvite()}
        {data.type === 'thread_reply' && renderThreadReply()}
        {(data.type === 'notification' || data.type === 'generic') && renderMessage()}
      </div>

      {/* Footer */}
      <div className="slack-footer">
        <p className="footer-text">
          This notification was sent by Slack.
          <span 
            className="footer-link" 
            onClick={() => window.open('https://slack.com', '_blank')}
          >
            Open Slack
          </span>
        </p>
      </div>
    </div>
  );
};

export default SlackPreview;
