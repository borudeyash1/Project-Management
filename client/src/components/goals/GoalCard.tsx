import React from 'react';
import { CheckCircle, Clock, Play, Pause, Square, Calendar, Flag, Users } from 'lucide-react';

interface GoalCardProps {
  goal: {
    _id: string;
    title: string;
    description: string;
    type: string;
    category: string;
    priority: string;
    status: string;
    startDate: Date | string;
    targetDate: Date | string;
    milestones?: Array<{ completed: boolean }>;
  };
  onClick: () => void;
  formatDate: (date: Date | string) => string;
  getStatusColor: (status: string) => string;
  getTypeColor: (type: string) => string;
  getPriorityColor: (priority: string) => string;
  t: (key: string, options?: any) => string;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onClick,
  formatDate,
  getStatusColor,
  getTypeColor,
  getPriorityColor,
  t
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'in_progress': return <Play className="w-3 h-3" />;
      case 'not_started': return <Clock className="w-3 h-3" />;
      case 'paused': return <Pause className="w-3 h-3" />;
      case 'cancelled': return <Square className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getBlobColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444'; // red
      case 'high': return '#f97316'; // orange
      case 'medium': return '#eab308'; // yellow - theme color
      case 'low': return '#3b82f6'; // blue
      default: return '#eab308'; // yellow default
    }
  };

  return (
    <div
      className="goal-card relative w-full h-64 rounded-2xl overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-colors"
      onClick={onClick}
    >
      {/* Animated Blob */}
      <div
        className="blob absolute z-10 top-1/2 left-1/2 w-32 h-32 rounded-full opacity-100"
        style={{
          backgroundColor: getBlobColor(goal.priority),
          filter: 'blur(12px)',
          animation: 'blob-bounce 5s infinite ease'
        }}
      />

      {/* Content Background */}
      <div
        className="bg absolute top-1 left-1 right-1 bottom-1 z-20 rounded-xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, .95)',
          backdropFilter: 'blur(24px)',
          outline: '2px solid white'
        }}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-lg flex-1 line-clamp-2 pr-2">
              {goal.title}
            </h3>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)} flex-shrink-0`}>
              {getStatusIcon(goal.status)}
              {t(`goals.status.${goal.status}`)}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {goal.description}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(goal.type)}`}>
              {t(`goals.type.${goal.type}`)}
            </span>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
              <Flag className="w-3 h-3 mr-1" />
              {t(`goals.priority.${goal.priority}`)}
            </span>
          </div>

          {/* Footer */}
          <div className="mt-auto space-y-2">
            {/* Milestones */}
            {goal.milestones && goal.milestones.length > 0 && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>
                  {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} {t('goals.milestones')}
                </span>
              </div>
            )}

            {/* Dates */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(goal.targetDate)}</span>
              </div>
              <span className="text-xs font-medium text-gray-400">
                {t(`goals.category.${goal.category}`)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob-bounce {
          0% {
            transform: translate(-100%, -100%) translate3d(0, 0, 0);
          }
          25% {
            transform: translate(-100%, -100%) translate3d(100%, 0, 0);
          }
          50% {
            transform: translate(-100%, -100%) translate3d(100%, 100%, 0);
          }
          75% {
            transform: translate(-100%, -100%) translate3d(0, 100%, 0);
          }
          100% {
            transform: translate(-100%, -100%) translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default GoalCard;
