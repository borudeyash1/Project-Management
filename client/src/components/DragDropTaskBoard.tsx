import React, { useState, useEffect } from 'react';
import { 
  Plus, MoreVertical, Edit, Trash2, Clock, User, Tag, 
  Paperclip, MessageSquare, CheckCircle, AlertCircle, 
  Calendar, Flag, Star, Eye, Archive, Copy, Move
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  dueDate?: Date;
  tags: string[];
  attachments: Array<{
    _id: string;
    name: string;
    url: string;
    type: string;
  }>;
  comments: Array<{
    _id: string;
    text: string;
    author: {
      _id: string;
      name: string;
      avatar?: string;
    };
    createdAt: Date;
  }>;
  milestones: Array<{
    _id: string;
    title: string;
    completed: boolean;
    dueDate?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface DragDropTaskBoardProps {
  projectId?: string;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskCreate?: (task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => void;
  onTaskDelete?: (taskId: string) => void;
}

const DragDropTaskBoard: React.FC<DragDropTaskBoardProps> = ({
  projectId,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete
}) => {
  const { state } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        _id: '1',
        title: 'Design new landing page',
        description: 'Create a modern, responsive landing page for the new product launch',
        status: 'pending',
        priority: 'high',
        assignee: {
          _id: 'u1',
          name: 'John Doe',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        },
        dueDate: new Date('2024-03-25'),
        tags: ['design', 'frontend', 'urgent'],
        attachments: [],
        comments: [],
        milestones: [
          { _id: 'm1', title: 'Wireframe creation', completed: false, dueDate: new Date('2024-03-20') },
          { _id: 'm2', title: 'Visual design', completed: false, dueDate: new Date('2024-03-22') },
          { _id: 'm3', title: 'Responsive implementation', completed: false, dueDate: new Date('2024-03-25') }
        ],
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      },
      {
        _id: '2',
        title: 'Implement user authentication',
        description: 'Set up secure user authentication with JWT tokens',
        status: 'in-progress',
        priority: 'medium',
        assignee: {
          _id: 'u2',
          name: 'Jane Smith',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
        },
        dueDate: new Date('2024-03-28'),
        tags: ['backend', 'security', 'api'],
        attachments: [],
        comments: [],
        milestones: [
          { _id: 'm4', title: 'JWT implementation', completed: true, dueDate: new Date('2024-03-18') },
          { _id: 'm5', title: 'Password hashing', completed: true, dueDate: new Date('2024-03-20') },
          { _id: 'm6', title: 'Session management', completed: false, dueDate: new Date('2024-03-25') }
        ],
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-20')
      },
      {
        _id: '3',
        title: 'Write API documentation',
        description: 'Create comprehensive API documentation for all endpoints',
        status: 'completed',
        priority: 'low',
        assignee: {
          _id: 'u3',
          name: 'Bob Wilson',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
        },
        dueDate: new Date('2024-03-15'),
        tags: ['documentation', 'api'],
        attachments: [],
        comments: [],
        milestones: [
          { _id: 'm7', title: 'Endpoint documentation', completed: true, dueDate: new Date('2024-03-12') },
          { _id: 'm8', title: 'Example requests', completed: true, dueDate: new Date('2024-03-14') },
          { _id: 'm9', title: 'Error handling docs', completed: true, dueDate: new Date('2024-03-15') }
        ],
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-03-15')
      }
    ];
    setTasks(mockTasks);
  }, [projectId]);

  const columns = [
    { id: 'pending', title: 'Pending', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50 border-blue-200' },
    { id: 'completed', title: 'Completed', color: 'bg-green-50 border-green-200' },
    { id: 'cancelled', title: 'Cancelled', color: 'bg-red-50 border-red-200' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '⚪';
      default: return '⚪';
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedTask) return;

    const updatedTasks = tasks.map(task =>
      task._id === draggedTask ? { ...task, status: newStatus as Task['status'] } : task
    );
    setTasks(updatedTasks);
    setDraggedTask(null);

    // Call API to update task status
    onTaskUpdate?.(draggedTask, { status: newStatus as Task['status'] });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getCompletedMilestones = (milestones: Task['milestones']) => {
    return milestones.filter(m => m.completed).length;
  };

  const getTotalMilestones = (milestones: Task['milestones']) => {
    return milestones.length;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Task Board</h2>
          <p className="text-sm text-gray-600">Drag and drop tasks between columns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Task Board */}
      <div className="flex-1 flex gap-4 p-4 overflow-x-auto">
        {columns.map(column => (
          <div
            key={column.id}
            className={`flex-1 min-w-80 rounded-lg border-2 border-dashed ${column.color} p-4`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">{column.title}</h3>
              <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-full">
                {getTasksByStatus(column.id).length}
              </span>
            </div>

            <div className="space-y-3">
              {getTasksByStatus(column.id).map(task => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  onClick={() => handleTaskClick(task)}
                  className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900 text-sm leading-tight">
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">{getPriorityIcon(task.priority)}</span>
                      <button className="text-gray-600 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Milestones Progress */}
                  {task.milestones.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Milestones</span>
                        <span>{getCompletedMilestones(task.milestones)}/{getTotalMilestones(task.milestones)}</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-1.5">
                        <div
                          className="bg-accent h-1.5 rounded-full transition-all"
                          style={{
                            width: `${(getCompletedMilestones(task.milestones) / getTotalMilestones(task.milestones)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {task.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {task.tags.length > 3 && (
                        <span className="text-xs text-gray-600">+{task.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Task Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Priority Badge */}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>

                      {/* Due Date */}
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Assignee */}
                      {task.assignee && (
                        <div className="flex items-center gap-1">
                          <img
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                            className="w-6 h-6 rounded-full"
                          />
                        </div>
                      )}

                      {/* Attachments */}
                      {task.attachments.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Paperclip className="w-3 h-3" />
                          <span>{task.attachments.length}</span>
                        </div>
                      )}

                      {/* Comments */}
                      {task.comments.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MessageSquare className="w-3 h-3" />
                          <span>{task.comments.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updates) => {
            setTasks(tasks.map(t => t._id === selectedTask._id ? { ...t, ...updates } : t));
            onTaskUpdate?.(selectedTask._id, updates);
          }}
          onDelete={() => {
            setTasks(tasks.filter(t => t._id !== selectedTask._id));
            onTaskDelete?.(selectedTask._id);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

// Task Detail Modal Component
interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    dueDate: task.dueDate?.toISOString().split('T')[0] || ''
  });

  const handleSave = () => {
    onUpdate({
      title: editData.title,
      description: editData.description,
      priority: editData.priority as Task['priority'],
      dueDate: editData.dueDate ? new Date(editData.dueDate) : undefined
    });
    setIsEditing(false);
  };

  const toggleMilestone = (milestoneId: string) => {
    const updatedMilestones = task.milestones.map(m =>
      m._id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    onUpdate({ milestones: updatedMilestones });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Task Details</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-gray-600 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData({ ...editData, priority: e.target.value as Task['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editData.dueDate}
                    onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Task Info */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h4>
                {task.description && (
                  <p className="text-gray-600">{task.description}</p>
                )}
              </div>

              {/* Milestones */}
              {task.milestones.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Milestones</h5>
                  <div className="space-y-2">
                    {task.milestones.map(milestone => (
                      <div key={milestone._id} className="flex items-center gap-3">
                        <button
                          onClick={() => toggleMilestone(milestone._id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            milestone.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300'
                          }`}
                        >
                          {milestone.completed && <CheckCircle className="w-3 h-3" />}
                        </button>
                        <span className={`flex-1 ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {milestone.title}
                        </span>
                        {milestone.dueDate && (
                          <span className="text-sm text-gray-600">
                            {new Date(milestone.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Task Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => onUpdate({ status: 'completed' })}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Complete
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DragDropTaskBoard;
