import { useState, useEffect } from 'react';
import './App.css';
import WeekGrid from './components/WeekGrid';
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

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

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
        <p>Loading Sartthi Calendar...</p>
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

  // Check if calendar module is enabled
  const isCalendarConnected = user?.modules?.calendar?.isEnabled;

  return (
    <div className="app-container">
      {isCalendarConnected ? (
        <WeekGrid user={user} />
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
           <h1>Connect Google Calendar</h1>
           <p style={{ marginBottom: '1rem', color: '#999' }}>
             {user?.modules?.calendar ? 'Checking connection status...' : 'Connect your Google Calendar to view events'}
           </p>
           <button onClick={() => {
             // Cookies will be sent automatically
             window.location.href = `${API_URL}/api/auth/sartthi/connect-calendar`;
           }} style={{ marginRight: '1rem' }}>
             Connect with Google
           </button>
           <button onClick={() => {
             setIsLoading(true);
             checkAuth();
           }} style={{ background: '#555', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
             Refresh Status
           </button>
        </div>
      )}
    </div>
  );
}

export default App;
