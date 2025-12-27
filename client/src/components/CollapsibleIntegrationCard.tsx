import React, { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntegrationCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
    isConnected: boolean;
    accounts: any[];
    activeAccount: any | null;
    onConnect: () => void;
    onDisconnect: (accountId: string) => void;
    onSetActive: (accountId: string) => void;
    loading?: boolean;
    apiConsoleUrl?: string;
    children?: React.ReactNode;
}

export const CollapsibleIntegrationCard: React.FC<IntegrationCardProps> = ({
    icon,
    title,
    description,
    color,
    bgColor,
    borderColor,
    isConnected,
    accounts,
    activeAccount,
    onConnect,
    onDisconnect,
    onSetActive,
    loading = false,
    apiConsoleUrl,
    children
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`rounded-lg border ${borderColor} ${bgColor} overflow-hidden transition-all duration-200`}>
            {/* Header - Always Visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4 flex-1">
                    <div className={`${color} ${bgColor} p-3 rounded-lg flex-shrink-0`}>
                        {icon}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            {title}
                        </h3>
                        {isConnected && accounts.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                {accounts.map((account) => (
                                    <div
                                        key={account._id}
                                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${account.isActive
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        {account.providerAvatar ? (
                                            <img
                                                src={account.providerAvatar}
                                                alt={account.providerName}
                                                className="w-3.5 h-3.5 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[8px] font-bold">
                                                {(account.providerName || account.providerEmail || '?')[0].toUpperCase()}
                                            </div>
                                        )}
                                        <span className="truncate max-w-[150px]">
                                            {account.providerEmail || account.providerName}
                                        </span>
                                        {account.isActive && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Active Account"></span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{description}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <div
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-help"
                        title="Documentation (Coming Soon)"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Future: Open docs link
                        }}
                    >
                        <Info className="w-4 h-4" />
                    </div>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                </div>
            </button>

            {/* Collapsible Content */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                            {/* Connected Accounts */}
                            {accounts.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Connected Accounts
                                    </h4>
                                    <div className="space-y-2">
                                        {accounts.map((account) => (
                                            <div
                                                key={account._id}
                                                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {account.providerAvatar && (
                                                        <img
                                                            src={account.providerAvatar}
                                                            alt={account.providerName}
                                                            className="w-8 h-8 rounded-full"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {account.providerName || account.providerEmail}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {account.providerEmail}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {account.isActive && (
                                                        <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-1 rounded">
                                                            Active
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => onDisconnect(account._id)}
                                                        disabled={loading}
                                                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    >
                                                        Disconnect
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Custom Content (e.g., Notion database selector) */}
                            {children}

                            {/* Connect Button */}
                            <button
                                onClick={onConnect}
                                disabled={loading}
                                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${isConnected
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    : `${bgColor} ${color} hover:opacity-80`
                                    }`}
                            >
                                {loading ? 'Connecting...' : isConnected ? 'Add Another Account' : `Connect ${title}`}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CollapsibleIntegrationCard;
