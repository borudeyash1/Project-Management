import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Monitor, Zap, Shield, Globe, CheckCircle, Download, Command, Bell, Layout, Wifi, WifiOff, Search, ArrowRight, X, User } from 'lucide-react';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import ContentBanner from './ContentBanner';
import DownloadAppWidget from './dashboard/DownloadAppWidget';
import api from '../services/api';

interface DesktopRelease {
    _id: string;
    version: string;
    versionName: string;
    description: string;
    releaseNotes: string;
    platform: 'windows' | 'macos' | 'linux';
    architecture: 'x64' | 'arm64' | 'universal';
    fileName: string;
    fileSize: number;
    downloadUrl: string;
    downloadCount: number;
    isLatest: boolean;
    releaseDate: string;
}

const DesktopPage: React.FC = () => {
    const [latestRelease, setLatestRelease] = useState<DesktopRelease | null>(null);
    const [loading, setLoading] = useState(true);

    // Interactive accordion state
    const [activeStep, setActiveStep] = useState(0);
    const [progress, setProgress] = useState(0);

    // Mockup states
    const [loginStep, setLoginStep] = useState(0); // 0: App, 1: Browser, 2: App Success
    const [searchTerm, setSearchTerm] = useState('');
    const [isOffline, setIsOffline] = useState(false);
    const [offlineSyncProgress, setOfflineSyncProgress] = useState(0);

    useEffect(() => {
        const fetchLatestRelease = async () => {
            try {
                const platform = navigator.platform.toLowerCase().includes('mac') ? 'macos' : 'windows';
                const response = await api.get(`/releases/latest?platform=${platform}`);
                if (response.data.success && response.data.data.length > 0) {
                    setLatestRelease(response.data.data[0]);
                }
            } catch (error) {
                console.error('Failed to fetch latest release:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestRelease();
    }, []);

    // Auto-advance accordion steps
    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    setActiveStep(current => (current + 1) % 4);
                    return 0;
                }
                return prev + 1.25; // ~8 seconds per step
            });
        }, 100);

        return () => clearInterval(progressInterval);
    }, []);

    // Cycle internal mockup states
    useEffect(() => {
        // Reset states on step change
        setLoginStep(0);
        setSearchTerm('');
        setIsOffline(false);
        setOfflineSyncProgress(0);

        // Auto-cycle login flow if on step 0
        let loginInterval: NodeJS.Timeout;
        if (activeStep === 0) {
            loginInterval = setInterval(() => {
                setLoginStep(prev => (prev + 1) % 3);
            }, 3000);
        }

        // Type search term if on step 1
        let typeInterval: NodeJS.Timeout;
        if (activeStep === 1) {
            let text = "sartthi";
            let idx = 0;
            typeInterval = setInterval(() => {
                if (idx <= text.length) {
                    setSearchTerm(text.substring(0, idx));
                    idx++;
                } else {
                    // Reset after a pause
                    setTimeout(() => { idx = 0; setSearchTerm(''); }, 2000);
                }
            }, 200);
        }

        return () => {
            clearInterval(loginInterval);
            clearInterval(typeInterval);
        };
    }, [activeStep]);

    return (
        <div className="min-h-screen flex flex-col relative bg-white font-inter">
            {/* Navbar */}
            <div className="relative z-10">
                <SharedNavbar />
                <ContentBanner route="/desktop" />
            </div>

            {/* Hero Section */}
            <div className="pt-32 pb-0 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-100 shadow-sm bg-gray-50 mb-8 animate-fade-in-up">
                        <img src="/sartthi_app_icon.png" alt="Logo" className="w-4 h-4" />
                        <span className="text-sm font-semibold text-gray-700">Sartthi Desktop App</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-8 leading-tight animate-fade-in-up delay-100">
                        Your Workspace,<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-[#006397] to-gray-900 animate-gradient">Now Native.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                        Experience Sartthi with enhanced performance, native notifications, and seamless offline capabilities.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-6 mb-12 animate-fade-in-up delay-300">
                        <div className="w-full max-w-xs">
                            {latestRelease ? (
                                <DownloadAppWidget release={latestRelease} />
                            ) : (
                                <a
                                    href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/releases/download/latest/auto?platform=${navigator.platform.toLowerCase().includes('mac') ? 'macos' : 'windows'}`}
                                    className="px-8 py-4 rounded-xl bg-[#006397] text-white font-bold w-full flex items-center justify-center gap-2 hover:bg-[#005280] transition-colors shadow-lg shadow-blue-900/20"
                                >
                                    <Download size={20} />
                                    Download Now
                                </a>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-gray-400" />
                                <span>Auto-updates</span>
                            </div>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-gray-400" />
                                <span>Offline Support</span>
                            </div>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <div className="flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-gray-400" />
                                <span>Secure & Sandboxed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Image - Centered & Borderless */}
                <div className="max-w-6xl mx-auto relative mt-8 animate-fade-in-up delay-500">
                    {/* Gradient overlay to blend bottom if needed, sticking to simple first */}
                    <div className="relative">
                        <img
                            src="/desktop1.jpeg"
                            alt="Sartthi Desktop App"
                            className="w-full h-auto object-cover rounded-t-xl"
                            style={{ boxShadow: '0 -20px 40px -10px rgba(0,0,0,0.05)' }}
                        />
                        {/* Optional blend at the bottom if the image has a hard cut */}
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                    </div>
                </div>
            </div>

            {/* Interactive Feature Section */}
            <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                            Designed for Power Users
                        </h2>
                        <p className="text-base text-gray-600 max-w-2xl mx-auto">
                            See what makes the desktop experience effectively better for your daily workflow.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Side: Accordion */}
                        <div className="space-y-4">
                            {[
                                {
                                    title: "Seamless Authentication",
                                    description: "Securely sign in via your browser with our handshake protocol. No need to type passwords into the app directly.",
                                    icon: <Shield size={24} className="text-indigo-500" />
                                },
                                {
                                    title: "Native Search Integration",
                                    description: "Launch Sartthi instantly from your OS search bar. We integrate deep into Windows Start and macOS Spotlight.",
                                    icon: <Search size={24} className="text-blue-500" />
                                },
                                {
                                    title: "Unified Dashboard",
                                    description: "View all your work, projects, and deadlines in one high-performance native window. Drag, drop, and organize continuously.",
                                    icon: <Layout size={24} className="text-orange-500" />
                                },
                                {
                                    title: "Offline Ready",
                                    description: "No internet? No problem. Continue working on tasks, documents, and boards. We'll verify and sync everything once you're back online.",
                                    icon: <WifiOff size={24} className="text-purple-500" />
                                }
                            ].map((step, index) => (
                                <div
                                    key={index}
                                    className={`rounded-xl overflow-hidden transition-all cursor-pointer ${activeStep === index
                                        ? 'border-2 border-[#006397] shadow-lg'
                                        : 'border border-gray-200 hover:border-gray-300'
                                        }`}
                                    style={{ backgroundColor: '#F1F4F9' }}
                                    onClick={() => { setActiveStep(index); setProgress(0); }}
                                >
                                    <button className="w-full text-left px-6 py-4 flex items-start gap-4">
                                        <div className={`mt-1 flex-shrink-0 ${activeStep === index ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                                            {step.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                                            {activeStep === index && (
                                                <>
                                                    <div className="h-1 bg-gray-200 rounded-full mb-3 overflow-hidden w-full">
                                                        <div
                                                            className="h-full bg-[#006397] rounded-full transition-all duration-100"
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        {step.description}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Right Side: Interactive Mockups */}
                        <div className="relative h-[400px] lg:h-[500px]">
                            <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-gray-200 shadow-2xl bg-white relative">

                                {/* Mockup 1: Login Flow */}
                                {activeStep === 0 && (
                                    <div className="w-full h-full relative">
                                        {/* State 0: Desktop App Login Request */}
                                        <div className={`absolute inset-0 bg-[#0F0F12] flex items-center justify-center transition-opacity duration-500 ${loginStep === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                                            <div className="w-80 bg-[#161618] rounded-2xl border border-gray-800 p-8 text-center shadow-2xl">
                                                <div className="flex justify-center mb-4">
                                                    <img src="/sartthi_desktop_logo.png" alt="Sartthi Logo" className="w-16 h-16 object-contain" />
                                                </div>
                                                <h3 className="text-white text-xl font-bold mb-2">Sartthi Desktop</h3>
                                                <p className="text-gray-400 text-sm mb-6">Authenticate through the secure Sartthi portal to continue.</p>
                                                <button className="w-full bg-[#FCD34D] hover:bg-[#F59E0B] text-black font-bold py-3 rounded-lg mb-3 transition-colors">
                                                    Continue to Login
                                                </button>
                                                <button className="w-full bg-[#27272A] hover:bg-[#3F3F46] text-white font-medium py-3 rounded-lg border border-gray-700 transition-colors">
                                                    Create account
                                                </button>
                                            </div>
                                        </div>

                                        {/* State 1: Browser Handshake */}
                                        <div className={`absolute inset-0 bg-white flex flex-col transition-opacity duration-500 ${loginStep === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                                            {/* Browser Chrome */}
                                            <div className="bg-[#2B2A33] px-4 py-2 flex items-center gap-2">
                                                <div className="flex gap-1.5">
                                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                </div>
                                                <div className="flex-1 ml-4 bg-[#42414D] rounded text-xs text-gray-300 px-3 py-1 flex items-center justify-between">
                                                    <span>sartthi.com/desktop-handshake</span>
                                                    <Shield size={10} />
                                                </div>
                                            </div>
                                            {/* Browser Content */}
                                            <div className="flex-1 flex items-center justify-center bg-[#F9FAFB] relative">
                                                <div className="absolute top-0 w-full h-full bg-black/50 z-10"></div>
                                                {/* Dialog */}
                                                <div className="relative z-20 bg-[#2B2A33] text-white p-6 rounded-lg shadow-2xl w-96 border border-gray-700">
                                                    <h4 className="font-semibold text-lg mb-2">Open Electron?</h4>
                                                    <p className="text-gray-400 text-sm mb-6">https://sartthi.com wants to open this application.</p>
                                                    <div className="flex justify-end gap-3">
                                                        <button className="px-4 py-2 bg-transparent border border-gray-600 rounded text-sm hover:bg-white/5">Cancel</button>
                                                        <button className="px-4 py-2 bg-[#6366F1] text-white rounded text-sm hover:bg-[#4F46E5]">Open Sartthi Desktop</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* State 2: Desktop App Success */}
                                        <div className={`absolute inset-0 bg-[#0F0F12] flex flex-col items-center justify-center transition-opacity duration-500 ${loginStep === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                                <CheckCircle className="text-green-500 w-8 h-8" />
                                            </div>
                                            <h3 className="text-white text-2xl font-bold mb-2">Welcome back!</h3>
                                            <p className="text-gray-400">Syncing your workspace...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Mockup 2: Windows Search */}
                                {activeStep === 1 && (
                                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center flex items-end justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>

                                        {/* Search Interface */}
                                        <div className="mb-12 w-[600px] h-[500px] bg-[#1E1E1E]/95 backdrop-blur-xl rounded-t-xl shadow-2xl border border-gray-700/50 flex flex-col transform transition-transform duration-300 slide-up">
                                            {/* Search Bar */}
                                            <div className="p-6 pb-2">
                                                <div className="bg-[#2D2D2D] rounded-full px-4 py-3 flex items-center gap-3 border border-gray-700 border-b-2 border-b-[#8B5CF6]">
                                                    <Search className="text-gray-400" size={18} />
                                                    <input
                                                        type="text"
                                                        value={searchTerm}
                                                        readOnly
                                                        placeholder="Type here to search"
                                                        className="bg-transparent border-none outline-none text-white text-sm w-full font-light"
                                                    />
                                                    <ArrowRight className="text-gray-500" size={18} />
                                                </div>
                                            </div>

                                            {/* Results */}
                                            <div className="flex flex-1 p-6 gap-6">
                                                {/* Left List */}
                                                <div className="w-1/2 space-y-1">
                                                    <div className="text-xs text-gray-400 font-semibold mb-2 px-2">Best match</div>
                                                    <div className={`flex items-center gap-3 p-3 rounded-lg ${searchTerm.length > 2 ? 'bg-[#3A3A3A]' : ''}`}>
                                                        <div className="w-8 h-8 rounded flex items-center justify-center">
                                                            <img src="/sartthi_desktop_logo.png" alt="App Icon" className="w-full h-full object-contain" />
                                                        </div>
                                                        <div>
                                                            <div className="text-white text-sm font-medium">Sartthi</div>
                                                            <div className="text-gray-400 text-xs">App</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Preview */}
                                                {searchTerm.length > 2 && (
                                                    <div className="w-1/2 border-l border-gray-700 pl-6 flex flex-col items-center pt-8 animate-fade-in">
                                                        <div className="w-24 h-24 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                                            <img src="/sartthi_desktop_logo.png" alt="App Icon Large" className="w-full h-full object-contain" />
                                                        </div>
                                                        <h3 className="text-white text-xl font-semibold mb-1">Sartthi</h3>
                                                        <span className="text-gray-400 text-xs mb-8">App</span>

                                                        <div className="w-full space-y-1">
                                                            <div className="flex items-center gap-3 p-2 hover:bg-[#3A3A3A] rounded cursor-pointer text-gray-300 hover:text-white transition-colors">
                                                                <ArrowRight size={14} />
                                                                <span className="text-sm">Open</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 p-2 hover:bg-[#3A3A3A] rounded cursor-pointer text-gray-300 hover:text-white transition-colors">
                                                                <Shield size={14} />
                                                                <span className="text-sm">Run as administrator</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Mockup 3: Unified Dashboard */}
                                {activeStep === 2 && (
                                    <div className="w-full h-full bg-gray-50 flex flex-col relative overflow-hidden">
                                        {/* Header */}
                                        <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                                    <Layout size={18} />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-gray-900">My Work</h3>
                                                    <p className="text-xs text-gray-500">Plan, organize, and track</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200"></div>
                                            </div>
                                        </div>

                                        {/* Kanban Board */}
                                        <div className="flex-1 p-6 overflow-hidden">
                                            <div className="flex gap-4 h-full">
                                                {/* Column 1: To Do */}
                                                <div className="w-1/3 bg-gray-100/50 rounded-xl p-3 flex flex-col gap-3">
                                                    <div className="flex items-center gap-2 px-1">
                                                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                                        <span className="text-xs font-semibold text-gray-600">To Do</span>
                                                        <span className="text-xs text-gray-400 ml-auto">1</span>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                                                        <div className="h-1 w-8 bg-blue-500 rounded-full mb-2"></div>
                                                        <h4 className="text-sm font-medium text-gray-900 mb-1">Accounts tab creation</h4>
                                                        <p className="text-xs text-gray-500 line-clamp-2">Create overview of all expense budgets etc.</p>
                                                        <div className="mt-3 flex items-center justify-between">
                                                            <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                <Layout size={10} /> Jan 12
                                                            </div>
                                                            <div className="w-5 h-5 rounded-full bg-yellow-100 text-[10px] flex items-center justify-center text-yellow-700">S</div>
                                                        </div>
                                                    </div>
                                                    <button className="w-full py-2 text-xs text-gray-500 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50">+ Add Task</button>
                                                </div>

                                                {/* Column 2: In Progress */}
                                                <div className="w-1/3 bg-gray-100/50 rounded-xl p-3 flex flex-col gap-3">
                                                    <div className="flex items-center gap-2 px-1">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                        <span className="text-xs font-semibold text-gray-600">In Progress</span>
                                                        <span className="text-xs text-gray-400 ml-auto">1</span>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing transform hover:-translate-y-1 duration-200">
                                                        <div className="h-1 w-8 bg-orange-500 rounded-full mb-2"></div>
                                                        <h4 className="text-sm font-medium text-gray-900 mb-1">PM System Testing</h4>
                                                        <p className="text-xs text-gray-500 line-clamp-2">Find errors, mistakes and bugs in the new flow.</p>
                                                        <div className="mt-3 flex items-center justify-between">
                                                            <div className="text-[10px] text-red-500 flex items-center gap-1 font-medium">
                                                                <Layout size={10} /> Due Today
                                                            </div>
                                                            <div className="w-5 h-5 rounded-full bg-purple-100 text-[10px] flex items-center justify-center text-purple-700">Y</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Column 3: Review */}
                                                <div className="w-1/3 bg-gray-100/50 rounded-xl p-3 flex flex-col gap-3 opacity-60">
                                                    <div className="flex items-center gap-2 px-1">
                                                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                        <span className="text-xs font-semibold text-gray-600">Review</span>
                                                        <span className="text-xs text-gray-400 ml-auto">0</span>
                                                    </div>
                                                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                                                        <span className="text-xs text-gray-400">No tasks</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Mockup 4: Offline (Existing) */}
                                {activeStep === 3 && (
                                    <div className="w-full h-full bg-gray-50 flex flex-col">
                                        {/* Mock App Header */}
                                        <div className={`p-4 border-b transition-colors duration-300 ${isOffline ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'} flex justify-between items-center`}>
                                            <div className="font-bold text-gray-700">Project Board</div>
                                            <button onClick={() => {
                                                if (isOffline) {
                                                    setIsOffline(false);
                                                    setOfflineSyncProgress(0);
                                                    let p = 0;
                                                    const interval = setInterval(() => {
                                                        p += 10;
                                                        if (p > 100) clearInterval(interval);
                                                        setOfflineSyncProgress(prev => Math.min(prev + 10, 100));
                                                    }, 100);
                                                } else {
                                                    setIsOffline(true);
                                                }
                                            }} className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-2 transition-colors ${isOffline ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {isOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
                                                {isOffline ? 'Go Online' : 'Go Offline'}
                                            </button>
                                        </div>

                                        <div className="flex-1 p-6 overflow-hidden relative">
                                            <div className={`absolute top-0 left-0 right-0 bg-gray-800 text-white text-xs py-1 text-center transition-transform duration-300 ${isOffline ? 'translate-y-0' : '-translate-y-full'}`}>
                                                You are offline. Changes will populate when you reconnect.
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mt-6">
                                                <div className="bg-white p-3 rounded shadow-sm border border-gray-200 h-32 opacity-50"></div>
                                                <div className="bg-white p-3 rounded shadow-sm border border-gray-200 h-32 opacity-50"></div>
                                                <div className="bg-white p-3 rounded shadow-sm border border-gray-200 h-32 opacity-50"></div>
                                            </div>

                                            {!isOffline && offlineSyncProgress > 0 && offlineSyncProgress < 100 && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                                                    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 flex flex-col items-center">
                                                        <div className="w-8 h-8 border-4 border-[#006397] border-t-transparent rounded-full animate-spin mb-2"></div>
                                                        <div className="text-sm font-medium text-gray-900">Syncing...</div>
                                                    </div>
                                                </div>
                                            )}

                                            {!isOffline && offlineSyncProgress === 100 && (
                                                <div className="absolute bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-bounce-slow">
                                                    <CheckCircle size={16} />
                                                    All changes synced!
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SharedFooter />
        </div>
    );
};

export default DesktopPage;
