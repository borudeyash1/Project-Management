import React, { useEffect, useState } from 'react';
import { FileText, AlertCircle, CheckCircle, XCircle, Scale, UserCheck } from 'lucide-react';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import { useTheme } from '../context/ThemeContext';
import ContentBanner from './ContentBanner';

const TermsPage: React.FC = () => {
    useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        setIsVisible(true);
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-900">
            <SharedNavbar />
            <ContentBanner route="/terms" />

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
                            <Scale className="w-4 h-4" />
                            <span className="text-sm font-semibold">Legal Agreement</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            Terms of Use
                        </h1>

                        <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
                            Your agreement to use Sartthi services
                        </p>

                        <p className="text-sm text-gray-500">Last Updated: December 25, 2024</p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-4xl mx-auto">

                    {/* Acceptance */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <UserCheck className="w-8 h-8 text-[#006397]" />
                            Acceptance of Terms
                        </h2>
                        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#F1F4F9' }}>
                            <p className="text-gray-700 leading-relaxed">
                                By accessing or using Sartthi ("Service"), you agree to be bound by these Terms of Use ("Terms"). If you do not agree, do not use the Service.
                            </p>
                        </div>
                    </div>

                    {/* Service Description */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <FileText className="w-8 h-8 text-[#006397]" />
                            Description of Service
                        </h2>
                        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#F1F4F9' }}>
                            <p className="text-gray-700 mb-4">Sartthi is a project management application that allows you to:</p>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#006397] mt-1">•</span>
                                    <span>Manage projects, tasks, and teams</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#006397] mt-1">•</span>
                                    <span>Connect third-party services (Slack, GitHub, Dropbox, Figma, Notion, Zoom, Vercel, Spotify)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#006397] mt-1">•</span>
                                    <span>Collaborate with team members</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#006397] mt-1">•</span>
                                    <span>Track progress and productivity</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Acceptable Use */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                            Acceptable Use
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* You May */}
                            <div className="rounded-xl p-6 border border-green-200 bg-green-50">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    You May
                                </h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Use the Service for lawful purposes</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Connect your own third-party accounts</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Collaborate with your team members</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Store and manage your project data</span>
                                    </li>
                                </ul>
                            </div>

                            {/* You May Not */}
                            <div className="rounded-xl p-6 border border-red-200 bg-red-50">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <XCircle className="w-5 h-5 text-red-500" />
                                    You May Not
                                </h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">✗</span>
                                        <span>Violate any laws or regulations</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">✗</span>
                                        <span>Infringe on intellectual property rights</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">✗</span>
                                        <span>Upload malicious code or viruses</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">✗</span>
                                        <span>Attempt to gain unauthorized access</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Third-Party Integrations */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Third-Party Integrations</h2>

                        <div className="space-y-4">
                            <div className="rounded-xl p-6 border border-gray-200" style={{ backgroundColor: '#F1F4F9' }}>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Connected Services</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#006397] mt-1">•</span>
                                        <span>You authorize us to access your connected accounts</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#006397] mt-1">•</span>
                                        <span>You are responsible for compliance with third-party terms</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#006397] mt-1">•</span>
                                        <span>We are not liable for third-party service issues</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#006397] mt-1">•</span>
                                        <span>You can disconnect services at any time</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="rounded-xl p-6 border border-gray-200" style={{ backgroundColor: '#F1F4F9' }}>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Responsibilities</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#006397] mt-1">•</span>
                                        <span>Ensure you have rights to data you share</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#006397] mt-1">•</span>
                                        <span>Comply with each service's terms of use</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#006397] mt-1">•</span>
                                        <span>Maintain valid credentials for connected services</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Service Availability */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Service Availability</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-xl p-6 border border-gray-200" style={{ backgroundColor: '#F1F4F9' }}>
                                <h4 className="font-semibold text-gray-900 mb-2">Our Commitment</h4>
                                <p className="text-sm text-gray-600">We strive for 99.9% uptime with scheduled maintenance announced in advance</p>
                            </div>
                            <div className="rounded-xl p-6 border border-gray-200" style={{ backgroundColor: '#F1F4F9' }}>
                                <h4 className="font-semibold text-gray-900 mb-2">No Guarantees</h4>
                                <p className="text-sm text-gray-600">Service provided "as is" without guarantee of uninterrupted access</p>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimers */}
                    <div className="mb-12">
                        <div className="rounded-2xl p-6 border-2 border-yellow-200 bg-yellow-50">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Disclaimers</h3>
                                    <p className="text-gray-700 mb-3">
                                        THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Limitation of Liability */}
                    <div className="mb-12">
                        <div className="rounded-2xl p-6 border-2 border-red-200 bg-red-50">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h3>
                                    <p className="text-gray-700 mb-3">
                                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR:
                                    </p>
                                    <ul className="space-y-2 text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-600 mt-1">•</span>
                                            <span>Indirect, incidental, or consequential damages</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-600 mt-1">•</span>
                                            <span>Loss of data, profits, or business opportunities</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-600 mt-1">•</span>
                                            <span>Service interruptions or errors</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-600 mt-1">•</span>
                                            <span>Third-party service issues</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="mb-12">
                        <div className="rounded-2xl p-8 bg-gradient-to-br from-[#006397] to-blue-600 text-white shadow-lg">
                            <h2 className="text-3xl font-bold mb-4">Questions About These Terms?</h2>
                            <p className="mb-6 text-white/90">For questions about these Terms of Use, contact us:</p>
                            <div className="space-y-2">
                                <p><strong>Email:</strong> legal@sartthi.com</p>
                                <p><strong>Website:</strong> https://sartthi.com/contact</p>
                            </div>
                        </div>
                    </div>

                    {/* Acknowledgment */}
                    <div className="mb-12">
                        <div className="rounded-2xl p-6 border-2 border-[#006397] bg-blue-50">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Acknowledgment</h3>
                            <p className="text-gray-700">
                                By using Sartthi, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            <SharedFooter />
        </div>
    );
};

export default TermsPage;
