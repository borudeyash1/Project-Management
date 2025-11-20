import React from 'react';
import { TrendingUp, CheckCircle, Clock, AlertCircle, Target, Calendar } from 'lucide-react';

interface ProjectProgressTabProps {
  project: any;
}

const ProjectProgressTab: React.FC<ProjectProgressTabProps> = ({ project }) => {
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
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Overall Progress</h3>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Project Completion</span>
            <span className="text-2xl font-bold text-accent-dark">{project?.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all"
              style={{ width: `${project?.progress || 0}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Clock className="w-8 h-8 text-accent-dark mx-auto mb-2" />
            <p className="text-2xl font-bold text-accent-dark">{inProgressTasks}</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Target className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-600">{pendingTasks}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{blockedTasks}</p>
            <p className="text-sm text-gray-600">Blocked</p>
          </div>
        </div>
      </div>

      {/* Timeline Progress */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Timeline Progress</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Start Date</span>
            </div>
            <span className="text-gray-700">
              {project?.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Due Date</span>
            </div>
            <span className="text-gray-700">
              {project?.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set'}
            </span>
          </div>

          {daysRemaining !== null && (
            <div className={`flex items-center justify-between p-4 rounded-lg ${
              daysRemaining < 0 ? 'bg-red-50' : daysRemaining < 7 ? 'bg-orange-50' : 'bg-green-50'
            }`}>
              <div className="flex items-center gap-3">
                <Clock className={`w-5 h-5 ${
                  daysRemaining < 0 ? 'text-red-600' : daysRemaining < 7 ? 'text-orange-600' : 'text-green-600'
                }`} />
                <span className="font-medium text-gray-900">Days Remaining</span>
              </div>
              <span className={`font-bold ${
                daysRemaining < 0 ? 'text-red-600' : daysRemaining < 7 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Task Completion Rate */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Task Completion Rate</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Total Tasks</span>
            <span className="font-semibold text-gray-900">{totalTasks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Completed Tasks</span>
            <span className="font-semibold text-green-600">{completedTasks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Completion Rate</span>
            <span className="font-semibold text-accent-dark">{completionRate}%</span>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <div className="w-full bg-gray-300 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Progress */}
      {project?.budget && (
        <div className="bg-white rounded-lg border border-gray-300 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget Progress</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Estimated Budget</span>
              <span className="font-semibold text-gray-900">
                ${project.budget.estimated?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Actual Spent</span>
              <span className="font-semibold text-accent-dark">
                ${project.budget.actual?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Remaining</span>
              <span className={`font-semibold ${
                (project.budget.estimated - project.budget.actual) < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                ${((project.budget.estimated || 0) - (project.budget.actual || 0)).toLocaleString()}
              </span>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="w-full bg-gray-300 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    project.budget.actual > project.budget.estimated 
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
        </div>
      )}

      {/* Milestones */}
      {project?.milestones && project.milestones.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-300 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Milestones</h3>
          
          <div className="space-y-3">
            {project.milestones.map((milestone: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  milestone.completed ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {milestone.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Target className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{milestone.name}</h4>
                  <p className="text-sm text-gray-600">
                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                  </p>
                </div>
                {milestone.completed && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Completed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectProgressTab;
