import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Plus, RefreshCw, LayoutGrid, List, Calendar, GanttChart, FileText, Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';
import { NotionPlannerProvider, useNotionPlanner } from '../../context/NotionPlannerContext';
import NotionPagePicker from '../notion/NotionPagePicker';
import BoardView from '../planner/views/BoardView';
import ListView from '../planner/views/ListView';
import CalendarView from '../planner/views/CalendarView';
import TimelineView from '../planner/views/TimelineView';

type ViewType = 'board' | 'list' | 'calendar' | 'timeline';

const NotionTabContent: React.FC = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const { addToast } = useApp();
    const notionContext = useNotionPlanner();

    const [currentView, setCurrentView] = useState<ViewType>('board');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    // NotionTabContent is always wrapped in NotionPlannerProvider, so context should exist
    if (!notionContext) {
        return <div>Error: Notion context not available</div>;
    }

    const { fetchData, tasks, loading } = notionContext;

    const handleSync = async () => {
        try {
            setIsSyncing(true);
            await apiService.post(`/notion/workspace/${workspaceId}/sync`);
            await fetchData();
            addToast('Synced tasks from Notion', 'success');
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to sync tasks', 'error');
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
        <div className="h-full flex flex-col pt-0">
            {showPicker && workspaceId && (
                <NotionPagePicker
                    workspaceId={workspaceId}
                    onClose={() => setShowPicker(false)}
                    onImported={handleImportComplete}
                />
            )}

            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <FileText size={24} className="text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Notion Tasks
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage and track Notion tasks
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowPicker(true)}
                            className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-2"
                        >
                            <Download size={18} />
                            Import Pages
                        </button>
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                            Sync
                        </button>
                        <button
                            onClick={() => window.open('https://notion.so', '_blank')}
                            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Create in Notion
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.todo}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">To Do</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.done}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Done</div>
                    </div>
                </div>

                {/* View Switcher & Search */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        {viewButtons.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setCurrentView(id)}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${currentView === id
                                    ? 'bg-accent text-gray-900'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <Icon size={18} />
                                {label}
                            </button>
                        ))}
                    </div>

                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
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
        </div>
    );
};

const WorkspaceNotionTab: React.FC = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();

    if (!workspaceId) {
        return <div>Error: Workspace ID not found</div>;
    }

    return (
        <NotionPlannerProvider workspaceId={workspaceId}>
            <NotionTabContent />
        </NotionPlannerProvider>
    );
};

export default WorkspaceNotionTab;
