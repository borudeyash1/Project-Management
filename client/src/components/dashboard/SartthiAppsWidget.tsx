import React, { useState, useEffect } from 'react';
import { Mail, Calendar as CalendarIcon, HardDrive, ArrowRight, Loader, CheckCircle2, Lock, X, ExternalLink, Clock, User, Folder, File, Maximize2, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import SartthiAppGuide from './SartthiAppGuide';
import SartthiOnboardingGuide from './SartthiOnboardingGuide';
import { useApp } from '../../context/AppContext';

interface EmailData {
    account: { email: string; name: string; avatar?: string } | null;
    emails: Array<{
        id: string;
        from: string;
        subject: string;
        snippet: string;
        isUnread: boolean;
        date?: string;
    }>;
}

interface CalendarData {
    account: { email: string; name: string; avatar?: string } | null;
    events: Array<{
        id: string;
        title: string;
        start: string;
        end: string;
        description?: string;
        location?: string;
    }>;
}

interface VaultData {
    account: { email: string; name: string; avatar?: string } | null;
    storage: { used: number; total: number };
    recentFiles: Array<{
        id: string;
        name: string;
        mimeType: string;
        modifiedTime?: string;
        size?: number;
    }>;
}

const AppCard: React.FC<{
    icon: React.ElementType;
    title: string;
    description: string;
    isConnected: boolean;
    data?: React.ReactNode;
    onConnect: () => void;
    onExpand: () => void;
    onOpenApp: () => void;
    color: string;
    link: string;
    loading?: boolean;
}> = ({ icon: Icon, title, description, isConnected, data, onConnect, onExpand, onOpenApp, color, link, loading }) => {
    const { isDarkMode } = useTheme();
    const { t } = useTranslation();

    return (
        <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 group ${isDarkMode
            ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
            : 'bg-white border-gray-100 hover:border-blue-100 shadow-sm hover:shadow-md'
            }`}>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.03] rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110`} />

            <div className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} group-hover:scale-105 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`} />
                    </div>
                    {isConnected ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-3 h-3" />
                            {t('home.connected')}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full bg-gray-500/10 text-gray-500">
                            <Lock className="w-3 h-3" />
                            {t('home.notConnected')}
                        </span>
                    )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">
                    {description}
                </p>


                <div className="mt-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader className="w-5 h-5 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <>
                            {isConnected && (
                                <div className="space-y-3 mb-4">
                                    {data}
                                </div>
                            )}
                            {!isConnected && (
                                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        {t('home.connectAccountMessage')} {title}
                                    </p>
                                </div>
                            )}
                            <div className="flex gap-2">
                                {isConnected && (
                                    <button
                                        onClick={onExpand}
                                        className={`flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition-all ${isDarkMode
                                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                        {t('home.viewDetails')}
                                    </button>
                                )}
                                <button
                                    onClick={isConnected ? onOpenApp : onConnect}
                                    className={`flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-all ${isConnected
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-orange-600 text-white hover:bg-orange-700'
                                        }`}
                                >
                                    {isConnected ? (
                                        <>
                                            {title.includes('Mail') ? t('home.openMail') : title.includes('Calendar') ? t('home.openCalendar') : t('home.openVault')} <ExternalLink className="w-4 h-4" />
                                        </>
                                    ) : (
                                        <>
                                            {t('home.connectAccount')} <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const DetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon: React.ElementType;
    color: string;
    children: React.ReactNode;
}> = ({ isOpen, onClose, title, icon: Icon, color, children }) => {
    const { isDarkMode } = useTheme();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className={`relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    } shadow-2xl`}
            >
                {/* Header */}
                <div className={`sticky top-0 z-10 px-6 py-4 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {title}
                                </h2>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Detailed view
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg transition-colors ${isDarkMode
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

const SartthiAppsWidget: React.FC = () => {
    const { t } = useTranslation();
    const { isDarkMode } = useTheme();
    const { state } = useApp();
    const navigate = useNavigate();

    const [mailData, setMailData] = useState<EmailData | null>(null);
    const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
    const [vaultData, setVaultData] = useState<VaultData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showGuide, setShowGuide] = useState<'mail' | 'calendar' | 'vault' | null>(null);
    const [expandedView, setExpandedView] = useState<'mail' | 'calendar' | 'vault' | null>(null);
    const [showOnboarding, setShowOnboarding] = useState<'mail' | 'calendar' | 'vault' | null>(null);

    const isMailConnected =
        state.userProfile?.modules?.mail?.isEnabled ||
        !!state.userProfile?.connectedAccounts?.mail?.activeAccountId ||
        !!mailData?.account;
    const isCalendarConnected =
        state.userProfile?.modules?.calendar?.isEnabled ||
        !!state.userProfile?.connectedAccounts?.calendar?.activeAccountId ||
        !!calendarData?.account;
    const isVaultConnected =
        state.userProfile?.modules?.vault?.isEnabled ||
        !!state.userProfile?.connectedAccounts?.vault?.activeAccountId ||
        !!vaultData?.account;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [mail, calendar, vault] = await Promise.all([
                apiService.get('/sartthi-data/mail/recent?limit=10'),
                apiService.get('/sartthi-data/calendar/upcoming?days=30'),
                apiService.get('/sartthi-data/vault/summary')
            ]);

            if (mail.success) setMailData(mail.data);
            if (calendar.success) setCalendarData(calendar.data);
            if (vault.success) setVaultData(vault.data);
        } catch (error) {
            console.error('Failed to fetch Sartthi data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = (service: 'mail' | 'calendar' | 'vault') => {
        // Navigate to settings page with the service tab selected
        navigate('/settings', { state: { activeTab: 'connected-accounts', service } });
    };

    const handleOpenApp = (service: 'mail' | 'calendar' | 'vault', link: string) => {
        // Check if user has completed the onboarding guide
        const guideCompleted = localStorage.getItem(`sartthi-${service}-guide-completed`);

        if (!guideCompleted) {
            // Show onboarding guide for first-time users
            setShowOnboarding(service);
        } else {
            // Open app directly
            const token = localStorage.getItem('accessToken');
            if (token) {
                const separator = link.includes('?') ? '&' : '?';
                const authUrl = `${link}${separator}token=${token}`;
                window.open(authUrl, '_blank');
            } else {
                window.open(link, '_blank');
            }
        }
    };

    const handleOnboardingComplete = (service: 'mail' | 'calendar' | 'vault', link: string) => {
        // Open the app after onboarding is complete
        const token = localStorage.getItem('accessToken');
        if (token) {
            const separator = link.includes('?') ? '&' : '?';
            const authUrl = `${link}${separator}token=${token}`;
            window.open(authUrl, '_blank');
        } else {
            window.open(link, '_blank');
        }
    };

    const handleOpenEmail = (emailId: string) => {
        const token = localStorage.getItem('accessToken');
        const url = `http://localhost:3001?token=${token}&emailId=${emailId}`;
        window.open(url, '_blank');
    };

    const handleOpenEvent = (eventId: string) => {
        const token = localStorage.getItem('accessToken');
        const url = `http://localhost:3002?token=${token}&eventId=${eventId}`;
        window.open(url, '_blank');
    };

    const handleOpenFile = (fileId: string) => {
        const token = localStorage.getItem('accessToken');
        const url = `http://localhost:3003?token=${token}&fileId=${fileId}`;
        window.open(url, '_blank');
    };

    const formatBytes = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const mailContent = mailData?.account ? (
        <>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {mailData.account.name} ({mailData.account.email})
            </div>
            {mailData.emails.length > 0 ? (
                mailData.emails.slice(0, 3).map((email, idx) => (
                    <div key={idx} className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} truncate`}>
                        <span className={email.isUnread ? 'font-semibold' : ''}>{email.subject || 'No Subject'}</span>
                    </div>
                ))
            ) : (
                <div className="text-xs text-gray-400">{t('home.noRecentEmails')}</div>
            )}
        </>
    ) : null;

    const calendarContent = calendarData?.account ? (
        <>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {calendarData.account.name}
            </div>
            {calendarData.events.length > 0 ? (
                calendarData.events.slice(0, 3).map((event, idx) => (
                    <div key={idx} className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-gray-400">{formatDate(event.start)}</div>
                    </div>
                ))
            ) : (
                <div className="text-xs text-gray-400">{t('home.noUpcomingEvents')}</div>
            )}
        </>
    ) : null;

    const vaultContent = vaultData?.account ? (
        <>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {vaultData.account.name}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
                Storage: {formatBytes(vaultData.storage.used)} / {formatBytes(vaultData.storage.total)}
            </div>
            {vaultData.recentFiles.length > 0 && (
                <div className="text-xs text-gray-400">
                    {vaultData.recentFiles.length} recent file{vaultData.recentFiles.length !== 1 ? 's' : ''}
                </div>
            )}
        </>
    ) : null;

    return (
        <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AppCard
                    icon={Mail}
                    title={t('home.sartthiMail')}
                    description={t('home.sartthiMailDesc')}
                    isConnected={!!mailData?.account}
                    data={mailContent}
                    onConnect={() => handleConnect('mail')}
                    onExpand={() => setExpandedView('mail')}
                    onOpenApp={() => handleOpenApp('mail', 'http://localhost:3001')}
                    color="from-blue-500 to-cyan-500"
                    link="http://localhost:3001"
                    loading={loading}
                />

                <AppCard
                    icon={CalendarIcon}
                    title={t('home.sartthiCalendar')}
                    description={t('home.sartthiCalendarDesc')}
                    isConnected={!!calendarData?.account}
                    data={calendarContent}
                    onConnect={() => handleConnect('calendar')}
                    onExpand={() => setExpandedView('calendar')}
                    onOpenApp={() => handleOpenApp('calendar', 'http://localhost:3002')}
                    color="from-purple-500 to-pink-500"
                    link="http://localhost:3002"
                    loading={loading}
                />

                <AppCard
                    icon={HardDrive}
                    title={t('home.sartthiVault')}
                    description={t('home.sartthiVaultDesc')}
                    isConnected={!!vaultData?.account}
                    data={vaultContent}
                    onConnect={() => handleConnect('vault')}
                    onExpand={() => setExpandedView('vault')}
                    onOpenApp={() => handleOpenApp('vault', 'http://localhost:3003')}
                    color="from-green-500 to-emerald-500"
                    link="http://localhost:3003"
                    loading={loading}
                />
            </div>

            {/* Mail Detail Modal */}
            <DetailModal
                isOpen={expandedView === 'mail'}
                onClose={() => setExpandedView(null)}
                title={t('home.sartthiMail')}
                icon={Mail}
                color="from-blue-500 to-cyan-500"
            >
                {mailData?.account && (
                    <div className="space-y-4">
                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                                    {mailData.account.name.charAt(0)}
                                </div>
                                <div>
                                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {mailData.account.name}
                                    </p>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {mailData.account.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Recent Emails ({mailData.emails.length})
                            </h3>
                            <div className="space-y-2">
                                {mailData.emails.map((email) => (
                                    <div
                                        key={email.id}
                                        onClick={() => handleOpenEmail(email.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${isDarkMode
                                            ? 'bg-gray-700/30 border-gray-600 hover:border-blue-500'
                                            : 'bg-white border-gray-200 hover:border-blue-500 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {email.from}
                                                    </p>
                                                </div>
                                                <p className={`font-semibold mb-1 ${email.isUnread
                                                    ? isDarkMode ? 'text-white' : 'text-gray-900'
                                                    : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                    }`}>
                                                    {email.subject || 'No Subject'}
                                                </p>
                                                <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {email.snippet}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {email.isUnread && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded-full">
                                                        New
                                                    </span>
                                                )}
                                                {email.date && (
                                                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        {formatDate(email.date)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </DetailModal>

            {/* Calendar Detail Modal */}
            <DetailModal
                isOpen={expandedView === 'calendar'}
                onClose={() => setExpandedView(null)}
                title={t('home.sartthiCalendar')}
                icon={CalendarIcon}
                color="from-purple-500 to-pink-500"
            >
                {calendarData?.account && (
                    <div className="space-y-4">
                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                                    {calendarData.account.name.charAt(0)}
                                </div>
                                <div>
                                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {calendarData.account.name}
                                    </p>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {calendarData.account.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Upcoming Events ({calendarData.events.length})
                            </h3>
                            <div className="space-y-2">
                                {calendarData.events.map((event) => (
                                    <div
                                        key={event.id}
                                        onClick={() => handleOpenEvent(event.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${isDarkMode
                                            ? 'bg-gray-700/30 border-gray-600 hover:border-purple-500'
                                            : 'bg-white border-gray-200 hover:border-purple-500 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                                                <CalendarIcon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {event.title}
                                                </p>
                                                {event.description && (
                                                    <p className={`text-sm mb-2 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {event.description}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-3 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                                            {new Date(event.start).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    {event.location && (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                                                {event.location}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </DetailModal>

            {/* Vault Detail Modal */}
            <DetailModal
                isOpen={expandedView === 'vault'}
                onClose={() => setExpandedView(null)}
                title={t('home.sartthiVault')}
                icon={HardDrive}
                color="from-green-500 to-emerald-500"
            >
                {vaultData?.account && (
                    <div className="space-y-4">
                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                                        {vaultData.account.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {vaultData.account.name}
                                        </p>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {vaultData.account.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {formatBytes(vaultData.storage.used)}
                                    </p>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        of {formatBytes(vaultData.storage.total)}
                                    </p>
                                </div>
                            </div>
                            <div className={`mt-3 h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                    style={{ width: `${(vaultData.storage.used / vaultData.storage.total) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Recent Files ({vaultData.recentFiles.length})
                            </h3>
                            <div className="space-y-2">
                                {vaultData.recentFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        onClick={() => handleOpenFile(file.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${isDarkMode
                                            ? 'bg-gray-700/30 border-gray-600 hover:border-green-500'
                                            : 'bg-white border-gray-200 hover:border-green-500 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                                                <File className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {file.name}
                                                </p>
                                                <div className="flex items-center gap-3 text-sm mt-1">
                                                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                                        {file.mimeType}
                                                    </span>
                                                    {file.size && (
                                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                                            {formatBytes(file.size)}
                                                        </span>
                                                    )}
                                                    {file.modifiedTime && (
                                                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                                                            {formatDate(file.modifiedTime)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </DetailModal>

            {/* Tutorial Modals */}
            <SartthiAppGuide
                service="mail"
                isOpen={showGuide === 'mail'}
                onClose={() => setShowGuide(null)}
            />
            <SartthiAppGuide
                service="calendar"
                isOpen={showGuide === 'calendar'}
                onClose={() => setShowGuide(null)}
            />
            <SartthiAppGuide
                service="vault"
                isOpen={showGuide === 'vault'}
                onClose={() => setShowGuide(null)}
            />

            {/* Onboarding Guides */}
            <SartthiOnboardingGuide
                service="mail"
                isOpen={showOnboarding === 'mail'}
                onClose={() => setShowOnboarding(null)}
                onComplete={() => handleOnboardingComplete('mail', 'http://localhost:3001')}
            />
            <SartthiOnboardingGuide
                service="calendar"
                isOpen={showOnboarding === 'calendar'}
                onClose={() => setShowOnboarding(null)}
                onComplete={() => handleOnboardingComplete('calendar', 'http://localhost:3002')}
            />
            <SartthiOnboardingGuide
                service="vault"
                isOpen={showOnboarding === 'vault'}
                onClose={() => setShowOnboarding(null)}
                onComplete={() => handleOnboardingComplete('vault', 'http://localhost:3003')}
            />
        </div>
    );
};

export default SartthiAppsWidget;
