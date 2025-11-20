import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Key, Bell, Shield, Mail, Database, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { validateAdminToken, clearExpiredTokens } from '../../utils/tokenUtils';
import api from '../../services/api';
import AdminDockNavigation from './AdminDockNavigation';

const Settings: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'system'>('profile');
  const [adminData, setAdminData] = useState<any>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSending, setOtpSending] = useState(false);

  useEffect(() => {
    // Clear expired tokens first
    clearExpiredTokens();
    
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken || !validateAdminToken(adminToken)) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/my-admin/login';
      return;
    }
    localStorage.setItem('accessToken', adminToken);
    
    const admin = localStorage.getItem('adminData');
    if (admin) {
      setAdminData(JSON.parse(admin));
    }
    setLoading(false);
  }, []);

  const handleSendOTP = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (!passwordData.currentPassword) {
      addToast('Current password is required', 'error');
      return;
    }

    try {
      setOtpSending(true);
      console.log('🔍 [SETTINGS] Sending OTP...');
      const response = await api.post('/admin/send-password-otp', {
        currentPassword: passwordData.currentPassword
      });
      if (response?.success) {
        console.log('✅ [SETTINGS] OTP sent successfully');
        addToast('OTP sent to your email', 'success');
        setShowOTPModal(true);
      }
    } catch (error: any) {
      console.error('❌ [SETTINGS] Failed to send OTP:', error);
      addToast(error?.message || 'Failed to send OTP', 'error');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      addToast('Please enter 6-digit OTP', 'error');
      return;
    }

    try {
      console.log('🔍 [SETTINGS] Verifying OTP and changing password...');
      const response = await api.post('/admin/verify-password-otp', {
        otp,
        newPassword: passwordData.newPassword
      });
      if (response?.success) {
        console.log('✅ [SETTINGS] Password changed successfully');
        addToast('Password changed successfully!', 'success');
        setShowOTPModal(false);
        setShowPasswordChange(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setOtp('');
      }
    } catch (error: any) {
      console.error('❌ [SETTINGS] Failed to verify OTP:', error);
      addToast(error?.message || 'Invalid or expired OTP', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin Settings</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mt-1`}>Manage your admin account preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4 h-fit`}>
            <nav className="space-y-2">
              {[
                { id: 'profile', icon: Mail, label: 'Profile' },
                { id: 'security', icon: Shield, label: 'Security' },
                { id: 'notifications', icon: Bell, label: 'Notifications' },
                { id: 'system', icon: Database, label: 'System' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                      : isDarkMode ? 'text-gray-700 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-3">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
              {activeTab === 'profile' && adminData && (
                <div className="space-y-6">
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile Settings</h2>
                  
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-2`}>Name</label>
                    <input type="text" value={adminData.name} disabled className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-500'} cursor-not-allowed`} />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-2`}>Email</label>
                    <input type="email" value={adminData.email} disabled className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-500'} cursor-not-allowed`} />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-2`}>Role</label>
                    <input type="text" value={adminData.role} disabled className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-500'} cursor-not-allowed`} />
                  </div>

                  <div className="pt-6 border-t border-gray-700">
                    <button onClick={() => setShowPasswordChange(!showPasswordChange)} className="flex items-center gap-2 text-yellow-500 hover:text-yellow-600 font-medium">
                      <Key className="w-5 h-5" />Change Password
                    </button>

                    {showPasswordChange && (
                      <div className="mt-4 space-y-4">
                        {['current', 'new', 'confirm'].map(type => (
                          <div key={type}>
                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-2`}>
                              {type === 'current' ? 'Current Password' : type === 'new' ? 'New Password' : 'Confirm New Password'}
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords[type as keyof typeof showPasswords] ? 'text' : 'password'}
                                value={passwordData[`${type}Password` as keyof typeof passwordData]}
                                onChange={(e) => setPasswordData({ ...passwordData, [`${type}Password`]: e.target.value })}
                                className={`w-full px-4 py-2 pr-10 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                              />
                              <button type="button" onClick={() => setShowPasswords({ ...showPasswords, [type]: !showPasswords[type as keyof typeof showPasswords] })} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {showPasswords[type as keyof typeof showPasswords] ? <EyeOff className="w-5 h-5 text-gray-600" /> : <Eye className="w-5 h-5 text-gray-600" />}
                              </button>
                            </div>
                          </div>
                        ))}
                        <button 
                          onClick={handleSendOTP}
                          disabled={otpSending}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            otpSending
                              ? 'bg-gray-400 cursor-not-allowed text-white'
                              : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                          }`}
                        >
                          {otpSending ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Security Settings</h2>
                  <p className={isDarkMode ? 'text-gray-600' : 'text-gray-600'}>Security features coming soon...</p>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notification Preferences</h2>
                  <p className={isDarkMode ? 'text-gray-600' : 'text-gray-600'}>Notification settings coming soon...</p>
                </div>
              )}

              {activeTab === 'system' && (
                <div className="space-y-6">
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Settings</h2>
                  <p className={isDarkMode ? 'text-gray-600' : 'text-gray-600'}>System configuration coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* OTP Modal */}
        {showOTPModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-8 max-w-md w-full`}>
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Verify OTP
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mb-6`}>
                Enter the 6-digit code sent to your email
              </p>
              
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className={`w-full px-4 py-3 text-center text-2xl tracking-widest rounded-xl border-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-6`}
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowOTPModal(false);
                    setOtp('');
                  }}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                    isDarkMode 
                      ? 'border-gray-600 hover:bg-gray-700 text-white' 
                      : 'border-gray-300 hover:bg-gray-50 text-gray-900'
                  } font-semibold transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                    otp.length === 6
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  Verify & Change Password
                </button>
              </div>
              
              <button
                onClick={handleSendOTP}
                disabled={otpSending}
                className={`w-full mt-4 text-sm font-medium ${
                  otpSending 
                    ? 'text-gray-600 cursor-not-allowed' 
                    : 'text-yellow-500 hover:text-yellow-600'
                }`}
              >
                {otpSending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Dock Navigation */}
      <AdminDockNavigation />
    </div>
  );
};

export default Settings;
