import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, Play, Pause, Square, CheckCircle, Circle, 
  Plus, Edit, Trash2, Bot, Sparkles, FileText, 
  MessageSquare, Calendar, User, Tag, Flag, 
  ArrowRight, ArrowLeft, ChevronDown, ChevronUp,
  X, Check, Save, RefreshCw, Zap, Lightbulb,
  Target, Timer, AlertCircle, TrendingUp, BarChart3
} from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  milestones: Milestone[];
  subtasks: Subtask[];
  tags: string[];
  estimatedHours: number;
  actualHours: number;
  project: {
    _id: string;
    name: string;
    color: string;
  };
  timeTracking: TimeEntry[];
  notes: Note[];
}

interface Milestone {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: Date;
  completedAt?: Date;
  assignee: string;
  taskId: string;
}

interface Subtask {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: Date;
  assignee: string;
  parentTaskId: string;
}

interface TimeEntry {
  _id: string;
  taskId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  description: string;
  createdAt: Date;
}

interface Note {
  _id: string;
  content: string;
  type: 'manual' | 'ai-generated';
  author: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: Date;
  taskId: string;
  tags: string[];
  isImportant: boolean;
}

interface TaskTimelineProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onNoteCreate: (taskId: string, content: string, type: 'manual' | 'ai-generated') => void;
  onNoteUpdate: (noteId: string, content: string) => void;
  onNoteDelete: (noteId: string) => void;
}

