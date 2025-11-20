import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, Upload, Link as LinkIcon, Calendar, Clock, Flag, User, Tag, FileText, Check, MessageSquare, Download, Trash2, Plus } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  assignee: any;
  priority: string;
  status: string;
  dueDate: Date;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  tags: string[];
  subtasks: any[];
  comments: any[];
  attachments: any[];
  links: string[];
  createdAt: Date;
  updatedAt: Date;
  rating?: number;
  reviewComments?: string;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdateTask: (taskId: string, updates: any) => void;
  onDeleteTask: (taskId: string) => void;
  currentUserRole: string; // 'manager' | 'employee'
  currentUserId: string;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdateTask,
  onDeleteTask,
  currentUserRole,
  currentUserId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [newLink, setNewLink] = useState('');

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    }
  }, [task]);

  if (!isOpen || !task || !editedTask) return null;

  const isManager = currentUserRole === 'manager' || currentUserRole === 'owner';
  const isAssignee = task.assignee?._id === currentUserId;
  const canEdit = isManager || isAssignee;

  const handleSave = () => {
    onUpdateTask(task._id, editedTask);
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: string) => {
    const updates = { status: newStatus };
    
    // If employee marks as completed, change to review
    if (newStatus === 'completed' && !isManager) {
      updates.status = 'review';
    }
    
    onUpdateTask(task._id, updates);
    setEditedTask({ ...editedTask, ...updates });
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    const updatedSubtasks = editedTask.subtasks.map((st: any) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    
    // Calculate progress based on completed subtasks
    const completedCount = updatedSubtasks.filter((st: any) => st.completed).length;
    const progress = updatedSubtasks.length > 0 
      ? Math.round((completedCount / updatedSubtasks.length) * 100)
      : 0;
    
    const updates = { 
      subtasks: updatedSubtasks,
      progress: progress
    };
    
    onUpdateTask(task._id, updates);
    setEditedTask({ ...editedTask, ...updates });
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const newSubtaskObj = {
        id: `subtask_${Date.now()}`,
        title: newSubtask.trim(),
        completed: false
      };
      
      const updatedSubtasks = [...editedTask.subtasks, newSubtaskObj];
      onUpdateTask(task._id, { subtasks: updatedSubtasks });
      setEditedTask({ ...editedTask, subtasks: updatedSubtasks });
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    const updatedSubtasks = editedTask.subtasks.filter((st: any) => st.id !== subtaskId);
    onUpdateTask(task._id, { subtasks: updatedSubtasks });
    setEditedTask({ ...editedTask, subtasks: updatedSubtasks });
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        _id: `comment_${Date.now()}`,
        content: newComment.trim(),
        author: {
          _id: currentUserId,
          name: 'Current User' // Would be actual user name
        },
        createdAt: new Date(),
        replies: []
      };
      
      const updatedComments = [...editedTask.comments, comment];
      onUpdateTask(task._id, { comments: updatedComments });
      setEditedTask({ ...editedTask, comments: updatedComments });
      setNewComment('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newAttachments = filesArray.map((file, index) => ({
        _id: `attachment_${Date.now()}_${index}`,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'file',
        size: file.size,
        uploadedBy: { name: 'Current User' },
        uploadedAt: new Date()
      }));
      
      const updatedAttachments = [...editedTask.attachments, ...newAttachments];
      onUpdateTask(task._id, { attachments: updatedAttachments });
      setEditedTask({ ...editedTask, attachments: updatedAttachments });
    }
  };

  const handleAddLink = () => {
    if (newLink.trim()) {
      const updatedLinks = [...editedTask.links, newLink.trim()];
      onUpdateTask(task._id, { links: updatedLinks });
      setEditedTask({ ...editedTask, links: updatedLinks });
      setNewLink('');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      onDeleteTask(task._id);
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-300 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="text-xl font-semibold text-gray-900 border-b-2 border-accent focus:outline-none w-full"
                />
              ) : (
                <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(editedTask.status)}`}>
                  {editedTask.status}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(editedTask.priority)}`}>
                  {editedTask.priority}
                </span>
                {task.rating && (
                  <span className="flex items-center gap-1 text-sm text-yellow-600">
                    ⭐ {task.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5 text-gray-600" />
                </button>
              )}
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Save className="w-5 h-5 text-green-600" />
                </button>
              )}
              {isManager && (
                <button
                  onClick={handleDelete}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                {isEditing ? (
                  <textarea
                    value={editedTask.description}
                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-700">{task.description || 'No description provided'}</p>
                )}
              </div>

              {/* Status Update (for employees) */}
              {canEdit && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Update Status</h3>
                  <select
                    value={editedTask.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    disabled={task.status === 'completed' && !isManager}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    {isAssignee && <option value="completed">Mark as Completed</option>}
                    {isManager && <option value="review">In Review</option>}
                    {isManager && <option value="completed">Completed (Final)</option>}
                  </select>
                  {!isManager && editedTask.status === 'review' && (
                    <p className="text-sm text-purple-600 mt-2">
                      ⏳ Waiting for manager review...
                    </p>
                  )}
                </div>
              )}

              {/* Subtasks/Milestones */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Subtasks ({editedTask.subtasks.filter((st: any) => st.completed).length}/{editedTask.subtasks.length})
                  </h3>
                  <span className="text-sm text-gray-600">{editedTask.progress}% Complete</span>
                </div>
                
                <div className="space-y-2">
                  {editedTask.subtasks.map((subtask: any) => (
                    <div key={subtask.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => handleSubtaskToggle(subtask.id)}
                        className="w-5 h-5 rounded"
                        disabled={!canEdit}
                      />
                      <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {subtask.title}
                      </span>
                      {isManager && (
                        <button
                          onClick={() => handleRemoveSubtask(subtask.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {isManager && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        placeholder="Add new subtask..."
                      />
                      <button
                        onClick={handleAddSubtask}
                        className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* File Attachments */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Attachments</h3>
                <div className="space-y-2">
                  {canEdit && (
                    <div>
                      <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent cursor-pointer transition-colors">
                        <Upload className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-600">Upload files</span>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                  
                  {editedTask.attachments.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {editedTask.attachments.map((file: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">{file.name}</span>
                          </div>
                          <a
                            href={file.url}
                            download
                            className="p-1 text-accent-dark hover:bg-blue-50 rounded ml-2"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Links */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Links</h3>
                <div className="space-y-2">
                  {canEdit && (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        placeholder="https://example.com"
                      />
                      <button
                        onClick={handleAddLink}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {editedTask.links.length > 0 && (
                    <div className="space-y-2">
                      {editedTask.links.map((link: string, index: number) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <LinkIcon className="w-4 h-4 text-accent-dark" />
                          <span className="text-sm text-accent-dark hover:underline truncate">{link}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Comments ({editedTask.comments.length})
                </h3>
                <div className="space-y-3">
                  {editedTask.comments.map((comment: any) => (
                    <div key={comment._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">{comment.author.name}</span>
                        <span className="text-xs text-gray-600">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                  
                  {canEdit && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        placeholder="Add a comment..."
                      />
                      <button
                        onClick={handleAddComment}
                        className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Task Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Task Details</h3>
                
                <div>
                  <p className="text-xs text-gray-600 mb-1">Assigned To</p>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {task.assignee?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-1">Due Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-1">Estimated Hours</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">{task.estimatedHours}h</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-1">Priority</p>
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-gray-600" />
                    <span className={`text-sm font-medium capitalize ${
                      task.priority === 'critical' ? 'text-red-600' :
                      task.priority === 'high' ? 'text-orange-600' :
                      task.priority === 'medium' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                {task.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Progress</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Completion</span>
                    <span className="font-medium text-gray-900">{editedTask.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${editedTask.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Review Status */}
              {task.reviewComments && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-purple-900 mb-2">Manager Review</h3>
                  <p className="text-sm text-purple-800">{task.reviewComments}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
