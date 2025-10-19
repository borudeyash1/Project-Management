import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Clock, Shield, Edit, Save, X, 
  Camera, Upload, Eye, EyeOff, CheckCircle, AlertCircle, Building, 
  Globe, CreditCard, Key, Lock, Unlock, Settings, Bell, Moon, Sun,
  Download, Trash2, Plus, Minus, Star, Award, Trophy, Target, Zap, BarChart3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import apiService from '../services/api';

interface ProfileData {
  fullName: string;
  username: string;
  email: string;
  contactNumber: string;
  avatarUrl: string;
  designation: string;
  department: string;
  location: string;
  about: string;
  dateOfBirth: string;
  joinDate: string;
  lastLogin: string;
  isEmailVerified: boolean;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private' | 'workspace';
      showEmail: boolean;
      showPhone: boolean;
    };
  };
  addresses: Array<{
    id: string;
    type: 'home' | 'work' | 'billing';
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  paymentMethods: Array<{
    id: string;
    type: 'card' | 'bank';
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedDate: string;
    category: 'productivity' | 'collaboration' | 'leadership' | 'innovation';
  }>;
  activityStats: {
    totalTasks: number;
    completedTasks: number;
    projectsParticipated: number;
    workspacesJoined: number;
    streakDays: number;
    totalHoursWorked: number;
  };
}

