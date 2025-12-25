import React, { useState, useEffect } from 'react';
import { Search, Github, Link as LinkIcon, Check, Loader, AlertCircle, RefreshCw } from 'lucide-react';

import { apiService } from '../../services/api';
import { useApp } from '../../context/AppContext';

interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string;
    private: boolean;
    html_url: string;
    owner: {
        login: string;
        avatar_url: string;
    };
    updated_at: string;
}

interface LinkedRepo {
    _id: string;
    owner: string;
    repo: string;
    fullName: string;
    autoCreateTasks: boolean;
    syncStatus: boolean;
}

interface GitHubRepoSelectorProps {
    projectId: string;
    linkedRepos?: LinkedRepo[]; // Existing linked repos to show status
    onLink?: (repo: LinkedRepo) => void;
    onUnlink?: (repoId: string) => void;
}

const GitHubRepoSelector: React.FC<GitHubRepoSelectorProps> = ({
    projectId,
    linkedRepos = [],
    onLink,
    onUnlink
}) => {
    const { addToast } = useApp();
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState(false);
    const [linking, setLinking] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fetchRepos = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.get('/github/repos');
            if (response.success) {
                setRepos(response.data);
            } else {
                setError('Failed to fetch repositories');
            }
        } catch (err) {
            setError('Could not connect to GitHub. Please ensure your account is connected.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRepos();
    }, []);

    const handleLinkRepo = async (repo: GitHubRepo) => {
        setLinking(repo.id);
        try {
            const response = await apiService.post(`/projects/${projectId}/link-repo`, {
                owner: repo.owner.login,
                repo: repo.name,
                autoCreateTasks: true,
                syncStatus: true
            });

            if (response.success) {
                addToast(`Linked ${repo.full_name} successfully!`, 'success');
                if (onLink) {
                    // Ideally we get the full linked repo object from response, 
                    // but for now we construct a partial or wait for parent refresh
                    // Assuming response.data gives us the updated list or the new link
                    // The controller returns the *list* of repos.
                    const newLink = response.data.find((r: any) => r.fullName === repo.full_name);
                    if (newLink) onLink(newLink);
                }
            } else {
                addToast(response.message || 'Failed to link repository', 'error');
            }
        } catch (err: any) {
            addToast(err.response?.data?.message || err.message || 'Error linking repository', 'error');
        } finally {
            setLinking(null);
        }
    };

    const isLinked = (repoFullName: string) => {
        return linkedRepos.some(r => r.fullName === repoFullName);
    };

    const filteredRepos = repos.filter(repo =>
        repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && repos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <Loader className="w-8 h-8 animate-spin mb-2" />
                <p>Loading repositories...</p>
            </div>
        );
    }

    if (error && repos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-red-500 bg-red-50 rounded-lg">
                <AlertCircle className="w-8 h-8 mb-2" />
                <p>{error}</p>
                <button
                    onClick={fetchRepos}
                    className="mt-4 px-4 py-2 bg-white border border-red-200 rounded-md text-sm text-red-600 hover:bg-red-50"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                    onClick={fetchRepos}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    title="Refresh repositories"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredRepos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Github className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No repositories found matching "{searchQuery}"</p>
                    </div>
                ) : (
                    filteredRepos.map(repo => {
                        const linked = isLinked(repo.full_name);
                        return (
                            <div
                                key={repo.id}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${linked
                                    ? 'bg-blue-50/50 border-blue-100'
                                    : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
                                    }`}
                            >
                                <div className="min-w-0 flex-1 mr-4">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-medium text-sm text-gray-900 truncate" title={repo.full_name}>
                                            {repo.name}
                                        </span>
                                        {repo.private && (
                                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                                                Private
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">
                                        {repo.owner.login} • Updated {new Date(repo.updated_at).toLocaleDateString()}
                                    </p>
                                </div>

                                {linked ? (
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                            <Check className="w-3 h-3" />
                                            Linked
                                        </span>
                                        {/* Unlink button could go here if needed, or controlled by parent */}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleLinkRepo(repo)}
                                        disabled={linking === repo.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {linking === repo.id ? (
                                            <Loader className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <LinkIcon className="w-3.5 h-3.5" />
                                        )}
                                        Link
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default GitHubRepoSelector;
