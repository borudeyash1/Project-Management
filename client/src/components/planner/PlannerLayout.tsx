import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useDock } from '../../context/DockContext';
import { useTranslation } from 'react-i18next';
import {
  LayoutGrid, List, Calendar, Clock, Inbox, BarChart3,
  Settings, Plus, Search, Filter, Command, Bell
} from 'lucide-react';
import BoardView from './views/BoardView';
import ListView from './views/ListView';
import TimelineView from './views/TimelineView';
import CalendarView from './views/CalendarView';
import MyWorkView from './views/MyWorkView';
import QuickAddDrawer from './QuickAddDrawer';
import CommandPalette from './CommandPalette';
import NotificationCenter from './NotificationCenter';
import QuickAddModal from './QuickAddModal';

type ViewType = 'board' | 'list' | 'timeline' | 'calendar' | 'mywork';

const PlannerLayout: React.FC = () => {
  const { state, dispatch } = useApp();
  const { dockPosition } = useDock();
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<ViewType>('board');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTaskCreate, setShowTaskCreate] = useState(false);
  const [taskCreateDefaults, setTaskCreateDefaults] = useState<{
    date?: Date;
    time?: string;
    status?: string;
  }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const views = [
    { id: 'board', label: t('planner.views.board'), icon: LayoutGrid },
    { id: 'list', label: t('planner.views.list'), icon: List },
    { id: 'timeline', label: t('planner.views.timeline'), icon: BarChart3 },
    { id: 'calendar', label: t('planner.views.calendar'), icon: Calendar },
    { id: 'mywork', label: t('planner.views.myWork'), icon: Inbox }
  ];

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Cmd/Ctrl + N for quick add
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setShowQuickAdd(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCalendarDateClick = (date: Date, time?: string) => {
    setTaskCreateDefaults({ date, time });
    setShowTaskCreate(true);
  };

  const handleCloseTaskCreate = () => {
    setShowTaskCreate(false);
    setTaskCreateDefaults({});
  };

  const renderView = () => {
    switch (currentView) {
      case 'board':
        return <BoardView searchQuery={searchQuery} />;
      case 'list':
        return <ListView searchQuery={searchQuery} />;
      case 'timeline':
        return <TimelineView searchQuery={searchQuery} />;
      case 'calendar':
        return <CalendarView searchQuery={searchQuery} onDateClick={handleCalendarDateClick} />;
      case 'mywork':
        return <MyWorkView searchQuery={searchQuery} />;
      default:
        return <BoardView searchQuery={searchQuery} />;
    }
  };

  return (
    <div
      className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-all duration-300"
      style={{
        paddingLeft: dockPosition === 'left' ? '100px' : undefined,
        paddingRight: dockPosition === 'right' ? '100px' : undefined
      }}
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('planner.title')}</h1>

            {/* View Switcher */}
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              {views.map(view => {
                const Icon = view.icon;
                return (
                  <button
                    key={view.id}
                    onClick={() => setCurrentView(view.id as ViewType)}
                    className={`px-3 py-2 text-sm font-medium flex items-center gap-2 ${currentView === view.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-700'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    title={view.label}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{view.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('planner.searchPlaceholder')}
                className="w-64 pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Filter */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Command Palette */}
            <button
              onClick={() => setShowCommandPalette(true)}
              className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Command className="w-4 h-4" />
              <span className="text-xs">⌘K</span>
            </button>

            {/* Quick Add */}
            <button
              onClick={() => setShowTaskCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
            >
              <Plus className="w-4 h-4" />
              <span>{t('planner.addTask')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderView()}
      </div>

      {/* Modals & Drawers */}
      {showQuickAdd && <QuickAddDrawer onClose={() => setShowQuickAdd(false)} />}
      {showCommandPalette && <CommandPalette onClose={() => setShowCommandPalette(false)} />}
      {showNotifications && <NotificationCenter onClose={() => setShowNotifications(false)} />}
      {showTaskCreate && (
        <QuickAddModal
          onClose={handleCloseTaskCreate}
          defaultDate={taskCreateDefaults.date}
          defaultTime={taskCreateDefaults.time}
        />
      )}
    </div>
  );
};

export default PlannerLayout;
