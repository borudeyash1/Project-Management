import React from 'react';
import { Calendar, Clock, Users, Sparkles, Shield, CheckCircle } from 'lucide-react';

const OAuthLoginPage: React.FC = () => {
    const handleGoogleLogin = () => {
        // Redirect to backend OAuth endpoint for standalone login
        const API_URL = import.meta.env.VITE_API_URL || '';
        window.location.href = `${API_URL}/api/auth/sartthi/login-calendar`;
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
                {/* Sartthi Logo Header */}
                <div className="absolute top-8 left-8">
                    <svg className="h-10" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <text x="10" y="35" fontFamily="Arial, sans-serif" fontSize="32" fontWeight="bold" fill="#F59E0B">
                            ››SARTTHI
                        </text>
                    </svg>
                </div>

                <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Branding & Features */}
                    <div className="text-center lg:text-left space-y-8">
                        {/* Logo */}
                        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl shadow-lg">
                            <Calendar className="w-8 h-8" />
                            <span className="text-2xl font-bold">Sartthi Calendar</span>
                        </div>

                        {/* Headline */}
                        <div className="space-y-4">
                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                                Time Management,
                                <br />
                                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Perfected
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg">
                                Stay organized and never miss a beat. Smart scheduling that adapts to your workflow.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                            {[
                                { icon: Clock, text: 'Smart scheduling & reminders' },
                                { icon: Users, text: 'Team collaboration tools' },
                                { icon: Sparkles, text: 'AI-powered suggestions' },
                                { icon: CheckCircle, text: 'Seamless Google sync' }
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <feature.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <span className="text-lg">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Login Card */}
                    <div className="relative">
                        {/* Glassmorphic Card */}
                        <div className="relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 lg:p-12">
                            {/* Decorative Elements */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-2xl opacity-50"></div>
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-30"></div>

                            <div className="relative space-y-8">
                                {/* Header */}
                                <div className="text-center space-y-2">
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        Welcome Back
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Sign in to access your Sartthi Calendar
                                    </p>
                                </div>

                                {/* Google Sign In Button */}
                                <button
                                    onClick={handleGoogleLogin}
                                    className="group relative w-full flex items-center justify-center gap-4 px-8 py-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                                        Continue with Google
                                    </span>
                                </button>

                                {/* Privacy Note */}
                                <div className="relative p-6 bg-purple-50/50 dark:bg-purple-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-800/50">
                                    <div className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                                                Privacy First
                                            </p>
                                            <p className="text-sm text-purple-800 dark:text-purple-400">
                                                We only access your calendar events. Your personal data remains completely private and secure.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms */}
                                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                                    By continuing, you agree to Sartthi's{' '}
                                    <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                                        Terms of Service
                                    </a>{' '}
                                    and{' '}
                                    <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                                        Privacy Policy
                                    </a>
                                </p>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full shadow-lg">
                            Part of the Sartthi Ecosystem
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.05); }
                }
                .animate-pulse {
                    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .delay-1000 {
                    animation-delay: 1s;
                }
                .delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </div>
    );
};

export default OAuthLoginPage;
