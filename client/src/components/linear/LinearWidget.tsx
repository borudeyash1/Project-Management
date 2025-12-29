import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, X, ExternalLink, Circle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { linearService } from '../../services/linearService';
import { LinearTeam, LinearIssue } from '../../types/linear';

// Helper function to get active workspace ID
const getActiveWorkspaceId = (): string | null => {
    const path = window.location.pathname;
    const match = path.match(/\/workspace\/([^\/]+)/);
    return match ? match[1] : null;
};

const LinearWidget: React.FC = () => {
    const navigate = useNavigate();
    const { state } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [teams, setTeams] = useState<LinearTeam[]>([]);
    const [issues, setIssues] = useState<LinearIssue[]>([]);
    const [loading, setLoading] = useState(true);

    const linearConnected = !!state.userProfile?.connectedAccounts?.linear?.activeAccountId;

    // Handle toggle event
    useEffect(() => {
        const handleToggle = () => {
            setIsOpen(prev => !prev);
        };

        window.addEventListener('TOGGLE_LINEAR_WIDGET', handleToggle);

        return () => {
            window.removeEventListener('TOGGLE_LINEAR_WIDGET', handleToggle);
        };
    }, []);

    useEffect(() => {
        if (isOpen && linearConnected) {
            fetchData();
        }
    }, [isOpen, linearConnected]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch teams
            const teamsData = await linearService.getTeams();
            setTeams(teamsData);

            // Fetch recent issues from all teams (limit to 10 most recent)
            const allIssues: LinearIssue[] = [];
            for (const team of teamsData.slice(0, 3)) { // Only fetch from first 3 teams to avoid too many requests
                const teamIssues = await linearService.getIssues(team.id);
                allIssues.push(...teamIssues);
            }

            // Sort by updated date and take 10 most recent
            const sortedIssues = allIssues
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 10);

            setIssues(sortedIssues);
        } catch (error) {
            console.error('Failed to fetch Linear data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleIssueClick = (issue: LinearIssue) => {
        const workspaceId = getActiveWorkspaceId();
        if (workspaceId) {
            navigate(`/workspace/${workspaceId}/linear`);
            setIsOpen(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const getPriorityIcon = (priority: number) => {
        if (priority === 1) return '🔴';
        if (priority === 2) return '🟠';
        if (priority === 3) return '🟡';
        if (priority === 4) return '🔵';
        return '';
    };

    const getStatusColor = (stateType: string) => {
        if (stateType === 'completed') return 'text-green-500';
        if (stateType === 'started') return 'text-yellow-500';
        if (stateType === 'canceled') return 'text-red-500';
        return 'text-gray-400';
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
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-600 rounded-lg">
                                        <Target size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Linear</h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Recent Issues</p>
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
                            {!linearConnected ? (
                                <div className="p-6 text-center">
                                    <Target size={48} className="mx-auto mb-3 text-gray-400" />
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                        Linear Not Connected
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Connect Linear to see your issues
                                    </p>
                                    <button
                                        onClick={() => {
                                            window.location.href = '/profile?tab=integrations';
                                            handleClose();
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        Connect Linear
                                    </button>
                                </div>
                            ) : loading ? (
                                <div className="p-8 flex items-center justify-center">
                                    <Loader className="w-6 h-6 animate-spin text-blue-600" />
                                </div>
                            ) : issues.length === 0 ? (
                                <div className="p-6 text-center">
                                    <Target size={48} className="mx-auto mb-3 text-gray-400" />
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                        No Issues Found
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Create your first issue in Linear
                                    </p>
                                </div>
                            ) : (
                                <div className="p-3 space-y-2">
                                    {issues.map(issue => (
                                        <div
                                            key={issue.id}
                                            onClick={() => handleIssueClick(issue)}
                                            className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-start gap-2 mb-2">
                                                <Circle
                                                    className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${getStatusColor(issue.state.type)}`}
                                                    fill={issue.state.type === 'completed' ? 'currentColor' : 'none'}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                                            {issue.identifier}
                                                        </span>
                                                        {issue.priority > 0 && (
                                                            <span className="text-xs">{getPriorityIcon(issue.priority)}</span>
                                                        )}
                                                    </div>
                                                    <h5 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {issue.title}
                                                    </h5>
                                                </div>
                                                <a
                                                    href={issue.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 hover:text-blue-600" />
                                                </a>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <span
                                                    className="px-1.5 py-0.5 rounded text-xs"
                                                    style={{
                                                        backgroundColor: `${issue.state.color}20`,
                                                        color: issue.state.color
                                                    }}
                                                >
                                                    {issue.state.name}
                                                </span>
                                                {issue.assignee && (
                                                    <span className="flex items-center gap-1">
                                                        {issue.assignee.avatarUrl ? (
                                                            <img
                                                                src={issue.assignee.avatarUrl}
                                                                alt={issue.assignee.name}
                                                                className="w-4 h-4 rounded-full"
                                                            />
                                                        ) : (
                                                            <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600" />
                                                        )}
                                                        <span className="truncate max-w-[100px]">{issue.assignee.name}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {linearConnected && issues.length > 0 && (
                            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <button
                                    onClick={() => {
                                        const workspaceId = getActiveWorkspaceId();
                                        if (workspaceId) {
                                            navigate(`/workspace/${workspaceId}/linear`);
                                            handleClose();
                                        }
                                    }}
                                    className="w-full px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                >
                                    View All Issues
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LinearWidget;
