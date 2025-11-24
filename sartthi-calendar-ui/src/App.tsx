import { useState, useEffect } from 'react';
import './App.css';
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
  }, []);

  const checkAuth = async () => {
    try {
      // 1. Check for token in URL (passed from main app)
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');

      if (tokenFromUrl) {
        // Save token to localStorage
        localStorage.setItem('accessToken', tokenFromUrl);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // 2. Get token from localStorage
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setIsLoading(false);
        return;
      }

      // 3. Verify token with backend
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        // Token invalid
        localStorage.removeItem('accessToken');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
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
        // <CalendarPage user={user} />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Calendar Connected!</h1>
          <p>Welcome back, {user.name}</p>
        </div>
      ) : (
        // <ConnectCalendarPage user={user} />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
           <h1>Connect Google Calendar</h1>
           <button onClick={() => {
             const token = localStorage.getItem('accessToken');
             window.location.href = `${API_URL}/api/auth/sartthi/connect-calendar${token ? `?token=${token}` : ''}`;
           }}>
             Connect with Google
           </button>
        </div>
      )}
    </div>
  );
}

export default App;
