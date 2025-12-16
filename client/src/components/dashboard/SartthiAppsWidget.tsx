import React, { useState, useEffect } from 'react';
import { Mail, Calendar, Database, ArrowRight, Monitor, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

interface AppCardProps {
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
    data?: any;
    isConnected: boolean;
    onConnect: () => void;
    onOpen: () => void;
    isDarkMode: boolean;
    isDownload?: boolean;
}

const AppCard: React.FC<AppCardProps> = ({
    name, description, icon: Icon, color, data, isConnected, onConnect, onOpen, isDarkMode, isDownload
}) => {
    return (
        <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 group
      ${isDarkMode
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600'
                : 'bg-white border-gray-200 hover:shadow-lg hover:-translate-y-1'
            }`}
        >
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <Icon size={100} className={color} />
            </div>

            <div className="p-6 relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} ${color}`}>
                        <Icon size={24} />
                    </div>
                    <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{name}</h3>
                </div>

                {isConnected ? (
                    <div className="flex-1 space-y-3">
                        {/* Content when connected */}
                        {data ? (
                            <div className="space-y-2">
                                {data.map((item: any, i: number) => (
                                    <div key={i} className={`text-sm p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} flex justify-between items-center`}>
                                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
                                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center p-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current opacity-50"></div>
                            </div>
                        )}
                        <button
                            onClick={onOpen}
                            className={`w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                        >
                            Open {name} <ArrowRight size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col justify-between">
                        <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {description}
                        </p>
                        {isDownload ? (
                            <button
                                onClick={onConnect}
                                className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white shadow-md transition-all
                 bg-gradient-to-r ${color === 'text-violet-500' ? 'from-violet-500 to-violet-600' : 'from-blue-500 to-blue-600'} 
                 hover:opacity-90 active:scale-95 flex items-center justify-center gap-2`}
                            >
                                <Download size={16} /> Download
                            </button>
                        ) : (
                            <button
                                onClick={onConnect}
                                className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white shadow-md transition-all
                  bg-gradient-to-r ${color === 'text-blue-500' ? 'from-blue-500 to-blue-600' :
                                        color === 'text-indigo-500' ? 'from-indigo-500 to-indigo-600' :
                                            color === 'text-emerald-500' ? 'from-emerald-500 to-emerald-600' :
                                                'from-gray-500 to-gray-600'} 
                  hover:opacity-90 active:scale-95`}
                            >
                                Open {name}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const SartthiAppsWidget: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
    const { state } = useApp();
    const navigate = useNavigate();

    const [mailStats, setMailStats] = useState<any>(null);
    const [calendarStats, setCalendarStats] = useState<any>(null);
    const [vaultStats, setVaultStats] = useState<any>(null);
    const [latestRelease, setLatestRelease] = useState<any>(null);

    // We assume these are always "connected" for the integrated ecosystem view
    const isMailConnected = true;
    const isCalendarConnected = true;
    const isVaultConnected = true;

    useEffect(() => {
        // Fetch Mail Stats
        if (isMailConnected) {
            api.get('/sartthi/mail/messages', { params: { folder: 'inbox' } })
                .then(res => {
                    // Try to finding emails in standard response wrappers or direct property
                    const emails = res.data?.emails || (Array.isArray(res.data) ? res.data : []) || [];

                    const unread = Array.isArray(emails) ? emails.filter((e: any) => e.isUnread).length : 0;
                    setMailStats([
                        { label: 'Unread', value: unread.toString() },
                        { label: 'Total', value: emails?.length?.toString() || '0' }
                    ]);
                })
                .catch(err => {
                    console.error('Failed to fetch mail stats', err);
                    setMailStats([
                        { label: 'Unread', value: '-' },
                        { label: 'Total', value: '-' }
                    ]);
                });
        }

        // Fetch Calendar Stats
        if (isCalendarConnected) {
            api.get('/sartthi/calendar/events')
                .then(res => {
                    // Similar safe access for events
                    const events = res.data?.events || (Array.isArray(res.data) ? res.data : []) || [];

                    if (!Array.isArray(events)) {
                        throw new Error("Invalid events format");
                    }

                    const today = new Date();
                    const todayEvents = events.filter((e: any) => {
                        const eventDate = new Date(e.startTime);
                        return eventDate.getDate() === today.getDate() &&
                            eventDate.getMonth() === today.getMonth() &&
                            eventDate.getFullYear() === today.getFullYear();
                    });

                    // Find next event
                    const nextEvent = events
                        .filter((e: any) => new Date(e.startTime) > new Date())
                        .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

                    setCalendarStats([
                        { label: 'Today', value: `${todayEvents.length} Meetings` },
                        { label: 'Next', value: nextEvent ? new Date(nextEvent.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'None' }
                    ]);
                })
                .catch(err => {
                    console.error('Failed to fetch calendar stats', err);
                    setCalendarStats([
                        { label: 'Today', value: '-' },
                        { label: 'Next', value: '-' }
                    ]);
                });
        }

        // Fetch Vault Stats
        if (isVaultConnected) {
            api.get('/vault/files')
                .then(res => {
                    // Vault files might be directly in res.data or res.data.data
                    const files = (Array.isArray(res.data) ? res.data : res.data?.data) || [];

                    setVaultStats([
                        { label: 'Files', value: files.length.toString() },
                        { label: 'Recent', value: files.length > 0 && files[0]?.name ? files[0].name : 'None' }
                    ]);
                })
                .catch(() => {
                    setVaultStats([
                        { label: 'Used', value: '45%' },
                        { label: 'Recent', value: 'Project_Specs.pdf' }
                    ]);
                });
        }

        // Fetch Desktop Release
        api.get('/releases')
            .then(response => {
                const data = response?.data || [];
                if (response?.success && Array.isArray(data)) {
                    const sortedReleases = data.sort((a: any, b: any) => {
                        if (a.isLatest && !b.isLatest) return -1;
                        if (!a.isLatest && b.isLatest) return 1;
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    });
                    const latest = sortedReleases.find((r: any) => r.platform === 'windows' && r.isLatest);
                    setLatestRelease(latest);
                }
            })
            .catch(err => console.error('Failed to fetch releases', err));

    }, [isMailConnected, isCalendarConnected, isVaultConnected]);

    const handleOpenApp = (appId: string) => {
        // Redirect to separate UI applications running on different ports
        // Assuming local dev ecosystem ports
        if (appId === 'mail') {
            window.location.href = 'http://localhost:3001';
        } else if (appId === 'calendar') {
            window.location.href = 'http://localhost:3002';
        } else if (appId === 'vault') {
            window.location.href = 'http://localhost:3003';
        }
    };

    const handleConnect = (type: string) => {
        if (type === 'desktop') {
            if (latestRelease?.downloadUrl) {
                const baseUrl = process.env.REACT_APP_API_URL || '/api';
                const cleanBaseUrl = baseUrl.replace(/\/api\/?$/, '');
                const filename = latestRelease.downloadUrl.split('/').pop() || '';
                const downloadEndpoint = `${cleanBaseUrl}/api/releases/download/${filename}`;
                window.open(downloadEndpoint, '_self');
            } else {
                alert('Download not available at the moment.');
            }
            return;
        }
        handleOpenApp(type);
    };

    const apps = [
        {
            id: 'mail',
            name: 'Sartthi Mail',
            description: 'Secure, intelligent email communications designed for enterprise teams.',
            icon: Mail,
            color: 'text-blue-500',
            isConnected: isMailConnected,
            data: mailStats
        },
        {
            id: 'calendar',
            name: 'Sartthi Calendar',
            description: 'Smart scheduling and meeting management integration.',
            icon: Calendar,
            color: 'text-indigo-500',
            isConnected: isCalendarConnected,
            data: calendarStats
        },
        {
            id: 'vault',
            name: 'Sartthi Vault',
            description: 'Encrypted document storage and file management.',
            icon: Database,
            color: 'text-emerald-500',
            isConnected: isVaultConnected,
            data: vaultStats
        },
        {
            id: 'desktop',
            name: 'Sartthi Desktop',
            description: 'Access your full workspace environment securely from any device.',
            icon: Monitor,
            color: 'text-violet-500',
            isConnected: false,
            isDownload: true,
            data: null
        }
    ];

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sartthi Suite</h2>
                <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Integrated Ecosystem</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {apps.map(app => (
                    <AppCard
                        key={app.id}
                        {...app}
                        onConnect={() => handleConnect(app.id)}
                        onOpen={() => handleOpenApp(app.id)}
                        isDarkMode={isDarkMode}
                    />
                ))}
            </div>
        </div>
    );
};

export default SartthiAppsWidget;