const TaskTimeline: React.FC<TaskTimelineProps> = ({
  tasks,
  onTaskUpdate,
  onNoteCreate,
  onNoteUpdate,
  onNoteDelete
}) => {
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<'manual' | 'ai-generated'>('manual');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [timeScale, setTimeScale] = useState<'hour' | 'day' | 'week'>('day');
  const [currentTime, setCurrentTime] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);

  // Update current time every minute for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Separate active and completed tasks
  useEffect(() => {
    const active = tasks.filter(task => task.status !== 'completed');
    const completed = tasks.filter(task => task.status === 'completed');
    setActiveTasks(active);
    setCompletedTasks(completed);
  }, [tasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-gray-600';
      case 'medium': return 'text-accent';
      case 'high': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low': return <Circle className="w-3 h-3" />;
      case 'medium': return <Flag className="w-3 h-3" />;
      case 'high': return <AlertCircle className="w-3 h-3" />;
      case 'critical': return <AlertCircle className="w-3 h-3" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateTaskProgress = (task: Task) => {
    if (task.milestones.length === 0) return 0;
    const completed = task.milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / task.milestones.length) * 100);
  };

  const generateAINote = async (task: Task) => {
    setIsGeneratingAI(true);
    try {
      // Simulate AI note generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiNote = `AI Analysis for "${task.title}":
      
📊 Progress: ${calculateTaskProgress(task)}% complete
⏱️ Time Tracking: ${task.actualHours}h / ${task.estimatedHours}h estimated
🎯 Next Steps: ${task.milestones.filter(m => m.status === 'pending').map(m => m.title).join(', ') || 'No pending milestones'}
⚠️ Risks: ${task.status === 'blocked' ? 'Task is currently blocked' : 'No immediate risks detected'}
💡 Suggestions: ${task.priority === 'high' ? 'Consider breaking down into smaller tasks' : 'Continue current approach'}

Generated at ${new Date().toLocaleString()}`;

      onNoteCreate(task._id, aiNote, 'ai-generated');
      setNoteContent(aiNote);
    } catch (error) {
      console.error('Error generating AI note:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleNoteSubmit = () => {
    if (!selectedTask || !noteContent.trim()) return;
    
    if (editingNote) {
      onNoteUpdate(editingNote._id, noteContent);
      setEditingNote(null);
    } else {
      onNoteCreate(selectedTask._id, noteContent, noteType);
    }
    
    setNoteContent('');
    setShowNoteModal(false);
  };

  const renderTaskCard = (task: Task, isCompleted: boolean = false) => (
    <div
      key={task._id}
      className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isCompleted ? 'opacity-75 border-gray-200' : 'border-gray-300 hover:border-blue-300'
      }`}
      onClick={() => setSelectedTask(task)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            <div className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
              {getPriorityIcon(task.priority)}
            </div>
          </div>
          <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-600'} mb-2`}>
            {task.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status.replace('-', ' ')}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: task.project.color }}
          />
          <span className="text-xs text-gray-600">{task.project.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <img
            src={task.assignee.avatarUrl || `https://ui-avatars.com/api/?name=${task.assignee.name}&background=random`}
            alt={task.assignee.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-xs text-gray-600">{task.assignee.name}</span>
        </div>
      </div>

      {task.milestones.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Milestones</span>
            <span>
              {task.milestones.filter(m => m.status === 'completed').length}/
              {task.milestones.length}
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateTaskProgress(task)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>Due: {formatDate(task.dueDate)}</span>
        <span>{task.actualHours}h / {task.estimatedHours}h</span>
      </div>

      {task.notes && task.notes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
            <MessageSquare className="w-3 h-3" />
            <span>{task.notes.length} note{task.notes.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-1">
            {task.notes.slice(0, 2).map(note => (
              <div key={note._id} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-1 mb-1">
                  {note.type === 'ai-generated' && <Bot className="w-3 h-3 text-accent" />}
                  <span className="font-medium">{note.author.name}</span>
                  <span className="text-gray-600">•</span>
                  <span>{formatTime(note.createdAt)}</span>
                </div>
                <p className="line-clamp-2">{note.content}</p>
              </div>
            ))}
            {task.notes.length > 2 && (
              <div className="text-xs text-accent-dark">
                +{task.notes.length - 2} more notes
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderTimelineHeader = () => (
    <div className="bg-gray-50 border-b border-gray-300 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Task Timeline</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Scale:</span>
            <select
              value={timeScale}
              onChange={(e) => setTimeScale(e.target.value as 'hour' | 'day' | 'week')}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="hour">Hour</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">
            Current Time: {formatTime(currentTime)}
          </div>
          <button
            onClick={() => setCurrentTime(new Date())}
            className="p-1 text-gray-600 hover:text-gray-600"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderNoteModal = () => {
    if (!showNoteModal || !selectedTask) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-accent-dark" />
              <h3 className="text-lg font-semibold text-gray-900">
                {editingNote ? 'Edit Note' : 'Add Note'} - {selectedTask.title}
              </h3>
            </div>
            <button
              onClick={() => {
                setShowNoteModal(false);
                setEditingNote(null);
                setNoteContent('');
              }}
              className="text-gray-600 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="manual"
                  name="noteType"
                  value="manual"
                  checked={noteType === 'manual'}
                  onChange={(e) => setNoteType(e.target.value as 'manual' | 'ai-generated')}
                  className="w-4 h-4 text-accent-dark"
                />
                <label htmlFor="manual" className="text-sm font-medium text-gray-700">
                  Manual Note
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="ai"
                  name="noteType"
                  value="ai-generated"
                  checked={noteType === 'ai-generated'}
                  onChange={(e) => setNoteType(e.target.value as 'manual' | 'ai-generated')}
                  className="w-4 h-4 text-accent-dark"
                />
                <label htmlFor="ai" className="text-sm font-medium text-gray-700">
                  AI Generated
                </label>
              </div>
            </div>

            {noteType === 'ai-generated' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-accent-dark" />
                  <span className="text-sm font-medium text-blue-900">AI Assistant</span>
                </div>
                <p className="text-sm text-blue-700">
                  AI will analyze the task and generate contextual notes based on progress, milestones, and patterns.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note Content
              </label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder={noteType === 'ai-generated' ? 'AI will generate content...' : 'Enter your note...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                rows={8}
                disabled={noteType === 'ai-generated' && isGeneratingAI}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Add tags (optional)"
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="important"
                  className="w-4 h-4 text-accent-dark"
                />
                <label htmlFor="important" className="text-sm text-gray-700">
                  Mark as important
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={() => {
                setShowNoteModal(false);
                setEditingNote(null);
                setNoteContent('');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            {noteType === 'ai-generated' && !isGeneratingAI && (
              <button
                onClick={() => generateAINote(selectedTask)}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
              >
                <Bot className="w-4 h-4" />
                Generate AI Note
              </button>
            )}
            <button
              onClick={handleNoteSubmit}
              disabled={!noteContent.trim() || isGeneratingAI}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingAI ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingNote ? 'Update Note' : 'Save Note'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {renderTimelineHeader()}
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Active Tasks Row */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">Active Tasks</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {activeTasks.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600">
                  {activeTasks.filter(t => t.status === 'in-progress').length} in progress
                </div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="text-sm text-gray-600">
                  {activeTasks.filter(t => t.status === 'pending').length} pending
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTasks.map(task => renderTaskCard(task, false))}
            </div>
          </div>

          {/* Completed Tasks Row */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">Completed Tasks</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {completedTasks.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600">
                  {completedTasks.length > 0 && (
                    <span>
                      Last completed: {formatDate(completedTasks[0].updatedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedTasks.map(task => renderTaskCard(task, true))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setNoteType('manual');
                  setShowNoteModal(true);
                }}
                className="flex items-center gap-3 p-4 bg-white border border-gray-300 rounded-lg hover:shadow-md transition-shadow"
              >
                <MessageSquare className="w-5 h-5 text-accent-dark" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Add Manual Note</div>
                  <div className="text-sm text-gray-600">Create a custom note</div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setNoteType('ai-generated');
                  setShowNoteModal(true);
                }}
                className="flex items-center gap-3 p-4 bg-white border border-gray-300 rounded-lg hover:shadow-md transition-shadow"
              >
                <Bot className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Generate AI Note</div>
                  <div className="text-sm text-gray-600">AI-powered analysis</div>
                </div>
              </button>
              
              <button className="flex items-center gap-3 p-4 bg-white border border-gray-300 rounded-lg hover:shadow-md transition-shadow">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">View Analytics</div>
                  <div className="text-sm text-gray-600">Task performance insights</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {renderNoteModal()}
    </div>
  );
};

export default TaskTimeline;
