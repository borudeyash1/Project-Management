import React from 'react';
import { Shield, AlertTriangle, Lock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface DeviceAccessDeniedProps {
  deviceId: string;
}

const DeviceAccessDenied: React.FC<DeviceAccessDeniedProps> = ({ deviceId }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
      <div className="max-w-md w-full mx-4">
        <div className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center`}>
          {/* Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
            Access Restricted
          </h1>

          {/* Message */}
          <div className={`${isDarkMode ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'} border rounded-xl p-4 mb-6`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-red-600' : 'text-red-600'} flex-shrink-0 mt-0.5`} />
              <div className="text-left">
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-red-600' : 'text-red-700'} mb-1`}>
                  Device Not Authorized
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-red-700' : 'text-red-600'}`}>
                  This device is not authorized to access the admin portal. Only pre-approved devices can access this area.
                </p>
              </div>
            </div>
          </div>

          {/* Device Info */}
          <div className={`${isDarkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4 mb-6`}>
            <div className="flex items-center gap-2 mb-2">
              <Lock className={`w-4 h-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`} />
              <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                Your Device ID
              </span>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} rounded-lg p-3 font-mono text-xs ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} break-all`}>
              {deviceId}
            </div>
          </div>

          {/* Instructions */}
          <div className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} space-y-2`}>
            <p>
              If you believe you should have access, please contact the system administrator with your Device ID above.
            </p>
            <p className="text-xs">
              Security is our top priority. This page is monitored and access attempts are logged.
            </p>
          </div>

          {/* Back Button */}
          <button
            onClick={() => window.location.href = '/'}
            className={`mt-6 w-full px-4 py-3 rounded-xl border-2 ${isDarkMode ? 'border-gray-600 hover:bg-gray-700/50 text-gray-200' : 'border-gray-300 hover:bg-gray-50 text-gray-700'} text-sm font-semibold transition-all duration-200`}
          >
            Return to Home
          </button>
        </div>

        {/* Footer */}
        <div className={`text-center mt-6 text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
          <Shield className="w-4 h-4 inline mr-1" />
          Protected by Sartthi Security
        </div>
      </div>
    </div>
  );
};

export default DeviceAccessDenied;
