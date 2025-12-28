import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Plus, RefreshCw, LayoutGrid, List, Calendar, GanttChart, Trello
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';
import JiraGuard from '../guards/JiraGuard';
import JiraIssuePicker from '../jira/JiraIssuePicker';
import JiraIssueModal from '../jira/JiraIssueModal';
import { JiraPlannerProvider, useJiraPlanner } from '../../context/JiraPlannerContext';
import BoardView from '../planner/views/BoardView';
import ListView from '../planner/views/ListView';
import CalendarView from '../planner/views/CalendarView';
import TimelineView from '../planner/views/TimelineView';

type ViewType = 'board' | 'list' | 'calendar' | 'timeline';

const JiraTabContent: React.FC = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const { addToast } = useApp();
    const jiraContext = useJiraPlanner();

    // JiraTabContent is always wrapped in JiraPlannerProvider, so context should exist
    if (!jiraContext) {
        return <div>Error: Jira context not available</div>;
    }

    const { fetchData, tasks, loading } = jiraContext;

    const [currentView, setCurrentView] = useState<ViewType>('board');
    const [showPicker, setShowPicker] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        try {
            setIsSyncing(true);
            await apiService.get(`/jira/workspace/${workspaceId}/sync`);
            await fetchData();
            addToast('Synced issues from Jira', 'success');
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to sync issues', 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleImportComplete = async () => {
        await fetchData();
        setShowPicker(false);
    };

    const viewButtons = [
        { id: 'board' as ViewType, label: 'Board', icon: LayoutGrid },
        { id: 'list' as ViewType, label: 'List', icon: List },
        { id: 'calendar' as ViewType, label: 'Calendar', icon: Calendar },
        { id: 'timeline' as ViewType, label: 'Timeline', icon: GanttChart },
    ];

    const getStats = () => {
        const total = tasks.length;
        const todo = tasks.filter((t: any) => t.status === 'pending').length;
        const inProgress = tasks.filter((t: any) => t.status === 'in-progress').length;
        const done = tasks.filter((t: any) => t.status === 'completed').length;
        return { total, todo, inProgress, done };
    };

    const stats = getStats();

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Trello size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Jira Issues
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage and track Jira issues
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                            Sync
                        </button>
                        <button
                            onClick={() => setShowPicker(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Import Issues
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
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

                {/* View Switcher */}
                <div className="flex items-center gap-4">
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        {viewButtons.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setCurrentView(id)}
                                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${currentView === id
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="font-medium">{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Search - only for views that support it */}
                    {(currentView === 'board' || currentView === 'list') && (
                        <div className="flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search issues..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* View Content */}
            <div className="flex-1 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                            <p className="text-gray-600 dark:text-gray-400">Loading Jira issues...</p>
                        </div>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <Trello className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No Jira Issues
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Import issues from Jira to get started
                            </p>
                            <button
                                onClick={() => setShowPicker(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Import Issues
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {currentView === 'board' && <BoardView searchQuery={searchQuery} />}
                        {currentView === 'list' && <ListView searchQuery={searchQuery} />}
                        {currentView === 'calendar' && <CalendarView searchQuery={searchQuery} />}
                        {currentView === 'timeline' && <TimelineView searchQuery={searchQuery} />}
                    </>
                )}
            </div>

            {/* Modals */}
            {showPicker && (
                <JiraIssuePicker
                    workspaceId={workspaceId!}
                    onClose={() => setShowPicker(false)}
                    onImported={handleImportComplete}
                />
            )}

            {showCreateModal && (
                <JiraIssueModal
                    workspaceId={workspaceId!}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => {
                        setShowCreateModal(false);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
};

const WorkspaceJiraTab: React.FC = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();

    if (!workspaceId) {
        return <div>No workspace selected</div>;
    }

    return (
        <JiraGuard>
            <JiraPlannerProvider workspaceId={workspaceId}>
                <JiraTabContent />
            </JiraPlannerProvider>
        </JiraGuard>
    );
};

export default WorkspaceJiraTab;
