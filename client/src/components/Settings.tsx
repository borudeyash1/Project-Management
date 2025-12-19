import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, User, Bell, Shield, CreditCard, Globe, Palette, Database,
  Download, Upload, Trash2, Key, Lock, Unlock, Eye, EyeOff, Save,
  AlertTriangle, CheckCircle, X, Plus, Minus, Edit, RefreshCw,
  Monitor, Smartphone, Tablet, Wifi, Cloud, Server, HardDrive,
  Zap, Moon, Sun, Volume2, VolumeX, Mic, MicOff, Camera, CameraOff,
  MapPin, Clock, Calendar, Mail, MessageSquare, Phone, Users,
  BarChart3, PieChart, TrendingUp, Activity, Target, Award, Languages
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useDock } from '../context/DockContext';
import { useTranslation } from 'react-i18next';
import apiService from '../services/api';
import LanguageSelector from './LanguageSelector';
import ConnectedAccounts from './ConnectedAccounts';
import { useRefreshData } from '../hooks/useRefreshData';
import GlassmorphicCard from './ui/GlassmorphicCard';
import GlassmorphicPageHeader from './ui/GlassmorphicPageHeader';

interface SettingsData {
  account: {
    username: string;
    email: string;
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    sessionTimeout: number; // minutes
    accountDeletion: {
      scheduledDate: string | null;
      reason: string;
    };
  };
  notifications: {
    email: {
      enabled: boolean;
      taskUpdates: boolean;
      projectUpdates: boolean;
      mentions: boolean;
      deadlines: boolean;
      weeklyDigest: boolean;
    };
    push: {
      enabled: boolean;
      taskUpdates: boolean;
      projectUpdates: boolean;
      mentions: boolean;
      deadlines: boolean;
    };
    sms: {
      enabled: boolean;
      urgentOnly: boolean;
      phoneNumber: string;
    };
    desktop: {
      enabled: boolean;
      sound: boolean;
      badges: boolean;
    };
  };
  privacy: {
    profileVisibility: 'public' | 'workspace' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    showLastSeen: boolean;
    allowDirectMessages: boolean;
    dataSharing: {
      analytics: boolean;
      crashReports: boolean;
      usageStats: boolean;
    };
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    density: 'compact' | 'comfortable' | 'spacious';
    sidebarCollapsed: boolean;
    animations: boolean;
    reducedMotion: boolean;
  };
  workspace: {
    defaultView: 'dashboard' | 'projects' | 'tasks' | 'calendar';
    autoArchive: boolean;
    archiveAfterDays: number;
    showCompletedTasks: boolean;
    taskGrouping: 'none' | 'project' | 'assignee' | 'dueDate' | 'priority';
    timeTracking: boolean;
    breakReminders: boolean;
    breakInterval: number; // minutes
  };
  integrations: {
    googleCalendar: {
      enabled: boolean;
      syncTasks: boolean;
      syncProjects: boolean;
    };
    slack: {
      enabled: boolean;
      channel: string;
      notifications: boolean;
    };
    github: {
      enabled: boolean;
      repository: string;
      syncIssues: boolean;
    };
    jira: {
      enabled: boolean;
      url: string;
      syncProjects: boolean;
    };
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    sessionManagement: {
      maxConcurrentSessions: number;
      sessionTimeout: number;
      requireReauth: boolean;
    };
    ipWhitelist: string[];
    deviceManagement: {
      trustedDevices: Array<{
        id: string;
        name: string;
        lastUsed: string;
        location: string;
      }>;
    };
  };
  billing: {
    plan: 'free' | 'pro' | 'enterprise';
    nextBillingDate: string;
    paymentMethod: {
      type: 'card' | 'bank';
      last4: string;
      brand: string;
    };
    invoices: Array<{
      id: string;
      date: string;
      amount: number;
      status: 'paid' | 'pending' | 'failed';
    }>;
    usage: {
      projects: number;
      maxProjects: number;
      storage: number; // GB
      maxStorage: number; // GB
      teamMembers: number;
      maxTeamMembers: number;
    };
  };
  data: {
    exportFormats: string[];
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    retentionPeriod: number; // days
    dataLocation: 'us' | 'eu' | 'asia';
  };
}

