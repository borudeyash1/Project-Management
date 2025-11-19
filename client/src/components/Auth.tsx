import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { LoginRequest, RegisterRequest, User, Workspace } from '../types';
import { apiService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import SharedNavbar from './SharedNavbar';
import EnhancedRegistration from './EnhancedRegistration';
import { googleAuthService } from '../config/googleAuth';
import { DESKTOP_FLOW_STORAGE_KEY } from '../constants/desktop';

const Auth: React.FC = () => {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [otpTimer, setOtpTimer] = useState(0);
  const [formData, setFormData] = useState<LoginRequest & RegisterRequest>({
    email: "",
    password: "",
    fullName: "",
    username: "",
    contactNumber: "",
    confirmPassword: "",
  });

  const queryDesktopFlow = useMemo(() => {
    return new URLSearchParams(location.search).get("source") === "desktop";
  }, [location.search]);

  const isDesktopFlow = useMemo(() => {
    if (queryDesktopFlow) return true;
    return sessionStorage.getItem(DESKTOP_FLOW_STORAGE_KEY) === "true";
  }, [queryDesktopFlow]);

  useEffect(() => {
    if (queryDesktopFlow) {
      sessionStorage.setItem(DESKTOP_FLOW_STORAGE_KEY, "true");
    } else if (!isDesktopFlow) {
      sessionStorage.removeItem(DESKTOP_FLOW_STORAGE_KEY);
    }

    if (!isDesktopFlow) return;

    if (localStorage.getItem("accessToken")) {
      navigate("/desktop-handshake", { replace: true });
    }
  }, [queryDesktopFlow, isDesktopFlow, navigate]);

  const ensureWorkspaceAccess = useCallback(
    async (user: User) => {
      try {
        const workspaces = await apiService.getWorkspaces();

        if (!workspaces || workspaces.length === 0) {
          const fallbackWorkspace: Workspace = {
            _id: `personal-${user._id}`,
            name: "Personal Workspace",
            description: "Automatically created workspace for your projects",
            type: "personal",
            region: "global",
            owner: user._id,
            members: [
              {
                user: user._id,
                role: "owner",
                permissions: {
                  canCreateProject: true,
                  canManageEmployees: false,
                  canViewPayroll: false,
                  canExportReports: true,
                  canManageWorkspace: true,
                },
                joinedAt: new Date(),
                status: "active",
              },
            ],
            settings: {
              isPublic: false,
              allowMemberInvites: false,
              requireApprovalForJoining: true,
              defaultProjectPermissions: {
                canCreate: true,
                canManage: false,
                canView: true,
              },
            },
            subscription: {
              plan: "free",
              maxMembers: 5,
              maxProjects: 1,
              features: {
                advancedAnalytics: false,
                customFields: false,
                apiAccess: false,
                prioritySupport: false,
              },
            },
            isActive: true,
            memberCount: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          dispatch({ type: "SET_WORKSPACES", payload: [fallbackWorkspace] });
          dispatch({ type: "SET_WORKSPACE", payload: fallbackWorkspace._id });
          dispatch({ type: "SET_MODE", payload: "Workspace" });
        } else {
          dispatch({ type: "SET_WORKSPACES", payload: workspaces });
          dispatch({ type: "SET_WORKSPACE", payload: workspaces[0]._id });
          dispatch({ type: "SET_MODE", payload: "Workspace" });
        }
      } catch (workspaceError) {
        console.error("[Auth] Failed to sync workspaces", workspaceError);
      }
    },
    [dispatch],
  );

  // Set auth tab based on route
  useEffect(() => {
    if (location.pathname === "/register") {
      setAuthTab("register");
    } else {
      setAuthTab("login");
    }
    setShowOtpVerification(false);
  }, [location.pathname]);

  const showToast = useCallback((
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
  ) => {
    dispatch({ type: "ADD_TOAST", payload: { message, type } });
  }, [dispatch]);

  // OTP Timer
  const startOtpTimer = (seconds: number) => {
    setOtpTimer(seconds);
    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginData: LoginRequest = {
        email: formData.email,
        password: formData.password,
        rememberMe: false,
      };

      const response = await apiService.login(loginData);

      // Check if OTP verification is required
      if (response.requiresOtpVerification) {
        setShowOtpVerification(true);
        setLoginEmail(formData.email);
        startOtpTimer(60); // 60 seconds for OTP timer
        showToast("Please check your email to verify your login", "info");
      } else {
        // Store tokens in localStorage
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        // Update user profile in context
        dispatch({ type: "SET_USER", payload: response.user });
        await ensureWorkspaceAccess(response.user);

        showToast("Welcome back!", "success");

        if (isDesktopFlow) {
          navigate("/desktop-handshake", { replace: true });
        } else {
          navigate("/home");
        }
      }
    } catch (error: any) {
      showToast(error.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input if a digit is entered and it's not the last input
    if (element.nextElementSibling && element.value !== "") {
      (element.nextElementSibling as HTMLInputElement).focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = e.currentTarget
        .previousElementSibling as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpVerification = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      showToast("Please enter the complete 6-digit OTP", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.verifyEmailOTP(loginEmail, otpCode);

      // Store tokens in localStorage
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      // Update user profile in context
      dispatch({ type: "SET_USER", payload: response.user });

      showToast("Login successful! Welcome back!", "success");

      if (isDesktopFlow) {
        navigate("/desktop-handshake", { replace: true });
      } else {
        navigate("/home");
      }
    } catch (error: any) {
      showToast(error.message || "OTP verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await apiService.resendEmailOTP(loginEmail);
      showToast("OTP resent successfully", "success");
      startOtpTimer(60);
    } catch (error: any) {
      showToast(error.message || "Failed to resend OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);

      // Initialize Google Auth if not already done
      await googleAuthService.initializeGapi();

      // Sign in with Google
      const googleUser = await googleAuthService.signInWithGoogle();

      // Try to authenticate with backend
      try {
        const response = await apiService.googleAuth({
          id: googleUser.id,
          name: googleUser.name,
          email: googleUser.email,
          imageUrl: googleUser.imageUrl,
          accessToken: googleUser.accessToken,
          idToken: googleUser.idToken,
          isRegistration: false,
        });

        // Store tokens in localStorage
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        // Update user profile in context
        dispatch({ type: "SET_USER", payload: response.user });
        await ensureWorkspaceAccess(response.user);

        showToast("Successfully signed in with Google!", "success");

        if (isDesktopFlow) {
          navigate("/desktop-handshake", { replace: true });
        } else {
          navigate("/home");
        }
      } catch (authError: any) {
        // Check if user needs to register
        if (authError.message === "USER_NOT_REGISTERED") {
          // Store Google data in sessionStorage to pass to registration
          sessionStorage.setItem("googleAuthData", JSON.stringify(googleUser));
          showToast("Please complete your registration", "info");
          navigate("/register");
        } else {
          throw authError;
        }
      }
    } catch (error: any) {
      console.error("Google authentication error:", error);
      showToast(error.message || "Google authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const switchToRegister = () => {
    const suffix = (isDesktopFlow || queryDesktopFlow || sessionStorage.getItem(DESKTOP_FLOW_STORAGE_KEY) === "true")
      ? "?source=desktop"
      : "";
    navigate("/register" + suffix);
  };

  const switchToLogin = () => {
    const suffix = (isDesktopFlow || queryDesktopFlow || sessionStorage.getItem(DESKTOP_FLOW_STORAGE_KEY) === "true")
      ? "?source=desktop"
      : "";
    navigate("/login" + suffix);
  };

  // If on register route, show enhanced registration
  if (location.pathname === "/register") {
    return <EnhancedRegistration />;
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gradient-to-br from-gray-900 via-yellow-900 to-orange-900" : "bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50"} relative overflow-hidden`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-96 h-96 ${isDarkMode ? "bg-yellow-500/10" : "bg-yellow-200/20"} rounded-full blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 ${isDarkMode ? "bg-orange-500/10" : "bg-orange-200/20"} rounded-full blur-3xl animate-pulse delay-1000`}
        ></div>
      </div>
      <SharedNavbar />
      <section className="min-h-screen flex pt-16 relative z-10">
        <div className="hidden lg:flex w-1/2 bg-white border-r border-border relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-black/20"></div>
          <div className="relative p-12 mt-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/20 mb-6 shadow-xl">
              <div className="w-5 h-5 text-yellow-600">🚀</div>
              <span className="text-sm font-semibold text-slate-700">
                Projects, Payroll, Planner — unified
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl tracking-tight font-bold text-white mb-4 leading-tight">
              Plan, track, and pay — all in one place
            </h1>
            <p className="text-white/90 text-lg mt-4 max-w-lg leading-relaxed">
              Workspaces, roles, analytics, and automations for teams of any
              size.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-10">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold tracking-tight bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg">
                TF
              </div>
              <div>
                <div
                  className={`text-xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Sartthi
                </div>
                <div
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                >
                  Project & Payroll Suite
                </div>
              </div>
            </div>

            <div
              className={`flex ${isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-1.5 mb-8 shadow-lg`}
            >
              <button
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  authTab === "login"
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md"
                    : `${isDarkMode ? "text-gray-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`
                }`}
                onClick={switchToLogin}
              >
                Login
              </button>
              <button
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  authTab === "register"
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md"
                    : `${isDarkMode ? "text-gray-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`
                }`}
                onClick={switchToRegister}
              >
                Register
              </button>
            </div>

            {isDesktopFlow && (
              <div
                className={`mb-8 rounded-2xl border ${isDarkMode ? "border-yellow-500/40 bg-yellow-500/10" : "border-yellow-200 bg-yellow-50"} p-4 text-sm leading-relaxed`}
              >
                <p className={`font-semibold ${isDarkMode ? "text-yellow-200" : "text-yellow-800"}`}>
                  Sartthi Desktop sign-in
                </p>
                <p className={isDarkMode ? "text-gray-200" : "text-slate-600"}>
                  You started login from the desktop app. After signing in here, we’ll reopen the desktop app automatically.
                </p>
              </div>
            )}

            {/* Login Form */}
            {authTab === "login" && (
              <form
                className={`${isDarkMode ? "bg-gray-800/60 border-gray-700/50" : "bg-white border-gray-200"} border backdrop-blur-sm rounded-2xl p-8 space-y-6 shadow-2xl`}
                onSubmit={handleLogin}
              >
                <div>
                  <label
                    className={`text-sm font-semibold block mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                  >
                    Email or Username
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border ${isDarkMode ? "border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder:text-slate-400"} px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all duration-200`}
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      className={`text-sm font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      className={`text-xs font-medium ${isDarkMode ? "text-yellow-400 hover:text-yellow-300" : "text-yellow-600 hover:text-yellow-700"} transition-colors`}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border ${isDarkMode ? "border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder:text-slate-400"} px-4 py-3 pr-12 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all duration-200`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-3.5"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff
                          className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-slate-400"}`}
                        />
                      ) : (
                        <Eye
                          className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-slate-400"}`}
                        />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label
                    className={`inline-flex items-center gap-2 text-sm ${isDarkMode ? "text-gray-300" : "text-slate-700"} cursor-pointer font-medium`}
                  >
                    <input type="checkbox" className="peer sr-only" />
                    <span
                      className={`relative inline-flex h-6 w-11 rounded-full ${isDarkMode ? "bg-gray-600" : "bg-slate-200"} transition-colors peer-checked:bg-gradient-to-r peer-checked:from-yellow-500 peer-checked:to-orange-500 shadow-inner`}
                    >
                      <span className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-md transition-all peer-checked:left-6"></span>
                    </span>
                    Remember me
                  </label>
                  <div
                    className={`text-xs ${isDarkMode ? "text-gray-400" : "text-slate-500"} font-medium`}
                  >
                    SSO enabled
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3.5 rounded-xl text-white text-base font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] transform"
                >
                  {loading ? "Signing in..." : "Continue"}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div
                      className={`w-full border-t ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}
                    ></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span
                      className={`${isDarkMode ? "bg-gray-800" : "bg-white"} px-4 text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                    >
                      or
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className={`w-full px-4 py-3.5 rounded-xl border-2 ${isDarkMode ? "border-gray-600 hover:bg-gray-700/50 text-gray-200" : "border-gray-300 hover:bg-gray-50 text-gray-700"} text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.02] transform shadow-lg`}
                  onClick={handleGoogleAuth}
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    className="h-5 w-5"
                    alt="Google"
                  />
                  Continue with Google
                </button>
              </form>
            )}

            {/* OTP Verification for Login */}
            {authTab === "login" && showOtpVerification && (
              <div
                className={`${isDarkMode ? "bg-gray-800/60 border-gray-700/50" : "bg-white border-gray-200"} border backdrop-blur-sm rounded-2xl p-8 space-y-6 shadow-2xl`}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <span className="text-3xl">📧</span>
                  </div>
                  <h3
                    className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"} mb-3`}
                  >
                    Verify Your Login
                  </h3>
                  <p
                    className={`text-sm ${isDarkMode ? "text-gray-300" : "text-slate-600"} mb-6`}
                  >
                    We've sent a 6-digit verification code to{" "}
                    <strong
                      className={
                        isDarkMode ? "text-yellow-400" : "text-yellow-600"
                      }
                    >
                      {loginEmail}
                    </strong>
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
                      className={`w-14 h-14 text-center text-xl font-bold border-2 ${isDarkMode ? "border-gray-600 bg-gray-700/50 text-white" : "border-gray-300 bg-white text-gray-900"} rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200`}
                      autoComplete="off"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleOtpVerification}
                  disabled={loading || otp.join("").length !== 6}
                  className="w-full px-4 py-3.5 rounded-xl text-white text-base font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] transform"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-slate-500"} font-medium`}
                    >
                      Resend OTP in{" "}
                      <span
                        className={
                          isDarkMode ? "text-yellow-400" : "text-yellow-600"
                        }
                      >
                        {otpTimer}s
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className={`text-sm ${isDarkMode ? "text-yellow-400 hover:text-yellow-300" : "text-yellow-600 hover:text-yellow-700"} font-bold disabled:opacity-50 transition-colors`}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Desktop CTA now handled via dedicated route */}

          </div>
        </div>
      </section>
    </div>
  );
};

export default Auth;
