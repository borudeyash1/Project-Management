import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Calendar, Clock, Flag, CheckCircle, Upload, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TaskFile {
  _id: string;
  name: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

interface RatingDetails {
  timeliness: number;
  quality: number;
  communication: number;
  completeness: number;
  comments: string;
  overallRating?: number;
  ratedAt?: Date;
  ratedBy?: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  taskType: 'status-update' | 'file-submission' | 'link-submission' | 'general' | 'review';
  assignedTo: string;
  assignedToName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'verified';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  dueDate: Date;
  progress: number;
  files: TaskFile[];
  links: string[];
  subtasks: Subtask[];
  rating?: number;
  ratingDetails?: RatingDetails;
  verifiedBy?: string;
  verifiedAt?: Date;
  isFinished?: boolean;
  requiresFile?: boolean;
  requiresLink?: boolean;
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
  const { t } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newLink, setNewLink] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTask, setRatingTask] = useState<Task | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingDetails, setRatingDetails] = useState({
    timeliness: 0,
    quality: 0,
    communication: 0,
    completeness: 0,
    comments: ''
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    taskType: 'general' as Task['taskType'],
    assignedTo: '',
    status: 'pending' as Task['status'],
    priority: 'medium' as Task['priority'],
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    progress: 0,
    subtasks: [] as Subtask[],
    files: [] as TaskFile[],
    links: [] as string[],
    requiresFile: false,
    requiresLink: false
  });

  const handleCreateTask = () => {
    if (!taskForm.title.trim() || !taskForm.assignedTo) {
      alert(t('project.tasks.alert.fillRequired'));
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
      taskType: 'general',
      assignedTo: '',
      status: 'pending',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      progress: 0,
      subtasks: [],
      files: [],
      links: [],
      requiresFile: false,
      requiresLink: false
    });
  };

  const handleAddSubtask = (taskId: string) => {
    if (!newSubtaskTitle.trim()) return;
    
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const newSubtask: Subtask = {
      _id: `subtask_${Date.now()}`,
      title: newSubtaskTitle,
      completed: false
    };

    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    onUpdateTask(taskId, { subtasks: updatedSubtasks });
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(st =>
      st._id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    onUpdateTask(taskId, { subtasks: updatedSubtasks });
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.filter(st => st._id !== subtaskId);
    onUpdateTask(taskId, { subtasks: updatedSubtasks });
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      taskType: task.taskType || 'general',
      assignedTo: task.assignedTo,
      status: task.status,
      priority: task.priority,
      startDate: new Date(task.startDate).toISOString().split('T')[0],
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      progress: task.progress,
      subtasks: task.subtasks || [],
      files: task.files || [],
      links: task.links || [],
      requiresFile: task.requiresFile || false,
      requiresLink: task.requiresLink || false
    });
  };

  const handleAddLink = (taskId: string) => {
    if (!newLink.trim()) return;
    
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const updatedLinks = [...(task.links || []), newLink];
    onUpdateTask(taskId, { links: updatedLinks });
    setNewLink('');
  };

  const handleRemoveLink = (taskId: string, linkIndex: number) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const updatedLinks = task.links.filter((_, index) => index !== linkIndex);
    onUpdateTask(taskId, { links: updatedLinks });
  };

  const handleVerifyTask = (task: Task) => {
    onUpdateTask(task._id, { 
      status: 'verified',
      verifiedBy: 'current_user_id', // Replace with actual user ID
      verifiedAt: new Date()
    });
  };

  const handleRateTask = () => {
    if (!ratingTask) return;
    
    // Calculate overall rating from individual criteria
    const overallRating = Math.round(
      (ratingDetails.timeliness + ratingDetails.quality + 
       ratingDetails.communication + ratingDetails.completeness) / 4
    );
    
    onUpdateTask(ratingTask._id, { 
      rating: overallRating,
      ratingDetails: {
        ...ratingDetails,
        overallRating,
        ratedAt: new Date(),
        ratedBy: 'current_user_id' // Replace with actual user ID
      },
      isFinished: true
    });
    
    setShowRatingModal(false);
    setRatingTask(null);
    setRating(0);
    setRatingDetails({
      timeliness: 0,
      quality: 0,
      communication: 0,
      completeness: 0,
      comments: ''
    });
  };

  const openRatingModal = (task: Task) => {
    setRatingTask(task);
    setRating(task.rating || 0);
    
    // Reset rating details
    setRatingDetails({
      timeliness: 0,
      quality: 0,
      communication: 0,
      completeness: 0,
      comments: ''
    });
    
    setShowRatingModal(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'high': return 'bg-orange-200 text-orange-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTaskTypeInfo = (taskType: Task['taskType']) => {
    switch (taskType) {
      case 'status-update':
        return { label: t('project.tasks.types.statusUpdate'), color: 'bg-blue-100 text-blue-700', icon: '📝' };
      case 'file-submission':
        return { label: t('project.tasks.types.fileSubmission'), color: 'bg-purple-100 text-purple-700', icon: '📎' };
      case 'link-submission':
        return { label: t('project.tasks.types.linkSubmission'), color: 'bg-indigo-100 text-indigo-700', icon: '🔗' };
      case 'review':
        return { label: t('project.tasks.types.review'), color: 'bg-yellow-100 text-yellow-700', icon: '👁️' };
      default:
        return { label: t('project.tasks.types.general'), color: 'bg-gray-100 text-gray-700', icon: '📋' };
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
      <div className="bg-white rounded-lg border border-gray-300 p-12 text-center">
        <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('project.tasks.accessRestricted')}</h3>
        <p className="text-gray-600">{t('project.tasks.accessRestrictedSubtitle')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('project.tasks.title')}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {t('project.tasks.subtitle', { count: tasks.length })}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('project.tasks.assignNew')}
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="font-medium">{t('project.tasks.noTasks')}</p>
              <p className="text-sm mt-1">{t('project.tasks.noTasksSubtitle')}</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Task Type Badge */}
                      {task.taskType && (() => {
                        const typeInfo = getTaskTypeInfo(task.taskType);
                        return (
                          <span className={`px-2 py-1 text-xs rounded-full ${typeInfo.color}`}>
                            {typeInfo.icon} {typeInfo.label}
                          </span>
                        );
                      })()}
                      
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
                      className="p-2 text-accent-dark hover:bg-blue-50 rounded-lg"
                      title="Edit Task"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t('project.tasks.alert.deleteConfirm'))) {
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
                    <p className="text-xs text-gray-600 mb-1">{t('project.tasks.startDate')}</p>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(task.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{t('project.tasks.dueDate')}</p>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Subtasks Section */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => setExpandedTaskId(expandedTaskId === task._id ? null : task._id)}
                      className="text-sm font-medium text-accent-dark hover:text-blue-700 flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t('project.tasks.subtasksCompleted', { completed: task.subtasks.filter(st => st.completed).length, total: task.subtasks.length })}
                      <span className="text-xs ml-1">{expandedTaskId === task._id ? '▼' : '▶'}</span>
                    </button>
                    
                    {expandedTaskId === task._id && (
                      <div className="mt-3 space-y-2 pl-4">
                        {task.subtasks.map((subtask) => (
                          <div key={subtask._id} className="flex items-center gap-2 group">
                            <input
                              type="checkbox"
                              checked={subtask.completed}
                              onChange={() => handleToggleSubtask(task._id, subtask._id)}
                              className="w-4 h-4 text-accent-dark rounded"
                            />
                            <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {subtask.title}
                            </span>
                            <button
                              onClick={() => handleDeleteSubtask(task._id, subtask._id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        
                        {/* Add Subtask */}
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="text"
                            value={expandedTaskId === task._id ? newSubtaskTitle : ''}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask(task._id)}
                            placeholder={t('project.tasks.addSubtask')}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                          <button
                            onClick={() => handleAddSubtask(task._id)}
                            className="px-2 py-1 bg-accent text-gray-900 text-sm rounded hover:bg-accent-hover"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Links Section */}
                {expandedTaskId === task._id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">{t('project.tasks.links')}</h5>
                    {task.links && task.links.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {task.links.map((link, index) => (
                          <div key={index} className="flex items-center gap-2 group text-sm">
                            <a href={link} target="_blank" rel="noopener noreferrer" className="flex-1 text-accent-dark hover:underline truncate">
                              {link}
                            </a>
                            <button
                              onClick={() => handleRemoveLink(task._id, index)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={expandedTaskId === task._id ? newLink : ''}
                        onChange={(e) => setNewLink(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddLink(task._id)}
                        placeholder={t('project.tasks.addLink')}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                      <button
                        onClick={() => handleAddLink(task._id)}
                        className="px-2 py-1 bg-accent text-gray-900 text-sm rounded hover:bg-accent-hover"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{t('project.tasks.progress')}</span>
                    <span className="text-xs font-medium text-gray-900">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>

                {/* PM Actions */}
                {task.status === 'completed' && !task.isFinished && (
                  <div className="mt-3 pt-3 border-t border-gray-300 flex items-center gap-2">
                    <button
                      onClick={() => handleVerifyTask(task)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t('project.tasks.verifyTask')}
                    </button>
                    <button
                      onClick={() => openRatingModal(task)}
                      className="flex-1 px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2"
                    >
                      <Flag className="w-4 h-4" />
                      {t('project.tasks.rateAndFinish')}
                    </button>
                  </div>
                )}

                {task.isFinished && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {t('project.tasks.taskFinished')}
                      </span>
                      {task.rating && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= task.rating! ? 'text-yellow-600' : 'text-gray-700'}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Comprehensive Rating Modal */}
      {showRatingModal && ratingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('project.tasks.rating.title')}</h3>
            <p className="text-sm text-gray-600 mb-6">
              {t('project.tasks.rating.evaluate', { title: ratingTask.title })}
              <br />
              <span className="text-xs">{t('project.tasks.rating.assignedTo', { name: ratingTask.assignedToName })}</span>
            </p>
            
            {/* Rating Criteria */}
            <div className="space-y-6">
              {/* 1. Timeliness */}
              <div className="border-b border-gray-300 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent-dark" />
                      {t('project.tasks.rating.timeliness')}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {t('project.tasks.rating.timelinessDesc')}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {ratingDetails.timeliness}/5
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingDetails({...ratingDetails, timeliness: star})}
                      className="text-3xl transition-transform hover:scale-110"
                    >
                      <span className={star <= ratingDetails.timeliness ? 'text-yellow-600' : 'text-gray-700'}>
                        ⭐
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Quality of Work */}
              <div className="border-b border-gray-300 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {t('project.tasks.rating.quality')}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {t('project.tasks.rating.qualityDesc')}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {ratingDetails.quality}/5
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingDetails({...ratingDetails, quality: star})}
                      className="text-3xl transition-transform hover:scale-110"
                    >
                      <span className={star <= ratingDetails.quality ? 'text-yellow-600' : 'text-gray-700'}>
                        ⭐
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Communication */}
              <div className="border-b border-gray-300 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-600" />
                      {t('project.tasks.rating.communication')}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {t('project.tasks.rating.communicationDesc')}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {ratingDetails.communication}/5
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingDetails({...ratingDetails, communication: star})}
                      className="text-3xl transition-transform hover:scale-110"
                    >
                      <span className={star <= ratingDetails.communication ? 'text-yellow-600' : 'text-gray-700'}>
                        ⭐
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Completeness */}
              <div className="border-b border-gray-300 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Flag className="w-4 h-4 text-orange-600" />
                      {t('project.tasks.rating.completeness')}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {t('project.tasks.rating.completenessDesc')}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {ratingDetails.completeness}/5
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingDetails({...ratingDetails, completeness: star})}
                      className="text-3xl transition-transform hover:scale-110"
                    >
                      <span className={star <= ratingDetails.completeness ? 'text-yellow-600' : 'text-gray-700'}>
                        ⭐
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Overall Rating Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('project.tasks.rating.overall')}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {t('project.tasks.rating.average')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-accent-dark">
                      {ratingDetails.timeliness && ratingDetails.quality && 
                       ratingDetails.communication && ratingDetails.completeness
                        ? ((ratingDetails.timeliness + ratingDetails.quality + 
                            ratingDetails.communication + ratingDetails.completeness) / 4).toFixed(1)
                        : '0.0'}
                    </div>
                    <div className="text-xs text-gray-600">out of 5.0</div>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block font-semibold text-gray-900 mb-2">
                  {t('project.tasks.rating.comments')}
                </label>
                <textarea
                  value={ratingDetails.comments}
                  onChange={(e) => setRatingDetails({...ratingDetails, comments: e.target.value})}
                  placeholder={t('project.tasks.rating.commentsPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleRateTask}
                disabled={!ratingDetails.timeliness || !ratingDetails.quality || 
                         !ratingDetails.communication || !ratingDetails.completeness}
                className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {t('project.tasks.rating.submit')}
              </button>
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setRatingTask(null);
                  setRating(0);
                  setRatingDetails({
                    timeliness: 0,
                    quality: 0,
                    communication: 0,
                    completeness: 0,
                    comments: ''
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                {t('project.tasks.rating.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Task Modal */}
      {(showCreateModal || editingTask) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTask ? t('project.tasks.modal.title.edit') : t('project.tasks.modal.title.create')}
            </h3>

            <div className="space-y-4">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('project.tasks.modal.taskTitle')}
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder={t('project.tasks.modal.taskTitlePlaceholder')}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('project.tasks.modal.description')}
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder={t('project.tasks.modal.descriptionPlaceholder')}
                />
              </div>

              {/* Task Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('project.tasks.modal.taskType')}
                </label>
                <select
                  value={taskForm.taskType}
                  onChange={(e) => {
                    const type = e.target.value as Task['taskType'];
                    setTaskForm({ 
                      ...taskForm, 
                      taskType: type,
                      requiresFile: type === 'file-submission',
                      requiresLink: type === 'link-submission'
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="general">{t('project.tasks.types.general')}</option>
                  <option value="status-update">{t('project.tasks.types.statusUpdate')}</option>
                  <option value="file-submission">{t('project.tasks.types.fileSubmission')}</option>
                  <option value="link-submission">{t('project.tasks.types.linkSubmission')}</option>
                  <option value="review">{t('project.tasks.types.review')}</option>
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {taskForm.taskType === 'general' && t('project.tasks.modal.taskTypeDesc.general')}
                  {taskForm.taskType === 'status-update' && t('project.tasks.modal.taskTypeDesc.statusUpdate')}
                  {taskForm.taskType === 'file-submission' && t('project.tasks.modal.taskTypeDesc.fileSubmission')}
                  {taskForm.taskType === 'link-submission' && t('project.tasks.modal.taskTypeDesc.linkSubmission')}
                  {taskForm.taskType === 'review' && t('project.tasks.modal.taskTypeDesc.review')}
                </p>
              </div>

              {/* Assign To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('project.tasks.modal.assignTo')}
                </label>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">{t('project.tasks.modal.selectMember')}</option>
                  {projectTeam.filter(m => m.role !== 'project-manager').map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority (Status removed - always starts as Pending) */}
              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('project.tasks.modal.priority')}
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="low">{t('project.priority.low')}</option>
                    <option value="medium">{t('project.priority.medium')}</option>
                    <option value="high">{t('project.priority.high')}</option>
                    <option value="critical">{t('project.priority.critical')}</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('project.tasks.modal.startDate')}
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
                    {t('project.tasks.modal.dueDate')}
                  </label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Progress - Only show when editing */}
              {editingTask && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('project.tasks.modal.progress', { percent: taskForm.progress })}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={taskForm.progress}
                    onChange={(e) => setTaskForm({ ...taskForm, progress: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {t('project.tasks.modal.progressDesc')}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={editingTask ? handleUpdateTask : handleCreateTask}
                  className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                >
                  {editingTask ? t('project.tasks.modal.update') : t('project.tasks.modal.assign')}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTask(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {t('project.tasks.modal.cancel')}
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
