import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, User, Bell, Shield, CreditCard, Globe, Palette, Database, 
  Download, Upload, Trash2, Key, Lock, Unlock, Eye, EyeOff, Save,
  AlertTriangle, CheckCircle, X, Plus, Minus, Edit, RefreshCw, 
  Monitor, Smartphone, Tablet, Wifi, Cloud, Server, HardDrive,
  Zap, Moon, Sun, Volume2, VolumeX, Mic, MicOff, Camera, CameraOff,
  MapPin, Clock, Calendar, Mail, MessageSquare, Phone, Users,
  BarChart3, PieChart, TrendingUp, Activity, Target, Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import apiService from '../services/api';

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
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [showExportData, setShowExportData] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');

  useEffect(() => {
    fetchSettings();
  }, []);

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
          message: 'Settings updated successfully!',
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
          message: 'Failed to update settings. Please try again.',
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
          message: 'Please provide a reason for account deletion.',
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
          message: 'Account deletion scheduled. You will receive an email confirmation.',
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
          message: 'Failed to schedule account deletion. Please try again.',
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
          message: 'Data exported successfully!',
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
          message: 'Failed to export data. Please try again.',
          duration: 3000
        }
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'workspace', label: 'Workspace', icon: Settings },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'data', label: 'Data & Export', icon: Database }
  ];

  const renderAccount = () => (
    <div className="space-y-6">
      {/* Account Information */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Account Information</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Username</p>
              <p className="text-sm text-gray-600">{settingsData?.account.username}</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700">
              <Edit className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-gray-600">{settingsData?.account.email}</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700">
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settingsData?.account.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
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
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settingsData?.account.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Login Notifications</p>
                <p className="text-sm text-gray-600">Get notified of new logins</p>
              </div>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settingsData?.account.loginNotifications ? 'bg-blue-600' : 'bg-gray-200'
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
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settingsData?.account.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Session Management</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="5"
              max="480"
            />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-medium text-red-900 mb-4">Danger Zone</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-700">Permanently delete your account and all data</p>
            </div>
            <button
              onClick={() => setShowDeleteAccount(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Email Notifications</h3>
          </div>
          <button
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settingsData?.notifications.email.enabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            onClick={() => {
              const newValue = !settingsData?.notifications.email.enabled;
              setSettingsData(prev => prev ? {
                ...prev,
                notifications: {
                  ...prev.notifications,
                  email: { ...prev.notifications.email, enabled: newValue }
                }
              } : null);
              handleSaveSettings('notifications', {
                ...settingsData?.notifications,
                email: { ...settingsData?.notifications.email, enabled: newValue }
              });
            }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settingsData?.notifications.email.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {settingsData?.notifications.email.enabled && (
          <div className="space-y-3">
            {Object.entries(settingsData.notifications.email).filter(([key]) => key !== 'enabled').map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <button
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    value ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  onClick={() => {
                    const newValue = !value;
                    setSettingsData(prev => prev ? {
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        email: { ...prev.notifications.email, [key]: newValue }
                      }
                    } : null);
                    handleSaveSettings('notifications', {
                      ...settingsData?.notifications,
                      email: { ...settingsData?.notifications.email, [key]: newValue }
                    });
                  }}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Push Notifications */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Push Notifications</h3>
          </div>
          <button
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settingsData?.notifications.push.enabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            onClick={() => {
              const newValue = !settingsData?.notifications.push.enabled;
              setSettingsData(prev => prev ? {
                ...prev,
                notifications: {
                  ...prev.notifications,
                  push: { ...prev.notifications.push, enabled: newValue }
                }
              } : null);
              handleSaveSettings('notifications', {
                ...settingsData?.notifications,
                push: { ...settingsData?.notifications.push, enabled: newValue }
              });
            }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settingsData?.notifications.push.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {settingsData?.notifications.push.enabled && (
          <div className="space-y-3">
            {Object.entries(settingsData.notifications.push).filter(([key]) => key !== 'enabled').map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <button
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    value ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  onClick={() => {
                    const newValue = !value;
                    setSettingsData(prev => prev ? {
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        push: { ...prev.notifications.push, [key]: newValue }
                      }
                    } : null);
                    handleSaveSettings('notifications', {
                      ...settingsData?.notifications,
                      push: { ...settingsData?.notifications.push, [key]: newValue }
                    });
                  }}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Notifications */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Desktop Notifications</h3>
          </div>
          <button
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settingsData?.notifications.desktop.enabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            onClick={() => {
              const newValue = !settingsData?.notifications.desktop.enabled;
              setSettingsData(prev => prev ? {
                ...prev,
                notifications: {
                  ...prev.notifications,
                  desktop: { ...prev.notifications.desktop, enabled: newValue }
                }
              } : null);
              handleSaveSettings('notifications', {
                ...settingsData?.notifications,
                desktop: { ...settingsData?.notifications.desktop, enabled: newValue }
              });
            }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settingsData?.notifications.desktop.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {settingsData?.notifications.desktop.enabled && (
          <div className="space-y-3">
            {Object.entries(settingsData.notifications.desktop).filter(([key]) => key !== 'enabled').map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <button
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    value ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  onClick={() => {
                    const newValue = !value;
                    setSettingsData(prev => prev ? {
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        desktop: { ...prev.notifications.desktop, [key]: newValue }
                      }
                    } : null);
                    handleSaveSettings('notifications', {
                      ...settingsData?.notifications,
                      desktop: { ...settingsData?.notifications.desktop, [key]: newValue }
                    });
                  }}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-6">
      {/* Theme */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Theme</h3>
        <div className="flex gap-3">
          {['light', 'dark', 'system'].map((theme) => (
            <button
              key={theme}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                settingsData?.appearance.theme === theme
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => {
                setSettingsData(prev => prev ? {
                  ...prev,
                  appearance: { ...prev.appearance, theme: theme as 'light' | 'dark' | 'system' }
                } : null);
                handleSaveSettings('appearance', { ...settingsData?.appearance, theme: theme as 'light' | 'dark' | 'system' });
              }}
            >
              {theme === 'light' && <Sun className="w-4 h-4 inline mr-2" />}
              {theme === 'dark' && <Moon className="w-4 h-4 inline mr-2" />}
              {theme === 'system' && <SettingsIcon className="w-4 h-4 inline mr-2" />}
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Accent Color</h3>
        <div className="flex gap-3">
          {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                settingsData?.appearance.accentColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => {
                setSettingsData(prev => prev ? {
                  ...prev,
                  appearance: { ...prev.appearance, accentColor: color }
                } : null);
                handleSaveSettings('appearance', { ...settingsData?.appearance, accentColor: color });
              }}
            />
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Font Size</h3>
        <div className="flex gap-3">
          {['small', 'medium', 'large'].map((size) => (
            <button
              key={size}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                settingsData?.appearance.fontSize === size
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => {
                setSettingsData(prev => prev ? {
                  ...prev,
                  appearance: { ...prev.appearance, fontSize: size as 'small' | 'medium' | 'large' }
                } : null);
                handleSaveSettings('appearance', { ...settingsData?.appearance, fontSize: size as 'small' | 'medium' | 'large' });
              }}
            >
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Density */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Density</h3>
        <div className="flex gap-3">
          {['compact', 'comfortable', 'spacious'].map((density) => (
            <button
              key={density}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                settingsData?.appearance.density === density
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => {
                setSettingsData(prev => prev ? {
                  ...prev,
                  appearance: { ...prev.appearance, density: density as 'compact' | 'comfortable' | 'spacious' }
                } : null);
                handleSaveSettings('appearance', { ...settingsData?.appearance, density: density as 'compact' | 'comfortable' | 'spacious' });
              }}
            >
              {density.charAt(0).toUpperCase() + density.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Accessibility */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Accessibility</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Animations</p>
              <p className="text-sm text-gray-600">Enable smooth transitions and animations</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settingsData?.appearance.animations ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              onClick={() => {
                const newValue = !settingsData?.appearance.animations;
                setSettingsData(prev => prev ? {
                  ...prev,
                  appearance: { ...prev.appearance, animations: newValue }
                } : null);
                handleSaveSettings('appearance', { ...settingsData?.appearance, animations: newValue });
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settingsData?.appearance.animations ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Reduced Motion</p>
              <p className="text-sm text-gray-600">Minimize motion for accessibility</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settingsData?.appearance.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              onClick={() => {
                const newValue = !settingsData?.appearance.reducedMotion;
                setSettingsData(prev => prev ? {
                  ...prev,
                  appearance: { ...prev.appearance, reducedMotion: newValue }
                } : null);
                handleSaveSettings('appearance', { ...settingsData?.appearance, reducedMotion: newValue });
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settingsData?.appearance.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Current Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold capitalize">{settingsData?.billing.plan} Plan</p>
            <p className="text-sm text-gray-600">Next billing: {new Date(settingsData?.billing.nextBillingDate || '').toLocaleDateString()}</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Usage */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Usage</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Projects</span>
              <span>{settingsData?.billing.usage.projects} / {settingsData?.billing.usage.maxProjects}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(settingsData?.billing.usage.projects || 0) / (settingsData?.billing.usage.maxProjects || 1) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Storage</span>
              <span>{settingsData?.billing.usage.storage} GB / {settingsData?.billing.usage.maxStorage} GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${(settingsData?.billing.usage.storage || 0) / (settingsData?.billing.usage.maxStorage || 1) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Team Members</span>
              <span>{settingsData?.billing.usage.teamMembers} / {settingsData?.billing.usage.maxTeamMembers}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${(settingsData?.billing.usage.teamMembers || 0) / (settingsData?.billing.usage.maxTeamMembers || 1) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Payment Method</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium">{settingsData?.billing.paymentMethod.brand} •••• {settingsData?.billing.paymentMethod.last4}</p>
              <p className="text-sm text-gray-600">Expires 12/25</p>
            </div>
          </div>
          <button className="text-blue-600 hover:text-blue-700">
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Invoices */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Recent Invoices</h3>
        <div className="space-y-3">
          {settingsData?.billing.invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <p className="font-medium">{invoice.id}</p>
                <p className="text-sm text-gray-600">{new Date(invoice.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">${invoice.amount}</p>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderData = () => (
    <div className="space-y-6">
      {/* Data Export */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Export Data</h3>
        <p className="text-sm text-gray-600 mb-4">Download a copy of your data in various formats</p>
        <div className="flex gap-3">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
          <button
            onClick={() => setShowExportData(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Auto Backup */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Auto Backup</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Auto Backup</p>
              <p className="text-sm text-gray-600">Automatically backup your data</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settingsData?.data.autoBackup ? 'bg-blue-600' : 'bg-gray-200'
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
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settingsData?.data.autoBackup ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {settingsData?.data.autoBackup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
              <select
                value={settingsData.data.backupFrequency}
                onChange={(e) => {
                  setSettingsData(prev => prev ? {
                    ...prev,
                    data: { ...prev.data, backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' }
                  } : null);
                  handleSaveSettings('data', { ...settingsData?.data, backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Data Location */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Data Location</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Data Center</label>
          <select
            value={settingsData?.data.dataLocation}
            onChange={(e) => {
              setSettingsData(prev => prev ? {
                ...prev,
                data: { ...prev.data, dataLocation: e.target.value as 'us' | 'eu' | 'asia' }
              } : null);
              handleSaveSettings('data', { ...settingsData?.data, dataLocation: e.target.value as 'us' | 'eu' | 'asia' });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="us">United States</option>
            <option value="eu">Europe</option>
            <option value="asia">Asia Pacific</option>
          </select>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-white border border-border rounded-xl p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white border border-border rounded-xl">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'account' && renderAccount()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'appearance' && renderAppearance()}
          {activeTab === 'billing' && renderBilling()}
          {activeTab === 'data' && renderData()}
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">Delete Account</h3>
            </div>
            <p className="text-gray-700 mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for deletion</label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={3}
                placeholder="Please tell us why you're deleting your account..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={saving || !deleteReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete Account'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteAccount(false);
                  setDeleteReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Data Modal */}
      {showExportData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Export Data</h3>
            <p className="text-gray-700 mb-4">
              This will download a copy of all your data in {exportFormat.toUpperCase()} format.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleExportData}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Exporting...' : 'Export Data'}
              </button>
              <button
                onClick={() => setShowExportData(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
