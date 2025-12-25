import React, { useEffect, useState } from 'react';
import { Shield, Lock, Eye, Database, Users, FileText, Globe, Mail } from 'lucide-react';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import { useTheme } from '../context/ThemeContext';
import ContentBanner from './ContentBanner';

const PrivacyPage: React.FC = () => {
    useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        setIsVisible(true);
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const services = [
        { name: 'Sartthi Mail', icon: <Mail className="w-5 h-5" />, data: 'Email content, contacts, labels' },
        { name: 'Sartthi Calendar', icon: <FileText className="w-5 h-5" />, data: 'Events, meetings, schedules' },
        { name: 'Sartthi Vault', icon: <Lock className="w-5 h-5" />, data: 'Stored files and documents' },
        { name: 'Slack', icon: <Globe className="w-5 h-5" />, data: 'Messages, channels, user info' },
        { name: 'GitHub', icon: <Globe className="w-5 h-5" />, data: 'Repositories, pull requests, commits' },
        { name: 'Dropbox', icon: <Database className="w-5 h-5" />, data: 'Files, folders, sharing permissions' },
        { name: 'Figma', icon: <Globe className="w-5 h-5" />, data: 'Design files, projects, comments' },
        { name: 'Notion', icon: <FileText className="w-5 h-5" />, data: 'Pages, databases, workspace content' },
        { name: 'Zoom', icon: <Users className="w-5 h-5" />, data: 'Meeting details, recordings, participants' },
        { name: 'Vercel', icon: <Globe className="w-5 h-5" />, data: 'Deployments, projects, logs' },
        { name: 'Spotify', icon: <Globe className="w-5 h-5" />, data: 'Playlists, tracks, listening history' }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-900">
            <SharedNavbar />
            <ContentBanner route="/privacy" />

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                    <div
                        className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
                        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
                    ></div>
                    <div
                        className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
                        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
                    ></div>
                </div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-[#006397] font-medium mb-6 border border-blue-200 shadow-lg">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-semibold">Your Privacy Matters</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            Privacy Policy
                        </h1>

                        <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
                            How we collect, use, and protect your data
                        </p>

                        <p className="text-sm text-gray-500">Last Updated: December 25, 2024</p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-4xl mx-auto">

                    {/* Introduction */}
                    <div className="mb-12">
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Sartthi ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our project management application.
                        </p>
                    </div>

                    {/* Information We Collect */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Eye className="w-8 h-8 text-[#006397]" />
                            Information We Collect
                        </h2>

                        <div className="space-y-6">
                            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#F1F4F9' }}>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#006397] mt-1">•</span>
                                        <span><strong>Account Information:</strong> Name, email address, profile picture</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#006397] mt-1">•</span>
                                        <span><strong>Authentication Data:</strong> Login credentials (encrypted)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#006397] mt-1">•</span>
                                        <span><strong>Usage Data:</strong> Activity logs, feature usage, preferences</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#F1F4F9' }}>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">OAuth Connected Services</h3>
                                <p className="text-gray-700 mb-4">When you connect third-party services, we collect:</p>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#006397] mt-1">•</span>
                                        <span><strong>Access Tokens:</strong> Encrypted OAuth tokens to access your connected accounts</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#006397] mt-1">•</span>
                                        <span><strong>Service Data:</strong> Files, messages, and content you choose to attach to tasks</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#006397] mt-1">•</span>
                                        <span><strong>Account Information:</strong> Email, username, and profile data from connected services</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Connected Services Grid */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Globe className="w-8 h-8 text-[#006397]" />
                            Connected Services We Integrate
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {services.map((service, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl p-4 border border-gray-200 hover:border-[#006397] transition-all duration-300 hover:shadow-lg"
                                    style={{ backgroundColor: '#F1F4F9' }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-[#006397] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                                            {service.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-1">{service.name}</h4>
                                            <p className="text-sm text-gray-600">{service.data}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* How We Use Your Information */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Database className="w-8 h-8 text-[#006397]" />
                            How We Use Your Information
                        </h2>

                        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#F1F4F9' }}>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#006397] mt-1">✓</span>
                                    <span>Provide and maintain our service</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#006397] mt-1">✓</span>
                                    <span>Authenticate your identity</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#006397] mt-1">✓</span>
                                    <span>Enable integrations with third-party services</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#006397] mt-1">✓</span>
                                    <span>Send notifications and updates</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#006397] mt-1">✓</span>
                                    <span>Improve our application</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#006397] mt-1">✓</span>
                                    <span>Comply with legal obligations</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Data Security */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Lock className="w-8 h-8 text-[#006397]" />
                            Data Storage and Security
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-xl p-6 border border-gray-200" style={{ backgroundColor: '#F1F4F9' }}>
                                <h4 className="font-semibold text-gray-900 mb-2">Encryption</h4>
                                <p className="text-sm text-gray-600">All data encrypted in transit (HTTPS/TLS) and at rest</p>
                            </div>
                            <div className="rounded-xl p-6 border border-gray-200" style={{ backgroundColor: '#F1F4F9' }}>
                                <h4 className="font-semibold text-gray-900 mb-2">Password Security</h4>
                                <p className="text-sm text-gray-600">Hashed using industry-standard algorithms</p>
                            </div>
                            <div className="rounded-xl p-6 border border-gray-200" style={{ backgroundColor: '#F1F4F9' }}>
                                <h4 className="font-semibold text-gray-900 mb-2">OAuth Tokens</h4>
                                <p className="text-sm text-gray-600">Encrypted and securely stored</p>
                            </div>
                            <div className="rounded-xl p-6 border border-gray-200" style={{ backgroundColor: '#F1F4F9' }}>
                                <h4 className="font-semibold text-gray-900 mb-2">Regular Audits</h4>
                                <p className="text-sm text-gray-600">Security audits and updates performed regularly</p>
                            </div>
                        </div>
                    </div>

                    {/* Your Rights */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Users className="w-8 h-8 text-[#006397]" />
                            Your Rights
                        </h2>

                        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#F1F4F9' }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Access</h4>
                                    <p className="text-sm text-gray-600">Request a copy of your data</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Correction</h4>
                                    <p className="text-sm text-gray-600">Update incorrect information</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Deletion</h4>
                                    <p className="text-sm text-gray-600">Request account and data deletion</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Portability</h4>
                                    <p className="text-sm text-gray-600">Export your data</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="mb-12">
                        <div className="rounded-2xl p-8 bg-gradient-to-br from-[#006397] to-blue-600 text-white shadow-lg">
                            <h2 className="text-3xl font-bold mb-4">Questions About Privacy?</h2>
                            <p className="mb-6 text-white/90">For privacy-related questions or requests, contact us:</p>
                            <div className="space-y-2">
                                <p><strong>Email:</strong> privacy@sartthi.com</p>
                                <p><strong>Website:</strong> https://sartthi.com/contact</p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            <SharedFooter />
        </div>
    );
};

export default PrivacyPage;