const Profile: React.FC = () => {
  const { state, dispatch } = useApp();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'home' as 'home' | 'work' | 'billing',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  });
  const [newPayment, setNewPayment] = useState({
    type: 'card' as 'card' | 'bank',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    name: '',
    isDefault: false
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProfile();
      setProfileData(response);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Use mock data for now
      setProfileData({
        fullName: state.userProfile?.fullName || 'John Doe',
        username: state.userProfile?.username || 'johndoe',
        email: state.userProfile?.email || 'john@example.com',
        contactNumber: state.userProfile?.phone || '+1 234 567 8900',
        avatarUrl: state.userProfile?.avatarUrl || '',
        designation: 'Senior Developer',
        department: 'Engineering',
        location: 'San Francisco, CA',
        about: 'Passionate developer with 5+ years of experience in full-stack development.',
        dateOfBirth: '1990-01-15',
        joinDate: '2023-01-15',
        lastLogin: new Date().toISOString(),
        isEmailVerified: true,
        preferences: {
          theme: 'system',
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          privacy: {
            profileVisibility: 'workspace',
            showEmail: true,
            showPhone: false
          }
        },
        addresses: [
          {
            id: '1',
            type: 'home',
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA',
            isDefault: true
          }
        ],
        paymentMethods: [
          {
            id: '1',
            type: 'card',
            last4: '4242',
            brand: 'Visa',
            expiryMonth: 12,
            expiryYear: 2025,
            isDefault: true
          }
        ],
        achievements: [
          {
            id: '1',
            title: 'Task Master',
            description: 'Completed 100 tasks',
            icon: 'Target',
            earnedDate: '2023-12-01',
            category: 'productivity'
          },
          {
            id: '2',
            title: 'Team Player',
            description: 'Collaborated on 10 projects',
            icon: 'Users',
            earnedDate: '2023-11-15',
            category: 'collaboration'
          }
        ],
        activityStats: {
          totalTasks: 150,
          completedTasks: 120,
          projectsParticipated: 8,
          workspacesJoined: 3,
          streakDays: 7,
          totalHoursWorked: 240
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveField = async (field: string, value: string) => {
    try {
      setSaving(true);
      await apiService.updateProfile({ [field]: value });
      setProfileData(prev => prev ? { ...prev, [field]: value } : null);
      setEditingField(null);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Profile updated successfully!',
          duration: 3000
        }
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to update profile. Please try again.',
          duration: 3000
        }
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (section: string, data: any) => {
    try {
      setSaving(true);
      await apiService.updateSettings({ [section]: data });
      setProfileData(prev => prev ? { ...prev, preferences: { ...prev.preferences, [section]: data } } : null);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Preferences updated successfully!',
          duration: 3000
        }
      });
    } catch (error) {
      console.error('Failed to update preferences:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to update preferences. Please try again.',
          duration: 3000
        }
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Passwords do not match!',
          duration: 3000
        }
      });
      return;
    }

    try {
      setSaving(true);
      await apiService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Password changed successfully!',
          duration: 3000
        }
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to change password. Please check your current password.',
          duration: 3000
        }
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async () => {
    try {
      setSaving(true);
      await apiService.addAddress(newAddress);
      setShowAddAddress(false);
      setNewAddress({
        type: 'home',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        isDefault: false
      });
      fetchProfileData(); // Refresh data
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Address added successfully!',
          duration: 3000
        }
      });
    } catch (error) {
      console.error('Failed to add address:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to add address. Please try again.',
          duration: 3000
        }
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddPayment = async () => {
    try {
      setSaving(true);
      await apiService.addPaymentMethod(newPayment);
      setShowAddPayment(false);
      setNewPayment({
        type: 'card',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        name: '',
        isDefault: false
      });
      fetchProfileData(); // Refresh data
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Payment method added successfully!',
          duration: 3000
        }
      });
    } catch (error) {
      console.error('Failed to add payment method:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to add payment method. Please try again.',
          duration: 3000
        }
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'activity', label: 'Activity', icon: BarChart3 }
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <img
            src={profileData?.avatarUrl || `https://ui-avatars.com/api/?name=${profileData?.fullName}&background=random`}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{profileData?.fullName}</h2>
          <p className="text-gray-600">{profileData?.designation} • {profileData?.department}</p>
          <p className="text-sm text-gray-500">Member since {new Date(profileData?.joinDate || '').toLocaleDateString()}</p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{profileData?.fullName}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingField('fullName');
                setEditValue(profileData?.fullName || '');
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{profileData?.email}</p>
                  {profileData?.isEmailVerified && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingField('email');
                setEditValue(profileData?.email || '');
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{profileData?.contactNumber}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingField('contactNumber');
                setEditValue(profileData?.contactNumber || '');
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{profileData?.department}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingField('department');
                setEditValue(profileData?.department || '');
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{profileData?.location}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingField('location');
                setEditValue(profileData?.location || '');
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{new Date(profileData?.dateOfBirth || '').toLocaleDateString()}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingField('dateOfBirth');
                setEditValue(profileData?.dateOfBirth || '');
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">About</h3>
          <button
            onClick={() => {
              setEditingField('about');
              setEditValue(profileData?.about || '');
            }}
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
        <p className="text-gray-700">{profileData?.about}</p>
      </div>

      {/* Security Section */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Security</h3>
        <button
          onClick={() => setShowPasswordForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Key className="w-4 h-4" />
          Change Password
        </button>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      {/* Theme Preferences */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Theme</h3>
        <div className="flex gap-3">
          {['light', 'dark', 'system'].map((theme) => (
            <button
              key={theme}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                profileData?.preferences.theme === theme
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => {
                setProfileData(prev => prev ? {
                  ...prev,
                  preferences: { ...prev.preferences, theme: theme as 'light' | 'dark' | 'system' }
                } : null);
                handleSavePreferences('theme', theme);
              }}
            >
              {theme === 'light' && <Sun className="w-4 h-4 inline mr-2" />}
              {theme === 'dark' && <Moon className="w-4 h-4 inline mr-2" />}
              {theme === 'system' && <Settings className="w-4 h-4 inline mr-2" />}
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Notifications</h3>
        <div className="space-y-3">
          {Object.entries(profileData?.preferences.notifications || {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)} Notifications</span>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                onClick={() => {
                  const newValue = !value;
                  setProfileData(prev => prev ? {
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      notifications: {
                        ...prev.preferences.notifications,
                        [key]: newValue
                      }
                    }
                  } : null);
                  handleSavePreferences('notifications', {
                    ...profileData?.preferences.notifications,
                    [key]: newValue
                  });
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Preferences */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Privacy</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
            <select
              value={profileData?.preferences.privacy.profileVisibility}
              onChange={(e) => {
                setProfileData(prev => prev ? {
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    privacy: {
                      ...prev.preferences.privacy,
                      profileVisibility: e.target.value as 'public' | 'private' | 'workspace'
                    }
                  }
                } : null);
                handleSavePreferences('privacy', {
                  ...profileData?.preferences.privacy,
                  profileVisibility: e.target.value as 'public' | 'private' | 'workspace'
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="public">Public</option>
              <option value="workspace">Workspace Only</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="space-y-3">
            {Object.entries(profileData?.preferences.privacy || {}).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="font-medium">Show {key.charAt(0).toUpperCase() + key.slice(1)}</span>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  onClick={() => {
                    const newValue = !value;
                    setProfileData(prev => prev ? {
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        privacy: {
                          ...prev.preferences.privacy,
                          [key]: newValue
                        }
                      }
                    } : null);
                    handleSavePreferences('privacy', {
                      ...profileData?.preferences.privacy,
                      [key]: newValue
                    });
                  }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Addresses</h3>
        <button
          onClick={() => setShowAddAddress(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profileData?.addresses.map((address) => (
          <div key={address.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-600" />
                <span className="font-medium capitalize">{address.type} Address</span>
                {address.isDefault && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Default</span>
                )}
              </div>
              <button className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-gray-700">
              <p>{address.street}</p>
              <p>{address.city}, {address.state} {address.zipCode}</p>
              <p>{address.country}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
        <button
          onClick={() => setShowAddPayment(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Payment Method
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profileData?.paymentMethods.map((payment) => (
          <div key={payment.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <span className="font-medium">{payment.brand} •••• {payment.last4}</span>
                {payment.isDefault && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Default</span>
                )}
              </div>
              <button className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-gray-700">
              <p>Expires {payment.expiryMonth}/{payment.expiryYear}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profileData?.achievements.map((achievement) => (
          <div key={achievement.id} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full capitalize">
                {achievement.category}
              </span>
              <span>{new Date(achievement.earnedDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Activity Statistics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(profileData?.activityStats || {}).map(([key, value]) => (
          <div key={key} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                {key.includes('Tasks') && <Target className="w-5 h-5 text-blue-600" />}
                {key.includes('Projects') && <Building className="w-5 h-5 text-blue-600" />}
                {key.includes('Workspaces') && <Globe className="w-5 h-5 text-blue-600" />}
                {key.includes('Streak') && <Zap className="w-5 h-5 text-blue-600" />}
                {key.includes('Hours') && <Clock className="w-5 h-5 text-blue-600" />}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              </div>
            </div>
          </div>
        ))}
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
          <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your personal information and preferences</p>
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
          {activeTab === 'personal' && renderPersonalInfo()}
          {activeTab === 'preferences' && renderPreferences()}
          {activeTab === 'addresses' && renderAddresses()}
          {activeTab === 'payments' && renderPaymentMethods()}
          {activeTab === 'achievements' && renderAchievements()}
          {activeTab === 'activity' && renderActivity()}
        </div>
      </div>

      {/* Edit Field Modal */}
      {editingField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Edit {editingField}</h3>
            <input
              type={editingField === 'email' ? 'email' : editingField === 'contactNumber' ? 'tel' : editingField === 'dateOfBirth' ? 'date' : 'text'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              placeholder={`Enter ${editingField}`}
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleSaveField(editingField, editValue)}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditingField(null);
                  setEditValue('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePasswordChange}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Changing...' : 'Change Password'}
              </button>
              <button
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddAddress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newAddress.type}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, type: e.target.value as 'home' | 'work' | 'billing' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="billing">Billing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={newAddress.zipCode}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Set as default address</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddAddress}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Address'}
              </button>
              <button
                onClick={() => {
                  setShowAddAddress(false);
                  setNewAddress({
                    type: 'home',
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: '',
                    isDefault: false
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showAddPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add Payment Method</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  value={newPayment.cardNumber}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, cardNumber: e.target.value }))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Month</label>
                  <input
                    type="text"
                    value={newPayment.expiryMonth}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, expiryMonth: e.target.value }))}
                    placeholder="MM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Year</label>
                  <input
                    type="text"
                    value={newPayment.expiryYear}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, expiryYear: e.target.value }))}
                    placeholder="YYYY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={newPayment.name}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newPayment.isDefault}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Set as default payment method</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddPayment}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Payment Method'}
              </button>
              <button
                onClick={() => {
                  setShowAddPayment(false);
                  setNewPayment({
                    type: 'card',
                    cardNumber: '',
                    expiryMonth: '',
                    expiryYear: '',
                    cvv: '',
                    name: '',
                    isDefault: false
                  });
                }}
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

export default Profile;
