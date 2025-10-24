import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Briefcase,
  Target,
  Settings,
  Zap,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';
import SharedNavbar from './SharedNavbar';

interface ProfileData {
  fullName: string;
  username: string;
  email: string;
  contactNumber?: string;
  password: string;
  confirmPassword: string;
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
    goals?: {
      shortTerm?: Array<{
        description: string;
        priority: 'low' | 'medium' | 'high';
      }>;
      longTerm?: Array<{
  description: string;
  priority: 'low' | 'medium' | 'high';
      }>;
      careerAspirations?: string;
    };
    workPreferences?: {
      workStyle?: 'collaborative' | 'independent' | 'mixed';
      communicationStyle?: 'direct' | 'diplomatic' | 'analytical' | 'creative';
      timeManagement?: 'structured' | 'flexible' | 'deadline-driven' | 'spontaneous';
    };
    personality?: {
      workingStyle?: 'detail-oriented' | 'big-picture' | 'process-focused' | 'results-driven';
      stressLevel?: 'low' | 'medium' | 'high';
    };
    productivity?: {
      workEnvironment?: {
        preferredEnvironment?: 'quiet' | 'moderate' | 'busy' | 'flexible';
      };
    };
    learning?: {
      interests?: string[];
    };
    aiPreferences?: {
      assistanceLevel?: 'minimal' | 'moderate' | 'comprehensive';
      communicationStyle?: 'formal' | 'casual' | 'technical' | 'friendly';
      notificationPreferences?: {
        taskReminders?: boolean;
        deadlineAlerts?: boolean;
        productivityInsights?: boolean;
        skillRecommendations?: boolean;
      };
    };
  };
}

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Professional', icon: Briefcase },
  { id: 3, title: 'Skills & Goals', icon: Target },
  { id: 4, title: 'Preferences', icon: Settings },
  { id: 5, title: 'AI Setup', icon: Zap }
];

const EnhancedRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const { isDarkMode } = useTheme();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [registrationUserId, setRegistrationUserId] = useState('');
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [otpTimer, setOtpTimer] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
  ) => {
    dispatch({ type: "ADD_TOAST", payload: { message, type } });
  };

  const [formData, setFormData] = useState<ProfileData>({
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
      goals: {
        shortTerm: [],
        longTerm: [],
        careerAspirations: ''
      },
      workPreferences: {
        workStyle: 'mixed',
        communicationStyle: 'direct',
        timeManagement: 'structured'
      },
      personality: {
        workingStyle: 'results-driven',
        stressLevel: 'medium'
      },
      productivity: {
        workEnvironment: {
          preferredEnvironment: 'moderate'
        }
      },
      learning: {
        interests: []
      },
      aiPreferences: {
        assistanceLevel: 'moderate',
        communicationStyle: 'friendly',
        notificationPreferences: {
          taskReminders: true,
          deadlineAlerts: true,
          productivityInsights: false,
          skillRecommendations: false
        }
      }
    }
  });

  // Debug log for initial form data
  console.log('🔍 [DEBUG] Initial form data:', formData);

  // Clear contact number field on mount to prevent autofill issues
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      contactNumber: ''
    }));
  }, []);

  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 'beginner' as const,
    category: 'technical' as const
  });

  const [newGoal, setNewGoal] = useState({
    description: '',
    priority: 'medium' as const
  });

  const [newInterest, setNewInterest] = useState('');

  // Check for Google OAuth data
  const [googleAuthData, setGoogleAuthData] = useState<any>(null);
  const [oauthData, setOauthData] = useState<any>(null);

  useEffect(() => {
    const storedGoogleData = sessionStorage.getItem('googleAuthData');
    if (storedGoogleData) {
      try {
        const parsedData = JSON.parse(storedGoogleData);
        setGoogleAuthData(parsedData);
        setOauthData(parsedData);
        
        // Pre-fill form with Google data
          setFormData(prev => ({
            ...prev,
          fullName: parsedData.name || '',
          email: parsedData.email || '',
          username: parsedData.email?.split('@')[0] || '',
          contactNumber: '', // Ensure contact number is empty
          password: '',
            confirmPassword: ''
          }));
      } catch (error) {
        console.error('Error parsing Google auth data:', error);
      }
    }
  }, []);

  const startOtpTimer = (seconds: number) => {
    setOtpTimer(seconds);
    const interval = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    console.log('🔍 [DEBUG] Form input change:', { name, value });
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current: any = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        console.log('🔍 [DEBUG] Updated nested form data:', newData);
        return newData;
      });
    } else {
      setFormData(prev => {
        const newData = {
        ...prev,
        [name]: value
        };
        console.log('🔍 [DEBUG] Updated form data:', newData);
        return newData;
      });
    }
  };

  const handleNestedInputChange = (path: string, value: any) => {
    const keys = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleGoogleAuth = async () => {
    try {
      // This would integrate with Google OAuth
      showToast('Google OAuth integration coming soon!', 'info');
    } catch (error) {
      console.error('Google auth error:', error);
      showToast('Google authentication failed', 'error');
    }
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
      setNewSkill({ name: '', level: 'beginner', category: 'technical' });
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
      default:
        return true;
    }
  };

  const nextStep = async () => {
    if (validateCurrentStep()) {
      // If we're on the last step (AI Setup), submit registration and show OTP verification
      if (currentStep === steps.length) {
        await handleRegistrationSubmission();
      } else if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleRegistrationSubmission = async () => {
    setLoading(true);

    try {
      console.log('Submitting registration data:', formData);

      let response;
      const hasGoogleData = oauthData || googleAuthData;

      if (hasGoogleData) {
        // Google OAuth registration - directly logs in and email is considered verified by Google
        const googleData = oauthData || googleAuthData;
        response = await apiService.googleAuth({
          id: googleData.id,
          name: googleData.name,
          email: googleData.email,
          imageUrl: googleData.imageUrl,
          accessToken: googleData.accessToken,
          idToken: googleData.idToken,
          isRegistration: true,
          registrationData: formData,
        });

        // Clear Google data from sessionStorage
        sessionStorage.removeItem('googleAuthData');
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        dispatch({ type: 'SET_USER', payload: response.user });
        showToast('Registration successful! Welcome to Proxima!', 'success');
        navigate('/home');

      } else {
        // Regular registration - requires OTP verification
        console.log('🔍 [DEBUG] Frontend - About to call apiService.register');
        const registerResponse = await apiService.register(formData);

        console.log('🔍 [DEBUG] Frontend - Registration response received:', registerResponse);

        // Check if the response indicates OTP verification is required
        if (registerResponse.requiresOtpVerification) { 
          setShowOtpVerification(true);
          setRegistrationEmail(formData.email);
          setRegistrationUserId(registerResponse.userId || ''); 
          startOtpTimer(60); // 60 seconds for OTP timer
          showToast('Please check your email to verify your account', 'info');
        } else {
          // This case should ideally not be reached if backend logic is consistent
          showToast('Registration successful, but unexpected flow.', 'success');
          // navigate('/home'); // Or handle as per expected flow
        }
      }
    } catch (error: any) {
      console.error('🔍 [DEBUG] Frontend - Registration error:', error);
      console.error('🔍 [DEBUG] Frontend - Error message:', error.message);
      console.error('🔍 [DEBUG] Frontend - Error stack:', error.stack);

      if (error.message?.includes('fetch')) {
        showToast('Unable to connect to server. Please check if the server is running.', 'error');
      } else if (error.message?.includes('already exists')) {
        showToast('User with this email or username already exists', 'error');
      } else if (error.message?.includes('validation')) {
        showToast('Please check your input and try again', 'error');
      } else if (error.message?.includes('Invalid response from server')) {
        showToast('Server response format error. Please try again.', 'error');
      } else {
        showToast(error.message || 'Registration failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  // OTP input handling
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input if a digit is entered and it's not the last input
    if (element.nextElementSibling && element.value !== '') {
      (element.nextElementSibling as HTMLInputElement).focus();
    } else if (!element.nextElementSibling && element.value !== '') {
      // If it's the last input and a digit is entered, blur it (optional)
      element.blur();
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const fullOtp = otp.join('');
      if (fullOtp.length !== 6) {
        showToast('Please enter a complete 6-digit OTP', 'error');
        return;
      }
      const response = await apiService.verifyEmailOTP(registrationEmail, fullOtp);

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      dispatch({ type: 'SET_USER', payload: response.user });
      showToast('Email verified and logged in successfully!', 'success');
      sessionStorage.removeItem('googleAuthData'); // Clear any pending google data
      navigate('/home');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      showToast(error.message || 'OTP verification failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await apiService.resendEmailOTP(registrationEmail);
      showToast('New OTP sent to your email!', 'success');
      startOtpTimer(60); // Restart timer for 60 seconds
      setOtp(new Array(6).fill('')); // Clear OTP input fields
      otpInputRefs.current[0]?.focus(); // Focus the first OTP input
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      showToast(error.message || 'Failed to resend OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    if (showOtpVerification) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
            <p className="text-gray-600">A 6-digit OTP has been sent to <strong>{registrationEmail}</strong>. Please enter it below to verify your account.</p>
          </div>

          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(e.target, index)}
                onFocus={e => e.target.select()}
                className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                ref={el => {
                  otpInputRefs.current[index] = el;
                }}
              />
            ))}
          </div>

          {otpTimer > 0 ? (
            <p className="text-center text-sm text-gray-500">Resend OTP in {otpTimer} seconds</p>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Resend OTP
            </button>
          )}

          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={loading || otp.join('').length !== 6}
            className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </div>
      );
    }

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
                  disabled={!!googleAuthData} // Disable if pre-filled by Google
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <div className="relative">
                  <input
                    key="contactNumber"
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="+1 555 0100"
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                  {formData.contactNumber && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, contactNumber: '' }))}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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

            {/* Only show Google OAuth button if not already pre-filled by Google */}
            {!googleAuthData && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-sm text-gray-500">or</span>
                </div>
              </div>
            )}

            {!googleAuthData && (
              <button
                type="button"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm flex items-center justify-center gap-3 transition-colors"
                onClick={handleGoogleAuth}
                disabled={loading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" alt="Google" />
                Continue with Google
              </button>
            )}

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
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="retail">Retail</option>
                  <option value="other">Other</option>
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
                  <option value="entry">Entry Level</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
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
                    <option value="soft">Soft</option>
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

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Career Aspirations</label>
                <textarea
                  name="profile.goals.careerAspirations"
                  value={formData.profile?.goals?.careerAspirations || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="e.g., Become a Senior Project Manager, Lead a diverse team, Master Machine Learning..."
                ></textarea>
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
                  <option value="deadline-driven">Deadline-Driven</option>
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
                  <option value="detail-oriented">Detail-Oriented</option>
                  <option value="big-picture">Big-Picture</option>
                  <option value="process-focused">Process-Focused</option>
                  <option value="results-driven">Results-Driven</option>
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
                  placeholder="e.g., Data Science"
                />
                <button
                  type="button"
                  onClick={addInterest}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
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

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-9 w-9 rounded-md flex items-center justify-center text-white font-semibold tracking-tight bg-yellow-500">
                PX
              </div>
              <div>
                <div className="text-base font-semibold tracking-tight">Proxima</div>
                <div className="text-xs text-slate-500">Project & Payroll Suite</div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-6">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const Icon = step.icon;

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

            <form className="bg-white border border-border rounded-xl p-8">
              {renderStepContent()}

              {!showOtpVerification && (
                <div className="flex justify-between mt-8">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      <ChevronLeft className="inline-block w-4 h-4 mr-2" /> Back
                    </button>
                  )}

                  {currentStep < steps.length && (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={loading}
                      className={`px-6 py-2 ${currentStep === 1 ? 'w-full' : 'ml-auto'} bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium`}
                    >
                      {loading ? 'Loading...' : 'Next'} 
                      {currentStep !== 1 && <ChevronRight className="inline-block w-4 h-4 ml-2" />}
                    </button>
                  )}

                  {currentStep === steps.length && (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={loading}
                      className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {loading ? 'Sending OTP...' : 'Send OTP & Complete Registration'}
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedRegistration;
