import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Power, PowerOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  isActive: boolean;
  addedBy: string;
  notes?: string;
  lastAccess?: string;
  createdAt: string;
}

const DeviceManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useApp();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDevice, setNewDevice] = useState({
    deviceId: '',
    deviceName: '',
    notes: ''
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await api.get('/admin/devices');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Device Management
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Manage authorized devices for admin access
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Device
          </button>
        </div>

        {/* Devices List */}
        <div className="grid gap-4">
          {devices.map((device) => (
            <div
              key={device._id}
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className={`w-5 h-5 ${device.isActive ? 'text-green-500' : 'text-gray-400'}`} />
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {device.deviceName}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${device.isActive ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                      {device.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1 font-mono`}>
                    <p className="break-all">
                      <span className="font-semibold">Device ID:</span> {device.deviceId}
                    </p>
                    {device.notes && (
                      <p><span className="font-semibold">Notes:</span> {device.notes}</p>
                    )}
                    <p><span className="font-semibold">Added by:</span> {device.addedBy}</p>
                    <p><span className="font-semibold">Added:</span> {new Date(device.createdAt).toLocaleString()}</p>
                    {device.lastAccess && (
                      <p><span className="font-semibold">Last Access:</span> {new Date(device.lastAccess).toLocaleString()}</p>
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

        {devices.length === 0 && (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No devices added yet</p>
          </div>
        )}
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 max-w-lg w-full`}>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Add New Device
            </h3>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
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
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
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
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
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
