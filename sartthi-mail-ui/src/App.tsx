import { useState, useEffect } from 'react';
import ConnectMailPage from './pages/ConnectMailPage';
import InboxPage from './pages/InboxPage';
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
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('[Mail App] User data received:', data);

      if (data.success && data.data) {
        setUser(data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('[Mail App] Auth error:', err);
      setError(err.message || 'Authentication failed');
      // Clear invalid token
      localStorage.removeItem('accessToken');
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
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#1a1a1a',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Authentication Required</h2>
          <p style={{ color: '#999', marginBottom: '2rem' }}>
            {error || 'Please sign in through the main Sartthi application'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '0.75rem 2rem',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Go to Main App
          </button>
        </div>
      </div>
    );
  }

  const isMailConnected = user.modules?.mail?.isEnabled && user.modules?.mail?.refreshToken;

  return (
    <ThemeProvider>
      <ToastProvider>
        {isMailConnected ? (
          <InboxPage user={user} />
        ) : (
          <ConnectMailPage user={user} />
        )}
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
