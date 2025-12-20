import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false,
}) => {
    const { isDarkMode } = useTheme();

    if (!isOpen) return null;

    const variantConfig = {
        danger: {
            icon: AlertTriangle,
            iconBg: 'bg-red-100 dark:bg-red-900/30',
            iconColor: 'text-red-600 dark:text-red-400',
            confirmBg: 'bg-red-600 hover:bg-red-700',
            confirmText: 'text-white',
        },
        warning: {
            icon: AlertTriangle,
            iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
            iconColor: 'text-yellow-600 dark:text-yellow-400',
            confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
            confirmText: 'text-white',
        },
        info: {
            icon: Info,
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600 dark:text-blue-400',
            confirmBg: 'bg-blue-600 hover:bg-blue-700',
            confirmText: 'text-white',
        },
    };

    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div
                className={`relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl transform transition-all animate-scaleIn ${isDarkMode
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-white border border-gray-200'
                    }`}
            >
                {/* Header */}
                <div className="p-6 pb-4">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${config.iconBg}`}>
                            <Icon className={`w-6 h-6 ${config.iconColor}`} />
                        </div>
                        <div className="flex-1">
                            <h3
                                className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}
                            >
                                {title}
                            </h3>
                            <p
                                className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}
                            >
                                {message}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className={`p-1 rounded-lg transition-colors ${isDarkMode
                                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div
                    className={`px-6 py-4 flex gap-3 border-t ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}
                >
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all ${isDarkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all ${config.confirmBg} ${config.confirmText} shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg
                                    className="animate-spin h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
