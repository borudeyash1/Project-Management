import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, MoreVertical, Filter, Search, SortAsc, Settings, 
  MessageSquare, Paperclip, CheckSquare, Clock, AlertCircle,
  User, Tag, Calendar, Flag, Eye, Edit, Trash2, Copy,
  ChevronDown, ChevronUp, X, Check, Save, RefreshCw,
  GripVertical, Users, BarChart3,
  Bell, Share2, HelpCircle, Star, Heart, Bookmark
} from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    initials?: string;
  };
  labels: Label[];
  customTags: CustomTag[];
  comments: Comment[];
  subtasks: Subtask[];
  attachments: Attachment[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  project: {
    _id: string;
    name: string;
    color: string;
  };
  estimatedHours: number;
  actualHours: number;
  isCompleted: boolean;
  completedAt?: Date;
}

interface Label {
  _id: string;
  name: string;
  color: string;
}

interface CustomTag {
  _id: string;
  name: string;
  color: string;
  text: string;
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: Date;
}

interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
}

interface Attachment {
  _id: string;
  name: string;
  url: string;
  type: 'file' | 'link';
}

interface Column {
  _id: string;
  name: string;
  color: string;
  position: number;
  taskLimit?: number;
}

interface KanbanBoardProps {
  tasks: Task[];
  columns: Column[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskCreate: (task: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  onColumnUpdate: (columnId: string, updates: Partial<Column>) => void;
  onColumnCreate: (column: Partial<Column>) => void;
  onColumnDelete: (columnId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  columns,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
  onColumnUpdate,
  onColumnCreate,
  onColumnDelete
}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterLabel, setFilterLabel] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [lastCompletedDate, setLastCompletedDate] = useState<Date | null>(null);

  // Calculate last completed task date
  useEffect(() => {
    const completedTasks = tasks.filter(task => task.isCompleted && task.completedAt);
    if (completedTasks.length > 0) {
      const latestCompleted = completedTasks.reduce((latest, task) => 
        task.completedAt! > latest ? task.completedAt! : latest, 
        completedTasks[0].completedAt!
      );
      setLastCompletedDate(latestCompleted);
    }
  }, [tasks]);

  // Get filtered and sorted tasks
  const getFilteredTasks = () => {
    let filtered = tasks;

    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterAssignee !== 'all') {
      filtered = filtered.filter(task => task.assignee._id === filterAssignee);
    }

    if (filterLabel !== 'all') {
      filtered = filtered.filter(task => 
        task.labels.some(label => label._id === filterLabel)
      );
    }

    return filtered;
  };

