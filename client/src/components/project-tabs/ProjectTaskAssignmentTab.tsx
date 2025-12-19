import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Calendar, Clock, Flag, CheckCircle, Upload, FileText, Link } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import TaskVerificationModal from '../TaskVerificationModal';

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
  taskType: 'general' | 'submission';
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
  currentUserId?: string;
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
  currentUserId,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onReassignTask
}) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  const inputClassName = `w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    }`;

  const labelClassName = `block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
    }`;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newLink, setNewLink] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTask, setRatingTask] = useState<Task | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verifyingTask, setVerifyingTask] = useState<Task | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingDetails, setRatingDetails] = useState<RatingDetails>({
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
    setVerifyingTask(task);
    setShowVerificationModal(true);
  };

  const handleVerificationComplete = (ratings: any[], comments: string) => {
    if (!verifyingTask) return;

    // Calculate average rating
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    // Convert ratings array to object for storage
    const ratingsObject = ratings.reduce((obj, r) => {
      obj[r.key] = r.rating;
      return obj;
    }, {} as any);

    onUpdateTask(verifyingTask._id, {
      status: 'verified',
      verifiedBy: currentUserId || undefined,
      verifiedAt: new Date(),
      rating: averageRating,
      ratingDetails: {
        ...ratingsObject,
        comments,
        overallRating: averageRating,
        ratedAt: new Date(),
        ratedBy: currentUserId || undefined
      }
    });

    setVerifyingTask(null);
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
      case 'low': return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
      case 'medium': return isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'high': return isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-200 text-orange-700';
      case 'critical': return isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700';
      default: return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  const getTaskTypeInfo = (taskType: Task['taskType']) => {
    switch (taskType) {
      case 'submission':
        return { label: 'Submission Task', color: isDarkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-700', icon: '🔗' };
      default:
        return { label: 'General Task', color: isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700', icon: '📋' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
      case 'in-progress': return isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'completed': return isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700';
      case 'blocked': return isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700';
      default: return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  if (!isProjectManager) {
    return (
      <GlassmorphicCard className="p-12 text-center">
        <User className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`} />
        <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('project.tasks.accessRestricted')}</h3>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{t('project.tasks.accessRestrictedSubtitle')}</p>
      </GlassmorphicCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Tasks Section */}
      <GlassmorphicCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('project.tasks.title')}</h3>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('project.tasks.subtitle', { count: tasks.filter(t => t.status !== 'verified').length })} Active Tasks
            </p>
          </div>
          <button
            onClick={() => {
              setShowCreateModal(true);
              setEditingTask(null);
              resetForm();
            }}
            className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('project.tasks.modal.title.create')}
          </button>
        </div>

        {/* Active Tasks List */}
        <div className="space-y-3">
          {tasks.filter(t => t.status !== 'verified').length === 0 ? (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <FileText className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`} />
              <p className="font-medium">{t('project.tasks.noTasks')}</p>
              <p className="text-sm mt-1">{t('project.tasks.noTasksSubtitle')}</p>
            </div>
          ) : (
            tasks.filter(t => t.status !== 'verified').map((task) => (
              <div
                key={task._id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-white'
                  }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{task.title}</h4>
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{task.description}</p>
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
                      <span className={`px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                        <User className="w-3 h-3 inline mr-1" />
                        {task.assignedToName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Verify Button - Only show for completed tasks */}
                    {task.status === 'completed' && !task.verifiedBy && (
                      <button
                        onClick={() => handleVerifyTask(task)}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1"
                        title="Verify Task as Completed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Verify
                      </button>
                    )}

                    {/* Edit and Delete buttons - Hide for verified tasks */}
                    {task.status !== 'verified' && (
                      <>
                        <button
                          onClick={() => openEditModal(task)}
                          className={`p-2 rounded-lg ${isDarkMode ? 'text-blue-400 hover:bg-blue-900/30' : 'text-accent-dark hover:bg-blue-50'}`}
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
                          className={`p-2 rounded-lg ${isDarkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'}`}
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-4 mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('project.tasks.startDate')}</p>
                    <p className={`text-sm flex items-center gap-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Calendar className="w-3 h-3" />
                      {new Date(task.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('project.tasks.dueDate')}</p>
                    <p className={`text-sm flex items-center gap-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Clock className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Submitted URLs - For Submission Tasks */}
                {task.taskType === 'submission' && (task.status === 'completed' || task.status === 'verified' || (task.links && task.links.length > 0)) && (
                  <div className={`mt-3 p-3 border rounded-lg ${isDarkMode ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-200'}`}>
                    <h5 className={`text-sm font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-indigo-100' : 'text-indigo-900'}`}>
                      <Link className="w-4 h-4" />
                      📎 Submitted URLs by Employee
                    </h5>

                    {/* Show links if they exist */}
                    {task.links && task.links.length > 0 ? (
                      <div className="space-y-2">
                        {task.links.map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 p-2 rounded-lg transition-colors group ${isDarkMode ? 'bg-gray-800 hover:bg-indigo-900/40' : 'bg-white hover:bg-indigo-100'
                              }`}
                          >
                            <Link className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                            <span className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline truncate flex-1">
                              {link}
                            </span>
                            <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              Open →
                            </span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-sm italic ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        No URLs submitted yet
                      </p>
                    )}

                    {/* Verify Button - Show for completed submission tasks */}
                    {task.status === 'completed' && !task.verifiedBy && (
                      <button
                        onClick={() => handleVerifyTask(task)}
                        className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Verify Submission
                      </button>
                    )}

                    {/* Verified Status */}
                    {task.verifiedBy && (
                      <div className={`mt-3 flex items-center gap-2 text-sm p-2 rounded-lg ${isDarkMode ? 'text-green-400 bg-green-900/20' : 'text-green-700 bg-green-50'}`}>
                        <CheckCircle className="w-4 h-4" />
                        Verified ✓
                      </div>
                    )}
                  </div>
                )}

                {/* Subtasks Section */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => setExpandedTaskId(expandedTaskId === task._id ? null : task._id)}
                      className={`text-sm font-medium flex items-center gap-1 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-accent-dark hover:text-blue-700'}`}
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
                            <span className={`flex-1 text-sm ${subtask.completed
                                ? 'line-through text-gray-500'
                                : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                              {subtask.title}
                            </span>
                            <button
                              onClick={() => handleDeleteSubtask(task._id, subtask._id)}
                              className={`opacity-0 group-hover:opacity-100 p-1 rounded ${isDarkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Links Section */}
                {expandedTaskId === task._id && (
                  <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h5 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('project.tasks.links')}</h5>
                    {task.links && task.links.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {task.links.map((link, index) => (
                          <div key={index} className="flex items-center gap-2 group text-sm">
                            <a href={link} target="_blank" rel="noopener noreferrer" className={`flex-1 hover:underline truncate ${isDarkMode ? 'text-blue-400' : 'text-accent-dark'}`}>
                              {link}
                            </a>
                            <button
                              onClick={() => handleRemoveLink(task._id, index)}
                              className={`opacity-0 group-hover:opacity-100 p-1 rounded ${isDarkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'}`}
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
                        className={`flex-1 px-2 py-1 text-sm border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                          }`}
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

                {/* PM Actions */}
                {task.status === 'completed' && !task.isFinished && (
                  <div className={`mt-3 pt-3 border-t flex items-center gap-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
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
                  <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium flex items-center gap-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        <CheckCircle className="w-4 h-4" />
                        {t('project.tasks.taskFinished')}
                      </span>
                      {task.rating && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= task.rating! ? 'text-yellow-600' : 'text-gray-600'}>
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
      </GlassmorphicCard>

      {/* Comprehensive Rating Modal */}
      {showRatingModal && ratingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <h3 className="text-xl font-bold mb-2">{t('project.tasks.rating.title')}</h3>
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('project.tasks.rating.evaluate', { title: ratingTask.title })}
              <br />
              <span className="text-xs">{t('project.tasks.rating.assignedTo', { name: ratingTask.assignedToName })}</span>
            </p>

            {/* Rating Criteria */}
            <div className="space-y-6">
              {[
                { label: t('project.tasks.rating.timeliness'), desc: t('project.tasks.rating.timelinessDesc'), key: 'timeliness' as keyof RatingDetails, icon: Clock, color: 'text-accent-dark' },
                { label: t('project.tasks.rating.quality'), desc: t('project.tasks.rating.qualityDesc'), key: 'quality' as keyof RatingDetails, icon: CheckCircle, color: 'text-green-600' },
                { label: t('project.tasks.rating.communication'), desc: t('project.tasks.rating.communicationDesc'), key: 'communication' as keyof RatingDetails, icon: User, color: 'text-purple-600' },
                { label: t('project.tasks.rating.completeness'), desc: t('project.tasks.rating.completenessDesc'), key: 'completeness' as keyof RatingDetails, icon: Flag, color: 'text-orange-600' },
              ].map((criteria) => (
                <div key={criteria.key} className={`border-b pb-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        <criteria.icon className={`w-4 h-4 ${criteria.color}`} />
                        {criteria.label}
                      </h4>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {criteria.desc}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {(ratingDetails as any)[criteria.key]}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRatingDetails({ ...ratingDetails, [criteria.key]: star })}
                        className="text-3xl transition-transform hover:scale-110"
                      >
                        <span className={star <= (ratingDetails as any)[criteria.key] ? 'text-yellow-600' : 'text-gray-600'}>
                          ⭐
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Overall Rating Display */}
              <div className={`border rounded-lg p-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('project.tasks.rating.overall')}</h4>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('project.tasks.rating.average')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-accent-dark'}`}>
                      {ratingDetails.timeliness && ratingDetails.quality &&
                        ratingDetails.communication && ratingDetails.completeness
                        ? ((ratingDetails.timeliness + ratingDetails.quality +
                          ratingDetails.communication + ratingDetails.completeness) / 4).toFixed(1)
                        : '0.0'}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>out of 5.0</div>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('project.tasks.rating.comments')}
                </label>
                <textarea
                  value={ratingDetails.comments}
                  onChange={(e) => setRatingDetails({ ...ratingDetails, comments: e.target.value })}
                  placeholder={t('project.tasks.rating.commentsPlaceholder')}
                  className={inputClassName}
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className={`flex items-center gap-3 mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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
                className={`flex-1 px-4 py-2 border rounded-lg font-medium ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
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
          <div className={`rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <h3 className="text-lg font-semibold mb-4">
              {editingTask ? t('project.tasks.modal.title.edit') : t('project.tasks.modal.title.create')}
            </h3>

            <div className="space-y-4">
              {/* Task Title */}
              <div>
                <label className={labelClassName}>
                  {t('project.tasks.modal.taskTitle')}
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className={inputClassName}
                  placeholder={t('project.tasks.modal.taskTitlePlaceholder')}
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelClassName}>
                  {t('project.tasks.modal.description')}
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={3}
                  className={inputClassName}
                  placeholder={t('project.tasks.modal.descriptionPlaceholder')}
                />
              </div>

              {/* Task Type */}
              <div>
                <label className={labelClassName}>
                  {t('project.tasks.modal.taskType')}
                </label>
                <select
                  value={taskForm.taskType}
                  onChange={(e) => {
                    const type = e.target.value as Task['taskType'];
                    setTaskForm({
                      ...taskForm,
                      taskType: type,
                      requiresFile: false,
                      requiresLink: type === 'submission'
                    });
                  }}
                  className={inputClassName}
                >
                  <option value="general">📋 General Task</option>
                  <option value="submission">🔗 Submission Task</option>
                </select>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {taskForm.taskType === 'general' && 'Employee can update status: Pending → In Progress → Completed'}
                  {taskForm.taskType === 'submission' && 'Employee must submit URL for review'}
                </p>
              </div>

              {/* Assign To */}
              <div>
                <label className={labelClassName}>
                  {t('project.tasks.modal.assignTo')}
                </label>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  className={inputClassName}
                >
                  <option value="">{t('project.tasks.modal.selectMember')}</option>
                  {projectTeam.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className={labelClassName}>
                  {t('project.tasks.modal.priority')}
                </label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                  className={inputClassName}
                >
                  <option value="low">{t('project.priority.low')}</option>
                  <option value="medium">{t('project.priority.medium')}</option>
                  <option value="high">{t('project.priority.high')}</option>
                  <option value="critical">{t('project.priority.critical')}</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClassName}>
                    {t('project.tasks.modal.startDate')}
                  </label>
                  <input
                    type="date"
                    value={taskForm.startDate}
                    onChange={(e) => setTaskForm({ ...taskForm, startDate: e.target.value })}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className={labelClassName}>
                    {t('project.tasks.modal.dueDate')}
                  </label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className={inputClassName}
                  />
                </div>
              </div>


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
                  className={`flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700'}`}
                >
                  {t('project.tasks.modal.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task History Section - Verified Tasks */}
      {tasks.filter(t => t.status === 'verified').length > 0 && (
        <GlassmorphicCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📜 Task History</h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {tasks.filter(t => t.status === 'verified').length} Verified & Completed Tasks
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.filter(t => t.status === 'verified').map((task) => (
              <div
                key={task._id}
                className={`border rounded-lg p-4 opacity-75 ${isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-gray-50'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{task.title}</h4>
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>
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

                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        Verified
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                        <User className="w-3 h-3 inline mr-1" />
                        {task.assignedToName}
                      </span>
                      {task.verifiedAt && (
                        <span className={`px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                          Verified on {new Date(task.verifiedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-4 mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                  <div>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Start Date</p>
                    <p className={`text-sm flex items-center gap-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Calendar className="w-3 h-3" />
                      {new Date(task.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed Date</p>
                    <p className={`text-sm flex items-center gap-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <CheckCircle className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Submitted URLs - For Submission Tasks */}
                {task.taskType === 'submission' && task.links && task.links.length > 0 && (
                  <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                    <p className={`text-xs font-medium mb-2 flex items-center gap-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Link className="w-3 h-3" />
                      Submitted URLs
                    </p>
                    <div className="space-y-2">
                      {task.links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 p-2 rounded-lg transition-colors text-sm hover:underline ${isDarkMode ? 'bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/40' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                        >
                          <Link className="w-3 h-3" />
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassmorphicCard>
      )}

      {/* Task Verification Modal */}
      <TaskVerificationModal
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          setVerifyingTask(null);
        }}
        onVerify={handleVerificationComplete}
        taskTitle={verifyingTask?.title || ''}
      />
    </div>
  );
};

export default ProjectTaskAssignmentTab;
