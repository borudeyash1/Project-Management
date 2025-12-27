import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link as LinkIcon, Settings, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ConnectionGuardProps {
    children: React.ReactNode;
    service: 'figma' | 'slack' | 'github' | 'dropbox' | 'notion';
    serviceName: string;
    serviceIcon?: React.ReactNode;
}

const ConnectionGuard: React.FC<ConnectionGuardProps> = ({
    children,
    service,
    serviceName,
    serviceIcon
}) => {
    const { state } = useApp();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            // Check if user has the service connected
            const user = state.userProfile;
            const serviceAccount = (user?.connectedAccounts as any)?.[service];

            if (!serviceAccount?.activeAccountId || !serviceAccount?.accounts?.length) {
                setIsConnected(false);
                setIsChecking(false);
                return;
            }

            setIsConnected(true);
            setIsChecking(false);
        } catch (error) {
            console.error(`${serviceName} connection check error:`, error);
            setIsConnected(false);
            setIsChecking(false);
        }
    };

    if (isChecking) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Checking {serviceName} connection...</p>
                </div>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                    {/* Icon */}
                    <div className="mb-6">
                        <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                            {serviceIcon || <AlertCircle size={32} className="text-orange-600 dark:text-orange-400" />}
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {serviceName} Not Connected
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        You need to connect your {serviceName} account to access {serviceName} features. Connect your account in Settings to get started.
                    </p>

                    {/* Instructions */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <LinkIcon size={16} />
                            How to connect:
                        </h3>
                        <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside">
                            <li>Go to Settings → Connected Accounts</li>
                            <li>Find {serviceName} in the integrations list</li>
                            <li>Click "Connect" and authorize Sartthi</li>
                            <li>Return here to access {serviceName} features</li>
                        </ol>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={() => navigate('/settings')}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Settings size={18} />
                            Open Settings
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ConnectionGuard;
