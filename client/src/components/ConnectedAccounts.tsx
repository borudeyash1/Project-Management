import React, { useState } from 'react';
import { Mail, Calendar, Shield, Link as LinkIcon, Unlink, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import AppInfoCard from './AppInfoCard';

interface ConnectedAccount {
  type: 'mail' | 'calendar' | 'vault';
  email?: string;
  connectedAt?: string;
  isConnected: boolean;
}

const ConnectedAccounts: React.FC = () => {
  const { state } = useApp();
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [showInfoCard, setShowInfoCard] = useState<'mail' | 'calendar' | 'vault' | null>(null);

  // Check connection status from user modules
  const accounts: ConnectedAccount[] = [
    {
      type: 'mail',
      email: state.userProfile.modules?.mail?.email,
      connectedAt: state.userProfile.modules?.mail?.connectedAt,
      isConnected: !!state.userProfile.modules?.mail?.refreshToken
    },
    {
      type: 'calendar',
      email: state.userProfile.modules?.calendar?.email,
      connectedAt: state.userProfile.modules?.calendar?.connectedAt,
      isConnected: !!state.userProfile.modules?.calendar?.refreshToken
    },
    {
      type: 'vault',
      email: state.userProfile.modules?.vault?.email,
      connectedAt: state.userProfile.modules?.vault?.connectedAt,
      isConnected: !!state.userProfile.modules?.vault?.refreshToken
    }
  ];

  const appConfig = {
    mail: {
      icon: <Mail className="w-6 h-6" />,
      title: 'Sartthi Mail',
      description: 'Gmail integration for email management',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    calendar: {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Sartthi Calendar',
      description: 'Google Calendar integration',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    vault: {
      icon: <Shield className="w-6 h-6" />,
      title: 'Sartthi Vault',
      description: 'Secure file storage with Google Drive',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    }
  };

  const handleUnlink = async (type: string) => {
    try {
      setUnlinking(type);

      // Call API to disconnect the module
      const response = await apiService.post(`/api/auth/sartthi/disconnect-${type}`, {});

      if (response.success) {
        // Refresh user profile
        window.location.reload();
      }
    } catch (error) {
      console.error(`Failed to unlink ${type}:`, error);
      alert(`Failed to disconnect ${type}. Please try again.`);
    } finally {
      setUnlinking(null);
      setShowConfirm(null);
    }
  };

  const handleConnect = (type: string) => {
    // Show the info card first (the guide)
    setShowInfoCard(type as 'mail' | 'calendar' | 'vault');
  };

  const proceedToConnect = (type: string) => {
    // Redirect to connection flow with token
    const token = localStorage.getItem('accessToken');
    window.location.href = `/api/auth/sartthi/connect-${type}?token=${token}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Connected Accounts
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your connected Google services. You can disconnect and reconnect at any time.
        </p>
      </div>

      <div className="grid gap-4">
        {accounts.map((account) => {
          const config = appConfig[account.type];

          return (
            <div
              key={account.type}
              className={`p-6 bg-white dark:bg-gray-800 rounded-xl border-2 ${account.isConnected
                ? `${config.borderColor} border-opacity-50`
                : 'border-gray-200 dark:border-gray-700'
                } transition-all hover:shadow-lg`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className={`p-3 ${config.bgColor} rounded-xl ${config.color}`}>
                    {config.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {config.title}
                      </h3>
                      {account.isConnected && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {config.description}
                    </p>

                    {account.isConnected ? (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Email:</span> {account.email || 'Not available'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Connected on {formatDate(account.connectedAt)}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <AlertCircle className="w-4 h-4" />
                        Not connected
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="ml-4">
                  {account.isConnected ? (
                    showConfirm === account.type ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Are you sure?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowConfirm(null)}
                            className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUnlink(account.type)}
                            disabled={unlinking === account.type}
                            className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            {unlinking === account.type ? (
                              <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Unlinking...
                              </>
                            ) : (
                              <>
                                <Unlink className="w-4 h-4" />
                                Confirm
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowConfirm(account.type)}
                        className="px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2 font-medium"
                      >
                        <Unlink className="w-4 h-4" />
                        Disconnect
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleConnect(account.type)}
                      className={`px-4 py-2 bg-gradient-to-r ${account.type === 'mail' ? 'from-blue-500 to-blue-600' :
                        account.type === 'calendar' ? 'from-purple-500 to-purple-600' :
                          'from-green-500 to-emerald-600'
                        } text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-medium`}
                    >
                      <LinkIcon className="w-4 h-4" />
                      Connect
                    </button>
                  )}
                </div>
              </div>

              {/* Privacy note for Vault */}
              {account.type === 'vault' && account.isConnected && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-green-600 dark:text-green-400">🔒 Privacy:</span> We only access files in your "Sartthi Vault" folder. Your personal files remain private.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          About Connected Accounts
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• You can disconnect and reconnect accounts at any time</li>
          <li>• Disconnecting will remove access but won't delete your data</li>
          <li>• Your data remains in your Google account</li>
          <li>• You can connect a different Google account after disconnecting</li>
        </ul>
      </div>

      {/* App Info Card Modal */}
      {showInfoCard && (
        <AppInfoCard
          app={showInfoCard}
          onClose={() => setShowInfoCard(null)}
          onConnect={() => proceedToConnect(showInfoCard)}
          onOpen={() => {
            const url = getAppUrl(showInfoCard);
            const token = localStorage.getItem('accessToken');
            if (token) {
              const separator = url.includes('?') ? '&' : '?';
              const authUrl = `${url}${separator}token=${token}`;
              window.open(authUrl, '_blank');
            } else {
              window.open(url, '_blank');
            }
            setShowInfoCard(null);
          }}
        />
      )}
    </div>
  );
};

export default ConnectedAccounts;
