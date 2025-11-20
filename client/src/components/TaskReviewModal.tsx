import React, { useState } from 'react';
import { X, Star, Check, XCircle, FileText, Download, ExternalLink } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  assignee: any;
  priority: string;
  status: string;
  dueDate: Date;
  estimatedHours: number;
  progress: number;
  subtasks: any[];
  attachments: any[];
  links: string[];
}

interface TaskReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onApprove: (taskId: string, rating: number, comments: string) => void;
  onReject: (taskId: string, reason: string) => void;
}

const TaskReviewModal: React.FC<TaskReviewModalProps> = ({
  isOpen,
  onClose,
  task,
  onApprove,
  onReject
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!isOpen || !task) return null;

  const handleApprove = () => {
    if (rating === 0) {
      alert('Please provide a rating before approving');
      return;
    }
    onApprove(task._id, rating, comments);
    handleReset();
    onClose();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    onReject(task._id, rejectReason);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setRating(0);
    setHoverRating(0);
    setComments('');
    setRejectReason('');
    setShowRejectForm(false);
  };

  const completedSubtasks = task.subtasks.filter((st: any) => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-300 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Review Task</h2>
              <p className="text-sm text-gray-600 mt-1">Verify completion and rate the work quality</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Task Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">{task.title}</h3>
            <p className="text-sm text-blue-800 mb-3">{task.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Assigned to:</span>
                <span className="ml-2 font-medium text-blue-900">{task.assignee?.name}</span>
              </div>
              <div>
                <span className="text-blue-700">Due date:</span>
                <span className="ml-2 font-medium text-blue-900">
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Priority:</span>
                <span className={`ml-2 font-medium capitalize ${
                  task.priority === 'critical' ? 'text-red-600' :
                  task.priority === 'high' ? 'text-orange-600' :
                  task.priority === 'medium' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {task.priority}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Estimated:</span>
                <span className="ml-2 font-medium text-blue-900">{task.estimatedHours}h</span>
              </div>
            </div>
          </div>

          {/* Subtasks Progress */}
          {totalSubtasks > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Subtasks Completion ({completedSubtasks}/{totalSubtasks})
              </h3>
              <div className="space-y-2">
                {task.subtasks.map((subtask: any) => (
                  <div key={subtask.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-5 h-5 rounded flex items-center justify-center ${
                      subtask.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {subtask.completed && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1 text-center">{task.progress}% Complete</p>
              </div>
            </div>
          )}

          {/* Attachments */}
          {task.attachments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Submitted Files ({task.attachments.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {task.attachments.map((file: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    </div>
                    <a
                      href={file.url}
                      download
                      className="p-1 text-accent-dark hover:bg-blue-50 rounded ml-2"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {task.links.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Submitted Links ({task.links.length})
              </h3>
              <div className="space-y-2">
                {task.links.map((link: string, index: number) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-accent-dark flex-shrink-0" />
                    <span className="text-sm text-accent-dark hover:underline truncate flex-1">{link}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {!showRejectForm ? (
            <>
              {/* Rating */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Rate Task Quality <span className="text-red-500">*</span>
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-600'
                            : 'text-gray-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-semibold text-gray-900">
                    {rating > 0 ? `${rating} / 5` : 'Not rated'}
                  </span>
                  {rating > 0 && (
                    <span className="text-gray-600">
                      ({rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Below Average' : 'Poor'})
                    </span>
                  )}
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Review Comments (Optional)
                </h3>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Add feedback about the task completion..."
                />
              </div>
            </>
          ) : (
            /* Reject Form */
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-2">
                Reason for Rejection <span className="text-red-500">*</span>
              </h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Explain what needs to be fixed or redone..."
              />
              <p className="text-sm text-red-600 mt-2">
                The task will be sent back to the employee with your feedback.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-300 px-6 py-4">
          {!showRejectForm ? (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowRejectForm(true)}
                className="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject Task
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Approve & Complete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason('');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Send Back for Revision
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskReviewModal;
