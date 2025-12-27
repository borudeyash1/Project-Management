import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { SpotifyLogo, DiscordLogo, LinearLogo, FigmaLogo, JiraLogo, ZendeskLogo, NotionLogo, DropboxLogo, GitHubLogo, SlackLogo } from './icons/BrandLogos';
import {
  Mail, Calendar, FileText,
  AlertCircle, CheckCircle, ExternalLink, Loader, Plus, Trash2, Unlink, Link as LinkIcon,
  Headphones, Zap, MessageSquare, HardDrive
} from 'lucide-react';
import CollapsibleIntegrationCard from './CollapsibleIntegrationCard';

interface ConnectedAccount {
  _id: string;
  userId: string;
  provider: string; // 'google' | 'slack' | 'github' etc
  providerId: string;
  providerEmail: string;
  providerName: string;
  providerAvatar?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean; // For switching between multiple accounts
  isPrimary?: boolean; // Main account for the service
}

interface ServiceAccounts {
  accounts: ConnectedAccount[];
  activeAccount: ConnectedAccount | null;
}

interface AccountsData {
  accounts: ConnectedAccount[];
  activeAccount: ConnectedAccount | null;
}

interface NotionDatabase {
  id: string;
  title: string;
}

const ConnectedAccounts: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // State for all services
  const [mailAccounts, setMailAccounts] = useState<ServiceAccounts>({ accounts: [], activeAccount: null });
  const [calendarAccounts, setCalendarAccounts] = useState<ServiceAccounts>({ accounts: [], activeAccount: null });
  const [vaultAccounts, setVaultAccounts] = useState<ServiceAccounts>({ accounts: [], activeAccount: null });
  const [slackAccounts, setSlackAccounts] = useState<ServiceAccounts>({ accounts: [], activeAccount: null });
  const [githubAccounts, setGithubAccounts] = useState<ServiceAccounts>({ accounts: [], activeAccount: null });
  const [dropboxAccounts, setDropboxAccounts] = useState<ServiceAccounts>({ accounts: [], activeAccount: null });
  const [figmaAccounts, setFigmaAccounts] = useState<ServiceAccounts>({ accounts: [], activeAccount: null });
  const [notionAccounts, setNotionAccounts] = useState<ServiceAccounts>({ accounts: [], activeAccount: null });
  const [spotifyAccounts, setSpotifyAccounts] = useState<ServiceAccounts>({ accounts: [], activeAccount: null });
  const [jiraAccounts, setJiraAccounts] = useState<ServiceAccounts>({ accounts: [], activeAccount: null });
  const [zendeskAccounts, setZendeskAccounts] = useState<ServiceAccounts>({ accounts: [], activeAccount: null });
  const [linearAccounts, setLinearAccounts] = useState<ServiceAccounts>({ accounts: [], activeAccount: null });
  const [discordAccounts, setDiscordAccounts] = useState<ServiceAccounts>({ accounts: [], activeAccount: null });

  // Notion specific state
  const [notionDatabases, setNotionDatabases] = useState<NotionDatabase[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');



  // Zendesk Modal State
  const [showZendeskModal, setShowZendeskModal] = useState(false);
  const [zendeskSubdomain, setZendeskSubdomain] = useState('');

  const appConfig = {
    mail: {
      icon: <Mail className="w-6 h-6" />,
      title: t('connectedAccounts.gmail'),
      description: t('connectedAccounts.gmailDesc'),
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/10',
      borderColor: 'border-red-500/20',
      apiConsole: 'https://console.cloud.google.com/apis/dashboard'
    },
    calendar: {
      icon: <Calendar className="w-6 h-6" />,
      title: t('connectedAccounts.gcal'),
      description: t('connectedAccounts.gcalDesc'),
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
      borderColor: 'border-blue-500/20',
      apiConsole: 'https://console.cloud.google.com/apis/dashboard'
    },
    vault: {
      icon: <HardDrive className="w-6 h-6" />,
      title: t('connectedAccounts.gdrive'),
      description: t('connectedAccounts.gdriveDesc'),
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/10',
      borderColor: 'border-green-500/20',
      apiConsole: 'https://console.cloud.google.com/apis/dashboard'
    },
    slack: {
      icon: <SlackLogo className="w-6 h-6" />,
      title: 'Slack',
      description: t('connectedAccounts.slackDesc'),
      color: 'text-[#4A154B]',
      bgColor: 'bg-purple-50 dark:bg-purple-900/10',
      borderColor: 'border-purple-500/20',
      apiConsole: 'https://api.slack.com/apps'
    },
    github: {
      icon: <GitHubLogo className="w-6 h-6" />,
      title: 'GitHub',
      description: t('connectedAccounts.githubDesc'),
      color: 'text-gray-900 dark:text-gray-100',
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      borderColor: 'border-gray-400/20',
      apiConsole: 'https://github.com/settings/developers'
    },
    dropbox: {
      icon: <DropboxLogo className="w-6 h-6" />,
      title: 'Dropbox',
      description: t('connectedAccounts.dropboxDesc'),
      color: 'text-[#0061FE]',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
      borderColor: 'border-blue-500/20',
      apiConsole: 'https://www.dropbox.com/developers/apps'
    },
    figma: {
      icon: <FigmaLogo className="w-6 h-6" />,
      title: 'Figma',
      description: t('connectedAccounts.figmaDesc'),
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/10',
      borderColor: 'border-orange-500/20',
      apiConsole: 'https://www.figma.com/developers/api'
    },
    notion: {
      icon: <NotionLogo className="w-6 h-6" />,
      title: 'Notion',
      description: t('connectedAccounts.notionDesc'),
      color: 'text-gray-900 dark:text-gray-100',
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      borderColor: 'border-gray-400/20',
      apiConsole: 'https://www.notion.so/my-integrations'
    },
    spotify: {
      icon: <SpotifyLogo className="w-6 h-6" />,
      title: 'Spotify',
      description: 'Control music playback',
      color: 'text-[#1DB954]',
      bgColor: 'bg-green-50 dark:bg-green-900/10',
      borderColor: 'border-green-500/20',
      apiConsole: 'https://developer.spotify.com/dashboard'
    },
    jira: {
      icon: <JiraLogo className="w-6 h-6" />,
      title: 'Jira',
      description: 'Issue & project tracking',
      color: 'text-[#2684FF]',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
      borderColor: 'border-blue-600/20',
      apiConsole: 'https://developer.atlassian.com/console/myapps/'
    },
    zendesk: {
      icon: <ZendeskLogo className="w-6 h-6" />,
      title: 'Zendesk',
      description: 'Customer Service',
      color: 'text-gray-900 dark:text-gray-100',
      bgColor: 'bg-green-600/10',
      borderColor: 'border-green-600/20',
      apiConsole: 'https://developer.zendesk.com/'
    },
    linear: {
      icon: <LinearLogo className="w-6 h-6" />,
      title: 'Linear',
      description: 'Issue Tracking',
      color: 'text-[#5E6AD2]',
      bgColor: 'bg-purple-600/10',
      borderColor: 'border-purple-600/20',
      apiConsole: 'https://linear.app/settings/api'
    },
    discord: {
      icon: <DiscordLogo className="w-6 h-6" />,
      title: 'Discord',
      description: 'Team Communication',
      color: 'text-[#5865F2]',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      apiConsole: 'https://discord.com/developers/applications'
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (notionAccounts.accounts.length > 0) {
      fetchNotionDatabases();

      // Pre-select saved default database
      const activeAccount = notionAccounts.activeAccount || notionAccounts.accounts.find(a => a.isActive);
      if (activeAccount && (activeAccount as any).settings?.notion?.defaultDatabaseId) {
        setSelectedDatabase((activeAccount as any).settings.notion.defaultDatabaseId);
      }
    }
  }, [notionAccounts]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);

      const services = [
        'mail', 'calendar', 'vault', 'slack', 'github',
        'dropbox', 'figma', 'notion', 'spotify', 'jira',
        'zendesk', 'linear', 'discord'
      ] as const;

      // Use individual error handling for each request to prevent one failure from blocking others
      const requests = services.map(service =>
        apiService.get(`/sartthi-accounts/${service}`)
          .then(response => ({ service, success: true, data: response.data }))
          .catch(error => {
            console.warn(`Failed to fetch ${service} accounts:`, error);
            return { service, success: false, data: null };
          })
      );

      const results = await Promise.all(requests);

      results.forEach(({ service, success, data }) => {
        if (success && data) {
          switch (service) {
            case 'mail': setMailAccounts(data); break;
            case 'calendar': setCalendarAccounts(data); break;
            case 'vault': setVaultAccounts(data); break;
            case 'slack': setSlackAccounts(data); break;
            case 'github': setGithubAccounts(data); break;
            case 'dropbox': setDropboxAccounts(data); break;
            case 'figma': setFigmaAccounts(data); break;
            case 'notion': setNotionAccounts(data); break;
            case 'spotify': setSpotifyAccounts(data); break;
            case 'jira': setJiraAccounts(data); break;
            case 'zendesk': setZendeskAccounts(data); break;
            case 'linear': setLinearAccounts(data); break;
            case 'discord': setDiscordAccounts(data); break;
          }
        }
      });
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotionDatabases = async () => {
    try {
      const response = await apiService.get('/sartthi/notion/databases');
      if (response.success && response.data) {
        setNotionDatabases(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch Notion databases:', error);
    }
  };

  const handleSetDefaultDatabase = async (databaseId: string, databaseName: string) => {
    try {
      setActionLoading('set-notion-database');
      const response = await apiService.post('/sartthi/notion/set-default-database', {
        databaseId,
        databaseName
      });

      if (response.success) {
        setSelectedDatabase(databaseId);
        // Show success message
        alert('Default database set successfully!');
      }
    } catch (error: any) {
      console.error('Failed to set default database:', error);
      alert(error.response?.data?.message || 'Failed to set default database');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDatabaseSelect = (databaseId: string) => {
    const db = notionDatabases.find(d => d.id === databaseId);
    if (db) {
      handleSetDefaultDatabase(db.id, db.title);
    }
  };

  const handleConnect = async (service: 'mail' | 'calendar' | 'vault' | 'slack' | 'github' | 'dropbox' | 'figma' | 'notion' | 'spotify' | 'jira' | 'zendesk' | 'linear' | 'discord', customParams?: any) => {
    try {
      if (service === 'zendesk' && !customParams?.subdomain) {
        setShowZendeskModal(true);
        return;
      }

      setActionLoading(`connect-${service}`);

      const queryParams = customParams ? `?${new URLSearchParams(customParams).toString()}` : '';
      const response = await apiService.post(`/sartthi-accounts/${service}/connect${queryParams}`, {});

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

  const handleSetActive = async (service: 'mail' | 'calendar' | 'vault' | 'slack' | 'github' | 'dropbox' | 'figma' | 'notion' | 'spotify' | 'jira' | 'zendesk' | 'linear' | 'discord', accountId: string) => {
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

  const handleDisconnect = async (service: 'mail' | 'calendar' | 'vault' | 'slack' | 'github' | 'dropbox' | 'figma' | 'notion' | 'spotify' | 'jira' | 'zendesk' | 'linear' | 'discord', accountId: string) => {
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
    service: 'mail' | 'calendar' | 'vault' | 'slack' | 'github' | 'dropbox' | 'figma' | 'notion' | 'spotify' | 'jira' | 'zendesk' | 'linear' | 'discord',
    accountsData: AccountsData
  ) => {
    const config = appConfig[service];
    const { accounts, activeAccount } = accountsData;
    const isConnected = accounts.length > 0;

    return (
      <CollapsibleIntegrationCard
        key={service}
        icon={config.icon}
        title={config.title}
        description={config.description}
        color={config.color}
        bgColor={config.bgColor}
        borderColor={config.borderColor}
        isConnected={isConnected}
        accounts={accounts}
        activeAccount={activeAccount}
        loading={!!actionLoading}
        apiConsoleUrl={(config as any).apiConsole}
        onConnect={() => handleConnect(service)}
        onDisconnect={(accountId) => handleDisconnect(service, accountId)}
        onSetActive={(accountId) => handleSetActive(service, accountId)}
      >
        {/* Special content for Notion */}
        {service === 'notion' && isConnected && (
          <div className="mt-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Database for Tasks
            </h4>
            {notionDatabases.length > 0 ? (
              <select
                value={selectedDatabase}
                onChange={(e) => handleDatabaseSelect(e.target.value)}
                className="w-full p-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a database...</option>
                {notionDatabases.map((db) => (
                  <option key={db.id} value={db.id}>
                    {db.title}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                No databases found
              </div>
            )}
          </div>
        )}
      </CollapsibleIntegrationCard>
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

      {/* Notion Database Selector - Only if not handled in card, but now card handles it so we can remove this duplicate block if we want. But wait, previous code had it. I moved it into the card. I will remove the top-level block. */}

      {renderServiceSection('spotify', spotifyAccounts)}
      {renderServiceSection('jira', jiraAccounts)}
      {renderServiceSection('zendesk', zendeskAccounts)}
      {renderServiceSection('linear', linearAccounts)}
      {renderServiceSection('discord', discordAccounts)}
      {/* Zendesk Subdomain Modal */}
      {showZendeskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Connect Zendesk</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Please enter your Zendesk subdomain to connect your account.
                <br />
                <span className="text-xs opacity-70">(e.g., if your URL is <b>company</b>.zendesk.com, enter <b>company</b>)</span>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subdomain
                  </label>
                  <div className="flex rounded-md shadow-sm">
                    <input
                      type="text"
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="d3v-yoursite"
                      value={zendeskSubdomain}
                      onChange={(e) => setZendeskSubdomain(e.target.value)}
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
                      .zendesk.com
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowZendeskModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (zendeskSubdomain) {
                        handleConnect('zendesk', { subdomain: zendeskSubdomain });
                        setShowZendeskModal(false);
                      }
                    }}
                    disabled={!zendeskSubdomain}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectedAccounts;
