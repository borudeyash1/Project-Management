import { useState, useEffect } from 'react';
import InboxPage from './pages/InboxPage';
import OAuthLoginPage from './pages/OAuthLoginPage';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || '';

interface User {
  _id: string;
  email: string;
  fullName: string;
  modules?: {
    mail?: {
      isEnabled: boolean;
      refreshToken?: string;
    };
  };
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('[Mail App] Checking authentication...');
      console.log('[Mail App] API URL:', API_URL);

      // 1. Check for token in URL (SSO)
      const params = new URLSearchParams(window.location.search);
      let token = params.get('token');

      if (token) {
        console.log('[Mail App] Found token in URL, saving to storage');
        localStorage.setItem('accessToken', token);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        // 2. Check storage
        token = localStorage.getItem('accessToken');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (!token) {
        console.log('[Mail App] No token found');
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('[Mail App] Fetching user data...');
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
        headers
      });

      console.log('[Mail App] Response status:', response.status);

      if (!response.ok) {
        console.log('[Mail App] Auth failed, clearing token');
        localStorage.removeItem('accessToken');
        setUser(null);
        setError('Authentication failed');
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[Mail App] User data received:', data);

      if (data.success && data.data) {
        setUser(data.data);
        setError(null);
      } else {
        console.log('[Mail App] Invalid response format');
        localStorage.removeItem('accessToken');
        setUser(null);
        setError('Invalid response format');
      }
    } catch (err: any) {
      console.error('[Mail App] Auth error:', err);
      setError(err.message || 'Authentication failed');
      // Clear invalid token
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#1a1a1a'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{
            width: '50px',
            height: '50px',
            border: '4px solid #333',
            borderTop: '4px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#999' }}>Loading Sartthi Mail...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return <OAuthLoginPage />;
  }

  const isMailConnected = user.modules?.mail?.isEnabled && user.modules?.mail?.refreshToken;

  return (
    <ThemeProvider>
      <ToastProvider>
        {isMailConnected ? (
          <InboxPage user={user} />
        ) : (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '1rem' }}>Connect Gmail</h1>
            <p style={{ marginBottom: '1.5rem', color: '#999', lineHeight: '1.6' }}>
              Connect your Gmail account from the main Sartthi application to access your emails here.
              You can connect multiple email accounts and switch between them easily.
            </p>
            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginTop: '2rem'
            }}>
              <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '0.75rem' }}>
                💡 <strong>Tip:</strong> Go to the main Sartthi app → Settings → Connected Accounts → Sartthi Mail → Connect your Gmail
              </p>
              <p style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>
                Already connected? Click "Set Active" on your account to sync it with Sartthi Mail.
              </p>
            </div>
          </div>
        )}
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
