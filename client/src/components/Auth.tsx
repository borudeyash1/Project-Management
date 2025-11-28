import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { LoginRequest, RegisterRequest, User, Workspace } from '../types';
import { apiService } from '../services/api';
import { useTranslation } from 'react-i18next';
import SharedNavbar from './SharedNavbar';
import EnhancedRegistration from './EnhancedRegistration';
import { googleAuthService } from '../config/googleAuth';
import { DESKTOP_FLOW_STORAGE_KEY } from '../constants/desktop';

const Auth: React.FC = () => {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  // Force light theme for auth pages
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    return () => {
      // Optional: Restore theme preference on unmount if needed
    };
  }, []);

  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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
                  canManageMembers: true,
                  canManageProjects: true,
                  canManageClients: true,
                  canUpdateWorkspaceDetails: true,
                  canManageCollaborators: true,
                  canManageInternalProjectSettings: true,
                  canAccessProjectManagerTabs: true,
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
        rememberMe: rememberMe,
      };

      const response = await apiService.login(loginData);

      // Check if OTP verification is required
      if (response.requiresOtpVerification) {
        setShowOtpVerification(true);
        setLoginEmail(formData.email);
        startOtpTimer(60); // 60 seconds for OTP timer
        showToast(t('auth.otp.checkEmail'), "info");
      } else {
        // Store tokens in localStorage
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        // Update user profile in context
        dispatch({ type: "SET_USER", payload: response.user });
        await ensureWorkspaceAccess(response.user);

        showToast(t('auth.login.welcomeBack'), "success");

        if (isDesktopFlow) {
          navigate("/desktop-handshake", { replace: true });
        } else {
          navigate("/home");
        }
      }
    } catch (error: any) {
      showToast(error.message || t('auth.login.loginFailed'), "error");
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
      showToast(t('auth.otp.enterComplete'), "error");
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

      // Load workspaces to ensure dock navigation shows correctly
      await ensureWorkspaceAccess(response.user);

      showToast(t('auth.otp.loginSuccess'), "success");

      if (isDesktopFlow) {
        navigate("/desktop-handshake", { replace: true });
      } else {
        navigate("/home");
      }
    } catch (error: any) {
      showToast(error.message || t('auth.otp.verificationFailed'), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await apiService.resendEmailOTP(loginEmail);
      showToast(t('auth.otp.otpSent'), "success");
      startOtpTimer(60);
    } catch (error: any) {
      showToast(error.message || t('auth.otp.otpFailed'), "error");
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

        showToast(t('auth.login.welcomeBack'), "success");

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
          showToast(t('auth.register.title'), "info");
          navigate("/register");
        } else {
          throw authError;
        }
      }
    } catch (error: any) {
      console.error("Google authentication error:", error);
      showToast(error.message || t('auth.login.loginFailed'), "error");
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
      className={`min-h-screen bg-gradient-to-br from-amber-50 via-white to-white relative overflow-hidden`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-96 h-96 bg-[accent]/10 rounded-full blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 bg-[accent]/10 rounded-full blur-3xl animate-pulse delay-1000`}
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
                {t('auth.hero.badge')}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl tracking-tight font-bold text-white mb-4 leading-tight">
              {t('auth.hero.title')}
            </h1>
            <p className="text-white/90 text-lg mt-4 max-w-lg leading-relaxed">
              {t('auth.hero.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-10">
              <img src="/logo.png" alt="Sartthi Logo" className="h-7 w-auto" />
            </div>

            <div
              className={`flex bg-white border-gray-200 border rounded-xl p-1.5 mb-8 shadow-lg`}
            >
              <button
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  authTab === "login"
                    ? "bg-[accent] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={switchToLogin}
              >
                {t('auth.login.title')}
              </button>
              <button
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  authTab === "register"
                    ? "bg-[accent] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={switchToRegister}
              >
                {t('auth.login.switchToRegister')}
              </button>
            </div>


            {isDesktopFlow && (
              <div
                className={`mb-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed`}
              >
                <p className={`font-semibold text-yellow-800`}>
                  {t('auth.login.desktopSignIn')}
                </p>
                <p className={"text-slate-600"}>
                  {t('auth.login.desktopMessage')}
                </p>
              </div>
            )}

            {/* Login Form */}
            {authTab === "login" && (
              <form
                className={`bg-white border-gray-200 border backdrop-blur-sm rounded-2xl p-8 space-y-6 shadow-2xl`}
                onSubmit={handleLogin}
              >
                <div>
                  <label
                    className={`text-sm font-semibold block mb-2 text-gray-700`}
                  >
                    {t('auth.login.emailLabel')}
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-slate-400 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[accent] transition-all duration-200`}
                    placeholder={t('auth.login.emailPlaceholder')}
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      className={`text-sm font-semibold text-gray-700`}
                    >
                      {t('auth.login.passwordLabel')}
                    </label>
                    <button
                      type="button"
                      className={`text-xs font-medium text-[accent] hover:text-[#3b8fc0] transition-colors`}
                    >
                      {t('auth.login.forgotPassword')}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-slate-400 px-4 py-3 pr-12 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[accent] transition-all duration-200`}
                      placeholder={t('auth.login.passwordPlaceholder')}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-3.5"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff
                          className={`w-5 h-5 text-slate-400`}
                        />
                      ) : (
                        <Eye
                          className={`w-5 h-5 text-slate-400`}
                        />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label
                    className={`inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer font-medium`}
                    onClick={() => setRememberMe(!rememberMe)}
                  >
                    <span
                      className={`relative inline-flex h-6 w-11 rounded-full ${rememberMe ? "bg-[accent]" : "bg-slate-200"} transition-colors shadow-inner`}
                    >
                      <span className={`absolute top-1 ${rememberMe ? "left-6" : "left-1"} h-4 w-4 rounded-full bg-white shadow-md transition-all`}></span>
                    </span>
                    {t('auth.login.rememberMe')}
                  </label>
                  <div
                    className={`text-xs text-slate-500 font-medium`}
                  >
                    {t('auth.login.ssoEnabled')}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3.5 rounded-xl text-white text-base font-bold bg-[accent] hover:bg-[#3b8fc0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[accent] shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] transform"
                >
                  {loading ? t('auth.login.signingIn') : t('auth.login.continueButton')}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div
                      className={`w-full border-t border-gray-200`}
                    ></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span
                      className={`bg-white px-4 text-sm font-medium text-slate-500`}
                    >
                      {t('auth.login.orDivider')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className={`w-full px-4 py-3.5 rounded-xl border-2 border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.02] transform shadow-lg`}
                  onClick={handleGoogleAuth}
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    className="h-5 w-5"
                    alt="Google"
                  />
                  {t('auth.login.googleButton')}
                </button>
              </form>
            )}

            {/* OTP Verification for Login */}
            {authTab === "login" && showOtpVerification && (
              <div
                className={`bg-white border-gray-200 border backdrop-blur-sm rounded-2xl p-8 space-y-6 shadow-2xl`}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-[accent] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <span className="text-3xl">📧</span>
                  </div>
                  <h3
                    className={`text-2xl font-bold text-slate-900 mb-3`}
                  >
                    {t('auth.otp.title')}
                  </h3>
                  <p
                    className={`text-sm text-slate-600 mb-6`}
                  >
                    {t('auth.otp.description')}{" "}
                    <strong
                      className={
                        "text-[accent]"
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
                      className={`w-14 h-14 text-center text-xl font-bold border-2 border-gray-300 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[accent] focus:border-[accent] transition-all duration-200`}
                      autoComplete="off"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleOtpVerification}
                  disabled={loading || otp.join("").length !== 6}
                  className="w-full px-4 py-3.5 rounded-xl text-white text-base font-bold bg-[accent] hover:bg-[#3b8fc0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[accent] shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] transform"
                >
                  {loading ? t('auth.otp.verifying') : t('auth.otp.verifyButton')}
                </button>

                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p
                      className={`text-sm text-slate-500 font-medium`}
                    >
                      {t('auth.otp.resendIn')}{" "}
                      <span
                        className={
                          "text-[accent]"
                        }
                      >
                        {otpTimer}{t('auth.otp.seconds')}
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className={`text-sm text-[accent] hover:text-[#3b8fc0] font-bold disabled:opacity-50 transition-colors`}
                    >
                      {t('auth.otp.resendOtp')}
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
