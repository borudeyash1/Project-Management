import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Activity, Settings, LogOut, AlertTriangle, FileText, Megaphone } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { validateAdminToken, clearExpiredTokens } from '../../utils/tokenUtils';
import AdminDockNavigation from './AdminDockNavigation';
import AdminChatbotButton from './AdminChatbotButton';
import api from '../../services/api';

const AdminDashboard: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useApp();
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState<any>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>({
    totalUsers: 0,
    activeSessions: 0,
    systemStatus: 'Loading...'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any expired tokens first
    clearExpiredTokens();
    
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    const admin = localStorage.getItem('adminData');

    console.log('🔍 [ADMIN DASHBOARD] Checking session...');
    console.log('🔍 [ADMIN DASHBOARD] Token exists:', !!token);
    console.log('🔍 [ADMIN DASHBOARD] Admin data exists:', !!admin);

    if (!token || !admin) {
      console.log('❌ [ADMIN DASHBOARD] No valid session, redirecting to login');
      addToast('Session expired. Please login again.', 'warning');
      navigate('/my-admin/login', { replace: true });
      return;
    }

    // Validate token expiration
    if (!validateAdminToken(token)) {
      console.log('❌ [ADMIN DASHBOARD] Token expired or invalid, clearing session');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      addToast('Your session has expired. Please login again.', 'warning');
      navigate('/my-admin/login', { replace: true });
      return;
    }

    try {
      const parsedAdmin = JSON.parse(admin);
      console.log('✅ [ADMIN DASHBOARD] Valid session found for:', parsedAdmin.email);
      setAdminData(parsedAdmin);
      
      // Fetch dashboard stats
      fetchDashboardStats();
    } catch (error) {
      console.error('❌ [ADMIN DASHBOARD] Invalid admin data, clearing session');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      navigate('/my-admin/login', { replace: true});
    }
  }, [navigate, addToast]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard-stats');
      
      if (response?.success) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('🔒 [ADMIN] Logging out...');
    
    // Get admin name before clearing
    const adminName = adminData?.name || 'Admin';
    
    // Clear all admin session data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('accessToken');
    
    console.log('✅ [ADMIN] Session cleared, redirecting to login...');
    
    // Show success message
    addToast(`Goodbye ${adminName}! You've been logged out successfully.`, 'success');
    
    // Close the modal
    setShowLogoutConfirm(false);
    
    // Redirect to admin login
    navigate('/my-admin/login', { replace: true });
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  if (!adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Admin Dashboard
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                  Sartthi Management Portal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {adminData.name}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                  {adminData.role.replace('_', ' ').toUpperCase()}
                </p>
              </div>
              <button
                onClick={confirmLogout}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                title="Logout"
              >
                <LogOut className={`w-5 h-5 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className={`${isDarkMode ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'} border rounded-2xl p-6 mb-8`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Welcome back, {adminData.name}!
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mt-1`}>
                You have full administrative access to Sartthi
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>Total Users</p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-2`}>
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    dashboardStats.totalUsers.toLocaleString()
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>Active Sessions</p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-2`}>
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    dashboardStats.activeSessions.toLocaleString()
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>System Status</p>
                <p className={`text-3xl font-bold ${
                  loading ? 'text-gray-600' :
                  dashboardStats.systemStatus === 'Healthy' ? 'text-green-500' :
                  dashboardStats.systemStatus === 'Warning' ? 'text-yellow-500' : 'text-red-500'
                } mt-2`}>
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    dashboardStats.systemStatus
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/admin/users')}
              className={`p-4 rounded-lg border-2 ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors text-left`}
            >
              <Users className={`w-6 h-6 ${isDarkMode ? 'text-yellow-500' : 'text-yellow-600'} mb-2`} />
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Manage Users</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mt-1`}>View and edit users</p>
            </button>

            <button 
              onClick={() => navigate('/admin/devices')}
              className={`p-4 rounded-lg border-2 ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors text-left`}
            >
              <Shield className={`w-6 h-6 ${isDarkMode ? 'text-accent' : 'text-accent-dark'} mb-2`} />
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Security</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mt-1`}>Manage devices & access</p>
            </button>

            <button 
              onClick={() => navigate('/admin/analytics')}
              className={`p-4 rounded-lg border-2 ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors text-left`}
            >
              <Activity className={`w-6 h-6 ${isDarkMode ? 'text-green-500' : 'text-green-600'} mb-2`} />
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analytics</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mt-1`}>View system metrics</p>
            </button>

            <button 
              onClick={() => navigate('/admin/settings')}
              className={`p-4 rounded-lg border-2 ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors text-left`}
            >
              <Settings className={`w-6 h-6 ${isDarkMode ? 'text-purple-500' : 'text-purple-600'} mb-2`} />
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mt-1`}>Configure system</p>
            </button>

            <button 
              onClick={() => navigate('/admin/releases')}
              className={`p-4 rounded-lg border-2 ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors text-left`}
            >
              <Activity className={`w-6 h-6 ${isDarkMode ? 'text-indigo-500' : 'text-indigo-600'} mb-2`} />
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Desktop Releases</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mt-1`}>Manage app versions</p>
            </button>

            <button 
              onClick={() => navigate('/admin/docs')}
              className={`p-4 rounded-lg border-2 ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors text-left`}
            >
              <FileText className={`w-6 h-6 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'} mb-2`} />
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Documentation</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mt-1`}>Manage help articles</p>
            </button>

            <button 
              onClick={() => navigate('/admin/content')}
              className={`p-4 rounded-lg border-2 ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors text-left`}
            >
              <Megaphone className={`w-6 h-6 ${isDarkMode ? 'text-pink-500' : 'text-pink-600'} mb-2`} />
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Content Management</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mt-1`}>Manage banners & offers</p>
            </button>
          </div>
        </div>

        {/* Admin Info */}
        <div className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-xl p-6 mt-8`}>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mb-3`}>
            Your Admin Profile
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>Email:</span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{adminData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>Role:</span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{adminData.role}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>Admin ID:</span>
              <span className={`text-sm font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{adminData.id}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 max-w-md w-full shadow-2xl`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Confirm Logout
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                  Are you sure you want to end your admin session?
                </p>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                This will:
              </p>
              <ul className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mt-2 space-y-1 ml-4`}>
                <li>• Clear your admin session</li>
                <li>• Remove authentication tokens</li>
                <li>• Redirect you to the login page</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelLogout}
                className={`flex-1 px-4 py-3 rounded-xl border-2 ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-gray-300 hover:bg-gray-50 text-gray-900'} font-semibold transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all duration-200 shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Dock Navigation */}
      <AdminDockNavigation />

      {/* Admin AI Chatbot */}
      <AdminChatbotButton pageContext={dashboardStats} />
    </div>
  );
};

export default AdminDashboard;
