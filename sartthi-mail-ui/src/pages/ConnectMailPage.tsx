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
    // Redirect to backend OAuth endpoint
    const token = localStorage.getItem('accessToken');
    const redirectUrl = `${API_URL}/api/auth/sartthi/connect-mail${token ? `?token=${token}` : ''}`;
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
            {user.fullName.charAt(0).toUpperCase()}
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

        {/* Actions */}
        <div className="connect-actions">
          <button onClick={handleConnect} className="btn-connect">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <a href="http://localhost:3000" className="btn-cancel">
            Cancel
          </a>
        </div>

        {/* Footer */}
        <div className="connect-footer">
          <p>
            By continuing, you allow Sartthi Mail to access your Gmail account.
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
