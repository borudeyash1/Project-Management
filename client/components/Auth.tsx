import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { LoginRequest, RegisterRequest } from '@/types';
import { apiService } from '@/services/api';

const Auth: React.FC = () => {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LoginRequest & RegisterRequest>({
    email: '',
    password: '',
    fullName: '',
    username: '',
    contactNumber: '',
    confirmPassword: ''
  });

  // Set auth tab based on route
  useEffect(() => {
    if (location.pathname === '/register') {
      setAuthTab('register');
    } else {
      setAuthTab('login');
    }
  }, [location.pathname]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const loginData: LoginRequest = {
        email: formData.email,
        password: formData.password,
        rememberMe: false
      };
      
      const response = await apiService.login(loginData);
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Update user profile in context
      dispatch({ type: 'SET_USER', payload: response.user });
      
      showToast('Welcome back!', 'success');
      navigate('/home');
    } catch (error: any) {
      showToast(error.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const registerData: RegisterRequest = {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        contactNumber: formData.contactNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };
      
      const response = await apiService.register(registerData);
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Update user profile in context
      dispatch({ type: 'SET_USER', payload: response.user });
      
      showToast('Registration successful! Welcome to Proxima!', 'success');
      navigate('/home');
    } catch (error: any) {
      showToast(error.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    showToast('Google authentication not implemented yet', 'info');
  };

  const switchToRegister = () => {
    navigate('/register');
  };

  const switchToLogin = () => {
    navigate('/login');
  };

  return (
    <section className="min-h-screen flex">
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

          <div className="flex bg-white border border-border rounded-lg p-1 mb-6">
            <button
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                authTab === 'login' 
                  ? 'bg-yellow-100 text-text' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={switchToLogin}
            >
              Login
            </button>
            <button
              className={`flex-1 px-3 py-2 rounded-md text-sm ${
                authTab === 'register' 
                  ? 'bg-yellow-100 text-text' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={switchToRegister}
            >
              Register
            </button>
          </div>

          {/* Login Form */}
          {authTab === 'login' && (
            <form className="bg-white border border-border rounded-xl p-5 space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="text-sm font-medium block mb-1">Email or Username</label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                  placeholder="you@company.com"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">Password</label>
                  <button type="button" className="text-xs text-slate-600 hover:text-slate-900">
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 pr-10 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" className="peer sr-only" />
                  <span className="relative inline-flex h-5 w-9 rounded-full bg-slate-200 transition-colors peer-checked:bg-yellow-500">
                    <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-all peer-checked:left-4"></span>
                  </span>
                  Remember me
                </label>
                <div className="text-xs text-slate-500">SSO enabled</div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-3 py-2 rounded-lg text-white text-sm font-medium hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 shadow-sm bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Continue'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-slate-500">or</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm flex items-center justify-center gap-2"
                onClick={handleGoogleAuth}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-4 w-4" alt="Google" />
                Continue with Google
              </button>
            </form>
          )}

          {/* Register Form */}
          {authTab === 'register' && (
            <form className="bg-white border border-border rounded-xl p-5 space-y-4" onSubmit={handleRegister}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="Jane Cooper"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="janecooper"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="+1 555 0100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer">
                <span className="mt-0.5 h-5 w-5 rounded-md border border-border flex items-center justify-center bg-white hover:bg-slate-50">
                  <div className="w-4 h-4 opacity-0">✓</div>
                </span>
                <span>Agree to Terms and Conditions</span>
              </label>
              <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer">
                <span className="mt-0.5 h-5 w-5 rounded-md border border-border flex items-center justify-center bg-white hover:bg-slate-50">
                  <div className="w-4 h-4 opacity-0">✓</div>
                </span>
                <span>Agree to Privacy Policy</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-3 py-2 rounded-lg text-white text-sm font-medium hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 shadow-sm bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Register'}
              </button>
              <p className="text-xs text-slate-500">
                After registration, check your email for a verification code or confirmation link.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Auth;
