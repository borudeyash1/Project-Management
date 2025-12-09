import React from 'react';
import { Clock, User, MessageSquare, Paperclip, Flag, CheckCircle } from 'lucide-react';
import { Task } from '../../context/PlannerContext';
import { getCompletedSubtasksCount, getTotalSubtasksCount, getTaskTags, getTaskComments, getTaskAttachments, getTaskAssignees } from '../../utils/taskHelpers';

interface TaskCardProps {
  task: Task;
  onDragStart?: () => void;
  onClick?: () => void;
  draggable?: boolean;
  compact?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onClick, draggable = false, compact = false }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-gray-400';
      default: return 'border-l-gray-300';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const completedSubtasks = getCompletedSubtasksCount(task);
  const totalSubtasks = getTotalSubtasksCount(task);
  const tags = getTaskTags(task);
  const comments = getTaskComments(task);
  const attachments = getTaskAttachments(task);
  const assignees = getTaskAssignees(task);

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className={`bg-white dark:bg-gray-700 rounded-lg border-l-4 ${getPriorityColor(task.priority)} p-3 cursor-pointer hover:shadow-md transition-shadow`}
    >
      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{task.title}</h4>
      
      {task.description && !compact && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{task.description}</p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-700 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Progress bar for subtasks */}
      {totalSubtasks > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
            <span>{completedSubtasks}/{totalSubtasks} subtasks</span>
            <span>{Math.round((completedSubtasks / totalSubtasks) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-200">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
              <Clock className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {comments.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {comments.length}
            </span>
          )}
          {attachments.length > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              {attachments.length}
            </span>
          )}
        </div>
        
        {/* Assignees */}
        {assignees.length > 0 && (
          <div className="flex -space-x-2">
            {assignees.slice(0, 3).map((assignee: any, idx: number) => (
              <div
                key={idx}
                className="w-6 h-6 rounded-full bg-accent border-2 border-white dark:border-gray-600 flex items-center justify-center text-gray-900 text-xs font-medium"
                title={assignee}
              >
                {typeof assignee === 'string' ? assignee[0].toUpperCase() : 'U'}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
