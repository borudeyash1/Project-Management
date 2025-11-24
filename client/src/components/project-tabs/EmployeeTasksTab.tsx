import React, { useState } from 'react';
import { CheckCircle, Clock, Flag, User, Calendar, Upload, Link as LinkIcon, ChevronDown, ChevronUp, List, LayoutGrid, CalendarDays, BarChart3, Table2, Activity, Users2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TaskFile {
  _id: string;
  name: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
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
  verifiedBy?: string;
  verifiedAt?: Date;
  isFinished?: boolean;
  requiresFile?: boolean;
  requiresLink?: boolean;
}

interface EmployeeTasksTabProps {
  tasks: Task[];
  currentUserId: string;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const EmployeeTasksTab: React.FC<EmployeeTasksTabProps> = ({
  tasks,
  currentUserId,
  onUpdateTask
}) => {
  const { t } = useTranslation();
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newLink, setNewLink] = useState<{[taskId: string]: string}>({});
  const [statusUpdate, setStatusUpdate] = useState<{[taskId: string]: string}>({});
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar' | 'gantt' | 'table' | 'dashboard' | 'workload'>('list');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);

  // Filter tasks assigned to current user
  const myTasks = tasks.filter(task => task.assignedTo === currentUserId);

  // Apply status filter
  const filteredTasks = filterStatus === 'all' 
    ? myTasks 
    : myTasks.filter(task => task.status === filterStatus);

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    onUpdateTask(taskId, { status: newStatus });
  };

  // Drag and Drop Handlers
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (newStatus: Task['status']) => {
    if (draggedTask && draggedTask.status !== newStatus) {
      onUpdateTask(draggedTask._id, { status: newStatus });
    }
    setDraggedTask(null);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTaskForModal(task);
    setExpandedTaskId(task._id);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(st =>
      st._id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    // Calculate progress based on completed subtasks
    const completedCount = updatedSubtasks.filter(st => st.completed).length;
    const progress = Math.round((completedCount / updatedSubtasks.length) * 100);

    onUpdateTask(taskId, { 
      subtasks: updatedSubtasks,
      progress 
    });
  };

  const handleAddLink = (taskId: string) => {
    const link = newLink[taskId];
    if (!link || !link.trim()) return;
    
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const updatedLinks = [...(task.links || []), link.trim()];
    onUpdateTask(taskId, { links: updatedLinks });
    
    // Clear input
    setNewLink({ ...newLink, [taskId]: '' });
  };

  const handleRemoveLink = (taskId: string, linkIndex: number) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const updatedLinks = task.links.filter((_, index) => index !== linkIndex);
    onUpdateTask(taskId, { links: updatedLinks });
  };

  const handleFileUpload = (taskId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // In a real app, you would upload to a server and get URLs
    // For now, we'll simulate with file names
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const newFiles = Array.from(files).map((file, index) => ({
      _id: `file_${Date.now()}_${index}`,
      name: file.name,
      url: URL.createObjectURL(file), // Temporary URL for preview
      uploadedAt: new Date(),
      uploadedBy: currentUserId
    }));

    const updatedFiles = [...(task.files || []), ...newFiles];
    onUpdateTask(taskId, { files: updatedFiles });
  };

  const handleRemoveFile = (taskId: string, fileId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const updatedFiles = task.files.filter(f => f._id !== fileId);
    onUpdateTask(taskId, { files: updatedFiles });
  };

  const handleAddStatusUpdate = (taskId: string) => {
    const update = statusUpdate[taskId];
    if (!update || !update.trim()) return;

    // In a real app, you'd save this to a comments/updates array
    // For now, we'll add it to the description or a custom field
    alert(t('project.employeeTasks.submitUpdate') + `: ${update}`);
    
    // Clear input
    setStatusUpdate({ ...statusUpdate, [taskId]: '' });
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
      case 'verified': return 'bg-purple-100 text-purple-700';
      case 'blocked': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isOverdue = (dueDate: Date) => {
    return new Date(dueDate) < new Date() && !['completed', 'verified'].includes(filterStatus);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('project.employeeTasks.title')}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {t('project.employeeTasks.subtitle', { count: filteredTasks.length })}
            </p>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('project.employeeTasks.filter.label')}</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent"
            >
              <option value="all">{t('project.employeeTasks.filter.all')}</option>
              <option value="pending">{t('project.employeeTasks.filter.pending')}</option>
              <option value="in-progress">{t('project.employeeTasks.filter.inProgress')}</option>
              <option value="completed">{t('project.employeeTasks.filter.completed')}</option>
              <option value="verified">{t('project.employeeTasks.filter.verified')}</option>
              <option value="blocked">{t('project.employeeTasks.filter.blocked')}</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 flex-wrap">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-accent-dark shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={t('project.employeeTasks.views.list')}
            >
              <List className="w-4 h-4" />
              <span className="text-xs font-medium">{t('project.employeeTasks.views.list')}</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                viewMode === 'kanban' 
                  ? 'bg-white text-accent-dark shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={t('project.employeeTasks.views.kanban')}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-xs font-medium">{t('project.employeeTasks.views.kanban')}</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-white text-accent-dark shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={t('project.employeeTasks.views.calendar')}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="text-xs font-medium">{t('project.employeeTasks.views.calendar')}</span>
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                viewMode === 'gantt' 
                  ? 'bg-white text-accent-dark shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={t('project.employeeTasks.views.gantt')}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs font-medium">{t('project.employeeTasks.views.gantt')}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white text-accent-dark shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={t('project.employeeTasks.views.table')}
            >
              <Table2 className="w-4 h-4" />
              <span className="text-xs font-medium">{t('project.employeeTasks.views.table')}</span>
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                viewMode === 'dashboard' 
                  ? 'bg-white text-accent-dark shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={t('project.employeeTasks.views.dashboard')}
            >
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium">{t('project.employeeTasks.views.dashboard')}</span>
            </button>
            <button
              onClick={() => setViewMode('workload')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                viewMode === 'workload' 
                  ? 'bg-white text-accent-dark shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={t('project.employeeTasks.views.workload')}
            >
              <Users2 className="w-4 h-4" />
              <span className="text-xs font-medium">{t('project.employeeTasks.views.workload')}</span>
            </button>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">{t('project.employeeTasks.stats.total')}</p>
            <p className="text-2xl font-bold text-gray-900">{myTasks.length}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-accent-dark mb-1">{t('project.employeeTasks.stats.inProgress')}</p>
            <p className="text-2xl font-bold text-blue-700">
              {myTasks.filter(t => t.status === 'in-progress').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-xs text-green-600 mb-1">{t('project.employeeTasks.stats.completed')}</p>
            <p className="text-2xl font-bold text-green-700">
              {myTasks.filter(t => t.status === 'completed' || t.status === 'verified').length}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-xs text-red-600 mb-1">{t('project.employeeTasks.stats.overdue')}</p>
            <p className="text-2xl font-bold text-red-700">
              {myTasks.filter(t => isOverdue(t.dueDate) && t.status !== 'completed' && t.status !== 'verified').length}
            </p>
          </div>
        </div>

        {/* Tasks Display - Different Views */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="font-medium">{t('project.employeeTasks.noTasks')}</p>
                <p className="text-sm mt-1">
                  {filterStatus === 'all' 
                    ? t('project.employeeTasks.noTasksSubtitle.all')
                    : t('project.employeeTasks.noTasksSubtitle.filtered', { status: filterStatus })}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
              <div 
                key={task._id} 
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  isOverdue(task.dueDate) && task.status !== 'completed' && task.status !== 'verified'
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 bg-white'
                }`}
              >
                {/* Task Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      {task.isFinished && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {t('project.employeeTasks.finished')}
                        </span>
                      )}
                    </div>
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
                      
                      {/* Status Display - Only show selector for general tasks */}
                      {!task.isFinished && task.taskType !== 'file-submission' && task.taskType !== 'link-submission' ? (
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value as Task['status'])}
                          className={`px-2 py-1 text-xs rounded-full border-0 cursor-pointer ${getStatusColor(task.status)}`}
                          disabled={task.status === 'verified'}
                        >
                          <option value="pending">{t('project.employeeTasks.filter.pending')}</option>
                          <option value="in-progress">{t('project.employeeTasks.filter.inProgress')}</option>
                          <option value="completed">{t('project.employeeTasks.filter.completed')}</option>
                          <option value="blocked">{t('project.employeeTasks.filter.blocked')}</option>
                          {task.status === 'verified' && <option value="verified">{t('project.employeeTasks.filter.verified')}</option>}
                        </select>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      )}

                      {isOverdue(task.dueDate) && task.status !== 'completed' && task.status !== 'verified' && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          {t('project.employeeTasks.overdue')}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedTaskId(expandedTaskId === task._id ? null : task._id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    {expandedTaskId === task._id ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 mb-3 pb-3 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{t('project.tasks.startDate')}</p>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(task.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{t('project.tasks.dueDate')}</p>
                    <p className={`text-sm flex items-center gap-1 ${
                      isOverdue(task.dueDate) && task.status !== 'completed' && task.status !== 'verified'
                        ? 'text-red-600 font-semibold' 
                        : 'text-gray-900'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
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

                {/* Expanded Content */}
                {expandedTaskId === task._id && (
                  <div className="space-y-3 pt-3 border-t border-gray-200">
                    {/* Subtasks */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {t('project.employeeTasks.subtasks', { completed: task.subtasks.filter(st => st.completed).length, total: task.subtasks.length })}
                        </h5>
                        <div className="space-y-2 pl-4">
                          {task.subtasks.map((subtask) => (
                            <div key={subtask._id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={subtask.completed}
                                onChange={() => handleToggleSubtask(task._id, subtask._id)}
                                className="w-4 h-4 text-accent-dark rounded"
                                disabled={task.isFinished}
                              />
                              <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                {subtask.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Task Type Specific Sections */}
                    
                    {/* File Submission Task */}
                    {(task.taskType === 'file-submission' || task.requiresFile) && !task.isFinished && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-purple-900 mb-2 flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          {t('project.employeeTasks.uploadRequired')}
                        </h5>
                        
                        {/* File Upload Input */}
                        <div className="mb-3">
                          <label className="block">
                            <input
                              type="file"
                              multiple
                              onChange={(e) => handleFileUpload(task._id, e)}
                              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                            />
                          </label>
                          <p className="text-xs text-gray-600 mt-1">
                            {t('project.employeeTasks.uploadDesc')}
                          </p>
                        </div>

                        {/* Uploaded Files */}
                        {task.files && task.files.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-700">{t('project.employeeTasks.uploadedFiles')}</p>
                            {task.files.map((file) => (
                              <div key={file._id} className="flex items-center justify-between bg-white rounded p-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Upload className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                </div>
                                <button
                                  onClick={() => handleRemoveFile(task._id, file._id)}
                                  className="text-red-600 hover:text-red-700 text-xs ml-2"
                                >
                                  {t('project.employeeTasks.remove')}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Submit Button */}
                        {task.files && task.files.length > 0 && task.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(task._id, 'completed')}
                            className="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                          >
                            {t('project.employeeTasks.markCompleted')}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Link Submission Task */}
                    {(task.taskType === 'link-submission' || task.requiresLink) && !task.isFinished && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-indigo-900 mb-2 flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          {t('project.employeeTasks.submitLinks')}
                        </h5>
                        
                        {/* Link Input */}
                        <div className="flex gap-2 mb-3">
                          <input
                            type="url"
                            value={newLink[task._id] || ''}
                            onChange={(e) => setNewLink({ ...newLink, [task._id]: e.target.value })}
                            placeholder="https://example.com"
                            className="flex-1 px-3 py-2 text-sm border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <button
                            onClick={() => handleAddLink(task._id)}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                          >
                            {t('project.employeeTasks.add')}
                          </button>
                        </div>

                        {/* Submitted Links */}
                        {task.links && task.links.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-700">{t('project.employeeTasks.submittedLinks')}</p>
                            {task.links.map((link, index) => (
                              <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                                <a 
                                  href={link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-sm text-indigo-600 hover:underline truncate flex-1 min-w-0"
                                >
                                  {link}
                                </a>
                                <button
                                  onClick={() => handleRemoveLink(task._id, index)}
                                  className="text-red-600 hover:text-red-700 text-xs ml-2"
                                >
                                  {t('project.employeeTasks.remove')}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Submit Button */}
                        {task.links && task.links.length > 0 && task.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(task._id, 'completed')}
                            className="w-full mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                          >
                            {t('project.employeeTasks.markCompleted')}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Status Update Task */}
                    {task.taskType === 'status-update' && !task.isFinished && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                          {t('project.employeeTasks.provideStatus')}
                        </h5>
                        
                        <div className="space-y-2">
                          <textarea
                            value={statusUpdate[task._id] || ''}
                            onChange={(e) => setStatusUpdate({ ...statusUpdate, [task._id]: e.target.value })}
                            placeholder={t('project.employeeTasks.statusPlaceholder')}
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent resize-none"
                          />
                          <button
                            onClick={() => handleAddStatusUpdate(task._id)}
                            className="px-4 py-2 bg-accent text-gray-900 text-sm rounded-lg hover:bg-accent-hover"
                          >
                            {t('project.employeeTasks.submitUpdate')}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Display Links (for all tasks) */}
                    {task.links && task.links.length > 0 && task.taskType !== 'link-submission' && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          {t('project.employeeTasks.referenceLinks')}
                        </h5>
                        <div className="space-y-1 pl-4">
                          {task.links.map((link, index) => (
                            <a 
                              key={index}
                              href={link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="block text-sm text-accent-dark hover:underline truncate"
                            >
                              {link}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Display Files (for all tasks) */}
                    {task.files && task.files.length > 0 && task.taskType !== 'file-submission' && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          {t('project.employeeTasks.attachedFiles')}
                        </h5>
                        <div className="space-y-1 pl-4">
                          {task.files.map((file) => (
                            <div key={file._id} className="flex items-center gap-2">
                              <Upload className="w-3 h-3 text-gray-600" />
                              <span className="text-sm text-gray-700">{file.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rating Display */}
                    {task.isFinished && task.rating && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('project.employeeTasks.taskRating')}</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= task.rating! ? 'text-yellow-600 text-lg' : 'text-gray-700 text-lg'}>
                              ⭐
                            </span>
                          ))}
                          <span className="text-sm text-gray-600 ml-2">
                            ({task.rating}/5)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          </div>
        )}

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-4 gap-4">
            {/* Pending Column */}
            <div 
              className="bg-gray-50 rounded-lg p-4 min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('pending')}
            >
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
                <span>{t('project.employeeTasks.kanban.pending')}</span>
                <span className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {filteredTasks.filter(t => t.status === 'pending').length}
                </span>
              </h3>
              <div className="space-y-3">
                {filteredTasks.filter(t => t.status === 'pending').map(task => (
                  <div 
                    key={task._id} 
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => handleTaskClick(task)}
                    className={`bg-white border border-gray-300 rounded-lg p-3 hover:shadow-md transition-all cursor-move ${
                      draggedTask?._id === task._id ? 'opacity-50' : ''
                    }`}
                  >
                    <h4 className="font-medium text-gray-900 text-sm mb-2">{task.title}</h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {task.taskType && (() => {
                        const typeInfo = getTaskTypeInfo(task.taskType);
                        return (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${typeInfo.color}`}>
                            {typeInfo.icon}
                          </span>
                        );
                      })()}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div 
              className="bg-blue-50 rounded-lg p-4 min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('in-progress')}
            >
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center justify-between">
                <span>{t('project.employeeTasks.kanban.inProgress')}</span>
                <span className="bg-blue-200 text-blue-700 text-xs px-2 py-1 rounded-full">
                  {filteredTasks.filter(t => t.status === 'in-progress').length}
                </span>
              </h3>
              <div className="space-y-3">
                {filteredTasks.filter(t => t.status === 'in-progress').map(task => (
                  <div 
                    key={task._id} 
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => handleTaskClick(task)}
                    className={`bg-white border border-blue-200 rounded-lg p-3 hover:shadow-md transition-all cursor-move ${
                      draggedTask?._id === task._id ? 'opacity-50' : ''
                    }`}
                  >
                    <h4 className="font-medium text-gray-900 text-sm mb-2">{task.title}</h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {task.taskType && (() => {
                        const typeInfo = getTaskTypeInfo(task.taskType);
                        return (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${typeInfo.color}`}>
                            {typeInfo.icon}
                          </span>
                        );
                      })()}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <Clock className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-1.5">
                      <div className="bg-accent h-1.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Column */}
            <div 
              className="bg-green-50 rounded-lg p-4 min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('completed')}
            >
              <h3 className="font-semibold text-green-900 mb-3 flex items-center justify-between">
                <span>{t('project.employeeTasks.kanban.completed')}</span>
                <span className="bg-green-200 text-green-700 text-xs px-2 py-1 rounded-full">
                  {filteredTasks.filter(t => t.status === 'completed').length}
                </span>
              </h3>
              <div className="space-y-3">
                {filteredTasks.filter(t => t.status === 'completed').map(task => (
                  <div 
                    key={task._id} 
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => handleTaskClick(task)}
                    className={`bg-white border border-green-200 rounded-lg p-3 hover:shadow-md transition-all cursor-move ${
                      draggedTask?._id === task._id ? 'opacity-50' : ''
                    }`}
                  >
                    <h4 className="font-medium text-gray-900 text-sm mb-2">{task.title}</h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {task.taskType && (() => {
                        const typeInfo = getTaskTypeInfo(task.taskType);
                        return (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${typeInfo.color}`}>
                            {typeInfo.icon}
                          </span>
                        );
                      })()}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      {t('project.employeeTasks.kanban.completed')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified/Blocked Column */}
            <div 
              className="bg-purple-50 rounded-lg p-4 min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('verified')}
            >
              <h3 className="font-semibold text-purple-900 mb-3 flex items-center justify-between">
                <span>{t('project.employeeTasks.kanban.verified')}</span>
                <span className="bg-purple-200 text-purple-700 text-xs px-2 py-1 rounded-full">
                  {filteredTasks.filter(t => t.status === 'verified' || t.status === 'blocked').length}
                </span>
              </h3>
              <div className="space-y-3">
                {filteredTasks.filter(t => t.status === 'verified' || t.status === 'blocked').map(task => (
                  <div 
                    key={task._id} 
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => handleTaskClick(task)}
                    className={`bg-white border rounded-lg p-3 hover:shadow-md transition-all cursor-move ${
                      draggedTask?._id === task._id ? 'opacity-50' : ''
                    } ${
                      task.status === 'blocked' ? 'border-red-200' : 'border-purple-200'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900 text-sm mb-2">{task.title}</h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {task.taskType && (() => {
                        const typeInfo = getTaskTypeInfo(task.taskType);
                        return (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${typeInfo.color}`}>
                            {typeInfo.icon}
                          </span>
                        );
                      })()}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        task.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    {task.rating && (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-yellow-600">⭐</span>
                        <span className="text-gray-600">{task.rating}/5</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-700 text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {(() => {
                  const today = new Date();
                  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                  const startingDayOfWeek = firstDay.getDay();
                  const daysInMonth = lastDay.getDate();
                  
                  const days = [];
                  
                  // Empty cells for days before month starts
                  for (let i = 0; i < startingDayOfWeek; i++) {
                    days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50 rounded"></div>);
                  }
                  
                  // Days of the month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const currentDate = new Date(today.getFullYear(), today.getMonth(), day);
                    const tasksOnDay = filteredTasks.filter(task => {
                      const taskDate = new Date(task.dueDate);
                      return taskDate.getDate() === day && 
                             taskDate.getMonth() === today.getMonth() && 
                             taskDate.getFullYear() === today.getFullYear();
                    });
                    
                    const isToday = day === today.getDate();
                    
                    days.push(
                      <div 
                        key={day} 
                        className={`h-24 border rounded-lg p-2 ${
                          isToday ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className={`text-sm font-semibold mb-1 ${
                          isToday ? 'text-accent-dark' : 'text-gray-700'
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {tasksOnDay.slice(0, 2).map(task => (
                            <div 
                              key={task._id} 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskClick(task);
                              }}
                              className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:shadow-sm transition-shadow ${
                                task.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                task.status === 'in-progress' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                'bg-gray-100 text-gray-700 hover:bg-gray-300'
                              }`}
                              title={task.title}
                            >
                              {task.taskType && getTaskTypeInfo(task.taskType).icon} {task.title}
                            </div>
                          ))}
                          {tasksOnDay.length > 2 && (
                            <div className="text-xs text-gray-600">
                              +{tasksOnDay.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Gantt Chart View */}
        {viewMode === 'gantt' && (
          <div className="bg-white rounded-lg border border-gray-300 p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('project.employeeTasks.views.gantt')}</h3>
            
            <div className="min-w-[800px]">
              {/* Timeline Header */}
              <div className="flex border-b border-gray-300 pb-2 mb-4">
                <div className="w-48 font-semibold text-sm text-gray-700">Task</div>
                <div className="flex-1 grid grid-cols-7 gap-1 text-xs text-gray-600 text-center">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day}>{day}</div>
                  ))}
                </div>
              </div>

              {/* Task Rows */}
              {filteredTasks.map(task => {
                const startDate = new Date(task.startDate);
                const dueDate = new Date(task.dueDate);
                const today = new Date();
                const daysDiff = Math.ceil((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                const startOffset = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div 
                    key={task._id} 
                    className="flex items-center mb-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="w-48 pr-4">
                      <div className="text-sm font-medium text-gray-900 truncate">{task.title}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {task.taskType && (() => {
                          const typeInfo = getTaskTypeInfo(task.taskType);
                          return (
                            <span className={`px-1.5 py-0.5 text-xs rounded ${typeInfo.color}`}>
                              {typeInfo.icon}
                            </span>
                          );
                        })()}
                        <span className={`px-1.5 py-0.5 text-xs rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 relative h-8">
                      <div 
                        className={`absolute h-6 rounded flex items-center px-2 text-xs text-white ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in-progress' ? 'bg-accent' :
                          task.status === 'blocked' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`}
                        style={{
                          left: `${Math.max(0, (startOffset / 7) * 100)}%`,
                          width: `${Math.min(100, (daysDiff / 7) * 100)}%`
                        }}
                      >
                        <div className="truncate">{task.progress}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-lg border border-gray-300 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">{t('project.tasks.task')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">{t('project.tasks.type')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">{t('project.tasks.status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">{t('project.tasks.priority')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">{t('project.tasks.progress')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">{t('project.tasks.startDate')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">{t('project.tasks.dueDate')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">{t('project.employeeTasks.taskRating')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTasks.map(task => (
                  <tr 
                    key={task._id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-gray-900">{task.title}</div>
                      <div className="text-xs text-gray-600 truncate max-w-xs">{task.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      {task.taskType && (() => {
                        const typeInfo = getTaskTypeInfo(task.taskType);
                        return (
                          <span className={`px-2 py-1 text-xs rounded-full ${typeInfo.color}`}>
                            {typeInfo.icon} {typeInfo.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-300 rounded-full h-2 max-w-[100px]">
                          <div 
                            className="bg-accent h-2 rounded-full" 
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(task.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {task.rating ? (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-600">⭐</span>
                          <span className="text-sm text-gray-700">{task.rating}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Dashboard View */}
        {viewMode === 'dashboard' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">{t('project.employeeTasks.dashboard.totalTasks')}</h3>
                  <List className="w-5 h-5 opacity-75" />
                </div>
                <p className="text-3xl font-bold">{myTasks.length}</p>
                <p className="text-xs opacity-75 mt-1">{t('project.employeeTasks.dashboard.totalTasksDesc')}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">{t('project.employeeTasks.dashboard.completed')}</h3>
                  <CheckCircle className="w-5 h-5 opacity-75" />
                </div>
                <p className="text-3xl font-bold">
                  {myTasks.filter(t => t.status === 'completed' || t.status === 'verified').length}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {t('project.employeeTasks.dashboard.completedDesc', { percent: Math.round((myTasks.filter(t => t.status === 'completed' || t.status === 'verified').length / myTasks.length) * 100) })}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">{t('project.employeeTasks.dashboard.inProgress')}</h3>
                  <Activity className="w-5 h-5 opacity-75" />
                </div>
                <p className="text-3xl font-bold">
                  {myTasks.filter(t => t.status === 'in-progress').length}
                </p>
                <p className="text-xs opacity-75 mt-1">{t('project.employeeTasks.dashboard.inProgressDesc')}</p>
              </div>
              
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">{t('project.employeeTasks.dashboard.overdue')}</h3>
                  <Clock className="w-5 h-5 opacity-75" />
                </div>
                <p className="text-3xl font-bold">
                  {myTasks.filter(t => isOverdue(t.dueDate) && t.status !== 'completed' && t.status !== 'verified').length}
                </p>
                <p className="text-xs opacity-75 mt-1">{t('project.employeeTasks.dashboard.overdueDesc')}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Task Distribution by Status */}
              <div className="bg-white rounded-lg border border-gray-300 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('project.employeeTasks.dashboard.distribution')}</h3>
                <div className="space-y-3">
                  {['pending', 'in-progress', 'completed', 'verified', 'blocked'].map(status => {
                    const count = myTasks.filter(t => t.status === status).length;
                    const percentage = myTasks.length > 0 ? (count / myTasks.length) * 100 : 0;
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 capitalize">{status}</span>
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getStatusColor(status).replace('text-', 'bg-').replace('100', '500')}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Priority Breakdown */}
              <div className="bg-white rounded-lg border border-gray-300 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('project.employeeTasks.dashboard.priorityBreakdown')}</h3>
                <div className="space-y-3">
                  {['critical', 'high', 'medium', 'low'].map(priority => {
                    const count = myTasks.filter(t => t.priority === priority).length;
                    const percentage = myTasks.length > 0 ? (count / myTasks.length) * 100 : 0;
                    return (
                      <div key={priority}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 capitalize">{priority}</span>
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getPriorityColor(priority).replace('text-', 'bg-').replace('100', '500')}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-white rounded-lg border border-gray-300 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('project.employeeTasks.dashboard.recentTasks')}</h3>
              <div className="space-y-2">
                {filteredTasks.slice(0, 5).map(task => (
                  <div 
                    key={task._id} 
                    onClick={() => handleTaskClick(task)}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {task.taskType && (() => {
                        const typeInfo = getTaskTypeInfo(task.taskType);
                        return <span className="text-lg">{typeInfo.icon}</span>;
                      })()}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-600">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <div className="w-16 bg-gray-300 rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full" style={{ width: `${task.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Workload View */}
        {viewMode === 'workload' && (
          <div className="bg-white rounded-lg border border-gray-300 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('project.employeeTasks.workload.title')}</h3>
            
            {/* Workload Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-accent-dark mb-1">{t('project.employeeTasks.workload.total')}</p>
                <p className="text-2xl font-bold text-blue-700">{myTasks.length} tasks</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 mb-1">{t('project.employeeTasks.workload.capacity')}</p>
                <p className="text-2xl font-bold text-green-700">
                  {Math.round((myTasks.filter(t => t.status === 'in-progress').length / Math.max(myTasks.length, 1)) * 100)}%
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-600 mb-1">{t('project.employeeTasks.workload.avgProgress')}</p>
                <p className="text-2xl font-bold text-orange-700">
                  {Math.round(myTasks.reduce((sum, t) => sum + t.progress, 0) / Math.max(myTasks.length, 1))}%
                </p>
              </div>
            </div>

            {/* Task Timeline */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">{t('project.employeeTasks.workload.tasksByWeek')}</h4>
              {(() => {
                const weeks = [
                  t('project.employeeTasks.workload.weeks.thisWeek'), 
                  t('project.employeeTasks.workload.weeks.nextWeek'), 
                  t('project.employeeTasks.workload.weeks.later')
                ];
                const today = new Date();
                const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                
                return weeks.map(week => {
                  let weekTasks;
                  if (week === t('project.employeeTasks.workload.weeks.thisWeek')) {
                    weekTasks = myTasks.filter(t => new Date(t.dueDate) <= nextWeek);
                  } else if (week === t('project.employeeTasks.workload.weeks.nextWeek')) {
                    const twoWeeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
                    weekTasks = myTasks.filter(t => new Date(t.dueDate) > nextWeek && new Date(t.dueDate) <= twoWeeks);
                  } else {
                    const twoWeeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
                    weekTasks = myTasks.filter(t => new Date(t.dueDate) > twoWeeks);
                  }
                  
                  return (
                    <div key={week} className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">{week}</h5>
                        <span className="text-sm text-gray-600">{weekTasks.length} tasks</span>
                      </div>
                      <div className="space-y-2">
                        {weekTasks.slice(0, 3).map(task => (
                          <div 
                            key={task._id} 
                            onClick={() => handleTaskClick(task)}
                            className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded p-1 -mx-1"
                          >
                            <span className={`w-2 h-2 rounded-full ${
                              task.priority === 'critical' ? 'bg-red-500' :
                              task.priority === 'high' ? 'bg-orange-500' :
                              task.priority === 'medium' ? 'bg-accent' :
                              'bg-gray-400'
                            }`} />
                            <span className="flex-1 text-gray-700 truncate">{task.title}</span>
                            <span className="text-xs text-gray-600">{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        ))}
                        {weekTasks.length > 3 && (
                          <p className="text-xs text-gray-600 pl-4">{t('project.employeeTasks.workload.moreTasks', { count: weekTasks.length - 3 })}</p>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Task Detail Modal */}
        {selectedTaskForModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTaskForModal(null)}
          >
            <div 
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedTaskForModal.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedTaskForModal.taskType && (() => {
                      const typeInfo = getTaskTypeInfo(selectedTaskForModal.taskType);
                      return (
                        <span className={`px-2 py-1 text-xs rounded-full ${typeInfo.color}`}>
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                      );
                    })()}
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedTaskForModal.priority)}`}>
                      <Flag className="w-3 h-3 inline mr-1" />
                      {selectedTaskForModal.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTaskForModal.status)}`}>
                      {selectedTaskForModal.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTaskForModal(null)}
                  className="text-gray-600 hover:text-gray-600 p-2"
                >
                  <ChevronUp className="w-6 h-6 rotate-45" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-4 space-y-4">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('project.employeeTasks.modal.description')}</h3>
                  <p className="text-sm text-gray-600">{selectedTaskForModal.description}</p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">{t('project.tasks.startDate')}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedTaskForModal.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">{t('project.tasks.dueDate')}</h3>
                    <p className={`text-sm flex items-center gap-1 ${
                      isOverdue(selectedTaskForModal.dueDate) && selectedTaskForModal.status !== 'completed' 
                        ? 'text-red-600 font-semibold' 
                        : 'text-gray-600'
                    }`}>
                      <Clock className="w-4 h-4" />
                      {new Date(selectedTaskForModal.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">{t('project.employeeTasks.modal.progress')}</h3>
                    <span className="text-sm font-medium text-gray-900">{selectedTaskForModal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3">
                    <div 
                      className="bg-accent h-3 rounded-full transition-all"
                      style={{ width: `${selectedTaskForModal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Subtasks */}
                {selectedTaskForModal.subtasks && selectedTaskForModal.subtasks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {t('project.employeeTasks.modal.subtasks', { completed: selectedTaskForModal.subtasks.filter(st => st.completed).length, total: selectedTaskForModal.subtasks.length })}
                    </h3>
                    <div className="space-y-2">
                      {selectedTaskForModal.subtasks.map((subtask) => (
                        <div key={subtask._id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={subtask.completed}
                            onChange={() => handleToggleSubtask(selectedTaskForModal._id, subtask._id)}
                            className="w-4 h-4 text-accent-dark rounded"
                            disabled={selectedTaskForModal.isFinished}
                          />
                          <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Files */}
                {selectedTaskForModal.files && selectedTaskForModal.files.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {t('project.employeeTasks.modal.files', { count: selectedTaskForModal.files.length })}
                    </h3>
                    <div className="space-y-2">
                      {selectedTaskForModal.files.map((file) => (
                        <div key={file._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Upload className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700 flex-1">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                {selectedTaskForModal.links && selectedTaskForModal.links.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      {t('project.employeeTasks.modal.links', { count: selectedTaskForModal.links.length })}
                    </h3>
                    <div className="space-y-2">
                      {selectedTaskForModal.links.map((link, index) => (
                        <a 
                          key={index}
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="block text-sm text-accent-dark hover:underline p-2 bg-gray-50 rounded"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rating */}
                {selectedTaskForModal.isFinished && selectedTaskForModal.rating && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('project.employeeTasks.modal.rating')}</h3>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= selectedTaskForModal.rating! ? 'text-yellow-600 text-2xl' : 'text-gray-700 text-2xl'}>
                          ⭐
                        </span>
                      ))}
                      <span className="text-sm text-gray-600 ml-2">
                        ({selectedTaskForModal.rating}/5)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-300 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedTaskForModal(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  {t('project.employeeTasks.modal.close')}
                </button>
                {!selectedTaskForModal.isFinished && selectedTaskForModal.taskType !== 'file-submission' && selectedTaskForModal.taskType !== 'link-submission' && (
                  <select
                    value={selectedTaskForModal.status}
                    onChange={(e) => {
                      handleStatusChange(selectedTaskForModal._id, e.target.value as Task['status']);
                      setSelectedTaskForModal({...selectedTaskForModal, status: e.target.value as Task['status']});
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="pending">{t('project.employeeTasks.filter.pending')}</option>
                    <option value="in-progress">{t('project.employeeTasks.filter.inProgress')}</option>
                    <option value="completed">{t('project.employeeTasks.filter.completed')}</option>
                    <option value="blocked">{t('project.employeeTasks.filter.blocked')}</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTasksTab;
