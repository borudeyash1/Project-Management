import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Target, Plus, ExternalLink, Circle, ChevronDown, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { linearService } from '../../services/linearService';
import { LinearTeam, LinearIssue } from '../../types/linear';
import LoadingAnimation from '../LoadingAnimation';

const WorkspaceLinearTab: React.FC = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const { state } = useApp();
    const [teams, setTeams] = useState<LinearTeam[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<LinearTeam | null>(null);
    const [issues, setIssues] = useState<LinearIssue[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [loadingIssues, setLoadingIssues] = useState(false);
    const [showTeamDropdown, setShowTeamDropdown] = useState(false);

    const linearConnected = !!state.userProfile?.connectedAccounts?.linear?.activeAccountId;

    useEffect(() => {
        if (linearConnected) {
            fetchTeams();
        } else {
            setLoadingTeams(false);
        }
    }, [linearConnected]);

    useEffect(() => {
        if (selectedTeam) {
            fetchIssues(selectedTeam.id);
        }
    }, [selectedTeam]);

    const fetchTeams = async () => {
        setLoadingTeams(true);
        try {
            const data = await linearService.getTeams();
            setTeams(data);
            if (data.length > 0 && !selectedTeam) {
                setSelectedTeam(data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch Linear teams:', error);
        } finally {
            setLoadingTeams(false);
        }
    };

    const fetchIssues = async (teamId: string) => {
        setLoadingIssues(true);
        try {
            const data = await linearService.getIssues(teamId);
            setIssues(data);
        } catch (error) {
            console.error('Failed to fetch Linear issues:', error);
        } finally {
            setLoadingIssues(false);
        }
    };

    const getPriorityLabel = (priority: number) => {
        const labels = ['No priority', 'Urgent', 'High', 'Medium', 'Low'];
        return labels[priority] || 'No priority';
    };

    const getPriorityColor = (priority: number) => {
        const colors = ['text-gray-400', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500'];
        return colors[priority] || 'text-gray-400';
    };

    const getStats = () => {
        const total = issues.length;
        const todo = issues.filter(i => i.state.type === 'unstarted' || i.state.type === 'backlog').length;
        const inProgress = issues.filter(i => i.state.type === 'started').length;
        const done = issues.filter(i => i.state.type === 'completed').length;
        return { total, todo, inProgress, done };
    };

    if (!linearConnected) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-800 h-full">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                    <Target size={32} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Linear Not Connected
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                    Connect your Linear workspace to manage issues directly from Sartthi
                </p>
                <button
                    onClick={() => window.location.href = '/profile?tab=integrations'}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    Connect Linear
                </button>
            </div>
        );
    }

    if (loadingTeams) {
        return <div className="h-full flex items-center justify-center"><LoadingAnimation message="Loading Linear..." /></div>;
    }

    const stats = getStats();

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Target size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Linear Issues
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage and track Linear issues
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Plus size={18} />
                            Create Issue
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Issues</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">To Do</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todo}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Done</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.done}</p>
                    </div>
                </div>

                {/* Team Selector & Filters */}
                <div className="flex items-center gap-4">
                    {/* Team Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {selectedTeam?.name || 'Select Team'}
                            </span>
                            <ChevronDown size={16} className="text-gray-500" />
                        </button>

                        {showTeamDropdown && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                                {teams.map(team => (
                                    <button
                                        key={team.id}
                                        onClick={() => {
                                            setSelectedTeam(team);
                                            setShowTeamDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${selectedTeam?.id === team.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                                {team.key}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-white">{team.name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <Filter size={16} />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Filter</span>
                    </button>
                </div>
            </div>

            {/* Issues List */}
            <div className="flex-1 overflow-y-auto p-6">
                {loadingIssues ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingAnimation message="" />
                    </div>
                ) : issues.length === 0 ? (
                    <div className="text-center py-12">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No Issues Yet
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Create your first issue to get started
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {issues.map(issue => (
                            <div
                                key={issue.id}
                                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Status Indicator */}
                                    <Circle
                                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                                        style={{ color: issue.state.color }}
                                        fill={issue.state.type === 'completed' ? issue.state.color : 'none'}
                                    />

                                    <div className="flex-1 min-w-0">
                                        {/* Identifier and Title */}
                                        <div className="flex items-start gap-3 mb-2">
                                            <span className="text-sm font-mono text-gray-500 dark:text-gray-400 flex-shrink-0">
                                                {issue.identifier}
                                            </span>
                                            <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
                                                {issue.title}
                                            </h4>
                                        </div>

                                        {/* Metadata */}
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            {/* Status */}
                                            <span
                                                className="px-2 py-0.5 rounded-full text-xs font-medium"
                                                style={{
                                                    backgroundColor: `${issue.state.color}20`,
                                                    color: issue.state.color
                                                }}
                                            >
                                                {issue.state.name}
                                            </span>

                                            {/* Priority */}
                                            <span className={`text-xs ${getPriorityColor(issue.priority)}`}>
                                                {getPriorityLabel(issue.priority)}
                                            </span>

                                            {/* Assignee */}
                                            {issue.assignee && (
                                                <span className="flex items-center gap-1.5 text-xs">
                                                    {issue.assignee.avatarUrl ? (
                                                        <img
                                                            src={issue.assignee.avatarUrl}
                                                            alt={issue.assignee.name}
                                                            className="w-5 h-5 rounded-full"
                                                        />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                                    )}
                                                    {issue.assignee.name}
                                                </span>
                                            )}

                                            {/* Project */}
                                            {issue.project && (
                                                <span className="text-xs">📁 {issue.project.name}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* External Link */}
                                    <a
                                        href={issue.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <ExternalLink className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkspaceLinearTab;
