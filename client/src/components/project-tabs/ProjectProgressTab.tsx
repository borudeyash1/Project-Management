import React from 'react';
import { TrendingUp, CheckCircle, Clock, AlertCircle, Target, Calendar } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';

interface ProjectProgressTabProps {
  project: any;
}

const ProjectProgressTab: React.FC<ProjectProgressTabProps> = ({ project }) => {
  const { isDarkMode } = useTheme();

  const tasks = project?.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t: any) => t.status === 'in-progress').length;
  const pendingTasks = tasks.filter((t: any) => t.status === 'pending').length;
  const blockedTasks = tasks.filter((t: any) => t.status === 'blocked').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate days remaining
  const daysRemaining = project?.dueDate
    ? Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <GlassmorphicCard className="p-6">
        <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Overall Progress</h3>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Project Completion</span>
            <span className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-accent-dark'}`}>{project?.progress || 0}%</span>
          </div>
          <div className={`w-full rounded-full h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all"
              style={{ width: `${project?.progress || 0}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
            <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{completedTasks}</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
          </div>
          <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
            <Clock className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-blue-400' : 'text-accent-dark'}`} />
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-accent-dark'}`}>{inProgressTasks}</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</p>
          </div>
          <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <Target className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{pendingTasks}</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
          </div>
          <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
            <AlertCircle className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{blockedTasks}</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Blocked</p>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Timeline Progress */}
      <GlassmorphicCard className="p-6">
        <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Timeline Progress</h3>

        <div className="space-y-4">
          <div className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Start Date</span>
            </div>
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {project?.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
            </span>
          </div>

          <div className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Due Date</span>
            </div>
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {project?.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set'}
            </span>
          </div>

          {daysRemaining !== null && (
            <div className={`flex items-center justify-between p-4 rounded-lg ${daysRemaining < 0
                ? (isDarkMode ? 'bg-red-900/20' : 'bg-red-50')
                : daysRemaining < 7
                  ? (isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50')
                  : (isDarkMode ? 'bg-green-900/20' : 'bg-green-50')
              }`}>
              <div className="flex items-center gap-3">
                <Clock className={`w-5 h-5 ${daysRemaining < 0
                    ? (isDarkMode ? 'text-red-400' : 'text-red-600')
                    : daysRemaining < 7
                      ? (isDarkMode ? 'text-orange-400' : 'text-orange-600')
                      : (isDarkMode ? 'text-green-400' : 'text-green-600')
                  }`} />
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Days Remaining</span>
              </div>
              <span className={`font-bold ${daysRemaining < 0
                  ? (isDarkMode ? 'text-red-400' : 'text-red-600')
                  : daysRemaining < 7
                    ? (isDarkMode ? 'text-orange-400' : 'text-orange-600')
                    : (isDarkMode ? 'text-green-400' : 'text-green-600')
                }`}>
                {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
              </span>
            </div>
          )}
        </div>
      </GlassmorphicCard>

      {/* Task Completion Rate */}
      <GlassmorphicCard className="p-6">
        <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Task Completion Rate</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Tasks</span>
            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalTasks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Completed Tasks</span>
            <span className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{completedTasks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Completion Rate</span>
            <span className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-accent-dark'}`}>{completionRate}%</span>
          </div>

          <div className={`pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`w-full rounded-full h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Budget Progress */}
      {project?.budget && (
        <GlassmorphicCard className="p-6">
          <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Budget Progress</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Estimated Budget</span>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${project.budget.estimated?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actual Spent</span>
              <span className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-accent-dark'}`}>
                ${project.budget.actual?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Remaining</span>
              <span className={`font-semibold ${(project.budget.estimated - project.budget.actual) < 0
                  ? (isDarkMode ? 'text-red-400' : 'text-red-600')
                  : (isDarkMode ? 'text-green-400' : 'text-green-600')
                }`}>
                ${((project.budget.estimated || 0) - (project.budget.actual || 0)).toLocaleString()}
              </span>
            </div>

            <div className={`pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`w-full rounded-full h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
                <div
                  className={`h-3 rounded-full transition-all ${project.budget.actual > project.budget.estimated
                      ? 'bg-red-600'
                      : 'bg-accent'
                    }`}
                  style={{
                    width: `${Math.min(
                      Math.round((project.budget.actual / project.budget.estimated) * 100),
                      100
                    )}%`
                  }}
                />
              </div>
            </div>
          </div>
        </GlassmorphicCard>
      )}

      {/* Milestones */}
      {project?.milestones && project.milestones.length > 0 && (
        <GlassmorphicCard className="p-6">
          <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Milestones</h3>

          <div className="space-y-3">
            {project.milestones.map((milestone: any, idx: number) => (
              <div key={idx} className={`flex items-center gap-3 p-3 border rounded-lg ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${milestone.completed
                    ? (isDarkMode ? 'bg-green-900/20' : 'bg-green-100')
                    : (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')
                  }`}>
                  {milestone.completed ? (
                    <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  ) : (
                    <Target className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{milestone.name}</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                  </p>
                </div>
                {milestone.completed && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                    Completed
                  </span>
                )}
              </div>
            ))}
          </div>
        </GlassmorphicCard>
      )}
    </div>
  );
};

export default ProjectProgressTab;
