import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useDock } from '../../context/DockContext';
import { useTranslation } from 'react-i18next';
import { useRefreshData } from '../../hooks/useRefreshData';
import { usePlanner } from '../../context/PlannerContext';
import {
  LayoutGrid, List, Calendar, Clock, Inbox, BarChart3,
  Settings, Plus, Search, Filter, Command, Bell, Target
} from 'lucide-react';
import GlassmorphicPageHeader from '../ui/GlassmorphicPageHeader';
import BoardView from './views/BoardView';
import ListView from './views/ListView';
import GanttView from './views/GanttView';
import CalendarView from './views/CalendarView';
import MyWorkView from './views/MyWorkView';
import QuickAddDrawer from './QuickAddDrawer';
import CommandPalette from './CommandPalette';
import NotificationCenter from './NotificationCenter';
import QuickAddModal from './QuickAddModal';

type ViewType = 'board' | 'list' | 'gantt' | 'calendar' | 'mywork';

const PlannerLayout: React.FC = () => {
  const { state, dispatch } = useApp();
  const { dockPosition } = useDock();
  const { t } = useTranslation();
  const { fetchData } = usePlanner();
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

  // Enable refresh button
  useRefreshData(fetchData, [fetchData]);

  const views = [
    { id: 'board', label: t('planner.views.board'), icon: LayoutGrid },
    { id: 'list', label: t('planner.views.list'), icon: List },
    { id: 'gantt', label: 'Gantt', icon: BarChart3 },
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
      case 'gantt':
        return <GanttView searchQuery={searchQuery} />;
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
    >
      {/* Header */}
      <GlassmorphicPageHeader
        title={t('planner.title')}
        subtitle={t('planner.description')}
        icon={Target}
        className="w-full !rounded-none !border-x-0 !mb-0"
        decorativeGradients={{
          topRight: 'rgba(124, 58, 237, 0.2)',
          bottomLeft: 'rgba(59, 130, 246, 0.2)'
        }}
      />

      {/* View Switcher Row */}
      <div className={`pr-6 mb-6 mt-6 transition-all duration-300 ${dockPosition === 'left' ? 'pl-[71px]' :
        dockPosition === 'right' ? 'pr-[71px]' :
          'pl-6'
        }`}>
        <div className="flex items-center gap-2 p-1 bg-white/50 dark:bg-gray-800/50 rounded-xl overflow-x-auto border border-gray-300/60 dark:border-gray-700/70 backdrop-blur-sm w-fit">
          {views.map(view => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setCurrentView(view.id as ViewType)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${currentView === view.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ring-1 ring-black/5 dark:ring-white/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
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

      {/* Main Content */}
      <div className={`flex-1 overflow-hidden transition-all duration-300 ${dockPosition === 'left' ? 'pl-[71px]' :
        dockPosition === 'right' ? 'pr-[71px]' :
          'pl-6'
        }`}>
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
