import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ChevronLeft, ChevronRight, Check, Star, Clock, Target, Brain, User, Briefcase, GraduationCap, Zap } from 'lucide-react';
import { RegisterRequest } from '../types';
import { apiService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import SharedNavbar from './SharedNavbar';
import { googleAuthService } from '../config/googleAuth';

interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'technical' | 'soft' | 'management' | 'creative' | 'analytical';
}

interface Goal {
  description: string;
  targetDate?: Date;
  priority: 'low' | 'medium' | 'high';
}

const EnhancedRegistration: React.FC = () => {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterRequest>({
    fullName: '',
    username: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    profile: {
      jobTitle: '',
      company: '',
      industry: '',
      experience: 'mid',
      skills: [],
      workPreferences: {
        workStyle: 'mixed',
        communicationStyle: 'direct',
        timeManagement: 'structured',
        preferredWorkingHours: {
          start: '09:00',
          end: '17:00'
        },
        timezone: 'UTC'
      },
      personality: {
        traits: [],
        workingStyle: 'results-driven',
        stressLevel: 'medium',
        motivationFactors: []
      },
      goals: {
        shortTerm: [],
        longTerm: [],
        careerAspirations: ''
      },
      learning: {
        interests: [],
        currentLearning: [],
        certifications: []
      },
      productivity: {
        peakHours: [],
        taskPreferences: {
          preferredTaskTypes: [],
          taskComplexity: 'mixed',
          deadlineSensitivity: 'moderate'
        },
        workEnvironment: {
          preferredEnvironment: 'moderate',
          collaborationPreference: 'medium'
        }
      },
      aiPreferences: {
        assistanceLevel: 'moderate',
        preferredSuggestions: [],
        communicationStyle: 'friendly',
        notificationPreferences: {
          taskReminders: true,
          deadlineAlerts: true,
          productivityInsights: true,
          skillRecommendations: true
        }
      }
    }
  });

  const [newSkill, setNewSkill] = useState<Skill>({
    name: '',
    level: 'intermediate',
    category: 'technical'
  });

  const [newGoal, setNewGoal] = useState<Goal>({
    description: '',
    priority: 'medium'
  });

  const [newInterest, setNewInterest] = useState('');
  const [oauthData, setOauthData] = useState<any>(null);

  const steps = [
    { id: 1, title: 'Basic Info', icon: User, description: 'Your basic information' },
    { id: 2, title: 'Professional', icon: Briefcase, description: 'Work and experience' },
    { id: 3, title: 'Skills & Goals', icon: Target, description: 'Your skills and aspirations' },
    { id: 4, title: 'Preferences', icon: Brain, description: 'Work style and preferences' },
    { id: 5, title: 'AI Assistant', icon: Zap, description: 'Personalize your AI helper' }
  ];

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);

      // Initialize Google Auth if not already done
      await googleAuthService.initializeGapi();

      // Sign in with Google
      const googleUser = await googleAuthService.signInWithGoogle();

      // Check if user already exists
      try {
        const loginResponse = await apiService.googleAuth({
          id: googleUser.id,
          name: googleUser.name,
          email: googleUser.email,
          imageUrl: googleUser.imageUrl,
          accessToken: googleUser.accessToken,
          idToken: googleUser.idToken
        });

        // User exists, log them in
        localStorage.setItem('accessToken', loginResponse.accessToken);
        localStorage.setItem('refreshToken', loginResponse.refreshToken);
        dispatch({ type: 'SET_USER', payload: loginResponse.user });
        showToast('Welcome back!', 'success');
        navigate('/home');
        return;
      } catch (loginError: any) {
        // User doesn't exist, pre-fill registration form
        if (loginError.message?.includes('not found') || loginError.message?.includes('User not found')) {
          setOauthData(googleUser);
          setFormData(prev => ({
            ...prev,
            fullName: googleUser.name || '',
            email: googleUser.email || '',
            username: googleUser.email?.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5) || '',
            password: '', // User needs to set password
            confirmPassword: ''
          }));
          showToast('Please complete your registration with the information below', 'info');
        } else {
          throw loginError;
        }
      }
    } catch (error: any) {
      console.error('Google authentication error:', error);
      showToast(error.message || 'Google authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('profile.')) {
      const profilePath = name.replace('profile.', '');
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile!,
          [profilePath]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNestedInputChange = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addSkill = () => {
    if (newSkill.name.trim()) {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile!,
          skills: [...(prev.profile?.skills || []), { ...newSkill }]
        }
      }));
      setNewSkill({ name: '', level: 'intermediate', category: 'technical' });
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile!,
        skills: prev.profile?.skills?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const addGoal = (type: 'shortTerm' | 'longTerm') => {
    if (newGoal.description.trim()) {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile!,
          goals: {
            ...prev.profile?.goals!,
            [type]: [...(prev.profile?.goals?.[type] || []), { ...newGoal }]
          }
        }
      }));
      setNewGoal({ description: '', priority: 'medium' });
    }
  };

  const removeGoal = (type: 'shortTerm' | 'longTerm', index: number) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile!,
        goals: {
          ...prev.profile?.goals!,
          [type]: prev.profile?.goals?.[type]?.filter((_, i) => i !== index) || []
        }
      }
    }));
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile!,
          learning: {
            ...prev.profile?.learning!,
            interests: [...(prev.profile?.learning?.interests || []), newInterest.trim()]
          }
        }
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile!,
        learning: {
          ...prev.profile?.learning!,
          interests: prev.profile?.learning?.interests?.filter((_, i) => i !== index) || []
        }
      }
    }));
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.fullName.trim()) {
          showToast('Full name is required', 'error');
          return false;
        }
        if (!formData.username.trim()) {
          showToast('Username is required', 'error');
          return false;
        }
        if (!formData.email.trim()) {
          showToast('Email is required', 'error');
          return false;
        }
        if (!formData.password.trim()) {
          showToast('Password is required', 'error');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          showToast('Passwords do not match', 'error');
          return false;
        }
        if (formData.password.length < 6) {
          showToast('Password must be at least 6 characters', 'error');
          return false;
        }
        return true;
      case 2:
        // Professional info is optional, so always valid
        return true;
      case 3:
        // Skills and goals are optional, so always valid
        return true;
      case 4:
        // Preferences are optional, so always valid
        return true;
      case 5:
        // AI preferences are optional, so always valid
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation before submission
    if (!validateCurrentStep()) {
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting registration data:', formData);

      let response;
      if (oauthData) {
        // OAuth registration - create user with Google data
        const oauthRegisterData = {
          ...formData,
          googleId: oauthData.id,
          avatarUrl: oauthData.imageUrl,
          isEmailVerified: true
        };
        response = await apiService.googleAuth({
          id: oauthData.id,
          name: oauthData.name,
          email: oauthData.email,
          imageUrl: oauthData.imageUrl,
          accessToken: oauthData.accessToken,
          idToken: oauthData.idToken,
          password: formData.password // Include password for OAuth registration
        });
      } else {
        // Regular registration
        response = await apiService.register(formData);
      }

      // Store tokens in localStorage
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Update user profile in context
      dispatch({ type: 'SET_USER', payload: response.user });

      showToast('Registration successful! Welcome to Proxima!', 'success');
      navigate('/home');
    } catch (error: any) {
      console.error('Registration error:', error);

      // Handle specific error cases
      if (error.message?.includes('fetch')) {
        showToast('Unable to connect to server. Please check if the server is running.', 'error');
      } else if (error.message?.includes('already exists')) {
        showToast('User with this email or username already exists', 'error');
      } else if (error.message?.includes('validation')) {
        showToast('Please check your input and try again', 'error');
      } else {
        showToast(error.message || 'Registration failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's get to know you</h2>
              <p className="text-gray-600">Tell us about yourself to personalize your experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Jane Cooper"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="janecooper"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="+1 555 0100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* OAuth Section */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-sm text-gray-500">or</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full mt-4 px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm flex items-center justify-center gap-3 transition-colors"
                onClick={handleGoogleAuth}
                disabled={loading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" alt="Google" />
                Continue with Google
              </button>

              {oauthData && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <img src={oauthData.imageUrl} alt="Profile" className="w-8 h-8 rounded-full mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Signed in as {oauthData.name}</p>
                      <p className="text-xs text-green-600">{oauthData.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Information</h2>
              <p className="text-gray-600">Help us understand your professional background</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                <input
                  type="text"
                  name="profile.jobTitle"
                  value={formData.profile?.jobTitle || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  name="profile.company"
                  value={formData.profile?.company || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Acme Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <select
                  name="profile.industry"
                  value={formData.profile?.industry || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                <select
                  name="profile.experience"
                  value={formData.profile?.experience || 'mid'}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="entry">Entry Level (0-2 years)</option>
                  <option value="junior">Junior (2-4 years)</option>
                  <option value="mid">Mid Level (4-7 years)</option>
                  <option value="senior">Senior (7-12 years)</option>
                  <option value="lead">Lead (12+ years)</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Skills & Goals</h2>
              <p className="text-gray-600">Tell us about your skills and what you want to achieve</p>
            </div>

            {/* Skills Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Skills</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
                  <input
                    type="text"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="JavaScript"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <select
                    value={newSkill.level}
                    onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as any })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as any })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="technical">Technical</option>
                    <option value="soft">Soft Skills</option>
                    <option value="management">Management</option>
                    <option value="creative">Creative</option>
                    <option value="analytical">Analytical</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
              >
                Add Skill
              </button>

              <div className="mt-4 space-y-2">
                {formData.profile?.skills?.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-sm text-gray-500">({skill.level})</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{skill.category}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Goals</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goal Description</label>
                  <input
                    type="text"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Learn React Native"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 mb-4">
                <button
                  type="button"
                  onClick={() => addGoal('shortTerm')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Add Short-term Goal
                </button>
                <button
                  type="button"
                  onClick={() => addGoal('longTerm')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  Add Long-term Goal
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Short-term Goals</h4>
                  {formData.profile?.goals?.shortTerm?.map((goal, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border mb-2">
                      <span>{goal.description}</span>
                      <button
                        type="button"
                        onClick={() => removeGoal('shortTerm', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Long-term Goals</h4>
                  {formData.profile?.goals?.longTerm?.map((goal, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border mb-2">
                      <span>{goal.description}</span>
                      <button
                        type="button"
                        onClick={() => removeGoal('longTerm', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Work Preferences</h2>
              <p className="text-gray-600">Help us understand how you work best</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Style</label>
                <select
                  name="profile.workPreferences.workStyle"
                  value={formData.profile?.workPreferences?.workStyle || 'mixed'}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="collaborative">Collaborative</option>
                  <option value="independent">Independent</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Communication Style</label>
                <select
                  name="profile.workPreferences.communicationStyle"
                  value={formData.profile?.workPreferences?.communicationStyle || 'direct'}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="direct">Direct</option>
                  <option value="diplomatic">Diplomatic</option>
                  <option value="analytical">Analytical</option>
                  <option value="creative">Creative</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Management</label>
                <select
                  name="profile.workPreferences.timeManagement"
                  value={formData.profile?.workPreferences?.timeManagement || 'structured'}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="structured">Structured</option>
                  <option value="flexible">Flexible</option>
                  <option value="deadline-driven">Deadline-driven</option>
                  <option value="spontaneous">Spontaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Working Style</label>
                <select
                  name="profile.personality.workingStyle"
                  value={formData.profile?.personality?.workingStyle || 'results-driven'}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="detail-oriented">Detail-oriented</option>
                  <option value="big-picture">Big-picture</option>
                  <option value="process-focused">Process-focused</option>
                  <option value="results-driven">Results-driven</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stress Level</label>
                <select
                  name="profile.personality.stressLevel"
                  value={formData.profile?.personality?.stressLevel || 'medium'}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Environment</label>
                <select
                  name="profile.productivity.workEnvironment.preferredEnvironment"
                  value={formData.profile?.productivity?.workEnvironment?.preferredEnvironment || 'moderate'}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="quiet">Quiet</option>
                  <option value="moderate">Moderate</option>
                  <option value="busy">Busy</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>

            {/* Learning Interests */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Interests</h3>

              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Machine Learning, Design Thinking, etc."
                />
                <button
                  type="button"
                  onClick={addInterest}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                >
                  Add Interest
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.profile?.learning?.interests?.map((interest, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(index)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Assistant Setup</h2>
              <p className="text-gray-600">Personalize your AI assistant to help you work better</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assistance Level</label>
                <select
                  name="profile.aiPreferences.assistanceLevel"
                  value={formData.profile?.aiPreferences?.assistanceLevel || 'moderate'}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="minimal">Minimal - Basic suggestions only</option>
                  <option value="moderate">Moderate - Regular helpful insights</option>
                  <option value="comprehensive">Comprehensive - Detailed analysis and recommendations</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Communication Style</label>
                <select
                  name="profile.aiPreferences.communicationStyle"
                  value={formData.profile?.aiPreferences?.communicationStyle || 'friendly'}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="technical">Technical</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.profile?.aiPreferences?.notificationPreferences?.taskReminders || false}
                    onChange={(e) => handleNestedInputChange('profile.aiPreferences.notificationPreferences.taskReminders', e.target.checked)}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Task reminders and updates</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.profile?.aiPreferences?.notificationPreferences?.deadlineAlerts || false}
                    onChange={(e) => handleNestedInputChange('profile.aiPreferences.notificationPreferences.deadlineAlerts', e.target.checked)}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Deadline alerts</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.profile?.aiPreferences?.notificationPreferences?.productivityInsights || false}
                    onChange={(e) => handleNestedInputChange('profile.aiPreferences.notificationPreferences.productivityInsights', e.target.checked)}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Productivity insights</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.profile?.aiPreferences?.notificationPreferences?.skillRecommendations || false}
                    onChange={(e) => handleNestedInputChange('profile.aiPreferences.notificationPreferences.skillRecommendations', e.target.checked)}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Skill development recommendations</span>
                </label>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start">
                <Zap className="w-6 h-6 text-yellow-600 mt-1 mr-3" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Your AI Assistant</h4>
                  <p className="text-yellow-700 text-sm">
                    Based on your preferences, your AI assistant will help you with task prioritization,
                    time estimation, deadline optimization, and skill development recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-yellow-900 to-orange-900' : 'bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50'}`}>
      <SharedNavbar />
      <section className="min-h-screen flex pt-16">
        <div className="hidden lg:flex w-1/2 bg-white border-r border-border relative">
          <img
            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-black/10"></div>
          <div className="relative p-10 mt-auto mb-10">
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur rounded-lg px-3 py-2 border border-border mb-4">
              <div className="w-4 h-4 text-yellow-600">🚀</div>
              <span className="text-xs text-slate-700">Projects, Payroll, Planner — unified</span>
            </div>
            <h1 className="text-3xl md:text-4xl tracking-tight font-semibold text-white">
              Plan, track, and pay — all in one place
            </h1>
            <p className="text-white/80 mt-3 max-w-lg">
              Workspaces, roles, analytics, and automations for teams of any size.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-9 w-9 rounded-md flex items-center justify-center text-white font-semibold tracking-tight bg-yellow-500">
                PX
              </div>
              <div>
                <div className="text-base font-semibold tracking-tight">Proxima</div>
                <div className="text-xs text-slate-500">Project & Payroll Suite</div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        isActive
                          ? 'border-yellow-500 bg-yellow-500 text-white'
                          : isCompleted
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300 bg-white text-gray-400'
                      }`}>
                        {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-16 h-0.5 mx-2 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {steps[currentStep - 1]?.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {steps[currentStep - 1]?.description}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-border rounded-xl p-8">
              {renderStepContent()}

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating account...' : 'Complete Registration'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedRegistration;
