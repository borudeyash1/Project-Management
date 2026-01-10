import React, { useState } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TaskCard from '../TaskCard';
import TaskDetailModal from '../TaskDetailModal';
import { usePlanner } from '../../../context/PlannerContext';
import { useJiraPlanner } from '../../../context/JiraPlannerContext';
import { useNotionPlanner } from '../../../context/NotionPlannerContext';
import { useDock } from '../../../context/DockContext';
import { Task } from '../../../context/PlannerContext';
import QuickAddModal from '../QuickAddModal';
import BoardViewSkeleton from '../skeletons/BoardViewSkeleton';
import { useApp } from '../../../context/AppContext';

interface BoardViewProps {
  searchQuery: string;
}

const BoardView: React.FC<BoardViewProps> = ({ searchQuery }) => {
  // Try JiraPlanner first, then NotionPlanner, fall back to regular Planner
  const jiraContext = useJiraPlanner();
  const notionContext = useNotionPlanner();
  const plannerContext = usePlanner();

  // Use whichever context is available
  const { columns, addTask, moveTask, tasks, loading } = jiraContext || notionContext || plannerContext;

  console.log('[BoardView] Using', jiraContext ? 'JiraPlannerContext' : notionContext ? 'NotionPlannerContext' : 'PlannerContext');

  const { dockPosition } = useDock();
  const { state } = useApp();
  const { t } = useTranslation();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskCreate, setShowTaskCreate] = useState(false);
  const [taskCreateStatus, setTaskCreateStatus] = useState<string>('pending');

  const currentUserId = state.userProfile?._id;

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task._id);

    // Add visual feedback to the dragged element
    const target = e.target as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling
    setDraggedOverColumn(columnId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation(); // Prevent bubbling
    // Only clear if leaving the column container, not child elements
    const relatedTarget = e.relatedTarget as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    if (!currentTarget.contains(relatedTarget)) {
      setDraggedOverColumn(null);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset visual feedback
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== columnId) {
      await moveTask(draggedTask._id, columnId);
    }
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const filteredTasks = (columnId: string) => {
    return tasks
      .filter(task => {
        // Filter by user assignment only
        if (currentUserId) {
          const isAssignedToMe = 
            task.assignee === currentUserId || 
            task.assignee?._id === currentUserId ||
            task.assignee?.toString() === currentUserId;
          
          // Show task only if user is assignee
          if (!isAssignedToMe) return false;
        }

        // Handle legacy statuses mapping to new columns
        if (columnId === 'pending') return task.status === 'pending' || task.status === 'todo';
        // Map both 'in-progress' and 'review' to the in-progress column
        if (columnId === 'in-progress') return task.status === 'in-progress' || task.status === 'review' || task.status === 'in-review';
        if (columnId === 'completed') return task.status === 'completed' || task.status === 'done';
        return task.status === columnId;
      })
      .filter(task =>
        !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  if (loading) {
    return <BoardViewSkeleton />;
  }

  return (
    <div className="h-full overflow-x-auto p-6">
      <div className="flex gap-6 h-full w-full">
        {columns.map(column => (
          <div
            key={column.id}
            className={`flex-1 min-w-[300px] bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-200 ${draggedOverColumn === column.id
              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300'
              : 'border border-gray-200 dark:border-gray-600'
              }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-gray-300 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t(column.name)}</h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredTasks(column.id).length}
                  </span>
                </div>
              </div>
              {column.wip && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t('planner.wipLimit')}: {filteredTasks(column.id).length}/{column.wip}
                </div>
              )}
            </div>

            {/* Tasks */}
            <div className="p-3 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
              {/* Drop placeholder */}
              {draggedOverColumn === column.id && draggedTask && draggedTask.status !== column.id && (
                <div className="bg-blue-100 dark:bg-blue-900/30 border-2 border-dashed border-blue-300 dark:border-blue-500 rounded-lg p-4 text-center text-blue-700 dark:text-blue-300 text-sm font-medium">
                  Drop "{draggedTask.title}" here
                </div>
              )}

              {filteredTasks(column.id).map(task => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedTask(task)}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${draggedTask?._id === task._id ? 'opacity-50' : ''}`}
                >
                  <TaskCard
                    task={task}
                    draggable={false}
                  />
                </div>
              ))}

              {filteredTasks(column.id).length === 0 && !draggedOverColumn && (
                <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p>No tasks</p>
                  <p className="text-xs mt-1">Drag tasks here or create new</p>
                </div>
              )}

              {/* Add Task Button */}
              <button
                onClick={() => {
                  setTaskCreateStatus(column.id);
                  setShowTaskCreate(true);
                }}
                className="w-full p-3 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('planner.addTask')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Quick Add Modal */}
      {showTaskCreate && (
        <QuickAddModal
          onClose={() => setShowTaskCreate(false)}
          defaultStatus={taskCreateStatus}
        />
      )}
    </div>
  );
};

export default BoardView;
