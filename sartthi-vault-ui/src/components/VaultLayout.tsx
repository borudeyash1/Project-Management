import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

interface VaultLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

interface UserData {
  email: string;
  fullName: string;
  profilePicture?: string;
}

const VaultLayout: React.FC<VaultLayoutProps> = ({ children, activeView, onViewChange }) => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers: any = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers
        });
        if (response.ok) {
          const data = await response.json();
          setUserData({
            email: data.data.email,
            fullName: data.data.fullName || data.data.name || 'User',
            profilePicture: data.data.profilePicture
          });
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="flex h-screen bg-app-bg text-text-primary overflow-hidden font-inter">
      <Sidebar
        activeView={activeView}
        onViewChange={onViewChange}
        usedGB={12.4} // Mock data for now, can be passed from parent
        totalGB={15}
        user={userData ? {
          fullName: userData.fullName,
          email: userData.email,
          photo: userData.profilePicture
        } : undefined}
      />
      <main className="flex-1 flex flex-col min-w-0 relative bg-gradient-to-br from-app-bg to-app-bg/95">
        {children}
      </main>
    </div>
  );
};

export default VaultLayout;
