import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Target, Plus, ExternalLink, Circle, ChevronDown, Filter, MoreHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { linearService } from '../../services/linearService';
import { LinearTeam, LinearIssue } from '../../types/linear';
import LoadingAnimation from '../LoadingAnimation';

type ViewTab = 'all' | 'active' | 'backlog';

const WorkspaceLinearTab: React.FC = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const { state } = useApp();
    const [teams, setTeams] = useState<LinearTeam[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<LinearTeam | null>(null);
    const [issues, setIssues] = useState<LinearIssue[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [loadingIssues, setLoadingIssues] = useState(false);
    const [showTeamDropdown, setShowTeamDropdown] = useState(false);
    const [currentTab, setCurrentTab] = useState<ViewTab>('active');

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

    // Map Linear states to our planner statuses
    const mapToStatus = (issue: LinearIssue): 'todo' | 'in-progress' | 'in-review' => {
        const stateType = issue.state.type.toLowerCase();
        const stateName = issue.state.name.toLowerCase();

        // In Review
        if (stateName.includes('review') || stateName.includes('testing') || stateName.includes('qa')) {
            return 'in-review';
        }

        // In Progress
        if (stateType === 'started' || stateName.includes('progress') || stateName.includes('doing')) {
            return 'in-progress';
        }

        // Todo (default for unstarted, backlog, etc.)
        return 'todo';
    };

    const getFilteredIssues = () => {
        let filtered = issues;

        if (currentTab === 'active') {
            // Active = not completed or canceled
            filtered = issues.filter(i =>
                i.state.type !== 'completed' && i.state.type !== 'canceled'
            );
        } else if (currentTab === 'backlog') {
            // Backlog = specifically backlog state
            filtered = issues.filter(i => i.state.type === 'backlog');
        }

        return filtered;
    };

    const groupedIssues = {
        todo: getFilteredIssues().filter(i => mapToStatus(i) === 'todo'),
        'in-progress': getFilteredIssues().filter(i => mapToStatus(i) === 'in-progress'),
        'in-review': getFilteredIssues().filter(i => mapToStatus(i) === 'in-review')
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
                                {selectedTeam?.name || 'Select a team'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {/* Team Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {selectedTeam?.key || 'Team'}
                                </span>
                                <ChevronDown size={16} className="text-gray-500" />
                            </button>

                            {showTeamDropdown && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                                    {teams.map(team => (
                                        <button
                                            key={team.id}
                                            onClick={() => {
                                                setSelectedTeam(team);
                                                setShowTeamDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedTeam?.id === team.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
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

                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Plus size={18} />
                            Create Issue
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setCurrentTab('all')}
                        className={`pb-3 px-1 border-b-2 transition-colors ${currentTab === 'all'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-medium'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        All issues
                    </button>
                    <button
                        onClick={() => setCurrentTab('active')}
                        className={`pb-3 px-1 border-b-2 transition-colors ${currentTab === 'active'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-medium'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setCurrentTab('backlog')}
                        className={`pb-3 px-1 border-b-2 transition-colors ${currentTab === 'backlog'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-medium'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        Backlog
                    </button>

                    <div className="ml-auto flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <Filter size={18} className="text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Board View */}
            <div className="flex-1 overflow-x-auto p-6">
                {loadingIssues ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingAnimation message="" />
                    </div>
                ) : (
                    <div className="flex gap-4 h-full min-w-max">
                        {/* Todo Column */}
                        <div className="flex-1 min-w-[320px] flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Circle className="w-4 h-4 text-gray-400" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        Todo
                                    </h3>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {groupedIssues.todo.length}
                                    </span>
                                </div>
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                    <Plus size={16} className="text-gray-400" />
                                </button>
                            </div>
                            <div className="space-y-2 flex-1 overflow-y-auto">
                                {groupedIssues.todo.map(issue => (
                                    <IssueCard key={issue.id} issue={issue} />
                                ))}
                            </div>
                        </div>

                        {/* In Progress Column */}
                        <div className="flex-1 min-w-[320px] flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Circle className="w-4 h-4 text-yellow-500" fill="currentColor" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        In Progress
                                    </h3>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {groupedIssues['in-progress'].length}
                                    </span>
                                </div>
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                    <Plus size={16} className="text-gray-400" />
                                </button>
                            </div>
                            <div className="space-y-2 flex-1 overflow-y-auto">
                                {groupedIssues['in-progress'].map(issue => (
                                    <IssueCard key={issue.id} issue={issue} />
                                ))}
                            </div>
                        </div>

                        {/* In Review Column */}
                        <div className="flex-1 min-w-[320px] flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Circle className="w-4 h-4 text-green-500" fill="currentColor" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        In Review
                                    </h3>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {groupedIssues['in-review'].length}
                                    </span>
                                </div>
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                    <Plus size={16} className="text-gray-400" />
                                </button>
                            </div>
                            <div className="space-y-2 flex-1 overflow-y-auto">
                                {groupedIssues['in-review'].map(issue => (
                                    <IssueCard key={issue.id} issue={issue} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Issue Card Component
const IssueCard: React.FC<{ issue: LinearIssue }> = ({ issue }) => {
    const getPriorityIcon = (priority: number) => {
        if (priority === 1) return '🔴'; // Urgent
        if (priority === 2) return '🟠'; // High
        if (priority === 3) return '🟡'; // Medium
        if (priority === 4) return '🔵'; // Low
        return '';
    };

    return (
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {issue.identifier}
                </span>
                <div className="flex items-center gap-1">
                    {issue.priority > 0 && (
                        <span className="text-sm">{getPriorityIcon(issue.priority)}</span>
                    )}
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal size={14} className="text-gray-400" />
                    </button>
                </div>
            </div>

            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                {issue.title}
            </h4>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {issue.assignee && (
                        issue.assignee.avatarUrl ? (
                            <img
                                src={issue.assignee.avatarUrl}
                                alt={issue.assignee.name}
                                className="w-5 h-5 rounded-full"
                            />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600" />
                        )
                    )}
                </div>

                <a
                    href={issue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 hover:text-blue-600" />
                </a>
            </div>
        </div>
    );
};

export default WorkspaceLinearTab;
