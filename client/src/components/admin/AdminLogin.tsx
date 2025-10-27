import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Lock, Mail } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { googleAuthService } from '../../config/googleAuth';
import api from '../../services/api';

const AdminLogin: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useApp();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // Initialize Google Auth
  useEffect(() => {
    googleAuthService.initializeGapi().catch(error => {
      console.error('Failed to initialize Google Auth:', error);
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔍 [ADMIN LOGIN] Attempting login with:', formData.email);
      
      const response = await api.post('/admin/login', {
        email: formData.email,
        password: formData.password
      });

      console.log('🔍 [ADMIN LOGIN] Response:', response);

      if (response?.success && response?.data?.requiresOtpVerification) {
        // OTP verification required
        console.log('✅ [ADMIN LOGIN] Password verified, OTP sent');
        addToast('OTP sent to your email', 'success');
        setShowOtpVerification(true);
      } else if (response?.success && response?.data?.token) {
        // Direct login (shouldn't happen with OTP enabled)
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.admin));
        
        console.log('✅ [ADMIN LOGIN] Login successful!');
        addToast('Welcome back, Admin!', 'success');
        
        navigate('/admin/dashboard');
      } else {
        addToast('Invalid credentials', 'error');
      }
    } catch (error: any) {
      console.error('❌ [ADMIN LOGIN] Error:', error);
      const errorMessage = error?.message || 'Login failed';
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const previousInput = (e.target as HTMLInputElement).previousSibling as HTMLInputElement;
      if (previousInput) {
        previousInput.focus();
      }
    }
  };

  const handleOtpVerification = async () => {
    setLoading(true);
    try {
      const otpCode = otp.join('');
      
      console.log('🔍 [ADMIN OTP] Verifying OTP:', otpCode);
      
      const response = await api.post('/admin/verify-login-otp', {
        email: formData.email,
        otp: otpCode
      });

      console.log('🔍 [ADMIN OTP] Response:', response);

      if (response?.success && response?.data?.token) {
        // Store admin token
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.admin));
        
        console.log('✅ [ADMIN OTP] Verification successful!');
        addToast('Welcome back, Admin!', 'success');
        
        navigate('/admin/dashboard');
      } else {
        addToast('Invalid OTP', 'error');
      }
    } catch (error: any) {
      console.error('❌ [ADMIN OTP] Error:', error);
      const errorMessage = error?.message || 'Verification failed';
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      console.log('🔍 [ADMIN GOOGLE] Starting Google OAuth...');
      
      // Get Google auth response
      const googleResponse = await googleAuthService.signInWithGoogle();
      console.log('🔍 [ADMIN GOOGLE] Google auth response:', googleResponse);

      // Send to backend for admin verification
      const response = await api.post('/admin/google-login', {
        email: googleResponse.email,
        googleId: googleResponse.id,
        name: googleResponse.name,
        avatar: googleResponse.imageUrl
      });

      console.log('🔍 [ADMIN GOOGLE] Backend response:', response);

      if (response?.success && response?.data?.token) {
        // Store admin token
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.admin));
        
        console.log('✅ [ADMIN GOOGLE] Login successful!');
        addToast('Welcome back, Admin!', 'success');
        
        navigate('/admin/dashboard');
      } else {
        addToast(response?.message || 'Google authentication failed', 'error');
      }
    } catch (error: any) {
      console.error('❌ [ADMIN GOOGLE] Error:', error);
      const errorMessage = error?.message || 'Google authentication failed';
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900' : 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500'}`}>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse animation-delay-500"></div>
        </div>

        <div className="relative z-10 p-12 flex flex-col justify-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20 shadow-2xl mb-6">
              <Shield className="w-8 h-8 text-white" />
              <span className="text-white font-bold text-xl">Admin Portal</span>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Saarthi
            <span className="block text-3xl mt-2 text-white/90">Administration Center</span>
          </h1>
          
          <p className="text-white/80 text-lg mb-8 max-w-lg leading-relaxed">
            Secure access to manage users, workspaces, projects, and system settings. Monitor platform activity and analytics in real-time.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>User & Workspace Management</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Real-time Analytics & Monitoring</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>System Configuration & Settings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Admin Portal
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Saarthi
              </div>
            </div>
          </div>

          {!showOtpVerification ? (
            /* Login Form */
            <form
              className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border backdrop-blur-sm rounded-2xl p-8 space-y-6 shadow-2xl`}
              onSubmit={handleAdminLogin}
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 mb-4 shadow-xl">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Admin Login
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Secure access for administrators only
                </p>
              </div>

              <div>
                <label className={`text-sm font-semibold block mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Mail className="w-4 h-4 inline mr-2" />
                  Admin Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full rounded-xl border ${isDarkMode ? 'border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder:text-slate-400'} px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all duration-200`}
                  placeholder="admin@taskflowhq.com"
                  required
                />
              </div>

              <div>
                <label className={`text-sm font-semibold block mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border ${isDarkMode ? 'border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder:text-slate-400'} px-4 py-3 pr-12 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all duration-200`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-3.5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`} />
                    ) : (
                      <Eye className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3.5 rounded-xl text-white text-base font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] transform"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}></div>
                </div>
                <div className="relative flex justify-center">
                  <span className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} px-4 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                    or
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={`w-full px-4 py-3.5 rounded-xl border-2 ${isDarkMode ? 'border-gray-600 hover:bg-gray-700/50 text-gray-200' : 'border-gray-300 hover:bg-gray-50 text-gray-700'} text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.02] transform shadow-lg`}
                onClick={handleGoogleAuth}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  className="h-5 w-5"
                  alt="Google"
                />
                Continue with Google
              </button>

              <div className={`text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} pt-4`}>
                <Shield className="w-4 h-4 inline mr-1" />
                Protected by 2FA and OTP verification
              </div>
            </form>
          ) : (
            /* OTP Verification */
            <div className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border backdrop-blur-sm rounded-2xl p-8 space-y-6 shadow-2xl`}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <span className="text-3xl">🔐</span>
                </div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-3`}>
                  Verify Admin Access
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-600'} mb-6`}>
                  Enter the 6-digit code sent to <strong className={isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}>{formData.email}</strong>
                </p>
              </div>

              <div className="flex justify-center gap-3 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className={`w-14 h-14 text-center text-xl font-bold border-2 ${isDarkMode ? 'border-gray-600 bg-gray-700/50 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200`}
                    autoComplete="off"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleOtpVerification}
                disabled={loading || otp.join('').length !== 6}
                className="w-full px-4 py-3.5 rounded-xl text-white text-base font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] transform"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <button
                type="button"
                onClick={() => setShowOtpVerification(false)}
                className={`w-full text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                ← Back to login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
