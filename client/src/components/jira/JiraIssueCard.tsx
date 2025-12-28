import React, { useState } from 'react';
import { ExternalLink, User, Calendar, Tag, ArrowUp, ArrowDown, Minus, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface JiraIssueCardProps {
    issue: any;
    onUpdate: () => void;
}

const JiraIssueCard: React.FC<JiraIssueCardProps> = ({ issue, onUpdate }) => {
    const { addToast } = useApp();
    const [isExpanded, setIsExpanded] = useState(false);

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'highest':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'high':
                return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'low':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'lowest':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getStatusColor = (status: string) => {
        const lower = status?.toLowerCase();
        if (lower?.includes('done') || lower?.includes('closed')) {
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        } else if (lower?.includes('progress')) {
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        } else {
            return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'bug':
                return '🐛';
            case 'story':
                return '📖';
            case 'task':
                return '✅';
            case 'epic':
                return '⚡';
            default:
                return '📋';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'highest':
            case 'high':
                return <ArrowUp size={16} />;
            case 'low':
            case 'lowest':
                return <ArrowDown size={16} />;
            default:
                return <Minus size={16} />;
        }
    };

    const openInJira = () => {
        // Construct Jira URL from issue key
        const baseUrl = issue.jiraProjectKey ? `https://your-domain.atlassian.net` : '';
        window.open(`${baseUrl}/browse/${issue.issueKey}`, '_blank');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:shadow-lg transition-shadow">
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{getTypeIcon(issue.issueType)}</span>
                            <span className="text-sm font-mono text-blue-600 dark:text-blue-400">
                                {issue.issueKey}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                                {issue.status}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getPriorityColor(issue.priority)}`}>
                                {getPriorityIcon(issue.priority)}
                                {issue.priority}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {issue.summary}
                        </h3>
                        {issue.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {issue.description}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={openInJira}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Open in Jira"
                    >
                        <ExternalLink size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {issue.assignee && (
                        <div className="flex items-center gap-1.5">
                            <User size={14} />
                            <span>{issue.assignee.name}</span>
                        </div>
                    )}
                    {issue.jiraProjectName && (
                        <div className="flex items-center gap-1.5">
                            <Tag size={14} />
                            <span>{issue.jiraProjectName}</span>
                        </div>
                    )}
                    {issue.storyPoints && (
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold">{issue.storyPoints} SP</span>
                        </div>
                    )}
                    {issue.comments?.length > 0 && (
                        <div className="flex items-center gap-1.5">
                            <MessageSquare size={14} />
                            <span>{issue.comments.length}</span>
                        </div>
                    )}
                    {issue.linkedTasks?.length > 0 && (
                        <div className="flex items-center gap-1.5">
                            <LinkIcon size={14} />
                            <span>{issue.linkedTasks.length} linked</span>
                        </div>
                    )}
                </div>

                {/* Labels */}
                {issue.labels?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {issue.labels.map((label: string, index: number) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                )}

                {/* Expand Button */}
                {(issue.description || issue.comments?.length > 0) && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                )}

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                        {issue.description && (
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                    {issue.description}
                                </p>
                            </div>
                        )}

                        {issue.comments?.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Comments ({issue.comments.length})
                                </h4>
                                <div className="space-y-2">
                                    {issue.comments.slice(0, 3).map((comment: any, index: number) => (
                                        <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm text-gray-900 dark:text-white">
                                                    {comment.author}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {comment.body}
                                            </p>
                                        </div>
                                    ))}
                                    {issue.comments.length > 3 && (
                                        <p className="text-sm text-gray-500">
                                            +{issue.comments.length - 3} more comments
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JiraIssueCard;
