import React, { useState } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import TaskCard from '../TaskCard';
import TaskDetailModal from '../TaskDetailModal';
import { usePlanner } from '../../../context/PlannerContext';
import { Task } from '../../../context/PlannerContext';

interface BoardViewProps {
  searchQuery: string;
}

const BoardView: React.FC<BoardViewProps> = ({ searchQuery }) => {
  const { tasks, columns, addTask, moveTask } = usePlanner();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
    return tasks
      .filter(task => task.status === columnId)
      .filter(task => 
        !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  return (
    <>
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
                  <h3 className="font-semibold text-gray-900 dark:text-white">{column.name}</h3>
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
                  WIP Limit: {filteredTasks(column.id).length}/{column.wip}
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
                Add Task
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
