import React from 'react';
import { GitHubEmailData } from '../../services/emailParsers/githubParser';
import './GitHubPreview.css';

interface GitHubPreviewProps {
  data: GitHubEmailData;
  emailSubject: string;
  emailDate: string;
}

const GitHubPreview: React.FC<GitHubPreviewProps> = ({ data, emailSubject, emailDate }) => {
  const handleAction = () => {
    if (data.url) {
      window.open(data.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRepoClick = () => {
    if (data.repoOwner && data.repoName) {
      window.open(`https://github.com/${data.repoOwner}/${data.repoName}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAuthorClick = () => {
    if (data.author) {
      window.open(`https://github.com/${data.author}`, '_blank', 'noopener,noreferrer');
    }
  };

  const getStatusBadge = () => {
    if (data.status === 'merged') {
      return <span className="status-badge merged">Merged</span>;
    } else if (data.status === 'closed') {
      return <span className="status-badge closed">Closed</span>;
    } else {
      return <span className="status-badge open">Open</span>;
    }
  };

  const getTypeIcon = () => {
    switch (data.type) {
      case 'pull_request':
        return (
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/>
          </svg>
        );
      case 'issue':
        return (
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/>
          </svg>
        );
      case 'release':
        return (
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2.5 7.775V2.75a.25.25 0 01.25-.25h5.025a.25.25 0 01.177.073l6.25 6.25a.25.25 0 010 .354l-5.025 5.025a.25.25 0 01-.354 0l-6.25-6.25a.25.25 0 01-.073-.177zm-1.5 0V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 010 2.474l-5.026 5.026a1.75 1.75 0 01-2.474 0l-6.25-6.25A1.75 1.75 0 011 7.775zM6 5a1 1 0 100 2 1 1 0 000-2z"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        );
    }
  };

  const renderPullRequest = () => (
    <div className="github-pr">
      <div className="pr-header">
        <div className="pr-icon">{getTypeIcon()}</div>
        <div className="pr-info">
          <div className="pr-title-row">
            <h3 className="pr-title" onClick={handleAction} style={{ cursor: 'pointer' }}>
              {data.title}
            </h3>
            {getStatusBadge()}
          </div>
          <div className="pr-meta">
            <span className="pr-number" onClick={handleAction} style={{ cursor: 'pointer' }}>
              #{data.prNumber}
            </span>
            {data.author && (
              <>
                <span className="meta-separator">•</span>
                <span className="pr-author" onClick={handleAuthorClick} style={{ cursor: 'pointer' }}>
                  by @{data.author}
                </span>
              </>
            )}
            {data.branch && (
              <>
                <span className="meta-separator">•</span>
                <span className="pr-branch">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z"/>
                  </svg>
                  {data.branch}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {data.description && (
        <div className="pr-description">
          <p>{data.description}</p>
        </div>
      )}

      {data.labels && data.labels.length > 0 && (
        <div className="pr-labels">
          {data.labels.map((label, idx) => (
            <span key={idx} className="label-tag">{label}</span>
          ))}
        </div>
      )}

      <div className="pr-actions">
        <button className="btn-view-pr" onClick={handleAction}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zm.5 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 00.471.696l2.5 1a.75.75 0 00.557-1.392L8.5 7.742V4.75z"/>
          </svg>
          View Pull Request
        </button>
        <button className="btn-view-repo" onClick={handleRepoClick}>
          View Repository
        </button>
      </div>
    </div>
  );

  const renderIssue = () => (
    <div className="github-issue">
      <div className="issue-header">
        <div className="issue-icon">{getTypeIcon()}</div>
        <div className="issue-info">
          <div className="issue-title-row">
            <h3 className="issue-title" onClick={handleAction} style={{ cursor: 'pointer' }}>
              {data.title}
            </h3>
            {getStatusBadge()}
          </div>
          <div className="issue-meta">
            <span className="issue-number" onClick={handleAction} style={{ cursor: 'pointer' }}>
              #{data.issueNumber}
            </span>
            {data.author && (
              <>
                <span className="meta-separator">•</span>
                <span className="issue-author" onClick={handleAuthorClick} style={{ cursor: 'pointer' }}>
                  opened by @{data.author}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {data.description && (
        <div className="issue-description">
          <p>{data.description}</p>
        </div>
      )}

      {data.labels && data.labels.length > 0 && (
        <div className="issue-labels">
          {data.labels.map((label, idx) => (
            <span key={idx} className="label-tag">{label}</span>
          ))}
        </div>
      )}

      <div className="issue-actions">
        <button className="btn-view-issue" onClick={handleAction}>
          View Issue
        </button>
        <button className="btn-comment" onClick={handleAction}>
          Add Comment
        </button>
      </div>
    </div>
  );

  const renderRelease = () => (
    <div className="github-release">
      <div className="release-header">
        <div className="release-icon">{getTypeIcon()}</div>
        <div className="release-badge">New Release</div>
      </div>

      <div className="release-info">
        <h3 className="release-title" onClick={handleAction} style={{ cursor: 'pointer' }}>
          {data.title}
        </h3>
        {data.description && <p className="release-description">{data.description}</p>}
      </div>

      <button className="btn-view-release" onClick={handleAction}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M7.47 10.78a.75.75 0 001.06 0l3.75-3.75a.75.75 0 00-1.06-1.06L8.75 8.44V1.75a.75.75 0 00-1.5 0v6.69L4.78 5.97a.75.75 0 00-1.06 1.06l3.75 3.75zM3.75 13a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5z"/>
        </svg>
        Download Release
      </button>
    </div>
  );

  const renderCommit = () => (
    <div className="github-commit">
      <div className="commit-header">
        <div className="commit-icon">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.93 8.5a4.002 4.002 0 01-7.86 0H.75a.75.75 0 010-1.5h3.32a4.002 4.002 0 017.86 0h3.32a.75.75 0 010 1.5h-3.32zM8 6a2 2 0 100 4 2 2 0 000-4z"/>
          </svg>
        </div>
        <div className="commit-info">
          <h3 className="commit-title" onClick={handleAction} style={{ cursor: 'pointer' }}>
            {data.title}
          </h3>
          <div className="commit-meta">
            {data.commitHash && (
              <span className="commit-hash" onClick={handleAction} style={{ cursor: 'pointer' }}>
                {data.commitHash}
              </span>
            )}
            {data.author && (
              <>
                <span className="meta-separator">•</span>
                <span className="commit-author" onClick={handleAuthorClick} style={{ cursor: 'pointer' }}>
                  @{data.author}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <button className="btn-view-commit" onClick={handleAction}>
        View Commit
      </button>
    </div>
  );

  return (
    <div className="github-preview">
      {/* GitHub Header */}
      <div className="github-header">
        <div className="github-logo">
          <svg width="24" height="24" viewBox="0 0 16 16" fill="white">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </div>
        <div className="github-title">
          <span 
            className="repo-name" 
            onClick={handleRepoClick}
            style={{ cursor: 'pointer' }}
          >
            {data.repoOwner}/{data.repoName}
          </span>
          <span className="email-date">{new Date(emailDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Content based on type */}
      <div className="github-content">
        {data.type === 'pull_request' && renderPullRequest()}
        {data.type === 'issue' && renderIssue()}
        {data.type === 'release' && renderRelease()}
        {data.type === 'commit' && renderCommit()}
        {(data.type === 'mention' || data.type === 'review' || data.type === 'generic') && renderPullRequest()}
      </div>

      {/* Footer */}
      <div className="github-footer">
        <p className="footer-text">
          This notification was sent by GitHub.
          <span 
            className="footer-link" 
            onClick={() => window.open('https://github.com', '_blank')}
          >
            Visit GitHub
          </span>
        </p>
      </div>
    </div>
  );
};

export default GitHubPreview;
