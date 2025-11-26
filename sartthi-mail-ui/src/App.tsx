import { useState, useEffect } from 'react';
import ConnectMailPage from './pages/ConnectMailPage';
import InboxPage from './pages/InboxPage';
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
      
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include', // Send cookies with request
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[Mail App] Response status:', response.status);
      console.log('[Mail App] Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('[Mail App] User data:', data);
        setUser(data.data);
      } else {
        const errorData = await response.text();
        console.error('[Mail App] Auth failed:', errorData);
        setError('Not authenticated. Please login to the main Sartthi app first.');
      }
    } catch (err) {
      console.error('[Mail App] Auth check failed:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Sartthi Mail...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>Authentication Required</h2>
        <p>{error}</p>
        <a href="http://localhost:3000/home" className="btn-primary">
          Go to Sartthi App
        </a>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-container">
        <h2>Not Authenticated</h2>
        <p>Please login to the main Sartthi app first.</p>
        <a href="http://localhost:3000/home" className="btn-primary">
          Go to Sartthi App
        </a>
      </div>
    );
  }

  // Check if Mail module is enabled
  const isMailEnabled = user.modules?.mail?.isEnabled || false;

  return (
    <div className="app">
      {isMailEnabled ? (
        <InboxPage user={user} />
      ) : (
        <ConnectMailPage user={user} />
      )}
    </div>
  );
}

export default App;
