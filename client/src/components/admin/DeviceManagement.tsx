import React, { useState, useEffect } from 'react';
import { 
  Shield, Plus, Trash2, Power, PowerOff, Search, Filter, 
  AlertTriangle, CheckCircle, XCircle, Globe, MapPin, Clock,
  Smartphone, Monitor, Tablet, Eye
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { validateAdminToken, clearExpiredTokens } from '../../utils/tokenUtils';
import api from '../../services/api';
import AdminDockNavigation from './AdminDockNavigation';
import AdminChatbotButton from './AdminChatbotButton';

interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  isActive: boolean;
  addedBy: string;
  notes?: string;
  lastAccess?: string;
  ipAddress?: string;
  location?: string;
  userAgent?: string;
  runtime?: 'browser' | 'desktop' | 'mobile';
  source?: 'web' | 'desktop' | 'mobile';
  deviceInfo?: {
    platform?: string;
    language?: string;
    timestamp?: string;
  };
  loginAttempts?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

interface SessionEntry {
  userId: string;
  fullName: string;
  email: string;
  runtime?: 'browser' | 'desktop' | 'mobile';
  source?: 'web' | 'desktop' | 'mobile';
  ipAddress?: string;
  userAgent?: string;
  loginTime: string;
  machineId?: string;
  macAddress?: string;
  deviceInfo?: {
    platform?: string;
    language?: string;
  };
}

const DeviceManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useApp();
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [newDevice, setNewDevice] = useState({
    deviceId: '',
    deviceName: '',
    notes: ''
  });

  // Validate admin session
  useEffect(() => {
    clearExpiredTokens();
    const token = localStorage.getItem('adminToken');
    if (!token || !validateAdminToken(token)) {
      navigate('/my-admin/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    fetchDevices();
    fetchSessions();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDevices();
      fetchSessions();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await api.getAdminDevices();
      if (response?.success) {
        setDevices(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      addToast('Failed to load devices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await api.getAdminRecentSessions();
      if (response?.success) {
        setSessions(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const handleAddDevice = async () => {
    if (!newDevice.deviceId || !newDevice.deviceName) {
      addToast('Device ID and name are required', 'error');
      return;
    }

    try {
      const response = await api.post('/admin/devices', {
        deviceId: newDevice.deviceId.trim(),
        deviceName: newDevice.deviceName.trim(),
        deviceType: 'admin',
        notes: newDevice.notes.trim()
      });

      if (response?.success) {
        addToast('Device added successfully!', 'success');
        setShowAddModal(false);
        setNewDevice({ deviceId: '', deviceName: '', notes: '' });
        fetchDevices();
      }
    } catch (error: any) {
      addToast(error?.message || 'Failed to add device', 'error');
    }
  };

  const handleToggleDevice = async (deviceId: string, currentStatus: boolean) => {
    try {
      const response = await api.put(`/admin/devices/${deviceId}`, {
        isActive: !currentStatus
      });

      if (response?.success) {
        addToast(`Device ${!currentStatus ? 'activated' : 'deactivated'}`, 'success');
        fetchDevices();
      }
    } catch (error) {
      addToast('Failed to update device', 'error');
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this device?')) return;

    try {
      const response = await api.delete(`/admin/devices/${deviceId}`);
      if (response?.success) {
        addToast('Device deleted successfully', 'success');
        fetchDevices();
      }
    } catch (error) {
      addToast('Failed to delete device', 'error');
    }
  };

  // Helper functions
  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-600 bg-gray-500/10';
    }
  };

  const getRiskIcon = (risk?: string) => {
    switch (risk) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />;
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Monitor className="w-5 h-5" />;
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="w-5 h-5" />;
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  // Filter devices
  const filteredDevices = devices.filter(device => {
    const matchesSearch = 
      device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = filterRisk === 'all' || device.riskLevel === filterRisk;
    
    return matchesSearch && matchesRisk;
  });

  // Calculate stats
  const stats = {
    total: devices.length,
    active: devices.filter(d => d.isActive).length,
    highRisk: devices.filter(d => d.riskLevel === 'high' || d.riskLevel === 'critical').length,
    suspicious: devices.filter(d => (d.loginAttempts || 0) > 5).length,
    desktopSessions: sessions.filter(s => s.runtime === 'desktop').length,
    browserSessions: sessions.filter(s => !s.runtime || s.runtime === 'browser').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen pb-32`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🔒 Device Security Management
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mt-1`}>
              Monitor and manage authorized devices with security insights
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Device
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>Total Devices</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                  {stats.total}
                </p>
              </div>
              <Shield className="w-8 h-8 text-accent" />
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>Active Now</p>
                <p className={`text-2xl font-bold text-green-500 mt-1`}>
                  {stats.active}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>High Risk</p>
                <p className={`text-2xl font-bold ${stats.highRisk > 0 ? 'text-red-500' : isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                  {stats.highRisk}
                </p>
              </div>
              <AlertTriangle className={`w-8 h-8 ${stats.highRisk > 0 ? 'text-red-500' : 'text-gray-600'}`} />
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>Suspicious</p>
                <p className={`text-2xl font-bold ${stats.suspicious > 0 ? 'text-orange-500' : isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                  {stats.suspicious}
                </p>
              </div>
              <XCircle className={`w-8 h-8 ${stats.suspicious > 0 ? 'text-orange-500' : 'text-gray-600'}`} />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`} />
            <input
              type="text"
              placeholder="Search by device name, ID, IP, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
            />
          </div>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical Risk</option>
          </select>
        </div>

        {/* Devices List */}
        <div className="grid gap-4">
          {filteredDevices.map((device) => (
            <div
              key={device._id}
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getDeviceIcon(device.userAgent)}
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {device.deviceName}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${device.isActive ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                      {device.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {device.riskLevel && (
                      <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getRiskColor(device.riskLevel)}`}>
                        {getRiskIcon(device.riskLevel)}
                        {device.riskLevel.toUpperCase()} RISK
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {device.ipAddress && (
                      <div className="flex items-center gap-2">
                        <Globe className={`w-4 h-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                          {device.ipAddress}
                        </span>
                      </div>
                    )}
                    {device.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                          {device.location}
                        </span>
                      </div>
                    )}
                    {device.lastAccess && (
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                          {new Date(device.lastAccess).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {device.loginAttempts !== undefined && device.loginAttempts > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${device.loginAttempts > 5 ? 'text-red-500' : 'text-yellow-500'}`} />
                        <span className={`text-sm ${device.loginAttempts > 5 ? 'text-red-500' : 'text-yellow-500'} font-semibold`}>
                          {device.loginAttempts} login attempts
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} space-y-1 font-mono`}>
                    <p className="break-all">
                      <span className="font-semibold">ID:</span> {device.deviceId.substring(0, 32)}...
                    </p>
                    {device.notes && (
                      <p><span className="font-semibold">Notes:</span> {device.notes}</p>
                    )}
                    {device.userAgent && (
                      <p className="break-all"><span className="font-semibold">User Agent:</span> {device.userAgent.substring(0, 60)}...</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleDevice(device._id, device.isActive)}
                    className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                    title={device.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {device.isActive ? (
                      <PowerOff className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Power className="w-5 h-5 text-green-500" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteDevice(device._id)}
                    className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDevices.length === 0 && (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">
              {searchTerm || filterRisk !== 'all' ? 'No devices match your filters' : 'No devices added yet'}
            </p>
            {(searchTerm || filterRisk !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterRisk('all');
                }}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      <div className={`mt-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent User Sessions</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>Last 200 logins across browser & desktop</p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-600 font-semibold">Desktop: {stats.desktopSessions}</span>
            <span className="px-2 py-1 rounded bg-teal-500/10 text-teal-400 font-semibold">Browser: {stats.browserSessions}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className={`${isDarkMode ? 'text-gray-700' : 'text-gray-600'} uppercase text-xs tracking-wider`}>
                <th className="py-2 text-left">User</th>
                <th className="py-2 text-left">Runtime</th>
                <th className="py-2 text-left">IP / Device</th>
                <th className="py-2 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 20).map((session) => (
                <tr key={`${session.userId}-${session.loginTime}`} className={`${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
                  <td className="py-2">
                    <div className="font-semibold">{session.fullName || 'Unknown User'}</div>
                    <div className={`${isDarkMode ? 'text-gray-600' : 'text-gray-600'} text-xs`}>{session.email}</div>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${session.runtime === 'desktop' ? 'bg-purple-500/10 text-purple-700' : 'bg-teal-500/10 text-teal-400'}`}>
                        {session.runtime ? session.runtime.toUpperCase() : 'BROWSER'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${session.source === 'desktop' ? 'bg-accent/10 text-blue-700' : 'bg-green-500/10 text-green-600'}`}>
                        {session.source ? session.source.toUpperCase() : 'WEB'}
                      </span>
                    </div>
                  </td>
                  <td className="py-2">
                    <div className="font-mono text-xs break-all">{session.ipAddress || 'Unknown IP'}</div>
                    <div className={`${isDarkMode ? 'text-gray-600' : 'text-gray-600'} text-xs`}>{session.deviceInfo?.platform || session.userAgent?.split(' ')[0] || 'Unknown Device'}</div>
                  </td>
                  <td className="py-2 text-xs">
                    {new Date(session.loginTime).toLocaleString()}
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={4} className={`py-6 text-center ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                    No recent session data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Dock Navigation */}
      <AdminDockNavigation />

      {/* Admin AI Chatbot */}
      <AdminChatbotButton pageContext={{
        devices: filteredDevices,
        stats,
        vulnerabilities: devices.filter(d => d.riskLevel === 'high' || d.riskLevel === 'critical').map(d => ({
          type: 'High Risk Device',
          description: `${d.deviceName} (${d.ipAddress || 'Unknown IP'})`,
          severity: d.riskLevel
        })),
        suspiciousDevices: devices.filter(d => (d.loginAttempts || 0) > 5).map(d => ({
          id: d.deviceId,
          ip: d.ipAddress,
          reason: `${d.loginAttempts} failed login attempts`,
          riskLevel: d.riskLevel
        })),
        totalDevices: devices.length,
        activeToday: stats.active,
        failedLogins: devices.reduce((sum, d) => sum + (d.loginAttempts || 0), 0),
        uniqueIPs: new Set(devices.map(d => d.ipAddress).filter(Boolean)).size
      }} />

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 max-w-lg w-full`}>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Add New Device
            </h3>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-2`}>
                  Device ID *
                </label>
                <input
                  type="text"
                  value={newDevice.deviceId}
                  onChange={(e) => setNewDevice({ ...newDevice, deviceId: e.target.value })}
                  placeholder="Paste the 64-character device ID"
                  className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono text-sm`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-2`}>
                  Device Name *
                </label>
                <input
                  type="text"
                  value={newDevice.deviceName}
                  onChange={(e) => setNewDevice({ ...newDevice, deviceName: e.target.value })}
                  placeholder="e.g., John's Laptop"
                  className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-2`}>
                  Notes (Optional)
                </label>
                <textarea
                  value={newDevice.notes}
                  onChange={(e) => setNewDevice({ ...newDevice, notes: e.target.value })}
                  placeholder="Additional notes about this device"
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewDevice({ deviceId: '', deviceName: '', notes: '' });
                }}
                className={`flex-1 px-4 py-3 rounded-xl border-2 ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-gray-300 hover:bg-gray-50 text-gray-900'} font-semibold transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddDevice}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold transition-all duration-200 shadow-lg"
              >
                Add Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceManagement;
