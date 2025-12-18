import React from 'react';
import { CheckCircle, Calendar, Clock, Flag, Users, MapPin, Link as LinkIcon, FileText, Tag } from 'lucide-react';

interface ReminderCardProps {
  reminder: {
    _id: string;
    title: string;
    description?: string;
    type: string;
    priority: string;
    dueDate: Date | string;
    completed: boolean;
    project?: {
      name: string;
      color: string;
    };
    assignee?: {
      name: string;
      avatar?: string;
    };
    tags?: string[];
    location?: string;
    meetingLink?: string;
    notes?: string;
    recurring?: {
      frequency: string;
      interval: number;
    };
  };
  onToggleComplete: (id: string) => void;
  onClick: () => void;
}

const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onToggleComplete, onClick }) => {
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityGradient = (priority: string) => {
    // All cards now have white to yellow gradient
    return 'from-white via-yellow-50 to-yellow-100';
  };

  const getPriorityBackGradient = (priority: string) => {
    // Back side with darker yellow gradient
    return 'from-yellow-100 via-yellow-200 to-yellow-300';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#eab308';
      case 'low':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="w-full max-w-[240px] h-80" style={{ perspective: '1000px' }}>
      <div 
        className="relative w-full h-full transition-transform duration-700"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: 'rotateY(0deg)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'rotateY(180deg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'rotateY(0deg)';
        }}
      >
        {/* Front Side */}
        <div 
          className={`absolute w-full h-full rounded-2xl shadow-lg border-2 flex flex-col justify-center items-center p-6 bg-gradient-to-br ${getPriorityGradient(reminder.priority)} animate-gradient`}
          style={{ 
            borderColor: getPriorityColor(reminder.priority),
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            backgroundSize: '200% 200%',
            animation: 'gradient 8s ease infinite'
          }}
        >
          {/* Priority Badge */}
          <div className="absolute top-4 right-4 z-10">
            <Flag className="w-6 h-6" style={{ color: getPriorityColor(reminder.priority) }} fill="currentColor" />
          </div>

          {/* Completion Status Badge - Top Left */}
          <div className="absolute top-4 left-4 z-10">
            {reminder.completed ? (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-full shadow-md">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-semibold">Completed</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-full shadow-sm">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-semibold">Pending</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 
            className={`text-2xl font-black text-center mb-4 px-2 ${reminder.completed ? 'line-through' : ''}`}
            style={{ color: getPriorityColor(reminder.priority) }}
          >
            {reminder.title}
          </h3>

          {/* Type Badge */}
          <div className="mb-6">
            <span 
              className="px-4 py-2 rounded-full text-sm font-semibold capitalize text-white shadow-md"
              style={{ backgroundColor: getPriorityColor(reminder.priority) }}
            >
              {reminder.type}
            </span>
          </div>

          {/* Deadline */}
          <div className="flex flex-col items-center gap-2" style={{ color: getPriorityColor(reminder.priority) }}>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">{formatDate(reminder.dueDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-bold text-lg">{formatTime(reminder.dueDate)}</span>
            </div>
          </div>

          {/* Hover Hint */}
          <p className="absolute bottom-4 text-xs text-gray-500 font-medium">Hover for details</p>
        </div>

        {/* Back Side - Clickable for Edit */}
        <div 
          className={`absolute w-full h-full rounded-2xl shadow-lg border-2 bg-gradient-to-br ${getPriorityBackGradient(reminder.priority)} p-6 overflow-y-auto cursor-pointer`}
          style={{ 
            borderColor: getPriorityColor(reminder.priority),
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            backgroundSize: '200% 200%',
            animation: 'gradient 8s ease infinite'
          }}
          onClick={(e) => {
            // Only trigger edit if not clicking on checkbox
            if (!(e.target as HTMLElement).closest('button[title*="Mark as"]')) {
              onClick();
            }
          }}
        >
          {/* Completion Checkbox - Top Left on Back */}
          <div className="absolute top-4 left-4 z-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(reminder._id);
              }}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                reminder.completed
                  ? 'bg-green-500 border-green-400 text-white'
                  : 'border-gray-400 hover:border-green-500 bg-white hover:bg-green-50'
              }`}
              title={reminder.completed ? 'Mark as Pending' : 'Mark as Completed'}
            >
              {reminder.completed ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-400"></div>
              )}
            </button>
          </div>

          <h3 className="text-xl font-bold mb-4 text-center border-b-2 border-gray-300 pb-2 mt-8 text-gray-800">
            Details
          </h3>

          <div className="space-y-3 text-sm text-gray-700">
            {/* Description */}
            {reminder.description && (
              <div>
                <p className="font-semibold mb-1 flex items-center gap-1 text-gray-800">
                  <FileText className="w-4 h-4" /> Description:
                </p>
                <p className="text-gray-600 text-xs leading-relaxed">{reminder.description}</p>
              </div>
            )}

            {/* Project */}
            {reminder.project && (
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${reminder.project.color}`}></div>
                <span className="font-semibold text-gray-800">Project:</span>
                <span className="text-gray-600">{reminder.project.name}</span>
              </div>
            )}

            {/* Assignee */}
            {reminder.assignee && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-semibold text-gray-800">Assigned to:</span>
                <span className="text-gray-600">{reminder.assignee.name}</span>
              </div>
            )}

            {/* Location */}
            {reminder.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="font-semibold text-gray-800">Location:</span>
                <span className="text-gray-600 text-xs">{reminder.location}</span>
              </div>
            )}

            {/* Meeting Link */}
            {reminder.meetingLink && (
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                <a 
                  href={reminder.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800 text-xs truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  Meeting Link
                </a>
              </div>
            )}

            {/* Notes */}
            {reminder.notes && (
              <div>
                <p className="font-semibold mb-1 text-gray-800">Notes:</p>
                <p className="text-gray-600 text-xs leading-relaxed">{reminder.notes}</p>
              </div>
            )}

            {/* Tags */}
            {reminder.tags && reminder.tags.length > 0 && (
              <div>
                <p className="font-semibold mb-1 flex items-center gap-1 text-gray-800">
                  <Tag className="w-4 h-4" /> Tags:
                </p>
                <div className="flex flex-wrap gap-1">
                  {reminder.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-yellow-200 text-gray-700 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recurring */}
            {reminder.recurring && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">Recurring:</span>
                <span className="text-gray-600 text-xs">
                  Every {reminder.recurring.interval} {reminder.recurring.frequency}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default ReminderCard;