const Settings: React.FC = () => {
  const { state, dispatch } = useApp();
  const { dockPosition } = useDock();
  const { isDarkMode, preferences, updatePreferences: updateThemePreferences } = useTheme();
  const { t, i18n } = useTranslation();
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [showExportData, setShowExportData] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSettings();
      setSettingsData(response);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      // Use mock data for now
      setSettingsData({
        account: {
          username: state.userProfile?.username || 'johndoe',
          email: state.userProfile?.email || 'john@example.com',
          twoFactorEnabled: false,
          loginNotifications: true,
          sessionTimeout: 30,
          accountDeletion: {
            scheduledDate: null,
            reason: ''
          }
        },
        notifications: {
          email: {
            enabled: true,
            taskUpdates: true,
            projectUpdates: true,
            mentions: true,
            deadlines: true,
            weeklyDigest: true
          },
          push: {
            enabled: true,
            taskUpdates: true,
            projectUpdates: false,
            mentions: true,
            deadlines: true
          },
          sms: {
            enabled: false,
            urgentOnly: true,
            phoneNumber: ''
          },
          desktop: {
            enabled: true,
            sound: true,
            badges: true
          }
        },
        privacy: {
          profileVisibility: 'workspace',
          showEmail: true,
          showPhone: false,
          showLastSeen: true,
          allowDirectMessages: true,
          dataSharing: {
            analytics: true,
            crashReports: true,
            usageStats: false
          }
        },
        appearance: {
          theme: 'system',
          accentColor: '#3B82F6',
          fontSize: 'medium',
          density: 'comfortable',
          sidebarCollapsed: false,
          animations: true,
          reducedMotion: false
        },
        workspace: {
          defaultView: 'dashboard',
          autoArchive: true,
          archiveAfterDays: 30,
          showCompletedTasks: true,
          taskGrouping: 'project',
          timeTracking: true,
          breakReminders: true,
          breakInterval: 60
        },
        integrations: {
          googleCalendar: {
            enabled: false,
            syncTasks: false,
            syncProjects: false
          },
          slack: {
            enabled: false,
            channel: '',
            notifications: false
          },
          github: {
            enabled: false,
            repository: '',
            syncIssues: false
          },
          jira: {
            enabled: false,
            url: '',
            syncProjects: false
          }
        },
        security: {
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSymbols: false
          },
          sessionManagement: {
            maxConcurrentSessions: 5,
            sessionTimeout: 30,
            requireReauth: false
          },
          ipWhitelist: [],
          deviceManagement: {
            trustedDevices: [
              {
                id: '1',
                name: 'MacBook Pro',
                lastUsed: new Date().toISOString(),
                location: 'San Francisco, CA'
              }
            ]
          }
        },
        billing: {
          plan: 'pro',
          nextBillingDate: '2024-02-15',
          paymentMethod: {
            type: 'card',
            last4: '4242',
            brand: 'Visa'
          },
          invoices: [
            {
              id: 'INV-001',
              date: '2024-01-15',
              amount: 29.99,
              status: 'paid'
            }
          ],
          usage: {
            projects: 8,
            maxProjects: 50,
            storage: 2.5,
            maxStorage: 100,
            teamMembers: 12,
            maxTeamMembers: 25
          }
        },
        data: {
          exportFormats: ['json', 'csv', 'pdf'],
          autoBackup: true,
          backupFrequency: 'weekly',
          retentionPeriod: 90,
          dataLocation: 'us'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle OAuth redirect success/error
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');
    const service = params.get('service');

    if (success === 'account_connected' && service) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: t('connectedAccounts.connectionSuccess', { service: service.charAt(0).toUpperCase() + service.slice(1) }),
          duration: 5000
        }
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh settings to show new connection
      fetchSettings();
    } else if (success === 'account_updated' && service) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: t('connectedAccounts.accountUpdated', { service: service.charAt(0).toUpperCase() + service.slice(1) }),
          duration: 5000
        }
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchSettings();
    } else if (error) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: t('connectedAccounts.connectionError', { error }),
          duration: 5000
        }
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Enable refresh button
  useRefreshData(fetchSettings, []);

  const handleSaveSettings = async (section: string, data: any) => {
    try {
      setSaving(true);
      await apiService.updateSettings({ [section]: data });
      setSettingsData(prev => prev ? { ...prev, [section]: data } : null);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: t('settings.updateSuccess'),
          duration: 3000
        }
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: t('settings.updateError'),
          duration: 3000
        }
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteReason.trim()) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: t('settings.deleteReasonRequired'),
          duration: 3000
        }
      });
      return;
    }

    try {
      setSaving(true);
      await apiService.deleteAccount({ reason: deleteReason });
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: t('settings.deleteScheduled'),
          duration: 5000
        }
      });
      setShowDeleteAccount(false);
    } catch (error) {
      console.error('Failed to delete account:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: t('settings.deleteError'),
          duration: 3000
        }
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      setSaving(true);
      const response = await apiService.exportData({ format: exportFormat });
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proxima-data-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setShowExportData(false);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: t('settings.exportSuccess'),
          duration: 3000
        }
      });
    } catch (error) {
      console.error('Failed to export data:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: t('settings.exportError'),
          duration: 3000
        }
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: t('settings.account'), icon: User },

    { id: 'appearance', label: t('settings.appearance'), icon: Palette },
    { id: 'billing', label: t('settings.billing'), icon: CreditCard }
    // Data & Export tab removed - not fully implemented
  ];

  const renderAccount = () => (
    <div className="space-y-6">
      {/* Connected Accounts Section */}
      <GlassmorphicCard className="p-4">
        <ConnectedAccounts />
      </GlassmorphicCard>

      {/* Account Information */}
      <GlassmorphicCard className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.accountInfo')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{t('settings.username')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{settingsData?.account.username}</p>
            </div>
            <button className="text-accent-dark hover:text-blue-700">
              <Edit className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{t('settings.email')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{settingsData?.account.email}</p>
            </div>
            <button className="text-accent-dark hover:text-blue-700">
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Security Settings */}
      <GlassmorphicCard className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.security')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{t('settings.twoFactor')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.twoFactorDesc')}</p>
              </div>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settingsData?.account.twoFactorEnabled ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              onClick={() => {
                const newValue = !settingsData?.account.twoFactorEnabled;
                setSettingsData(prev => prev ? {
                  ...prev,
                  account: { ...prev.account, twoFactorEnabled: newValue }
                } : null);
                handleSaveSettings('account', { ...settingsData?.account, twoFactorEnabled: newValue });
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settingsData?.account.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{t('settings.loginNotifications')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.loginNotificationsDesc')}</p>
              </div>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settingsData?.account.loginNotifications ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              onClick={() => {
                const newValue = !settingsData?.account.loginNotifications;
                setSettingsData(prev => prev ? {
                  ...prev,
                  account: { ...prev.account, loginNotifications: newValue }
                } : null);
                handleSaveSettings('account', { ...settingsData?.account, loginNotifications: newValue });
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settingsData?.account.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Session Management */}
      <GlassmorphicCard className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.sessionManagement')}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.sessionTimeout')}</label>
            <input
              type="number"
              value={settingsData?.account.sessionTimeout}
              onChange={(e) => {
                const newValue = parseInt(e.target.value);
                setSettingsData(prev => prev ? {
                  ...prev,
                  account: { ...prev.account, sessionTimeout: newValue }
                } : null);
                handleSaveSettings('account', { ...settingsData?.account, sessionTimeout: newValue });
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
              min="5"
              max="480"
            />
          </div>
        </div>
      </GlassmorphicCard>

      {/* Danger Zone */}
      <GlassmorphicCard className="p-4 border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
        <h3 className="font-medium text-red-900 dark:text-red-400 mb-4">{t('settings.dangerZone')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-900 dark:text-red-400">{t('settings.deleteAccount')}</p>
              <p className="text-sm text-red-700 dark:text-red-300">{t('settings.deleteAccountDesc')}</p>
            </div>
            <button
              onClick={() => setShowDeleteAccount(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {t('settings.deleteAccount')}
            </button>
          </div>
        </div>
      </GlassmorphicCard>
    </div>
  );

  /* Notifications Section Removed as per request */

  const renderAppearance = () => (
    <div className="space-y-6">
      {/* Theme */}
      <GlassmorphicCard className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.theme')}</h3>
        <div className="flex gap-3">
          {['light', 'dark', 'system'].map((theme) => (
            <button
              key={theme}
              className={`px-4 py-2 rounded-lg border transition-colors ${preferences.theme === theme
                ? 'bg-accent text-gray-900 border-accent-dark ring-2 ring-accent ring-offset-2 dark:ring-offset-gray-800'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              onClick={async () => {
                try {
                  await updateThemePreferences({ theme: theme as 'light' | 'dark' | 'system' });
                  dispatch({
                    type: 'ADD_TOAST',
                    payload: {
                      id: Date.now().toString(),
                      type: 'success',
                      message: t('settings.themeUpdated', { theme }),
                      duration: 2000
                    }
                  });
                } catch (error) {
                  dispatch({
                    type: 'ADD_TOAST',
                    payload: {
                      id: Date.now().toString(),
                      type: 'error',
                      message: t('settings.themeError'),
                      duration: 3000
                    }
                  });
                }
              }}
            >
              {theme === 'light' && <Sun className="w-4 h-4 inline mr-2" />}
              {theme === 'dark' && <Moon className="w-4 h-4 inline mr-2" />}
              {theme === 'system' && <Monitor className="w-4 h-4 inline mr-2" />}
              {t(`settings.${theme}`)}
            </button>
          ))}
        </div>
      </GlassmorphicCard>

      {/* Accent Color */}
      <GlassmorphicCard className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.accentColor')}</h3>
        <div className="flex gap-3 flex-wrap">
          {['#FBBF24', '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'].map((color) => (
            <button
              key={color}
              className={`w-10 h-10 rounded-full border-2 transition-all ${preferences.accentColor === color
                ? 'border-gray-900 dark:border-white scale-110 ring-2 ring-offset-2 ring-gray-900 dark:ring-white dark:ring-offset-gray-800'
                : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                }`}
              style={{ backgroundColor: color }}
              onClick={async () => {
                try {
                  await updateThemePreferences({ accentColor: color });
                  dispatch({
                    type: 'ADD_TOAST',
                    payload: {
                      id: Date.now().toString(),
                      type: 'success',
                      message: t('settings.accentColorUpdated'),
                      duration: 2000
                    }
                  });
                } catch (error) {
                  dispatch({
                    type: 'ADD_TOAST',
                    payload: {
                      id: Date.now().toString(),
                      type: 'error',
                      message: t('settings.accentColorError'),
                      duration: 3000
                    }
                  });
                }
              }}
              title={color}
            />
          ))}
        </div>
      </GlassmorphicCard>

      {/* Language Selector */}
      <LanguageSelector />

      {/* Font Size */}
      {/* Font Size */}
      <GlassmorphicCard className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.fontSize')}</h3>
        <div className="flex gap-3">
          {['small', 'medium', 'large'].map((size) => (
            <button
              key={size}
              className={`px-4 py-2 rounded-lg border transition-colors ${preferences.fontSize === size
                ? 'bg-accent text-gray-900 border-accent-dark ring-2 ring-accent ring-offset-2 dark:ring-offset-gray-800'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              onClick={async () => {
                try {
                  await updateThemePreferences({ fontSize: size as 'small' | 'medium' | 'large' });
                  dispatch({
                    type: 'ADD_TOAST',
                    payload: {
                      id: Date.now().toString(),
                      type: 'success',
                      message: t('settings.fontSizeUpdated', { size }),
                      duration: 2000
                    }
                  });
                } catch (error) {
                  dispatch({
                    type: 'ADD_TOAST',
                    payload: {
                      id: Date.now().toString(),
                      type: 'error',
                      message: t('settings.fontSizeError'),
                      duration: 3000
                    }
                  });
                }
              }}
            >
              {t(`settings.${size}`)}
            </button>
          ))}
        </div>
      </GlassmorphicCard>

      {/* Density */}
      {/* Density */}
      <GlassmorphicCard className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.density')}</h3>
        <div className="flex gap-3">
          {['compact', 'comfortable', 'spacious'].map((density) => (
            <button
              key={density}
              className={`px-4 py-2 rounded-lg border transition-colors ${preferences.density === density
                ? 'bg-accent text-gray-900 border-accent-dark ring-2 ring-accent ring-offset-2 dark:ring-offset-gray-800'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              onClick={async () => {
                try {
                  await updateThemePreferences({ density: density as 'compact' | 'comfortable' | 'spacious' });
                  dispatch({
                    type: 'ADD_TOAST',
                    payload: {
                      id: Date.now().toString(),
                      type: 'success',
                      message: t('settings.densityUpdated', { density }),
                      duration: 2000
                    }
                  });
                } catch (error) {
                  dispatch({
                    type: 'ADD_TOAST',
                    payload: {
                      id: Date.now().toString(),
                      type: 'error',
                      message: t('settings.densityError'),
                      duration: 3000
                    }
                  });
                }
              }}
            >
              {t(`settings.${density}`)}
            </button>
          ))}
        </div>
      </GlassmorphicCard>

      {/* Accessibility */}
      {/* Accessibility */}
      <GlassmorphicCard className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.accessibility')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{t('settings.animations')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.animationsDesc')}</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.animations ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              onClick={async () => {
                try {
                  await updateThemePreferences({ animations: !preferences.animations });
                } catch (error) {
                  console.error('Failed to update animations:', error);
                }
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.animations ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{t('settings.reducedMotion')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.reducedMotionDesc')}</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.reducedMotion ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              onClick={async () => {
                try {
                  await updateThemePreferences({ reducedMotion: !preferences.reducedMotion });
                } catch (error) {
                  console.error('Failed to update reduced motion:', error);
                }
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>
      </GlassmorphicCard>
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-6">
      {/* Current Plan */}
      {/* Current Plan */}
      <GlassmorphicCard className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.currentPlan')}</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">{settingsData?.billing.plan} Plan</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.nextBilling', { date: new Date(settingsData?.billing.nextBillingDate || '').toLocaleDateString() })}</p>
          </div>
          <button className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors">
            {t('settings.upgradePlan')}
          </button>
        </div>
      </GlassmorphicCard>

      {/* Usage */}
      {/* Usage */}
      <GlassmorphicCard className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.usage')}</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-1">
              <span>{t('settings.projects')}</span>
              <span>{settingsData?.billing.usage.projects} / {settingsData?.billing.usage.maxProjects}</span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full"
                style={{ width: `${(settingsData?.billing.usage.projects || 0) / (settingsData?.billing.usage.maxProjects || 1) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-1">
              <span>{t('settings.storage')}</span>
              <span>{settingsData?.billing.usage.storage} GB / {settingsData?.billing.usage.maxStorage} GB</span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${(settingsData?.billing.usage.storage || 0) / (settingsData?.billing.usage.maxStorage || 1) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-1">
              <span>{t('workspace.teamMembers')}</span>
              <span>{settingsData?.billing.usage.teamMembers} / {settingsData?.billing.usage.maxTeamMembers}</span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${(settingsData?.billing.usage.teamMembers || 0) / (settingsData?.billing.usage.maxTeamMembers || 1) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Payment Method */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">{t('settings.paymentMethod')}</h3>
        {/* Payment Method */}
        <GlassmorphicCard className="p-4">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.paymentMethod')}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{settingsData?.billing.paymentMethod.brand} •••• {settingsData?.billing.paymentMethod.last4}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.expires', { date: '12/25' })}</p>
              </div>
            </div>
            <button className="text-accent-dark hover:text-blue-700">
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Invoices */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">{t('settings.recentInvoices')}</h3>
        {/* Invoices */}
        <GlassmorphicCard className="p-4">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.recentInvoices')}</h3>
          <div className="space-y-3">
            {settingsData?.billing.invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{invoice.id}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(invoice.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-100">${invoice.amount}</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  );

  const renderData = () => (
    <div className="space-y-6">
      {/* Data Export */}
      {/* Data Export */}
      <GlassmorphicCard className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.exportData')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('settings.exportDataDesc')}</p>
        <div className="flex gap-3">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
          <button
            onClick={() => setShowExportData(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('settings.exportData')}
          </button>
        </div>
      </GlassmorphicCard>

      {/* Auto Backup */}
      {/* Auto Backup */}
      <GlassmorphicCard className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.autoBackup')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{t('settings.autoBackup')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.autoBackupDesc')}</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settingsData?.data.autoBackup ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              onClick={() => {
                const newValue = !settingsData?.data.autoBackup;
                setSettingsData(prev => prev ? {
                  ...prev,
                  data: { ...prev.data, autoBackup: newValue }
                } : null);
                handleSaveSettings('data', { ...settingsData?.data, autoBackup: newValue });
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settingsData?.data.autoBackup ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
          {settingsData?.data.autoBackup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.backupFrequency')}</label>
              <select
                value={settingsData.data.backupFrequency}
                onChange={(e) => {
                  setSettingsData(prev => prev ? {
                    ...prev,
                    data: { ...prev.data, backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' }
                  } : null);
                  handleSaveSettings('data', { ...settingsData?.data, backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>
      </GlassmorphicCard>

      {/* Data Location */}
      {/* Data Location */}
      <GlassmorphicCard className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.dataLocation')}</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.primaryDataCenter')}</label>
          <select
            value={settingsData?.data.dataLocation}
            onChange={(e) => {
              setSettingsData(prev => prev ? {
                ...prev,
                data: { ...prev.data, dataLocation: e.target.value as 'us' | 'eu' | 'asia' }
              } : null);
              handleSaveSettings('data', { ...settingsData?.data, dataLocation: e.target.value as 'us' | 'eu' | 'asia' });
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="us">United States</option>
            <option value="eu">Europe</option>
            <option value="asia">Asia Pacific</option>
          </select>
        </div>
      </GlassmorphicCard>
    </div>
  );

  if (loading) {
    return (
      <div
        className="p-4 sm:p-6 transition-all duration-300"
        style={{
          paddingLeft: dockPosition === 'left' ? '80px' : undefined,
          paddingRight: dockPosition === 'right' ? '80px' : undefined
        }}
      >
        <div className="bg-white dark:bg-gray-800 border border-border dark:border-gray-600 rounded-xl p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 sm:p-6 transition-all duration-300 min-h-screen bg-gradient-to-br ${isDarkMode ? 'from-gray-900 via-gray-800 to-gray-900' : 'from-gray-50 via-blue-50/30 to-purple-50/20'}`}
      style={{
        paddingLeft: dockPosition === 'left' ? '80px' : undefined,
        paddingRight: dockPosition === 'right' ? '80px' : undefined
      }}
    >
      <GlassmorphicPageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        icon={SettingsIcon}
      />

      {/* Tabs */}
      <GlassmorphicCard className="mb-6">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'border-accent text-accent-dark dark:text-accent-light'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </GlassmorphicCard>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'account' && renderAccount()}
        {activeTab === 'appearance' && renderAppearance()}
        {activeTab === 'billing' && renderBilling()}
        {activeTab === 'data' && renderData()}
      </div>

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">{t('settings.deleteAccount')}</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-700 mb-4">
              {t('settings.deleteAccountWarning')}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">{t('settings.deleteReason')}</label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={3}
                placeholder={t('settings.deleteReasonPlaceholder')}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={saving || !deleteReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {saving ? t('settings.deleting') : t('settings.deleteAccount')}
              </button>
              <button
                onClick={() => {
                  setShowDeleteAccount(false);
                  setDeleteReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Data Modal */}
      {showExportData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('settings.exportData')}</h3>
            <p className="text-gray-700 dark:text-gray-700 mb-4">
              {t('settings.exportWarning', { format: exportFormat.toUpperCase() })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleExportData}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {saving ? t('settings.exporting') : t('settings.exportData')}
              </button>
              <button
                onClick={() => setShowExportData(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
