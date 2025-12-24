import React, { useState, useEffect } from 'react';
import { Mail, Calendar, Shield, Link as LinkIcon, Unlink, CheckCircle, AlertCircle, Loader, Plus, Trash2, Check, Slack, Github, HardDrive, Cloud, Figma, FileText, Video, Server, Music } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { useTranslation } from 'react-i18next';

interface ConnectedAccount {
  _id: string;
  service: 'mail' | 'calendar' | 'vault' | 'slack' | 'github' | 'dropbox' | 'figma' | 'notion' | 'zoom' | 'vercel' | 'spotify';
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
  const [slackAccounts, setSlackAccounts] = useState<AccountsData>({ accounts: [], activeAccount: null });
  const [githubAccounts, setGithubAccounts] = useState<AccountsData>({ accounts: [], activeAccount: null });
  const [dropboxAccounts, setDropboxAccounts] = useState<AccountsData>({ accounts: [], activeAccount: null });
  const [figmaAccounts, setFigmaAccounts] = useState<AccountsData>({ accounts: [], activeAccount: null });
  const [notionAccounts, setNotionAccounts] = useState<AccountsData>({ accounts: [], activeAccount: null });
  const [zoomAccounts, setZoomAccounts] = useState<AccountsData>({ accounts: [], activeAccount: null });
  const [vercelAccounts, setVercelAccounts] = useState<AccountsData>({ accounts: [], activeAccount: null });
  const [spotifyAccounts, setSpotifyAccounts] = useState<AccountsData>({ accounts: [], activeAccount: null });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const appConfig = {
    mail: {
      icon: <Mail className="w-6 h-6" />,
      title: t('connectedAccounts.sartthiMail'),
      description: t('connectedAccounts.sartthiMailDesc'),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    calendar: {
      icon: <Calendar className="w-6 h-6" />,
      title: t('connectedAccounts.sartthiCalendar'),
      description: t('connectedAccounts.sartthiCalendarDesc'),
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    vault: {
      icon: <Shield className="w-6 h-6" />,
      title: t('connectedAccounts.sartthiVault'),
      description: t('connectedAccounts.sartthiVaultDesc'),
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    slack: {
      icon: <Slack className="w-6 h-6" />,
      title: 'Slack',
      description: 'Communication',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20'
    },
    github: {
      icon: <Github className="w-6 h-6" />,
      title: 'GitHub',
      description: 'Development',
      color: 'text-gray-900 dark:text-gray-100',
      bgColor: 'bg-gray-900/10 dark:bg-gray-100/10',
      borderColor: 'border-gray-900/20'
    },
    dropbox: {
      icon: <HardDrive className="w-6 h-6" />,
      title: 'Dropbox',
      description: 'Cloud Storage',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20'
    },
    figma: {
      icon: <Figma className="w-6 h-6" />,
      title: 'Figma',
      description: 'Design',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20'
    },
    notion: {
      icon: <FileText className="w-6 h-6" />,
      title: 'Notion',
      description: 'Documentation',
      color: 'text-gray-800 dark:text-gray-200',
      bgColor: 'bg-gray-800/10 dark:bg-gray-200/10',
      borderColor: 'border-gray-800/20'
    },
    zoom: {
      icon: <Video className="w-6 h-6" />,
      title: 'Zoom',
      description: 'Video Conferencing',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    vercel: {
      icon: <Server className="w-6 h-6" />,
      title: 'Vercel',
      description: 'Deployment',
      color: 'text-black dark:text-white',
      bgColor: 'bg-black/10 dark:bg-white/10',
      borderColor: 'border-black/20 dark:border-white/20'
    },
    spotify: {
      icon: <Music className="w-6 h-6" />,
      title: 'Spotify',
      description: 'Music',
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
      const [mail, calendar, vault, slack, github, dropbox, figma, notion, zoom, vercel, spotify] = await Promise.all([
        apiService.get('/sartthi-accounts/mail'),
        apiService.get('/sartthi-accounts/calendar'),
        apiService.get('/sartthi-accounts/vault'),
        apiService.get('/sartthi-accounts/slack'),
        apiService.get('/sartthi-accounts/github'),
        apiService.get('/sartthi-accounts/dropbox'),
        apiService.get('/sartthi-accounts/figma'),
        apiService.get('/sartthi-accounts/notion'),
        apiService.get('/sartthi-accounts/zoom'),
        apiService.get('/sartthi-accounts/vercel'),
        apiService.get('/sartthi-accounts/spotify')
      ]);

      if (mail.success) setMailAccounts(mail.data);
      if (calendar.success) setCalendarAccounts(calendar.data);
      if (vault.success) setVaultAccounts(vault.data);
      if (slack.success) setSlackAccounts(slack.data);
      if (github.success) setGithubAccounts(github.data);
      if (dropbox.success) setDropboxAccounts(dropbox.data);
      if (figma.success) setFigmaAccounts(figma.data);
      if (notion.success) setNotionAccounts(notion.data);
      if (zoom.success) setZoomAccounts(zoom.data);
      if (vercel.success) setVercelAccounts(vercel.data);
      if (spotify.success) setSpotifyAccounts(spotify.data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (service: 'mail' | 'calendar' | 'vault' | 'slack' | 'github' | 'dropbox' | 'figma' | 'notion' | 'zoom' | 'vercel' | 'spotify') => {
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

  const handleSetActive = async (service: 'mail' | 'calendar' | 'vault' | 'slack' | 'github' | 'dropbox' | 'figma' | 'notion' | 'zoom' | 'vercel' | 'spotify', accountId: string) => {
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

  const handleDisconnect = async (service: 'mail' | 'calendar' | 'vault' | 'slack' | 'github' | 'dropbox' | 'figma' | 'notion' | 'zoom' | 'vercel' | 'spotify', accountId: string) => {
    if (!window.confirm(t('connectedAccounts.confirmDisconnect'))) {
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
    service: 'mail' | 'calendar' | 'vault' | 'slack' | 'github' | 'dropbox' | 'figma' | 'notion' | 'zoom' | 'vercel' | 'spotify',
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
            {t('connectedAccounts.addAccount')}
          </button>
        </div>

        {/* Helper Note for GitHub/Slack multi-account */}
        {(service === 'github' || service === 'slack') && accounts.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              To connect a <strong>different</strong> {appConfig[service].title} account, please ensure you are <strong>signed out</strong> of {appConfig[service].title} in your browser (or use Incognito mode). Otherwise, it may automatically reconnect your existing account.
            </p>
          </div>
        )}

        {accounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>{t('connectedAccounts.noAccounts')}</p>
            <p className="text-sm mt-1">{t('connectedAccounts.clickAddAccount')}</p>
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
                          {t('connectedAccounts.active')}
                        </span>
                      )}
                      {account.isPrimary && (
                        <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                          {t('connectedAccounts.primary')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {account.providerEmail}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {t('connectedAccounts.connected')} {new Date(account.createdAt).toLocaleDateString()}
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
                        t('connectedAccounts.setActive')
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
          {t('connectedAccounts.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('connectedAccounts.subtitle')}
        </p>
      </div>

      {renderServiceSection('mail', mailAccounts)}
      {renderServiceSection('calendar', calendarAccounts)}
      {renderServiceSection('vault', vaultAccounts)}
      {renderServiceSection('slack', slackAccounts)}
      {renderServiceSection('github', githubAccounts)}
      {renderServiceSection('dropbox', dropboxAccounts)}
      {renderServiceSection('figma', figmaAccounts)}
      {renderServiceSection('notion', notionAccounts)}
      {renderServiceSection('zoom', zoomAccounts)}
      {renderServiceSection('vercel', vercelAccounts)}
      {renderServiceSection('spotify', spotifyAccounts)}
    </div>
  );
};

export default ConnectedAccounts;
