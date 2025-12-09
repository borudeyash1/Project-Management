import React from 'react';
import { Calendar, Plus, Search } from 'lucide-react';
import { TimelineTask } from '../../../types/timeline';
import UnscheduledTaskItem from './UnscheduledTaskItem';

interface UnscheduledSidebarProps {
    tasks: TimelineTask[];
    onAddTask?: () => void;
}

const UnscheduledSidebar: React.FC<UnscheduledSidebarProps> = ({ tasks, onAddTask }) => {
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-[280px] h-full bg-notion-sidebar dark:bg-sidebar-bg border-r border-notion-border dark:border-border-subtle flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-notion-border dark:border-border-subtle">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-notion-text dark:text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Unscheduled
                    </h3>
                    <span className="text-xs text-notion-text-secondary dark:text-gray-400 bg-notion-hover dark:bg-hover-bg px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-notion-text-secondary dark:text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-notion-border dark:border-border-subtle rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                </div>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto p-3">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <UnscheduledTaskItem key={task.id} task={task} />
                    ))
                ) : (
                    <div className="text-center py-12">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-notion-text-secondary dark:text-gray-600" />
                        <p className="text-sm text-notion-text-secondary dark:text-gray-400 mb-1">
                            {searchQuery ? 'No tasks found' : 'No unscheduled tasks'}
                        </p>
                        <p className="text-xs text-notion-text-secondary dark:text-gray-500">
                            {searchQuery ? 'Try a different search' : 'All tasks are scheduled'}
                        </p>
                    </div>
                )}
            </div>

            {/* Add Task Button */}
            {onAddTask && (
                <div className="p-3 border-t border-notion-border dark:border-border-subtle">
                    <button
                        onClick={onAddTask}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-notion-text dark:text-gray-300 bg-white dark:bg-gray-800 border border-notion-border dark:border-border-subtle rounded-md hover:bg-notion-hover dark:hover:bg-hover-bg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Task
                    </button>
                </div>
            )}
        </div>
    );
};

export default React.memo(UnscheduledSidebar);