  // Get tasks for a specific column
  const getTasksForColumn = (columnId: string) => {
    const filteredTasks = getFilteredTasks().filter(task => task.status === columnId);
    
    // Sort tasks
    return filteredTasks.sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'due':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task._id);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDraggedOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== columnId) {
      onTaskUpdate(draggedTask._id, { 
        status: columnId,
        updatedAt: new Date()
      });
    }
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  // Task creation handler
  const handleCreateTask = (columnId: string) => {
    const newTask: Partial<Task> = {
      title: 'New Task',
      description: '',
      status: columnId,
      priority: 'medium',
      assignee: { _id: 'unassigned', name: 'Unassigned', email: '', initials: 'U' },
      labels: [],
      customTags: [],
      comments: [],
      subtasks: [],
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      project: { _id: '1', name: 'Default Project', color: '#3B82F6' },
      estimatedHours: 0,
      actualHours: 0,
      isCompleted: false
    };
    
    onTaskCreate(newTask);
  };

  // Get unique assignees for filter
  const getUniqueAssignees = () => {
    const assignees = tasks.map(task => task.assignee);
    return assignees.filter((assignee, index, self) => 
      index === self.findIndex(a => a._id === assignee._id)
    );
  };

  // Get unique labels for filter
  const getUniqueLabels = () => {
    const allLabels = tasks.flatMap(task => task.labels);
    return allLabels.filter((label, index, self) => 
      index === self.findIndex(l => l._id === label._id)
    );
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#10B981';
      case 'medium': return '#3B82F6';
      case 'high': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Content Production</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Last task completed on</span>
                <span className="text-sm font-medium text-gray-900">
                  {lastCompletedDate ? formatDate(lastCompletedDate) : 'No completed tasks'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Set status</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {getUniqueAssignees().slice(0, 3).map(assignee => (
                  <div
                    key={assignee._id}
                    className="w-8 h-8 rounded-full bg-accent text-gray-900 text-xs flex items-center justify-center border-2 border-white"
                    title={assignee.name}
                  >
                    {assignee.initials || assignee.name.charAt(0)}
                  </div>
                ))}
                {getUniqueAssignees().length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 text-xs flex items-center justify-center border-2 border-white">
                    +{getUniqueAssignees().length - 3}
                  </div>
                )}
              </div>
            </div>
            
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent w-64"
              />
            </div>
            
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Board Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">All tasks</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            
            <div className="flex items-center gap-2">
              <SortAsc className="w-4 h-4 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="due">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Settings className="w-4 h-4" />
              Rules
            </button>
            
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <BarChart3 className="w-4 h-4" />
              Fields
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Assignees</option>
                  {getUniqueAssignees().map(assignee => (
                    <option key={assignee._id} value={assignee._id}>{assignee.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                <select
                  value={filterLabel}
                  onChange={(e) => setFilterLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Labels</option>
                  {getUniqueLabels().map(label => (
                    <option key={label._id} value={label._id}>{label.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-6 min-w-max">
          {columns.map((column) => {
            const columnTasks = getTasksForColumn(column._id);
            const isOverLimit = column.taskLimit && columnTasks.length >= column.taskLimit;
            
            return (
              <div
                key={column._id}
                className={`flex-shrink-0 w-80 bg-white rounded-lg border border-gray-300 ${
                  draggedOverColumn === column._id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, column._id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column._id)}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{column.name}</h3>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {columnTasks.length}
                        {column.taskLimit && `/${column.taskLimit}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCreateTask(column._id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setShowColumnMenu(showColumnMenu === column._id ? null : column._id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  {isOverLimit && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                      Task limit reached
                    </div>
                  )}
                </div>

                {/* Column Menu */}
                {showColumnMenu === column._id && (
                  <div className="absolute z-10 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="py-1">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Edit Column
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Set Task Limit
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Archive Column
                      </button>
                      <button 
                        onClick={() => onColumnDelete(column._id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete Column
                      </button>
                    </div>
                  </div>
                )}

                {/* Tasks */}
                <div className="p-4 space-y-3 min-h-[400px]">
                  {columnTasks.map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskModal(true);
                      }}
                      className="bg-white border border-gray-300 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300"
                    >
                      {/* Labels */}
                      {task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {task.labels.map((label) => (
                            <span
                              key={label._id}
                              className="px-2 py-1 text-xs rounded-full text-white"
                              style={{ backgroundColor: label.color }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Task Title */}
                      <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                        {task.title}
                      </h4>

                      {/* Custom Tags */}
                      {task.customTags.length > 0 && (
                        <div className="flex gap-1 mb-2">
                          {task.customTags.map((tag) => (
                            <span
                              key={tag._id}
                              className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center"
                              style={{ backgroundColor: tag.color }}
                              title={tag.name}
                            >
                              {tag.text}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Task Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Assignee Avatar */}
                          <div
                            className="w-6 h-6 rounded-full bg-accent text-gray-900 text-xs flex items-center justify-center"
                            title={task.assignee.name}
                          >
                            {task.assignee.initials || task.assignee.name.charAt(0)}
                          </div>
                          
                          {/* Task Counts */}
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            {task.comments.length > 0 && (
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{task.comments.length}</span>
                              </div>
                            )}
                            {task.subtasks.length > 0 && (
                              <div className="flex items-center gap-1">
                                <CheckSquare className="w-3 h-3" />
                                <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
                              </div>
                            )}
                            {task.attachments.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Paperclip className="w-3 h-3" />
                                <span>{task.attachments.length}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Due Date */}
                        {task.dueDate && (
                          <div className={`text-xs px-2 py-1 rounded ${
                            new Date(task.dueDate) < new Date() && !task.isCompleted
                              ? 'bg-red-200 text-red-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {formatDate(task.dueDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Empty State */}
                  {columnTasks.length === 0 && (
                    <div className="text-center text-gray-600 py-8">
                      <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                        <Plus className="w-6 h-6" />
                      </div>
                      <p className="text-sm">No tasks in {column.name}</p>
                      <p className="text-xs">Drag tasks here or create new ones</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{selectedTask.title}</h3>
              </div>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-gray-600 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={selectedTask.description}
                  onChange={(e) => onTaskUpdate(selectedTask._id, { description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => onTaskUpdate(selectedTask._id, { status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {columns.map(column => (
                      <option key={column._id} value={column._id}>{column.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) => onTaskUpdate(selectedTask._id, { 
                      priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                  <select
                    value={selectedTask.assignee._id}
                    onChange={(e) => {
                      const assignee = getUniqueAssignees().find(a => a._id === e.target.value);
                      if (assignee) {
                        onTaskUpdate(selectedTask._id, { assignee });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {getUniqueAssignees().map(assignee => (
                      <option key={assignee._id} value={assignee._id}>{assignee.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={selectedTask.dueDate ? selectedTask.dueDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => onTaskUpdate(selectedTask._id, { 
                      dueDate: e.target.value ? new Date(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    onTaskDelete(selectedTask._id);
                    setShowTaskModal(false);
                  }}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                  Delete Task
                </button>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
