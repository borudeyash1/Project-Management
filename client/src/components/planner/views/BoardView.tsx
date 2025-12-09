import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TaskCard from '../TaskCard';
import TaskDetailModal from '../TaskDetailModal';
import { usePlanner } from '../../../context/PlannerContext';
import { Task } from '../../../context/PlannerContext';
import apiService from '../../../services/api';

interface BoardViewProps {
  searchQuery: string;
}

const BoardView: React.FC<BoardViewProps> = ({ searchQuery }) => {
  const { columns, addTask, moveTask } = usePlanner();
  const { t } = useTranslation();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Fetch data directly in this component
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      console.log('📡 [BoardView] Fetching tasks directly...');
      try {
        const timestamp = new Date().getTime();
        const response = await apiService.get(`/planner/data?_t=${timestamp}`);
        console.log('✅ [BoardView] Response:', response.data);
        
        if (response.data && response.data.success) {
          const normalizedTasks = (response.data.data.tasks || []).map((task: any) => ({
            ...task,
            subtasks: task.subtasks || [],
            tags: task.tags || [],
            comments: task.comments || [],
            attachments: task.attachments || [],
            assignees: task.assignee ? [task.assignee] : [],
            estimatedTime: task.estimatedHours || task.estimatedTime || 0
          }));
          
          console.log('💾 [BoardView] Setting tasks:', normalizedTasks.length);
          console.log('📋 [BoardView] Tasks:', normalizedTasks);
          setTasks(normalizedTasks);
        }
      } catch (error) {
        console.error('❌ [BoardView] Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);

  useEffect(() => {
    console.log('🔄 [BoardView] Tasks state updated. Count:', tasks.length);
    console.log('📊 [BoardView] Current tasks:', tasks);
  }, [tasks]);

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (columnId: string) => {
    if (draggedTask) {
      moveTask(draggedTask, columnId);
      setDraggedTask(null);
    }
  };

  const filteredTasks = (columnId: string) => {
    const filtered = tasks
      .filter(task => task.status === columnId)
      .filter(task => 
        !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    console.log(`[BoardView] Column ${columnId}:`, {
      totalTasks: tasks.length,
      taskStatuses: tasks.map(t => ({ title: t.title, status: t.status })),
      filteredCount: filtered.length
    });
    
    return filtered;
  };

  // Log all tasks on render
  React.useEffect(() => {
    console.log('[BoardView] All tasks:', tasks);
    console.log('[BoardView] Columns:', columns);
  }, [tasks, columns]);

  return (
    <>
    {/* DEBUG PANEL */}
    <div className="bg-yellow-100 dark:bg-yellow-900 p-4 m-4 rounded-lg border-2 border-yellow-500">
      <h3 className="font-bold text-lg mb-2">🔍 DEBUG INFO</h3>
      <div className="mb-2">
        <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Total Tasks:</strong> {tasks.length}
          <div className="ml-4 mt-1">
            {tasks.length === 0 && <div className="text-red-600">⚠️ No tasks in state!</div>}
            {tasks.map((task, idx) => (
              <div key={idx} className="text-xs">
                • {task.title} (status: <span className="font-mono bg-gray-200 px-1">{task.status}</span>)
              </div>
            ))}
          </div>
        </div>
        <div>
          <strong>Columns:</strong>
          <div className="ml-4 mt-1">
            {columns.map(col => (
              <div key={col.id} className="text-xs">
                • {col.id}: {filteredTasks(col.id).length} tasks
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    
    {/* DIRECT TASK DISPLAY - BYPASS COLUMNS */}
    {tasks.length > 0 && (
      <div className="bg-green-100 dark:bg-green-900 p-4 m-4 rounded-lg border-2 border-green-500">
        <h3 className="font-bold text-lg mb-2">✅ ALL TASKS (Direct Display)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tasks.map(task => (
            <div key={task._id} className="bg-white dark:bg-gray-800 p-3 rounded shadow">
              <div className="font-bold">{task.title}</div>
              <div className="text-sm text-gray-600">Status: {task.status}</div>
              <div className="text-sm text-gray-600">Priority: {task.priority}</div>
              {task.description && <div className="text-xs mt-1">{task.description}</div>}
            </div>
          ))}
        </div>
      </div>
    )}
    
    <div className="h-full overflow-x-auto p-6">
      <div className="flex gap-4 h-full min-w-max">
        {columns.map(column => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 bg-gray-100 dark:bg-gray-800 rounded-lg"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-gray-300 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-gray-900 dark:text-white" title={column.name}>{t(column.name)}</h3>
                  <span className="text-sm text-gray-600 dark:text-gray-200">
                    {filteredTasks(column.id).length}
                  </span>
                </div>
                <button className="p-1 text-gray-600 hover:text-gray-600 dark:hover:text-gray-700 rounded">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              {column.wip && (
                <div className="text-xs text-gray-600 dark:text-gray-200">
                  {t('planner.wipLimit')}: {filteredTasks(column.id).length}/{column.wip}
                </div>
              )}
            </div>

            {/* Tasks */}
            <div className="p-3 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
              {filteredTasks(column.id).map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onDragStart={() => handleDragStart(task._id)}
                  onClick={() => setSelectedTask(task)}
                  draggable
                />
              ))}
              
              {/* Add Task Button */}
              <button
                onClick={() => addTask(column.id)}
                className="w-full p-3 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('planner.addTask')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    {/* Task Detail Modal */}
    {selectedTask && (
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    )}
    </>
  );
};

export default BoardView;
