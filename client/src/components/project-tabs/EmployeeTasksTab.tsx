import React, { useState } from 'react';
import { CheckCircle, Clock, Flag, User, Calendar, Upload, Link as LinkIcon, ChevronDown, ChevronUp, List, LayoutGrid, CalendarDays, BarChart3, Table2, Activity, Users2, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Slider } from '@heroui/slider';

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
  ratingDetails?: {
    timeliness?: number;
    quality?: number;
    effort?: number;
    accuracy?: number;
    collaboration?: number;
    initiative?: number;
    reliability?: number;
    learning?: number;
    compliance?: number;
    comments?: string;
    overallRating?: number;
    ratedAt?: Date;
    ratedBy?: string;
  };
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
  onCreateTask?: (task: Partial<Task>) => void;
}

const EmployeeTasksTab: React.FC<EmployeeTasksTabProps> = ({
  tasks,
  currentUserId,
  onUpdateTask,
  onCreateTask
}) => {
  const { t } = useTranslation();
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newLink, setNewLink] = useState<{ [taskId: string]: string }>({});
  const [statusUpdate, setStatusUpdate] = useState<{ [taskId: string]: string }>({});
  const [sliderValues, setSliderValues] = useState<{ [taskId: string]: number }>({});
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar' | 'gantt' | 'table' | 'dashboard' | 'workload'>('list');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const handleCreateNewTask = () => {
    if (!newTask.title.trim()) return;

    if (onCreateTask) {
      onCreateTask({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        dueDate: new Date(newTask.dueDate),
        status: 'pending',
        assignedTo: currentUserId,
        taskType: 'general',
        startDate: new Date(),
        progress: 0,
        subtasks: [],
        files: [],
        links: []
      });
      setShowCreateModal(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0]
      });
    }
  };

  // Filter tasks assigned to current user
  const myTasks = tasks.filter(task => task.assignedTo === currentUserId);

  // Separate active tasks from verified (history) tasks
  const activeTasks = myTasks.filter(task => task.status !== 'verified');
  const verifiedTasks = myTasks.filter(task => task.status === 'verified');

  // Apply status filter to active tasks only
  const filteredTasks = filterStatus === 'all'
    ? activeTasks
    : filterStatus === 'verified'
      ? verifiedTasks
      : activeTasks.filter(task => task.status === filterStatus);

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
    // Prevent employees from setting tasks to 'verified' status
    if (newStatus === 'verified') {
      setDraggedTask(null);
      return;
    }
    
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
      case 'submission':
        return { label: 'Submission Task', color: 'bg-indigo-100 text-indigo-700', icon: '🔗' };
      default:
        return { label: 'General Task', color: 'bg-gray-100 text-gray-700', icon: '📋' };
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
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('project.employeeTasks.title')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {activeTasks.length} Active Tasks {verifiedTasks.length > 0 && `• ${verifiedTasks.length} Verified`}
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex-wrap">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${viewMode === 'list'
                ? 'bg-white dark:bg-gray-600 text-accent-dark dark:text-accent-light shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              title={t('project.employeeTasks.views.list')}
            >
              <List className="w-4 h-4" />
              <span className="text-xs font-medium">{t('project.employeeTasks.views.list')}</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${viewMode === 'kanban'
                ? 'bg-white dark:bg-gray-600 text-accent-dark dark:text-accent-light shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              title={t('project.employeeTasks.views.kanban')}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-xs font-medium">{t('project.employeeTasks.views.kanban')}</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${viewMode === 'calendar'
                ? 'bg-white dark:bg-gray-600 text-accent-dark dark:text-accent-light shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              title={t('project.employeeTasks.views.calendar')}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="text-xs font-medium">{t('project.employeeTasks.views.calendar')}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${viewMode === 'table'
                ? 'bg-white dark:bg-gray-600 text-accent-dark dark:text-accent-light shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              title={t('project.employeeTasks.views.table')}
            >
              <Table2 className="w-4 h-4" />
              <span className="text-xs font-medium">{t('project.employeeTasks.views.table')}</span>
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${viewMode === 'dashboard'
                ? 'bg-white dark:bg-gray-600 text-accent-dark dark:text-accent-light shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              title={t('project.employeeTasks.views.dashboard')}
            >
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium">{t('project.employeeTasks.views.dashboard')}</span>
            </button>
            <button
              onClick={() => setViewMode('workload')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${viewMode === 'workload'
                ? 'bg-white dark:bg-gray-600 text-accent-dark dark:text-accent-light shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              title={t('project.employeeTasks.views.workload')}
            >
              <Users2 className="w-4 h-4" />
              <span className="text-xs font-medium">{t('project.employeeTasks.views.workload')}</span>
            </button>
          </div>
        </div>

        {/* Task Statistics - Only show in list view */}
        {viewMode === 'list' && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{t('project.employeeTasks.stats.total')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{myTasks.length}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
              <p className="text-xs text-accent-dark dark:text-accent-light mb-1">{t('project.employeeTasks.stats.inProgress')}</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {myTasks.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
              <p className="text-xs text-green-600 dark:text-green-400 mb-1">{t('project.employeeTasks.stats.completed')}</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {myTasks.filter(t => t.status === 'completed' || t.status === 'verified').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
              <p className="text-xs text-red-600 dark:text-red-400 mb-1">{t('project.employeeTasks.stats.overdue')}</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                {myTasks.filter(t => isOverdue(t.dueDate) && t.status !== 'completed' && t.status !== 'verified').length}
              </p>
            </div>
          </div>
        )}

        {/* Tasks Display - Different Views */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-600 dark:text-gray-400" />
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
                  className={`border-2 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 ${isOverdue(task.dueDate) && task.status !== 'completed' && task.status !== 'verified'
                    ? 'border-red-400 dark:border-red-600 bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800'
                    : 'border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:border-accent dark:hover:border-accent-light'
                    }`}
                >
                  {/* Colored Status Bar */}
                  <div className={`h-1.5 ${task.status === 'completed' || task.status === 'verified' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                    task.status === 'in-progress' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      task.status === 'blocked' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                        'bg-gradient-to-r from-gray-300 to-gray-500'
                    }`} />

                  <div className="p-4">
                    {/* Task Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">{task.title}</h4>
                          {task.isFinished && (
                            <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1 shadow-sm">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {t('project.employeeTasks.finished')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-2">{task.description}</p>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Task Type Badge */}
                          {task.taskType && (() => {
                            const typeInfo = getTaskTypeInfo(task.taskType);
                            return (
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${typeInfo.color} shadow-sm`}>
                                <span className="mr-1">{typeInfo.icon}</span>
                                {typeInfo.label}
                              </span>
                            );
                          })()}

                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${getPriorityColor(task.priority)} shadow-sm`}>
                            <Flag className="w-3 h-3 inline mr-1" />
                            {task.priority.toUpperCase()}
                          </span>

                          {isOverdue(task.dueDate) && task.status !== 'completed' && task.status !== 'verified' && (
                            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg shadow-sm animate-pulse">
                              ⚠️ {t('project.employeeTasks.overdue')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expand/Collapse Button - Only show if there's expandable content */}
                      {((task.taskType === 'submission' && !task.isFinished) ||
                        (task.links && task.links.length > 0) ||
                        (task.files && task.files.length > 0) ||
                        (task.isFinished && task.rating)) ? (
                        <button
                          onClick={() => setExpandedTaskId(expandedTaskId === task._id ? null : task._id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-3"
                        >
                          {expandedTaskId === task._id ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      ) : null}
                    </div>

                    {/* Dates - Compact Single Row */}
                    <div className="flex items-center gap-4 mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('project.tasks.startDate')}</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {new Date(task.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`p-1.5 rounded-lg ${isOverdue(task.dueDate) && task.status !== 'completed' && task.status !== 'verified'
                          ? 'bg-red-100 dark:bg-red-900'
                          : 'bg-green-100 dark:bg-green-900'
                          }`}>
                          <Clock className={`w-4 h-4 ${isOverdue(task.dueDate) && task.status !== 'completed' && task.status !== 'verified'
                            ? 'text-red-600 dark:text-red-300'
                            : 'text-green-600 dark:text-green-300'
                            }`} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('project.tasks.dueDate')}</p>
                          <p className={`text-sm font-semibold ${isOverdue(task.dueDate) && task.status !== 'completed' && task.status !== 'verified'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-900 dark:text-gray-100'
                            }`}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Slider - HeroUI Component */}
                    {task.status !== 'verified' && task.taskType === 'general' && (
                      <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="w-full max-w-2xl mx-auto">
                          <Slider
                            label="Task Status"
                            size="md"
                            className="w-full"
                            // Use local slider value if dragging, otherwise derive from status
                            value={
                              sliderValues[task._id] ?? (
                                task.status === 'pending' ? 0 :
                                  task.status === 'in-progress' ? 0.33 :
                                    task.status === 'completed' ? 0.66 :
                                      task.status === 'blocked' ? 0 : 0
                              )
                            }
                            onChange={(value: number | number[]) => {
                              // Only update local state visually, DO NOT call API
                              const numValue = Array.isArray(value) ? value[0] : value;
                              // Limit to max 0.66 (Completed) for employees
                              const limitedValue = Math.min(numValue, 0.66);
                              setSliderValues(prev => ({ ...prev, [task._id]: limitedValue }));
                            }}
                            onChangeEnd={(value: number | number[]) => {
                              // Snap to nearest mark and CALL API only when released
                              const numValue = Array.isArray(value) ? value[0] : value;
                              // Limit to max 0.66 (Completed) for employees
                              const limitedValue = Math.min(numValue, 0.66);
                              let newStatus: Task['status'] = 'pending';

                              if (limitedValue <= 0.16) newStatus = 'pending';
                              else if (limitedValue <= 0.5) newStatus = 'in-progress';
                              else newStatus = 'completed'; // Max status employees can set

                              // Clear local override so it falls back to actual status
                              const newSliderValues = { ...sliderValues };
                              delete newSliderValues[task._id];
                              setSliderValues(newSliderValues);

                              // Only update if status actually changed
                              if (newStatus !== task.status) {
                                handleStatusChange(task._id, newStatus);
                              }
                            }}
                            marks={[
                              { value: 0, label: "Pending" },
                              { value: 0.33, label: "In Progress" },
                              { value: 0.66, label: "Completed" },
                              { value: 1, label: "Verified" }
                            ]}
                            minValue={0}
                            maxValue={0.66}
                            step={0.01}
                            showTooltip={false}
                            classNames={{
                              base: "gap-3",
                              track: "h-2 bg-gray-300 dark:bg-gray-600",
                              filler: (sliderValues[task._id] !== undefined ? sliderValues[task._id] : (task.status === 'pending' ? 0 : task.status === 'in-progress' ? 0.33 : task.status === 'completed' ? 0.66 : 0)) <= 0.16 ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                                (sliderValues[task._id] !== undefined ? sliderValues[task._id] : (task.status === 'pending' ? 0 : task.status === 'in-progress' ? 0.33 : task.status === 'completed' ? 0.66 : 0)) <= 0.5 ? "bg-gradient-to-r from-blue-400 to-blue-600" :
                                  "bg-gradient-to-r from-green-400 to-green-600",
                              thumb: (sliderValues[task._id] !== undefined ? sliderValues[task._id] : (task.status === 'pending' ? 0 : task.status === 'in-progress' ? 0.33 : task.status === 'completed' ? 0.66 : 0)) <= 0.16 ? "w-5 h-5 bg-orange-500 shadow-lg" :
                                (sliderValues[task._id] !== undefined ? sliderValues[task._id] : (task.status === 'pending' ? 0 : task.status === 'in-progress' ? 0.33 : task.status === 'completed' ? 0.66 : 0)) <= 0.5 ? "w-5 h-5 bg-blue-500 shadow-lg" :
                                  "w-5 h-5 bg-green-500 shadow-lg",
                              label: "text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3",
                              mark: "text-xs font-medium",
                              value: "hidden opacity-0 invisible"
                            }}
                          />
                        </div>

                        {/* Current Status Display */}
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <span className={`px-5 py-2.5 text-sm font-bold rounded-lg shadow-md ${task.status === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                            task.status === 'in-progress' ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' :
                              task.status === 'completed' ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' :
                                task.status === 'blocked' ? 'bg-red-500 text-white' :
                                  'bg-gray-400 text-white'
                            }`}>
                            {task.status === 'in-progress' ? 'IN PROGRESS' : task.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Blocked Status - Separate */}
                        {task.status === 'blocked' && (
                          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                                !
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-red-700 dark:text-red-300">Task Blocked</p>
                                <p className="text-xs text-red-600 dark:text-red-400">This task has been marked as blocked</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status Badge for Special Task Types or Verified */}
                    {(task.taskType === 'submission' || task.status === 'verified') && (
                      <div className="mb-3">
                        <span className={`inline-block px-3 py-1.5 text-sm font-semibold rounded-lg shadow-sm ${getStatusColor(task.status)}`}>
                          Status: {task.status.toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Subtasks - Always Visible */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h5 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {t('project.employeeTasks.subtasks', { completed: task.subtasks.filter(st => st.completed).length, total: task.subtasks.length })}
                        </h5>
                        <div className="space-y-2">
                          {task.subtasks.map((subtask) => (
                            <div key={subtask._id} className="flex items-center gap-2.5 p-1.5 bg-white dark:bg-gray-800 rounded-lg hover:shadow-sm transition-shadow">
                              <input
                                type="checkbox"
                                checked={subtask.completed}
                                onChange={() => handleToggleSubtask(task._id, subtask._id)}
                                className="w-4 h-4 text-accent-dark rounded focus:ring-2 focus:ring-accent"
                                disabled={task.isFinished}
                              />
                              <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200 font-medium'}`}>
                                {subtask.title}
                              </span>
                              {subtask.completed && (
                                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submission Task - URL Submission (Always Visible) */}
                    {task.taskType === 'submission' && (
                      <div className="mb-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                        <h5 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-2 flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          🔗 Submit URL
                        </h5>

                        {/* Link Input - Only show if not finished */}
                        {!task.isFinished && (
                          <div className="flex gap-2 mb-3">
                            <input
                              type="url"
                              value={newLink[task._id] || ''}
                              onChange={(e) => setNewLink({ ...newLink, [task._id]: e.target.value })}
                              placeholder="https://example.com"
                              className="flex-1 px-3 py-2 text-sm border border-indigo-300 dark:border-indigo-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800"
                            />
                            <button
                              onClick={() => handleAddLink(task._id)}
                              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium"
                            >
                              Add
                            </button>
                          </div>
                        )}

                        {/* Submitted Links */}
                        {task.links && task.links.length > 0 && (
                          <div className="space-y-2 mb-3">
                            <p className="text-xs font-medium text-indigo-900 dark:text-indigo-100">Submitted URLs:</p>
                            {task.links.map((link, index) => (
                              <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded p-2">
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline truncate flex-1 min-w-0"
                                >
                                  {link}
                                </a>
                                {!task.isFinished && (
                                  <button
                                    onClick={() => handleRemoveLink(task._id, index)}
                                    className="text-red-600 hover:text-red-700 text-xs ml-2 font-medium"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Submit Button */}
                        {task.links && task.links.length > 0 && task.status !== 'completed' && task.status !== 'verified' && !task.isFinished && (
                          <button
                            onClick={() => handleStatusChange(task._id, 'completed')}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Submit for Review
                          </button>
                        )}

                        {/* Submitted Status */}
                        {(task.status === 'completed' || task.status === 'verified') && (
                          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                            <CheckCircle className="w-4 h-4" />
                            {task.status === 'verified' ? 'Verified by Manager ✓' : 'Submitted - Waiting for Manager Review'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reference Links - Always Visible for General Tasks */}
                    {task.links && task.links.length > 0 && task.taskType !== 'submission' && (
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h5 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          📎 Reference Links (from Manager)
                        </h5>
                        <div className="space-y-2">
                          {task.links.map((link, index) => (
                            <a
                              key={index}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group"
                            >
                              <LinkIcon className="w-3 h-3 text-blue-600 flex-shrink-0" />
                              <span className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate flex-1">
                                {link}
                              </span>
                              <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                Open →
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expanded Content */}
                  {expandedTaskId === task._id && (
                    <div className="px-6 pb-6 space-y-4 border-t-2 border-gray-200 dark:border-gray-700 pt-4">
                      {/* Task Type Specific Sections */}

                      {/* Submission Task - URL Submission */}
                      {(task.taskType === 'submission' && !task.isFinished) ||
                        (task.links && task.links.length > 0 && task.taskType === 'submission') ? (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                          <h5 className="text-sm font-medium text-indigo-900 mb-2 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" />
                            Submit URL
                          </h5>

                          {/* Link Input - Only show if not finished */}
                          {!task.isFinished && (
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
                          )}

                          {/* Submitted Links */}
                          {task.links && task.links.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-gray-700">Submitted URLs:</p>
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
                                  {!task.isFinished && (
                                    <button
                                      onClick={() => handleRemoveLink(task._id, index)}
                                      className="text-red-600 hover:text-red-700 text-xs ml-2"
                                    >
                                      {t('project.employeeTasks.remove')}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Submit Button */}
                          {task.links && task.links.length > 0 && task.status !== 'completed' && !task.isFinished && (
                            <button
                              onClick={() => handleStatusChange(task._id, 'completed')}
                              className="w-full mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                            >
                              Submit for Review
                            </button>
                          )}
                        </div>
                      ) : null}


                      {/* Display Files (for all tasks) */}
                      {task.files && task.files.length > 0 && (
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
                    className={`bg-white border border-gray-300 rounded-lg p-3 hover:shadow-md transition-all cursor-move ${draggedTask?._id === task._id ? 'opacity-50' : ''
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
                    className={`bg-white border border-blue-200 rounded-lg p-3 hover:shadow-md transition-all cursor-move ${draggedTask?._id === task._id ? 'opacity-50' : ''
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
                    className={`bg-white border border-green-200 rounded-lg p-3 hover:shadow-md transition-all cursor-move ${draggedTask?._id === task._id ? 'opacity-50' : ''
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

            {/* Verified/Blocked Column - Read Only for Employees */}
            <div
              className="bg-purple-50 rounded-lg p-4 min-h-[400px] relative"
            >
              {/* Overlay to prevent drops */}
              <div className="absolute inset-0 bg-purple-100/30 rounded-lg pointer-events-none z-10 flex items-center justify-center">
                <div className="bg-white/90 px-4 py-2 rounded-lg shadow-sm">
                  <p className="text-xs font-medium text-purple-700">🔒 Manager Only</p>
                </div>
              </div>
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
                    draggable={false}
                    onClick={() => handleTaskClick(task)}
                    className={`bg-white border rounded-lg p-3 hover:shadow-md transition-all cursor-move ${draggedTask?._id === task._id ? 'opacity-50' : ''
                      } ${task.status === 'blocked' ? 'border-red-200' : 'border-purple-200'
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
                      <span className={`px-2 py-0.5 text-xs rounded-full ${task.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
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
                        className={`h-24 border rounded-lg p-2 ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                          }`}
                      >
                        <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-accent-dark' : 'text-gray-700'
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
                              className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:shadow-sm transition-shadow ${task.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
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
          <div className="bg-white rounded-lg border border-gray-300 p-6 overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gantt Timeline</h3>

            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Timeline Header */}
                <div className="flex border-b border-gray-200 mb-4 pb-2">
                  <div className="w-1/4 font-medium text-sm text-gray-500">Task</div>
                  <div className="w-3/4 flex justify-between text-xs text-gray-400">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <div key={i} className="flex-1 text-center border-l border-gray-100">{i + 1}</div>
                    ))}
                  </div>
                </div>

                {/* Timeline Rows */}
                <div className="space-y-4">
                  {filteredTasks.map((task, index) => (
                    <div key={task._id} className="flex items-center gap-4 group">
                      <div className="w-1/4">
                        <div className="text-sm font-medium text-gray-900 truncate">{task.title}</div>
                        <div className="text-xs text-gray-500">{task.progress}% complete</div>
                      </div>
                      <div className="w-3/4 h-8 bg-gray-50 rounded-lg relative overflow-hidden">
                        {task.dueDate && (
                          <div
                            className={`absolute top-1 bottom-1 rounded-md ${
                              task.status === 'completed' ? 'bg-green-500/50' :
                              task.status === 'in-progress' ? 'bg-blue-500/50' :
                              task.status === 'blocked' ? 'bg-red-500/50' :
                              task.priority === 'critical' ? 'bg-red-500/50' :
                              task.priority === 'high' ? 'bg-orange-500/50' : 'bg-blue-500/50'
                            } opacity-80 backdrop-blur-sm border border-gray-700/70`}
                            style={{
                              left: `${(index * 15) % 60}%`,
                              width: `${Math.max(10, task.progress ? task.progress / 5 : 20)}%`
                            }}
                          >
                            <div className="w-full h-full flex items-center px-2">
                              <span className="text-[10px] font-medium text-white truncate">{task.status}</span>
                            </div>
                          </div>
                        )}
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex">
                          {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} className="flex-1 border-r border-gray-200/20"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                            <span className={`w-2 h-2 rounded-full ${task.priority === 'critical' ? 'bg-red-500' :
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
                    <p className={`text-sm flex items-center gap-1 ${isOverdue(selectedTaskForModal.dueDate) && selectedTaskForModal.status !== 'completed'
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
                {!selectedTaskForModal.isFinished && selectedTaskForModal.taskType === 'general' && (
                  <select
                    value={selectedTaskForModal.status}
                    onChange={(e) => {
                      handleStatusChange(selectedTaskForModal._id, e.target.value as Task['status']);
                      setSelectedTaskForModal({ ...selectedTaskForModal, status: e.target.value as Task['status'] });
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

      {/* Task History Section - Verified Tasks */}
      {verifiedTasks.length > 0 && filterStatus !== 'verified' && (
        <div className="bg-white rounded-lg border border-gray-300 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">📜 Task History</h3>
              <p className="text-sm text-gray-600 mt-1">
                {verifiedTasks.length} Verified & Completed Tasks
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {verifiedTasks.map((task) => (
              <div
                key={task._id}
                className="border border-gray-300 bg-gray-50 rounded-lg p-4 opacity-75"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700 mb-1">{task.title}</h4>
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

                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        ✓ Verified
                      </span>

                      {/* Rating Display */}
                      {task.rating && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
                          ⭐ {task.rating.toFixed(1)} / 5.0
                        </span>
                      )}

                      {task.verifiedAt && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                          Verified on {new Date(task.verifiedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-300">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Start Date</p>
                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      📅 {new Date(task.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Completed Date</p>
                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      ✅ {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Submitted URLs - For Submission Tasks */}
                {task.taskType === 'submission' && task.links && task.links.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs font-medium text-gray-700 mb-2">📎 Submitted URLs</p>
                    <div className="space-y-2">
                      {task.links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-sm text-indigo-600 hover:underline"
                        >
                          🔗 {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show rating details if available */}
                {task.ratingDetails && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs font-medium text-gray-700 mb-2">Performance Rating</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {task.ratingDetails.timeliness && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Timeliness:</span>
                          <span className="font-medium text-gray-800">{task.ratingDetails.timeliness}/5</span>
                        </div>
                      )}
                      {task.ratingDetails.quality && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Quality:</span>
                          <span className="font-medium text-gray-800">{task.ratingDetails.quality}/5</span>
                        </div>
                      )}
                      {task.ratingDetails.collaboration && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Collaboration:</span>
                          <span className="font-medium text-gray-800">{task.ratingDetails.collaboration}/5</span>
                        </div>
                      )}
                    </div>
                    {task.ratingDetails.comments && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-gray-700">
                        <span className="font-medium">Feedback:</span> {task.ratingDetails.comments}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('project.tasks.modal.title.create', 'Create New Task')}</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('project.tasks.modal.title', 'Task Title')} *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. Update Documentation"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('project.tasks.modal.description', 'Description')}
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Describe the task details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('project.tasks.modal.priority', 'Priority')}
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('project.tasks.modal.dueDate', 'Due Date')}
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleCreateNewTask}
                className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover font-medium shadow-sm transition-colors"
                disabled={!newTask.title.trim()}
              >
                {t('project.tasks.modal.submit', 'Create Task')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTasksTab;
