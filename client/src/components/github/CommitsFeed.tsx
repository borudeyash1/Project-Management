import React, { useState, useEffect } from 'react';
import { GitCommit, User, ExternalLink, RefreshCw } from 'lucide-react';
import { apiService } from '../../services/api';

interface Commit {
    sha: string;
    message: string;
    author: {
        name: string;
        username?: string;
        avatar?: string;
    };
    url: string;
    timestamp: string;
    repo: string;
}

interface CommitsFeedProps {
    projectId: string;
    limit?: number;
}

const CommitsFeed: React.FC<CommitsFeedProps> = ({ projectId, limit = 10 }) => {
    const [commits, setCommits] = useState<Commit[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAuthor, setSelectedAuthor] = useState<string>('');

    const fetchCommits = async () => {
        setLoading(true);
        try {
            const response = await apiService.get(`/github/commits`, {
                params: { projectId, author: selectedAuthor || undefined, limit }
            });

            if (response.success) {
                setCommits(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch commits:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchCommits();
        }
    }, [projectId, selectedAuthor]);

    const getUniqueAuthors = () => {
        const authors = new Set(commits.map(c => c.author.username).filter(Boolean));
        return Array.from(authors);
    };

    const formatTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        return 'Just now';
    };

    return (
        <div className="rounded-xl border p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <GitCommit className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Recent Commits
                    </h3>
                </div>
                <button
                    onClick={fetchCommits}
                    disabled={loading}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Refresh commits"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Author Filter */}
            {commits.length > 0 && (
                <select
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    className="w-full mb-3 px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">All Authors</option>
                    {getUniqueAuthors().map(author => (
                        <option key={author} value={author}>{author}</option>
                    ))}
                </select>
            )}

            {/* Commits List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Loading commits...</p>
                    </div>
                ) : commits.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <GitCommit className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No commits found</p>
                        <p className="text-xs mt-1">Link a GitHub repository to see commits</p>
                    </div>
                ) : (
                    commits.map(commit => (
                        <div
                            key={commit.sha}
                            className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
                        >
                            <div className="flex items-start gap-2">
                                {commit.author.avatar ? (
                                    <img
                                        src={commit.author.avatar}
                                        alt={commit.author.name}
                                        className="w-6 h-6 rounded-full flex-shrink-0"
                                    />
                                ) : (
                                    <User className="w-6 h-6 text-gray-400 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {commit.author.name}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mt-0.5">
                                        {commit.message.split('\n')[0]}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                            {commit.repo}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatTimeAgo(commit.timestamp)}
                                        </span>
                                        <a
                                            href={commit.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            View
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommitsFeed;
