import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Clock, Shield, Edit, Save, X,
  Camera, Upload, Eye, EyeOff, CheckCircle, AlertCircle, Building,
  Globe, CreditCard, Key, Lock, Unlock, Settings, Bell, Moon, Sun,
  Download, Trash2, Plus, Minus, Star, Award, Trophy, Target, Zap, BarChart3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDock } from '../context/DockContext';
import apiService from '../services/api';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import FaceEnrollmentSection from './profile/FaceEnrollmentSection';
import GlassmorphicCard from './ui/GlassmorphicCard';
import GlassmorphicPageHeader from './ui/GlassmorphicPageHeader';
import BillingInfoForm from './BillingInfoForm';

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
  profile?: {
    jobTitle?: string;
    company?: string;
    industry?: string;
    experience?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
    skills?: Array<{
      name: string;
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      category: 'technical' | 'soft' | 'management' | 'creative' | 'analytical';
    }>;
    workPreferences?: {
      workStyle?: 'collaborative' | 'independent' | 'mixed';
      communicationStyle?: 'direct' | 'diplomatic' | 'analytical' | 'creative';
      timeManagement?: 'structured' | 'flexible' | 'deadline-driven' | 'spontaneous';
      preferredWorkingHours?: {
        start?: string;
        end?: string;
      };
      timezone?: string;
    };
    personality?: {
      traits?: Array<{
        name: string;
        score: number;
      }>;
      workingStyle?: 'detail-oriented' | 'big-picture' | 'process-focused' | 'results-driven';
      stressLevel?: 'low' | 'medium' | 'high';
      motivationFactors?: Array<'recognition' | 'autonomy' | 'challenge' | 'security' | 'growth' | 'impact'>;
    };
    goals?: {
      shortTerm?: Array<{
        description: string;
        targetDate?: string;
        priority?: 'low' | 'medium' | 'high';
      }>;
      longTerm?: Array<{
        description: string;
        targetDate?: string;
        priority?: 'low' | 'medium' | 'high';
      }>;
      careerAspirations?: string;
    };
    learning?: {
      interests?: string[];
      currentLearning?: Array<{
        topic: string;
        progress: number;
        startDate?: string;
        targetCompletion?: string;
      }>;
      certifications?: Array<{
        name: string;
        issuer: string;
        dateEarned?: string;
        expiryDate?: string;
      }>;
    };
    productivity?: {
      peakHours?: Array<{
        start: string;
        end: string;
        dayOfWeek: string;
      }>;
      taskPreferences?: {
        preferredTaskTypes?: Array<'creative' | 'analytical' | 'administrative' | 'collaborative' | 'technical'>;
        taskComplexity?: 'simple' | 'moderate' | 'complex' | 'mixed';
        deadlineSensitivity?: 'flexible' | 'moderate' | 'strict';
      };
      workEnvironment?: {
        preferredEnvironment?: 'quiet' | 'moderate' | 'busy' | 'flexible';
        collaborationPreference?: 'high' | 'medium' | 'low' | 'mixed';
      };
    };
    aiPreferences?: {
      assistanceLevel?: 'minimal' | 'moderate' | 'comprehensive';
      preferredSuggestions?: Array<'task-prioritization' | 'time-estimation' | 'resource-allocation' | 'deadline-optimization' | 'skill-development'>;
      communicationStyle?: 'formal' | 'casual' | 'technical' | 'friendly';
      notificationPreferences?: {
        taskReminders?: boolean;
        deadlineAlerts?: boolean;
        productivityInsights?: boolean;
        skillRecommendations?: boolean;
      };
    };
  };
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
  const { state, dispatch, addToast } = useApp();
  const { dockPosition } = useDock();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
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
  const [showBillingForm, setShowBillingForm] = useState(false);

  // Helper function to apply theme changes to the document
  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('theme', 'system');
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Initialize theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      applyTheme(savedTheme);
    } else if (profileData?.preferences?.theme) {
      applyTheme(profileData.preferences.theme);
    }
  }, [profileData?.preferences?.theme]);

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
        profile: {
          jobTitle: 'Senior Full Stack Developer',
          company: 'Tech Innovations Inc.',
          industry: 'Technology',
          experience: 'senior',
          skills: [
            { name: 'React', level: 'expert', category: 'technical' },
            { name: 'Node.js', level: 'advanced', category: 'technical' },
            { name: 'Team Leadership', level: 'intermediate', category: 'management' }
          ],
          workPreferences: {
            workStyle: 'mixed',
            communicationStyle: 'direct',
            timeManagement: 'structured',
            preferredWorkingHours: {
              start: '09:00',
              end: '17:00'
            },
            timezone: 'America/Los_Angeles'
          },
          personality: {
            traits: [
              { name: 'Creativity', score: 8 },
              { name: 'Analytical Thinking', score: 9 }
            ],
            workingStyle: 'results-driven',
            stressLevel: 'medium',
            motivationFactors: ['growth', 'challenge', 'autonomy']
          },
          goals: {
            shortTerm: [
              { description: 'Complete React certification', targetDate: '2024-06-30', priority: 'high' }
            ],
            longTerm: [
              { description: 'Become a Tech Lead', targetDate: '2025-12-31', priority: 'high' }
            ],
            careerAspirations: 'Aspiring to lead innovative projects and mentor junior developers.'
          },
          learning: {
            interests: ['AI/ML', 'Cloud Architecture', 'DevOps'],
            currentLearning: [
              { topic: 'AWS Solutions Architect', progress: 65, startDate: '2024-01-01', targetCompletion: '2024-06-30' }
            ],
            certifications: [
              { name: 'AWS Certified Developer', issuer: 'Amazon', dateEarned: '2023-05-15' }
            ]
          },
          productivity: {
            peakHours: [
              { start: '09:00', end: '12:00', dayOfWeek: 'monday' }
            ],
            taskPreferences: {
              preferredTaskTypes: ['technical', 'analytical'],
              taskComplexity: 'complex',
              deadlineSensitivity: 'moderate'
            },
            workEnvironment: {
              preferredEnvironment: 'moderate',
              collaborationPreference: 'medium'
            }
          },
          aiPreferences: {
            assistanceLevel: 'moderate',
            preferredSuggestions: ['task-prioritization', 'time-estimation'],
            communicationStyle: 'friendly',
            notificationPreferences: {
              taskReminders: true,
              deadlineAlerts: true,
              productivityInsights: true,
              skillRecommendations: false
            }
          }
        },
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

      // Check if this is a nested profile field
      if (field.startsWith('profile.')) {
        const profileField = field.replace('profile.', '');
        const profileUpdate: any = { profile: {} };

        // Handle nested goals field
        if (profileField === 'goals.careerAspirations') {
          profileUpdate.profile.goals = {
            ...profileData?.profile?.goals,
            careerAspirations: value
          };
        } else if (profileField === 'skills') {
          // Parse skills from JSON string
          try {
            profileUpdate.profile.skills = JSON.parse(value);
          } catch {
            profileUpdate.profile.skills = value;
          }
        } else if (profileField === 'experience') {
          // Handle experience dropdown
          profileUpdate.profile.experience = value;
        } else {
          // Handle other profile fields (jobTitle, company, industry)
          profileUpdate.profile[profileField] = value;
        }

        await apiService.updateProfile(profileUpdate);

        // Update local state
        setProfileData(prev => {
          if (!prev) return null;
          const newProfile = { ...prev.profile };

          if (profileField === 'goals.careerAspirations') {
            if (!newProfile.goals) newProfile.goals = {};
            newProfile.goals.careerAspirations = value;
          } else if (profileField === 'skills') {
            try {
              newProfile.skills = JSON.parse(value);
            } catch {
              (newProfile as any).skills = value;
            }
          } else {
            (newProfile as any)[profileField] = value;
          }

          return { ...prev, profile: newProfile };
        });
      } else {
        // Handle basic fields (fullName, contactNumber, department, location, dateOfBirth, etc.)
        await apiService.updateProfile({ [field]: value });
        setProfileData(prev => prev ? { ...prev, [field]: value } : null);
      }

      // Only close modal if not editing skills (allow adding multiple skills)
      if (field !== 'profile.skills') {
        setEditingField(null);
      }
      
      addToast(t('messages.profileUpdated'), 'success');
    } catch (error) {
      console.error('Failed to update profile:', error);
      addToast(t('messages.profileUpdateFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (section: string, data: any) => {
    try {
      setSaving(true);

      // Apply theme immediately if theme is being changed
      if (section === 'theme') {
        applyTheme(data as 'light' | 'dark' | 'system');
      }

      await apiService.updateSettings({ [section]: data });
      setProfileData(prev => prev ? { ...prev, preferences: { ...prev.preferences, [section]: data } } : null);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: t('messages.preferencesUpdated'),
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
          message: t('messages.preferencesUpdateFailed'),
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
          message: t('messages.passwordsMismatch'),
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
          message: t('messages.passwordChanged'),
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
          message: t('messages.passwordChangeFailed'),
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
          message: t('messages.addressAdded'),
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
          message: t('messages.addressAddFailed'),
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
          message: t('messages.paymentAdded'),
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
          message: t('messages.paymentAddFailed'),
          duration: 3000
        }
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: t('profile.personalInfo'), icon: User },
    { id: 'professional', label: t('profile.professionalProfile'), icon: Target },
    { id: 'billing', label: 'Billing Information', icon: CreditCard }
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <img
            src={profileData?.avatarUrl || `https://ui-avatars.com/api/?name=${profileData?.fullName}&background=random`}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-white"
          />
          <button className="absolute bottom-0 right-0 bg-accent text-gray-900 dark:text-gray-100 rounded-full p-2 hover:bg-accent-hover transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{profileData?.fullName}</h2>
          <p className="text-gray-600 dark:text-gray-400">{profileData?.designation} • {profileData?.department}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.memberSince', { date: !isNaN(new Date(profileData?.joinDate || '').getTime()) ? new Date(profileData?.joinDate || '').toLocaleDateString() : 'N/A' })}</p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.fullName')}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{profileData?.fullName}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingField('fullName');
                setEditValue(profileData?.fullName || '');
              }}
              className="text-accent-dark hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('common.email')}</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{profileData?.email}</p>
                  {profileData?.isEmailVerified && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Lock className="w-4 h-4" />
              <span className="text-xs">{t('profile.nonEditable')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.contactNumber')}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{profileData?.contactNumber}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingField('contactNumber');
                setEditValue(profileData?.contactNumber || '');
              }}
              className="text-accent-dark hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.department')}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{profileData?.department}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingField('department');
                setEditValue(profileData?.department || '');
              }}
              className="text-accent-dark hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.location')}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{profileData?.location}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingField('location');
                setEditValue(profileData?.location || '');
              }}
              className="text-accent-dark hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.dateOfBirth')}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{new Date(profileData?.dateOfBirth || '').toLocaleDateString()}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingField('dateOfBirth');
                setEditValue(profileData?.dateOfBirth || '');
              }}
              className="text-accent-dark hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('profile.about')}</h3>
          <button
            onClick={() => {
              setEditingField('about');
              setEditValue(profileData?.about || '');
            }}
            className="text-accent-dark hover:text-blue-700"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
        <p className="text-gray-700 dark:text-gray-300">{profileData?.about}</p>
      </div>

      {/* Security Section */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">{t('settings.security')}</h3>
        <button
          onClick={() => setShowPasswordForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover transition-colors"
        >
          <Key className="w-4 h-4" />
          {t('profile.changePassword')}
        </button>
      </div>

      {/* Face Recognition Section - Pending Implementation */}
      {/* <FaceEnrollmentSection
        userId={state.userProfile._id}
        faceData={(state.userProfile as any).faceData}
        onUpdate={fetchProfileData}
      /> */}
    </div>
  );

  const renderPreferences = () => {
    // Provide default values if preferences are not loaded yet
    const currentTheme = profileData?.preferences?.theme || 'system';
    const notifications = profileData?.preferences?.notifications || { email: true, push: true, sms: false };
    const privacy = profileData?.preferences?.privacy || {
      profileVisibility: 'workspace' as const,
      showEmail: true,
      showPhone: false
    };

    return (
      <div className="space-y-6">
        {/* Theme Preferences */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.theme')}</h3>
          <div className="flex gap-3">
            {['light', 'dark', 'system'].map((theme) => (
              <button
                key={theme}
                className={`px-4 py-2 rounded-lg border transition-colors ${currentTheme === theme
                  ? 'bg-accent text-gray-900 dark:text-gray-100 border-accent-dark'
                  : 'bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600'
                  }`}
                onClick={() => {
                  if (profileData) {
                    setProfileData({
                      ...profileData,
                      preferences: {
                        ...profileData.preferences,
                        theme: theme as 'light' | 'dark' | 'system'
                      }
                    });
                  }
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
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.notifications')}</h3>
          <div className="space-y-3">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{key.charAt(0).toUpperCase() + key.slice(1)} Notifications</span>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-accent' : 'bg-gray-300'
                    }`}
                  onClick={() => {
                    const newValue = !value;
                    if (profileData) {
                      setProfileData({
                        ...profileData,
                        preferences: {
                          ...profileData.preferences,
                          notifications: {
                            ...notifications,
                            [key]: newValue
                          }
                        }
                      });
                    }
                    handleSavePreferences('notifications', {
                      ...notifications,
                      [key]: newValue
                    });
                  }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-800 transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Preferences */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('settings.privacy')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.visibility')}</label>
              <select
                value={privacy.profileVisibility}
                onChange={(e) => {
                  if (profileData) {
                    setProfileData({
                      ...profileData,
                      preferences: {
                        ...profileData.preferences,
                        privacy: {
                          ...privacy,
                          profileVisibility: e.target.value as 'public' | 'private' | 'workspace'
                        }
                      }
                    });
                  }
                  handleSavePreferences('privacy', {
                    ...privacy,
                    profileVisibility: e.target.value as 'public' | 'private' | 'workspace'
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
              >
                <option value="public">Public</option>
                <option value="workspace">Workspace Only</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="space-y-3">
              {Object.entries(privacy).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{t('profile.' + key)}</span>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-accent' : 'bg-gray-300'
                      }`}
                    onClick={() => {
                      const newValue = !value;
                      if (profileData) {
                        setProfileData({
                          ...profileData,
                          preferences: {
                            ...profileData.preferences,
                            privacy: {
                              ...privacy,
                              [key]: newValue
                            }
                          }
                        });
                      }
                      handleSavePreferences('privacy', {
                        ...privacy,
                        [key]: newValue
                      });
                    }}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-800 transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
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
  };

  const renderAddresses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('profile.addresses')}</h3>
        <button
          onClick={() => setShowAddAddress(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('profile.addAddress')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profileData?.addresses?.map((address) => (
          <div key={address.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="font-medium capitalize text-gray-900 dark:text-gray-100">{t('profile.' + address.type)}</span>
                {address.isDefault && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{t('profile.default')}</span>
                )}
              </div>
              <button className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('profile.payments')}</h3>
        <button
          onClick={() => setShowAddPayment(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('profile.addPaymentMethod')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profileData?.paymentMethods?.map((payment) => (
          <div key={payment.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">{payment.brand} •••• {payment.last4}</span>
                {payment.isDefault && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{t('profile.default')}</span>
                )}
              </div>
              <button className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p>{t('profile.expiryDate')} {payment.expiryMonth}/{payment.expiryYear}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('profile.achievements')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profileData?.achievements?.map((achievement) => (
          <div key={achievement.id} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{achievement.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
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
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('profile.activity')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(profileData?.activityStats || {}).map(([key, value]) => (
          <div key={key} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                {key.includes('Tasks') && <Target className="w-5 h-5 text-accent-dark" />}
                {key.includes('Projects') && <Building className="w-5 h-5 text-accent-dark" />}
                {key.includes('Workspaces') && <Globe className="w-5 h-5 text-accent-dark" />}
                {key.includes('Streak') && <Zap className="w-5 h-5 text-accent-dark" />}
                {key.includes('Hours') && <Clock className="w-5 h-5 text-accent-dark" />}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{t('profile.' + key)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfessionalProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('profile.professionalProfile')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.professionalSummary')}</p>
      </div>

      <GlassmorphicCard className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('profile.jobTitle')}</label>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {profileData?.profile?.jobTitle || t('profile.notSet')}
              </p>
              <button
                onClick={() => {
                  setEditingField('profile.jobTitle');
                  setEditValue(profileData?.profile?.jobTitle || '');
                }}
                className="text-accent-dark hover:text-blue-700"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('profile.company')}</label>
            <div className="flex items-center justify-between">
              <p className="text-gray-900 dark:text-gray-100">
                {profileData?.profile?.company || t('profile.notSet')}
              </p>
              <button
                onClick={() => {
                  setEditingField('profile.company');
                  setEditValue(profileData?.profile?.company || '');
                }}
                className="text-accent-dark hover:text-blue-700"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </GlassmorphicCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassmorphicCard className="p-6">
          <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">{t('profile.industry')}</label>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
              {profileData?.profile?.industry || t('profile.notSet')}
            </p>
            <button
              onClick={() => {
                setEditingField('profile.industry');
                setEditValue(profileData?.profile?.industry || '');
              }}
              className="text-accent-dark hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6">
          <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">{t('profile.experience')}</label>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {profileData?.profile?.experience === 'mid' ? '3-5 years' :
                profileData?.profile?.experience === 'senior' ? '6-10 years' :
                  profileData?.profile?.experience === 'junior' ? '1-3 years' :
                    profileData?.profile?.experience || t('profile.notSet')}
            </p>
            <button
              onClick={() => {
                setEditingField('profile.experience');
                setEditValue(profileData?.profile?.experience || '');
              }}
              className="text-accent-dark hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </GlassmorphicCard>
      </div>

      <GlassmorphicCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('profile.topSkills')}</h4>
          <button
            onClick={() => {
              setEditingField('skills');
              setEditValue('');
            }}
            className="text-accent-dark hover:text-blue-700"
            title="Edit Skills & Learning"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(profileData?.profile?.skills || []).map((skill: any, index: number) => {
            const skillName = typeof skill === 'string' ? skill : skill.name || 'Unknown Skill';
            return (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              >
                {skillName}
              </span>
            );
          })}
          {(!profileData?.profile?.skills || profileData.profile.skills.length === 0) && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('profile.noSkillsAdded')}</p>
          )}
        </div>
      </GlassmorphicCard>

      <GlassmorphicCard className="p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700/50">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300">{t('profile.careerGoals')}</h4>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-700 dark:text-gray-300 flex-1">
            {profileData?.profile?.goals?.careerAspirations || t('profile.setCareerGoals')}
          </p>
          <button
            onClick={() => {
              setEditingField('profile.goals.careerAspirations');
              setEditValue(profileData?.profile?.goals?.careerAspirations || '');
            }}
            className="text-accent-dark hover:text-blue-700 ml-4"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </GlassmorphicCard>
    </div>
  );

  const renderBillingInfo = () => {
    const billingInfo = state.userProfile?.billingInfo;
    const isComplete = billingInfo?.isComplete;

    return (
      <div className="space-y-6">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Billing Information
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your billing details for payments and invoices
            </p>
          </div>
          <button
            onClick={() => setShowBillingForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            {isComplete ? 'Update' : 'Add'} Billing Info
          </button>
        </div>

        {!isComplete ? (
          /* Empty State */
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-8 text-center">
            <CreditCard className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Billing Information
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add your billing information to make payments easier and faster
            </p>
            <button
              onClick={() => setShowBillingForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Billing Information
            </button>
          </div>
        ) : (
          /* Billing Info Display */
          <div className="space-y-4">
            {/* Contact Information */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {billingInfo.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Billing Email</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {billingInfo.billingEmail || state.userProfile?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            {billingInfo.address && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Billing Address
                </h4>
                <div className="text-gray-700 dark:text-gray-300">
                  <p>{billingInfo.address.street}</p>
                  <p>
                    {billingInfo.address.city}, {billingInfo.address.state} {billingInfo.address.postalCode}
                  </p>
                  <p>{billingInfo.address.country}</p>
                </div>
              </div>
            )}

            {/* Business Information */}
            {(billingInfo.companyName || billingInfo.gstNumber) && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  Business Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {billingInfo.companyName && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Company Name</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {billingInfo.companyName}
                      </p>
                    </div>
                  )}
                  {billingInfo.gstNumber && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">GST Number</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100 font-mono">
                        {billingInfo.gstNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Last Updated */}
            {billingInfo.lastUpdated && (
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Last updated: {new Date(billingInfo.lastUpdated).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`transition-all duration-300 ${dockPosition === 'left' ? 'pl-[71px] pr-4 sm:pr-6 py-4 sm:py-6' :
        dockPosition === 'right' ? 'pr-[71px] pl-4 sm:pl-6 py-4 sm:py-6' :
          'p-4 sm:p-6'
        }`}>
        <div className="bg-white dark:bg-gray-800 border border-border rounded-xl p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 bg-gradient-to-br ${isDarkMode ? 'from-gray-900 via-gray-800 to-gray-900' : 'from-gray-50 via-blue-50/30 to-purple-50/20'}`}
    >
      <GlassmorphicPageHeader
        title={t('profile.title')}
        subtitle={t('descriptions.profile')}
        icon={User}
        className="w-full !rounded-none !border-x-0 !mb-0"
      />

      <div className={`transition-all duration-300 ${dockPosition === 'left' ? 'pl-[71px] pr-4 sm:pr-6 py-4 sm:py-6' :
        dockPosition === 'right' ? 'pr-[71px] pl-4 sm:pl-6 py-4 sm:py-6' :
          'p-4 sm:p-6'
        }`}>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300/60 dark:border-gray-700/70 rounded-xl">

          {/* Tabs */}
          <div className="border-b border-border dark:border-gray-600">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                      ? 'border-accent text-accent-dark dark:text-accent-light'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
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
            {activeTab === 'professional' && renderProfessionalProfile()}
            {activeTab === 'billing' && renderBillingInfo()}
          </div>
        </div>
      </div>

      {/* Edit Field Modal */}
      {editingField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white dark:bg-gray-800 rounded-xl ${editingField === 'skills' ? 'max-w-2xl' : 'max-w-md'} w-full p-6`}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {editingField === 'skills' ? 'Edit Skills & Learning' : t('common.edit') + ' ' + t(editingField.startsWith('profile.') ? editingField : 'profile.' + editingField)}
            </h3>
            {editingField === 'skills' ? (
              <div className="mb-4">
                {/* Add New Skill Form */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Add New Skill</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Skill Name</label>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="e.g., JavaScript, Project Management"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Level</label>
                        <select
                          value={(profileData as any)?._tempSkillLevel || 'beginner'}
                          onChange={(e) => {
                            if (profileData) {
                              setProfileData({ ...profileData, _tempSkillLevel: e.target.value } as any);
                            }
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Category</label>
                        <select
                          value={(profileData as any)?._tempSkillCategory || 'technical'}
                          onChange={(e) => {
                            if (profileData) {
                              setProfileData({ ...profileData, _tempSkillCategory: e.target.value } as any);
                            }
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                          <option value="technical">Technical</option>
                          <option value="soft">Soft Skills</option>
                          <option value="language">Language</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!editValue.trim()) {
                          alert('Please enter a skill name');
                          return;
                        }
                        const newSkill = {
                          name: editValue.trim(),
                          level: (profileData as any)?._tempSkillLevel || 'beginner',
                          category: (profileData as any)?._tempSkillCategory || 'technical'
                        };
                        const currentSkills = profileData?.profile?.skills || [];
                        const updatedSkills = [...currentSkills, newSkill];
                        handleSaveField('profile.skills', JSON.stringify(updatedSkills));
                        setEditValue('');
                      }}
                      disabled={saving || !editValue.trim()}
                      className="w-full px-3 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {saving ? 'Adding...' : '+ Add Skill'}
                    </button>
                  </div>
                </div>

                {/* Current Skills List */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Current Skills ({profileData?.profile?.skills?.length || 0})
                  </h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {(profileData?.profile?.skills || []).map((skill: any, index: number) => {
                      const skillName = typeof skill === 'string' ? skill : skill.name || 'Unknown';
                      const skillLevel = typeof skill === 'object' ? skill.level : 'intermediate';
                      const skillCategory = typeof skill === 'object' ? skill.category : 'technical';
                      
                      return (
                        <div
                          key={skill._id || index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{skillName}</span>
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full capitalize">
                                {skillLevel}
                              </span>
                              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full capitalize">
                                {skillCategory}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const updatedSkills = (profileData?.profile?.skills || []).filter((_: any, i: number) => i !== index);
                              handleSaveField('profile.skills', JSON.stringify(updatedSkills));
                            }}
                            className="ml-2 p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Remove skill"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                    {(!profileData?.profile?.skills || profileData.profile.skills.length === 0) && (
                      <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
                        No skills added yet. Add your first skill above!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : editingField === 'profile.experience' ? (
              <select
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select experience</option>
                <option value="entry">0-1 years</option>
                <option value="junior">1-3 years</option>
                <option value="mid">3-5 years</option>
                <option value="senior">6-10 years</option>
                <option value="lead">10-15 years</option>
                <option value="executive">15+ years</option>
              </select>
            ) : editingField === 'profile.goals.careerAspirations' || editingField === 'about' ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={4}
                placeholder={t(editingField.startsWith('profile.') ? editingField : 'profile.' + editingField)}
              />
            ) : (
              <input
                type={editingField === 'email' ? 'email' : editingField === 'contactNumber' ? 'tel' : editingField === 'dateOfBirth' ? 'date' : 'text'}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder={t(editingField.startsWith('profile.') ? editingField : 'profile.' + editingField)}
              />
            )}
            <div className="flex gap-3">
              {editingField !== 'skills' && (
                <button
                  onClick={() => handleSaveField(editingField, editValue)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {saving ? t('common.saving') : t('common.save')}
                </button>
              )}
              <button
                onClick={() => {
                  setEditingField(null);
                  setEditValue('');
                }}
                className={`${editingField === 'skills' ? 'flex-1' : 'flex-1'} px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
              >
                {editingField === 'skills' ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">{t('profile.changePassword')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.currentPassword')}</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.newPassword')}</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.confirmNewPassword')}</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePasswordChange}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {saving ? t('common.changing') : t('profile.changePassword')}
              </button>
              <button
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-700 transition-colors"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">{t('profile.addAddress')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.type')}</label>
                <select
                  value={newAddress.type}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, type: e.target.value as 'home' | 'work' | 'billing' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="billing">Billing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.street')}</label>
                <input
                  type="text"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.city')}</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.state')}</label>
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.zipCode')}</label>
                  <input
                    type="text"
                    value={newAddress.zipCode}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.country')}</label>
                  <input
                    type="text"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="h-4 w-4 text-accent-dark focus:ring-accent border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">{t('profile.setAsDefault')}</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddAddress}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {saving ? t('common.adding') : t('profile.addAddress')}
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
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-700 transition-colors"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">{t('profile.addPaymentMethod')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.cardNumber')}</label>
                <input
                  type="text"
                  value={newPayment.cardNumber}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, cardNumber: e.target.value }))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.expiryMonth')}</label>
                  <input
                    type="text"
                    value={newPayment.expiryMonth}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, expiryMonth: e.target.value }))}
                    placeholder="MM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.expiryYear')}</label>
                  <input
                    type="text"
                    value={newPayment.expiryYear}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, expiryYear: e.target.value }))}
                    placeholder="YYYY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.cardHolderName')}</label>
                <input
                  type="text"
                  value={newPayment.name}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newPayment.isDefault}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="h-4 w-4 text-accent-dark focus:ring-accent border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">{t('profile.setAsDefault')}</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddPayment}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {saving ? t('common.adding') : t('profile.addPaymentMethod')}
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
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Info Form Modal */}
      <BillingInfoForm
        isOpen={showBillingForm}
        onClose={() => setShowBillingForm(false)}
        onSuccess={() => {
          setShowBillingForm(false);
          fetchProfileData(); // Refresh profile data
        }}
      />
    </div>
  );
};

export default Profile;
