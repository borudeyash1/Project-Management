import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader, ExternalLink } from 'lucide-react';
import { jiraService, JiraIssue } from '../../services/jiraService';
import { useApp } from '../../context/AppContext';

// Event for toggling
export const toggleJiraWidget = () => {
    window.dispatchEvent(new CustomEvent('TOGGLE_JIRA_WIDGET'));
};

const JiraWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [issues, setIssues] = useState<JiraIssue[]>([]);
    const [loading, setLoading] = useState(false);
    const { state } = useApp();

    const jiraConnected = !!state.userProfile?.connectedAccounts?.jira?.activeAccountId;

    useEffect(() => {
        const handleToggle = () => setIsOpen(prev => !prev);
        window.addEventListener('TOGGLE_JIRA_WIDGET', handleToggle);
        return () => window.removeEventListener('TOGGLE_JIRA_WIDGET', handleToggle);
    }, []);

    useEffect(() => {
        if (isOpen && jiraConnected) {
            fetchIssues();
        }
    }, [isOpen, jiraConnected]);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const data = await jiraService.getRecentIssues();
            setIssues(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!jiraConnected) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-24 right-20 w-80 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-2xl z-[60] overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-white/50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded flex items-center justify-center bg-[#0052CC]/10 border border-[#0052CC]/20">
                                {/* Jira Icon */}
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.53 2.19C11.53 1.53239 12.0641 1 12.7241 1H21.2829C21.8213 1 22.2577 1.43468 22.2577 1.97089V10.4958C22.2577 11.1534 21.7236 11.6858 21.0636 11.6858H12.5048C11.9664 11.6858 11.53 11.2511 11.53 10.7149V2.19Z" fill="#0052CC" />
                                    <path d="M1 12.7149C1 12.0573 1.53412 11.5249 2.19412 11.5249H10.7529C11.2913 11.5249 11.7277 11.9596 11.7277 12.4958V21.0207C11.7277 21.6783 11.1936 22.2107 10.5336 22.2107H1.97479C1.43639 22.2107 1 21.776 1 21.2398V12.7149Z" fill="#0052CC" />
                                    <path d="M11.53 12.7149C11.53 12.0573 12.0641 11.5249 12.7241 11.5249H21.2829C21.8213 11.5249 22.2577 11.9596 22.2577 12.4958V21.0207C22.2577 21.6783 21.7236 22.2107 21.0636 22.2107H12.5048C11.9664 22.2107 11.53 21.776 11.53 21.2398V12.7149Z" fill="#2684FF" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Recent Issues</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    {/* Content List */}
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar bg-white/30 dark:bg-gray-900/30">
                        {loading ? (
                            <div className="py-12 flex justify-center">
                                <Loader className="w-6 h-6 text-[#0052CC] animate-spin" />
                            </div>
                        ) : issues.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {issues.map((issue) => (
                                    <a
                                        key={issue.id}
                                        href={`#`} // Ideally link to Jira or open modal, for now link to project view? or external Jira?
                                        // The user is connected, but we don't have the browse URL easily unless we construct it from config baseUrl (which is hidden in backend)
                                        // We can fallback to just showing items.
                                        // But users want to CLICK.
                                        // Usually issue key works if we know the base URL.
                                        // For now, let's just make it clickable to open in new tab if we can guess url, OR just visual.
                                        onClick={(e) => {
                                            e.preventDefault();
                                            // TODO: Open in local Jira Tab or external
                                            // Ideally open external if we had the URL.
                                        }}
                                        className="block p-3 hover:bg-white dark:hover:bg-gray-800/80 transition-colors group cursor-default"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="shrink-0 mt-0.5">
                                                {issue.type.iconUrl && <img src={issue.type.iconUrl} className="w-4 h-4" alt={issue.type.name} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-[#0052CC] transition-colors">
                                                        {issue.key}
                                                    </span>
                                                    {issue.priority.iconUrl && (
                                                        <img src={issue.priority.iconUrl} className="w-3.5 h-3.5" alt={issue.priority.name} title={issue.priority.name} />
                                                    )}
                                                </div>
                                                <h4 className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug mb-1.5">
                                                    {issue.summary}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]`}
                                                        style={{
                                                            backgroundColor: issue.status.color === 'blue-gray' ? '#DFE1E6' :
                                                                issue.status.color === 'yellow' ? '#FFE380' :
                                                                    issue.status.color === 'green' ? '#E3FCEF' : '#DFE1E6',
                                                            color: '#172B4D'
                                                        }}
                                                    >
                                                        {issue.status.name}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {new Date(issue.updated).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#0052CC]/10 flex items-center justify-center">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-50" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.53 2.19C11.53 1.53239 12.0641 1 12.7241 1H21.2829C21.8213 1 22.2577 1.43468 22.2577 1.97089V10.4958C22.2577 11.1534 21.7236 11.6858 21.0636 11.6858H12.5048C11.9664 11.6858 11.53 11.2511 11.53 10.7149V2.19Z" fill="#0052CC" />
                                        <path d="M1 12.7149C1 12.0573 1.53412 11.5249 2.19412 11.5249H10.7529C11.2913 11.5249 11.7277 11.9596 11.7277 12.4958V21.0207C11.7277 21.6783 11.1936 22.2107 10.5336 22.2107H1.97479C1.43639 22.2107 1 21.776 1 21.2398V12.7149Z" fill="#0052CC" />
                                        <path d="M11.53 12.7149C11.53 12.0573 12.0641 11.5249 12.7241 11.5249H21.2829C21.8213 11.5249 22.2577 11.9596 22.2577 12.4958V21.0207C22.2577 21.6783 21.7236 22.2107 21.0636 22.2107H12.5048C11.9664 22.2107 11.53 21.776 11.53 21.2398V12.7149Z" fill="#2684FF" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium">No assigned issues found</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2 text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-700/50 flex justify-between">
                        <span>Synced from Jira</span>
                        <span>Assigned to you</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default JiraWidget;
