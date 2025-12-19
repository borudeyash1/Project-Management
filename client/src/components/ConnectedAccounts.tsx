import React, { useState, useEffect } from 'react';
import { Mail, Calendar, Shield, Link as LinkIcon, Unlink, CheckCircle, AlertCircle, Loader, Plus, Trash2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { useTranslation } from 'react-i18next';

interface ConnectedAccount {
  _id: string;
  service: 'mail' | 'calendar' | 'vault';
  providerEmail: string;
  providerName: string;
  providerAvatar?: string;
  isActive: boolean;
  isPrimary: boolean;
  createdAt: string;
}

interface AccountsData {
  accounts: ConnectedAccount[];
  activeAccount: ConnectedAccount | null;
}

const ConnectedAccounts: React.FC = () => {
  const { t } = useTranslation();
  const { state } = useApp();
  const [mailAccounts, setMailAccounts] = useState<AccountsData>({ accounts: [], activeAccount: null });
  const [calendarAccounts, setCalendarAccounts] = useState<AccountsData>({ accounts: [], activeAccount: null });
  const [vaultAccounts, setVaultAccounts] = useState<AccountsData>({ accounts: [], activeAccount: null });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const appConfig = {
    mail: {
      icon: <Mail className="w-6 h-6" />,
      title: t('connectedAccounts.sartthiMail') || 'Sartthi Mail',
      description: t('connectedAccounts.sartthiMailDesc') || 'Secure email platform',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    calendar: {
      icon: <Calendar className="w-6 h-6" />,
      title: t('connectedAccounts.sartthiCalendar') || 'Sartthi Calendar',
      description: t('connectedAccounts.sartthiCalendarDesc') || 'Schedule and manage time',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    vault: {
      icon: <Shield className="w-6 h-6" />,
      title: t('connectedAccounts.sartthiVault') || 'Sartthi Vault',
      description: t('connectedAccounts.sartthiVaultDesc') || 'Secure cloud storage',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const [mail, calendar, vault] = await Promise.all([
        apiService.get('/sartthi-accounts/mail'),
        apiService.get('/sartthi-accounts/calendar'),
        apiService.get('/sartthi-accounts/vault')
      ]);

      if (mail.success) setMailAccounts(mail.data);
      if (calendar.success) setCalendarAccounts(calendar.data);
      if (vault.success) setVaultAccounts(vault.data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (service: 'mail' | 'calendar' | 'vault') => {
    try {
      setActionLoading(`connect-${service}`);
      const response = await apiService.post(`/sartthi-accounts/${service}/connect`, {});

      if (response.success && response.data.authUrl) {
        // Open OAuth flow in new window
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      console.error(`Failed to initiate ${service} connection:`, error);
      alert(`Failed to connect ${service}. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetActive = async (service: 'mail' | 'calendar' | 'vault', accountId: string) => {
    try {
      setActionLoading(`active-${accountId}`);
      const response = await apiService.put(`/sartthi-accounts/${service}/active`, { accountId });

      if (response.success) {
        await fetchAccounts();
      }
    } catch (error) {
      console.error(`Failed to set active account:`, error);
      alert('Failed to switch account. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (service: 'mail' | 'calendar' | 'vault', accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) {
      return;
    }

    try {
      setActionLoading(`disconnect-${accountId}`);
      const response = await apiService.delete(`/sartthi-accounts/${service}/${accountId}`);

      if (response.success) {
        await fetchAccounts();
      }
    } catch (error) {
      console.error(`Failed to disconnect account:`, error);
      alert('Failed to disconnect account. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const renderServiceSection = (
    service: 'mail' | 'calendar' | 'vault',
    accountsData: AccountsData
  ) => {
    const config = appConfig[service];
    const { accounts, activeAccount } = accountsData;

    return (
      <div key={service} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`${config.bgColor} ${config.color} p-3 rounded-lg`}>
              {config.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {config.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {config.description}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleConnect(service)}
            disabled={!!actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading === `connect-${service}` ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Account
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No accounts connected</p>
            <p className="text-sm mt-1">Click "Add Account" to connect your first account</p>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account._id}
                className={`flex items-center justify-between p-4 rounded-lg border ${account.isActive
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {account.providerAvatar ? (
                    <img
                      src={account.providerAvatar}
                      alt={account.providerName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold">
                      {account.providerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {account.providerName}
                      </p>
                      {account.isActive && (
                        <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                          Active
                        </span>
                      )}
                      {account.isPrimary && (
                        <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {account.providerEmail}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Connected {new Date(account.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!account.isActive && (
                    <button
                      onClick={() => handleSetActive(service, account._id)}
                      disabled={!!actionLoading}
                      className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === `active-${account._id}` ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        'Set Active'
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleDisconnect(service, account._id)}
                    disabled={!!actionLoading}
                    className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionLoading === `disconnect-${account._id}` ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Connected Accounts
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your connected Sartthi services. You can connect multiple accounts for each service.
        </p>
      </div>

      {renderServiceSection('mail', mailAccounts)}
      {renderServiceSection('calendar', calendarAccounts)}
      {renderServiceSection('vault', vaultAccounts)}
    </div>
  );
};

export default ConnectedAccounts;
