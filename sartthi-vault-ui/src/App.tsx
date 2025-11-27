import { useState, useEffect } from 'react';
import './App.css';
import VaultPage from './components/VaultPage';

const API_URL = import.meta.env.VITE_API_URL || '';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    
    // Check if returning from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') || urlParams.get('code')) {
      // Wait a moment for backend to process, then re-fetch user data
      setTimeout(() => {
        checkAuth();
      }, 1000);
    }
  }, []);

  const checkAuth = async () => {
    try {
      // 1. Check for token in URL (SSO)
      const params = new URLSearchParams(window.location.search);
      let token = params.get('token');
      
      if (token) {
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

      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading Sartthi Vault...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-error">
        <h2>Authentication Required</h2>
        <p>Please log in to Sartthi Project Management first.</p>
        <button onClick={() => window.location.href = 'http://localhost:3000'}>
          Go to Login
        </button>
      </div>
    );
  }

  const isVaultConnected = user?.modules?.vault?.isEnabled;

  if (!isVaultConnected) {
    return (
      <div className="connect-vault">
        <div className="connect-container">
          <div className="vault-icon">🔐</div>
          <h1>Activate Sartthi Vault</h1>
          <p>Secure, unlimited cloud storage for your workspace.</p>
          <p className="powered-by">Powered by Google Drive</p>
          <button className="btn-connect" onClick={() => {
            const token = localStorage.getItem('accessToken');
            const url = token 
              ? `${API_URL}/api/auth/sartthi/connect-vault?token=${encodeURIComponent(token)}`
              : `${API_URL}/api/auth/sartthi/connect-vault`;
            window.location.href = url;
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            Connect Storage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vault-app">
      <VaultPage />
    </div>
  );
}

export default App;
