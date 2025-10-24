import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { LoginRequest, RegisterRequest } from "../types";
import { apiService } from "../services/api";
import { useTheme } from "../context/ThemeContext";
import SharedNavbar from "./SharedNavbar";
import EnhancedRegistration from "./EnhancedRegistration";
import { googleAuthService } from "../config/googleAuth";

const Auth: React.FC = () => {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [otpTimer, setOtpTimer] = useState(0);
  const [formData, setFormData] = useState<LoginRequest & RegisterRequest>({
    email: "",
    password: "",
    fullName: "",
    username: "",
    contactNumber: "",
    confirmPassword: "",
  });

  // Set auth tab based on route
  useEffect(() => {
    if (location.pathname === "/register") {
      setAuthTab("register");
    } else {
      setAuthTab("login");
    }
  }, [location.pathname]);

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
  ) => {
    dispatch({ type: "ADD_TOAST", payload: { message, type } });
  };

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
        showToast('Please check your email to verify your login', 'info');
      } else {
        // Store tokens in localStorage
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        // Update user profile in context
        dispatch({ type: "SET_USER", payload: response.user });

        showToast("Welcome back!", "success");
        navigate("/home");
      }
    } catch (error: any) {
      showToast(error.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // OTP verification functions
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input if a digit is entered and it's not the last input
    if (element.nextElementSibling && element.value !== '') {
      (element.nextElementSibling as HTMLInputElement).focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = e.currentTarget.previousElementSibling as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpVerification = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showToast('Please enter the complete 6-digit OTP', 'error');
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
      navigate("/home");
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
      showToast('OTP resent successfully', 'success');
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

        showToast("Successfully signed in with Google!", "success");
        navigate("/home");
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
    navigate("/register");
  };

  const switchToLogin = () => {
    navigate("/login");
  };

  // If on register route, show enhanced registration
  if (location.pathname === "/register") {
    return <EnhancedRegistration />;
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gradient-to-br from-gray-900 via-yellow-900 to-orange-900" : "bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50"}`}
    >
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
              <span className="text-xs text-slate-700">
                Projects, Payroll, Planner — unified
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl tracking-tight font-semibold text-white">
              Plan, track, and pay — all in one place
            </h1>
            <p className="text-white/80 mt-3 max-w-lg">
              Workspaces, roles, analytics, and automations for teams of any
              size.
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
                <div className="text-base font-semibold tracking-tight">
                  Proxima
                </div>
                <div className="text-xs text-slate-500">
                  Project & Payroll Suite
                </div>
              </div>
            </div>

            <div className="flex bg-white border border-border rounded-lg p-1 mb-6">
              <button
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                  authTab === "login"
                    ? "bg-yellow-100 text-text"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={switchToLogin}
              >
                Login
              </button>
              <button
                className={`flex-1 px-3 py-2 rounded-md text-sm ${
                  authTab === "register"
                    ? "bg-yellow-100 text-text"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={switchToRegister}
              >
                Register
              </button>
            </div>

            {/* Login Form */}
            {authTab === "login" && (
              <form
                className="bg-white border border-border rounded-xl p-5 space-y-4"
                onSubmit={handleLogin}
              >
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Email or Username
                  </label>
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
                    <button
                      type="button"
                      className="text-xs text-slate-600 hover:text-slate-900"
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
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 pr-10 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-400" />
                      )}
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
                  {loading ? "Signing in..." : "Continue"}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs text-slate-500">
                      or
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm flex items-center justify-center gap-2"
                  onClick={handleGoogleAuth}
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    className="h-4 w-4"
                    alt="Google"
                  />
                  Continue with Google
                </button>
              </form>
            )}

            {/* OTP Verification for Login */}
            {authTab === "login" && showOtpVerification && (
              <div className="bg-white border border-border rounded-xl p-5 space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Verify Your Login
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    We've sent a 6-digit verification code to <strong>{loginEmail}</strong>
                  </p>
                </div>

                <div className="flex justify-center space-x-2 mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="w-12 h-12 text-center text-lg font-semibold border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      autoComplete="off"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleOtpVerification}
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full px-3 py-2 rounded-lg text-white text-sm font-medium hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 shadow-sm bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p className="text-sm text-slate-500">
                      Resend OTP in {otpTimer}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-sm text-yellow-600 hover:text-yellow-700 font-medium disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>
    </div>
  );
};

export default Auth;
