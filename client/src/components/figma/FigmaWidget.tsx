import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { figmaService } from '../../services/figmaService'; // You'll need to create this service
import { FigmaLogo } from '../icons/BrandLogos';

// Helper function to get active workspace ID
const getActiveWorkspaceId = (): string | null => {
    const path = window.location.pathname;
    const match = path.match(/\/workspace\/([^\/]+)/);
    return match ? match[1] : null;
};

const FigmaWidget: React.FC = () => {
    const navigate = useNavigate();
    const { state } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const figmaConnected = !!state.userProfile?.connectedAccounts?.figma?.activeAccountId;

    // Handle toggle event
    useEffect(() => {
        const handleToggle = () => {
            setIsOpen(prev => !prev);
        };

        window.addEventListener('TOGGLE_FIGMA_WIDGET', handleToggle);

        return () => {
            window.removeEventListener('TOGGLE_FIGMA_WIDGET', handleToggle);
        };
    }, []);

    useEffect(() => {
        if (isOpen && figmaConnected) {
            fetchData();
        }
    }, [isOpen, figmaConnected]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const workspaceId = getActiveWorkspaceId();
            if (workspaceId) {
                // Fetch designs saved in the workspace as a proxy for "Recent Files"
                // Or you could implement a real "recent files" fetch from Figma API in figmaService
                const designs = await figmaService.getWorkspaceDesigns(workspaceId);
                setFiles(designs.slice(0, 5)); // Limit to 5
            }
        } catch (error) {
            console.error('Failed to fetch Figma data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileClick = (file: any) => {
        // Open file in Figma
        window.open(file.fileUrl || `https://www.figma.com/file/${file.fileKey}`, '_blank');
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
                    />

                    {/* Widget */}
                    <motion.div
                        initial={{ opacity: 0, x: 20, y: 20 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: 20, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-20 right-6 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-[#1e1e1e] rounded-lg"> {/* Figma dark bg */}
                                        <FigmaLogo size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Figma</h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Recent Designs</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X size={18} className="text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="max-h-[500px] overflow-y-auto">
                            {!figmaConnected ? (
                                <div className="p-6 text-center">
                                    <FigmaLogo size={48} className="mx-auto mb-3 opacity-50" />
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                        Figma Not Connected
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Connect Figma to access your designs
                                    </p>
                                    <button
                                        onClick={() => {
                                            window.location.href = '/profile?tab=integrations';
                                            handleClose();
                                        }}
                                        className="px-4 py-2 bg-[#0ACF83] text-white rounded-lg hover:bg-[#09B772] transition-colors text-sm font-medium"
                                    >
                                        Connect Figma
                                    </button>
                                </div>
                            ) : loading ? (
                                <div className="p-8 flex items-center justify-center">
                                    <Loader className="w-6 h-6 animate-spin text-purple-600" />
                                </div>
                            ) : files.length === 0 ? (
                                <div className="p-6 text-center">
                                    <FigmaLogo size={48} className="mx-auto mb-3 opacity-50" />
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                        No Designs Found
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Add designs to your workspace project tabs
                                    </p>
                                </div>
                            ) : (
                                <div className="p-3 space-y-2">
                                    {files.map((file, index) => (
                                        <div
                                            key={file._id || index}
                                            onClick={() => handleFileClick(file)}
                                            className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Thumbnail if available */}
                                                {file.thumbnailUrl ? (
                                                    <img src={file.thumbnailUrl} alt={file.name} className="w-10 h-10 rounded object-cover bg-gray-200" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                                        <FigmaLogo size={20} />
                                                    </div>
                                                )}

                                                <div className="flex-1 min-w-0">
                                                    <h5 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                        {file.name}
                                                    </h5>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {file.project?.name || 'Workspace Design'}
                                                    </p>
                                                </div>

                                                <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <button
                                onClick={() => {
                                    const workspaceId = getActiveWorkspaceId();
                                    if (workspaceId) {
                                        navigate(`/workspace/${workspaceId}/design`); // Navigate to the renamed tab
                                        handleClose();
                                    }
                                }}
                                className="w-full px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            >
                                Go to Figma Tab
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FigmaWidget;
