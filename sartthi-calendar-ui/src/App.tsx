import { useState, useEffect } from 'react';
import './App.css';
import WeekGrid from './components/WeekGrid';
import OAuthLoginPage from './pages/OAuthLoginPage';
// import ConnectCalendarPage from './pages/ConnectCalendarPage';
// import CalendarPage from './pages/CalendarPage';

// Use relative path for API to leverage Vite proxy
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

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Verify token with backend
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        setIsAuthenticated(true);
      } else {
        // Auth failed, clear token
        localStorage.removeItem('accessToken');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading Sartthi Calendar...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <OAuthLoginPage />;
  }

  // Check if calendar module is enabled
  const isCalendarConnected = user?.modules?.calendar?.isEnabled;

  return (
    <div className="app-container">
      {isCalendarConnected ? (
        <WeekGrid user={user} />
      ) : (
        <div style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '1rem' }}>Connect Google Calendar</h1>
          <p style={{ marginBottom: '1.5rem', color: '#999', lineHeight: '1.6' }}>
            Connect your Google Calendar account from the main Sartthi application to view and manage your events here.
            You can connect multiple calendar accounts and switch between them easily.
          </p>
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginTop: '2rem'
          }}>
            <p style={{ fontSize: '0.9rem', color: '#999' }}>
              💡 <strong>Tip:</strong> Go to the main Sartthi app → Home → Sartthi Ecosystem → Connect Calendar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
