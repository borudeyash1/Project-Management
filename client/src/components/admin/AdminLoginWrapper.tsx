import React, { useEffect, useState } from 'react';
import AdminLogin from './AdminLogin';
import DeviceAccessDenied from './DeviceAccessDenied';
import { getDeviceFingerprint, getDeviceInfo, setCustomDeviceId } from '../../utils/deviceFingerprint';
import api from '../../services/api';

const AdminLoginWrapper: React.FC = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      console.log('✅ [ADMIN] Already logged in, redirecting to dashboard');
      window.location.href = '/admin/dashboard';
      return;
    }
    
    checkDeviceAccess();
  }, []);

  const checkDeviceAccess = async () => {
    try {
      setIsChecking(true);

      // Check if user has manually set a custom device ID
      const customDeviceId = localStorage.getItem('customDeviceId');
      
      // If custom device ID exists, use it; otherwise generate fingerprint
      let currentDeviceId: string;
      
      if (customDeviceId) {
        currentDeviceId = customDeviceId;
      } else {
        currentDeviceId = await getDeviceFingerprint();
      }

      setDeviceId(currentDeviceId);

      console.log('🔍 [DEBUG] Current Device ID:', currentDeviceId);

      // Get full device info
      const deviceInfo = await getDeviceInfo();
      console.log('🔍 [DEBUG] Device Info:', deviceInfo);

      // Log the access attempt
      try {
        await api.post('/admin/log-access', {
          deviceId: currentDeviceId,
          deviceInfo
        });
      } catch (logError) {
        console.error('❌ Failed to log access:', logError);
      }

      // Check if device is allowed
      console.log('🔍 [DEBUG] Checking device access...');
      const response = await api.post('/admin/check-device', {
        deviceId: currentDeviceId
      });

      console.log('🔍 [DEBUG] API Response:', response);
      console.log('🔍 [DEBUG] Response type:', typeof response);
      console.log('🔍 [DEBUG] Response keys:', response ? Object.keys(response) : 'null');
      console.log('🔍 [DEBUG] Response.success:', response?.success);
      console.log('🔍 [DEBUG] Response.data:', response?.data);
      console.log('🔍 [DEBUG] Response.data.allowed:', response?.data?.allowed);

      // The API service returns the backend response directly
      // Backend sends: { success: true, message: "...", data: { allowed: true, ... } }
      // So response.success and response.data.allowed should work
      if (response?.success && response?.data?.allowed) {
        console.log('✅ Device is allowed!');
        setIsAllowed(true);
      } else {
        console.log('❌ Device is NOT allowed');
        console.log('❌ Reason: success =', response?.success, ', allowed =', response?.data?.allowed);
        setIsAllowed(false);
      }
    } catch (error: any) {
      console.error('Device access check failed:', error);
      setIsAllowed(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Loading state
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Verifying Device...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we check your authorization</p>
        </div>
      </div>
    );
  }

  // Show appropriate component based on access
  if (isAllowed) {
    return <AdminLogin />;
  } else {
    return <DeviceAccessDenied deviceId={deviceId} />;
  }
};

export default AdminLoginWrapper;
