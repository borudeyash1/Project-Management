import './ConnectMailPage.css';

const API_URL = import.meta.env.VITE_API_URL || '';

interface ConnectMailPageProps {
  user: {
    fullName: string;
    email: string;
  };
}

function ConnectMailPage({ user }: ConnectMailPageProps) {
  const handleConnect = () => {
    const token = localStorage.getItem('accessToken');
    const redirectUrl = token
      ? `${API_URL}/api/auth/sartthi/connect-mail?token=${encodeURIComponent(token)}`
      : `${API_URL}/api/auth/sartthi/connect-mail`;
    window.location.href = redirectUrl;
  };

  return (
    <div className="connect-page">
      <div className="connect-container">
        {/* Header */}
        <div className="connect-header">
          <div className="logo-container">
            <div className="mail-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <h1>Sartthi Mail</h1>
          </div>
          <p className="subtitle">Connect your Google account to access Gmail</p>
        </div>

        {/* User Info */}
        <div className="user-info">
          <div className="user-avatar">
            {user.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <h3>{user.fullName}</h3>
            <p>{user.email}</p>
          </div>
        </div>

        {/* Permission Card */}
        <div className="permission-card">
          <h2>Sartthi Mail wants to access your Google Account</h2>
          <p className="permission-subtitle">
            This will allow Sartthi Mail to:
          </p>

          <div className="permissions-list">
            <div className="permission-item">
              <div className="permission-icon">📧</div>
              <div className="permission-text">
                <h4>Read, compose, send, and permanently delete all your email from Gmail</h4>
                <p>Access your Gmail inbox to display and manage your emails</p>
              </div>
            </div>

            <div className="permission-item">
              <div className="permission-icon">🔄</div>
              <div className="permission-text">
                <h4>Sync your emails</h4>
                <p>Keep your emails up to date across all devices</p>
              </div>
            </div>

            <div className="permission-item">
              <div className="permission-icon">🔒</div>
              <div className="permission-text">
                <h4>Secure access</h4>
                <p>Your data is encrypted and stored securely</p>
              </div>
            </div>
          </div>

          <div className="security-notice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Make sure you trust Sartthi Mail</span>
          </div>
        </div>

        {/* Footer - Informational Only */}
        <div className="connect-footer">
          <p>
            Connect your Gmail account from the main Sartthi application to access your emails here.
            You can manage multiple accounts and switch between them easily.
          </p>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
            Once connected, you'll be able to read, compose, and send emails directly from Sartthi Mail.
            You can revoke access anytime from your{' '}
            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
              Google Account settings
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConnectMailPage;
