import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Calendar, Clock, Flag, CheckCircle, Upload, FileText } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  dueDate: Date;
  progress: number;
  files: any[];
  subtasks: Subtask[];
}

interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
}

interface ProjectTaskAssignmentTabProps {
  projectId: string;
  projectTeam: any[];
  tasks: Task[];
  isProjectManager: boolean;
  onCreateTask: (task: Partial<Task>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onReassignTask: (taskId: string, newAssignee: string) => void;
}

const ProjectTaskAssignmentTab: React.FC<ProjectTaskAssignmentTabProps> = ({
  projectId,
  projectTeam,
  tasks,
  isProjectManager,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onReassignTask
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: 'pending' as Task['status'],
    priority: 'medium' as Task['priority'],
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    progress: 0
  });

  const handleCreateTask = () => {
    if (!taskForm.title.trim() || !taskForm.assignedTo) {
      alert('Please fill in all required fields');
      return;
    }

    const assignedMember = projectTeam.find(m => m._id === taskForm.assignedTo);
    
    const newTask: Partial<Task> = {
      _id: `task_${Date.now()}`,
      title: taskForm.title,
      description: taskForm.description,
      assignedTo: taskForm.assignedTo,
      assignedToName: assignedMember?.name || 'Unknown',
      status: taskForm.status,
      priority: taskForm.priority,
      startDate: new Date(taskForm.startDate),
      dueDate: new Date(taskForm.dueDate),
      progress: taskForm.progress,
      files: [],
      subtasks: []
    };

    onCreateTask(newTask);
    setShowCreateModal(false);
    resetForm();
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;

    const assignedMember = projectTeam.find(m => m._id === taskForm.assignedTo);

    const updates: Partial<Task> = {
      title: taskForm.title,
      description: taskForm.description,
      assignedTo: taskForm.assignedTo,
      assignedToName: assignedMember?.name || 'Unknown',
      status: taskForm.status,
      priority: taskForm.priority,
      startDate: new Date(taskForm.startDate),
      dueDate: new Date(taskForm.dueDate),
      progress: taskForm.progress
    };

    onUpdateTask(editingTask._id, updates);
    setEditingTask(null);
    resetForm();
  };

  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      assignedTo: '',
      status: 'pending',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      progress: 0
    });
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      status: task.status,
      priority: task.priority,
      startDate: new Date(task.startDate).toISOString().split('T')[0],
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      progress: task.progress
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'blocked': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isProjectManager) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600">Only the Project Manager can assign and manage tasks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Task Assignment</h3>
            <p className="text-sm text-gray-600 mt-1">
              Assign and manage tasks for your team ({tasks.length} tasks)
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Assign New Task
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No tasks assigned yet</p>
              <p className="text-sm mt-1">Create your first task to get started</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                        <Flag className="w-3 h-3 inline mr-1" />
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        <User className="w-3 h-3 inline mr-1" />
                        {task.assignedToName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit Task"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this task?')) {
                          onDeleteTask(task._id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Start Date</p>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(task.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Due Date</p>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs font-medium text-gray-900">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Task Modal */}
      {(showCreateModal || editingTask) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTask ? 'Edit Task' : 'Assign New Task'}
            </h3>

            <div className="space-y-4">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter task title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter task description"
                />
              </div>

              {/* Assign To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To *
                </label>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select team member...</option>
                  {projectTeam.filter(m => m.role !== 'project-manager').map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={taskForm.startDate}
                    onChange={(e) => setTaskForm({ ...taskForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Progress */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress ({taskForm.progress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={taskForm.progress}
                  onChange={(e) => setTaskForm({ ...taskForm, progress: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={editingTask ? handleUpdateTask : handleCreateTask}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingTask ? 'Update Task' : 'Assign Task'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTask(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTaskAssignmentTab;
