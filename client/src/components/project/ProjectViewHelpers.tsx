import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar, Activity, FileText, Upload, Plus, Download, Share2,
  TrendingUp, DollarSign, Users, CheckCircle, Settings, Flag
} from 'lucide-react';

interface RenderTimelineViewProps {
  activeProject: any;
  formatDate: (date: Date) => string;
  isDarkMode: boolean;
}

export const RenderTimelineView: React.FC<RenderTimelineViewProps> = ({ activeProject, formatDate, isDarkMode }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('project.view.timeline.title')}
        </h3>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
            {t('project.view.timeline.day')}
          </button>
          <button className="px-3 py-1 text-sm font-medium text-accent-dark bg-blue-50 rounded-lg">
            {t('project.view.timeline.week')}
          </button>
          <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
            {t('project.view.timeline.month')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="space-y-6">
          {!activeProject?.timeline || activeProject?.timeline.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="font-medium">{t('project.view.timeline.noActivity')}</p>
              <p className="text-sm mt-1">{t('project.view.timeline.noActivityDesc')}</p>
            </div>
          ) : (
            activeProject?.timeline.map((event: any, index: number) => (
              <div key={event._id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    event.type === 'task' ? 'bg-blue-100' :
                    event.type === 'milestone' ? 'bg-green-100' :
                    event.type === 'comment' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    {event.type === 'task' && <CheckCircle className="w-5 h-5 text-accent-dark" />}
                    {event.type === 'milestone' && <Flag className="w-5 h-5 text-green-600" />}
                  </div>
                  {index < (activeProject?.timeline.length || 0) - 1 && (
                    <div className="w-0.5 h-full bg-gray-300 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <span className="text-sm text-gray-600">{formatDate(event.date)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">{t('project.view.timeline.milestones')}</h4>
        <div className="space-y-4">
          {!activeProject?.milestones || activeProject?.milestones.length === 0 ? (
            <p className="text-center text-gray-600 py-8">{t('project.view.timeline.noMilestones')}</p>
          ) : (
            activeProject?.milestones.map((milestone: any) => (
              <div key={milestone._id} className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{milestone.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>{t('project.view.timeline.due', { date: formatDate(milestone.dueDate) })}</span>
                    <span>{t('project.view.timeline.complete', { percent: milestone.progress })}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                  milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {milestone.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface RenderDocumentsViewProps {
  activeProject: any;
  formatDate: (date: Date) => string;
  isDarkMode: boolean;
}

export const RenderDocumentsView: React.FC<RenderDocumentsViewProps> = ({ activeProject, formatDate, isDarkMode }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('project.view.documents.title')}
        </h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Upload className="w-4 h-4" />
            {t('project.view.documents.upload')}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover">
            <Plus className="w-4 h-4" />
            {t('project.view.documents.newFolder')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">{t('project.view.documents.totalFiles')}</p>
          <p className="text-2xl font-bold text-gray-900">{activeProject?.documents.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">{t('project.view.documents.storageUsed')}</p>
          <p className="text-2xl font-bold text-gray-900">
            {((activeProject?.documents.reduce((acc: number, doc: any) => acc + (doc.size || 0), 0) || 0) / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">{t('project.view.documents.recentUploads')}</p>
          <p className="text-2xl font-bold text-gray-900">
            {activeProject?.documents.filter((d: any) => {
              const dayAgo = new Date();
              dayAgo.setDate(dayAgo.getDate() - 1);
              return new Date(d.uploadedAt) > dayAgo;
            }).length || 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button className="px-3 py-1 text-sm font-medium text-accent-dark bg-blue-50 rounded-lg">
              {t('project.view.documents.allFiles')}
            </button>
            <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
              {t('project.view.documents.images')}
            </button>
            <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
              {t('project.view.documents.docs')}
            </button>
            <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
              {t('project.view.documents.recent')}
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeProject?.documents.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="font-medium">{t('project.view.documents.noDocuments')}</p>
              <p className="text-sm mt-1">{t('project.view.documents.noDocumentsDesc')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProject?.documents.map((doc: any) => (
                <div key={doc._id} className="border border-gray-300 rounded-lg p-4 transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-accent-dark" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm">{doc.name}</h5>
                        <p className="text-xs text-gray-600">
                          {doc.size ? `${(doc.size / 1024).toFixed(2)} KB` : t('project.view.documents.folder')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    <p>{t('project.view.documents.uploadedBy', { name: doc.uploadedBy?.name || 'Unknown' })}</p>
                    <p>{formatDate(doc.uploadedAt)}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      <Download className="w-3 h-3 inline mr-1" />
                      {t('project.view.documents.download')}
                    </button>
                    <button className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      <Share2 className="w-3 h-3 inline mr-1" />
                      {t('project.view.documents.share')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface RenderAnalyticsViewProps {
  activeProject: any;
  formatCurrency: (amount: number) => string;
  isDarkMode: boolean;
}

export const RenderAnalyticsView: React.FC<RenderAnalyticsViewProps> = ({ activeProject, formatCurrency, isDarkMode }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('project.view.analytics.title')}
        </h3>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
            {t('project.view.analytics.last7Days')}
          </button>
          <button className="px-3 py-1 text-sm font-medium text-accent-dark bg-blue-50 rounded-lg">
            {t('project.view.analytics.last30Days')}
          </button>
          <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
            {t('project.view.analytics.allTime')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">{t('project.view.analytics.completionRate')}</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{activeProject?.progress}%</p>
          <p className="text-sm text-green-600 mt-1">{t('project.view.analytics.vsLastMonth')}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">{t('project.view.analytics.teamVelocity')}</p>
            <Activity className="w-5 h-5 text-accent-dark" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {activeProject?.tasks.filter((t: any) => t.status === 'completed').length || 0}
          </p>
          <p className="text-sm text-accent-dark mt-1">{t('project.view.analytics.tasksCompleted')}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">{t('project.view.analytics.budgetUsage')}</p>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {activeProject?.budget && activeProject?.spent 
              ? Math.round((activeProject.spent / activeProject.budget) * 100)
              : 0}%
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {t('project.view.analytics.budgetDesc', { 
              spent: formatCurrency(activeProject?.spent || 0),
              total: formatCurrency(activeProject?.budget || 0)
            })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">{t('project.view.analytics.teamWorkload')}</p>
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {activeProject?.team.length 
              ? Math.round(activeProject.team.reduce((acc: number, m: any) => acc + m.workload, 0) / activeProject.team.length)
              : 0}%
          </p>
          <p className="text-sm text-gray-600 mt-1">{t('project.view.analytics.avgWorkload')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">{t('project.view.analytics.taskDist')}</h4>
          <div className="space-y-3">
            {['pending', 'in-progress', 'review', 'completed', 'blocked'].map((status) => {
              const count = activeProject?.tasks.filter((t: any) => t.status === status).length || 0;
              const total = activeProject?.tasks.length || 1;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="capitalize text-gray-700">{status.replace('-', ' ')}</span>
                    <span className="font-medium text-gray-900">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        status === 'completed' ? 'bg-green-600' :
                        status === 'in-progress' ? 'bg-accent' :
                        status === 'blocked' ? 'bg-red-600' :
                        status === 'review' ? 'bg-purple-600' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">{t('project.view.analytics.teamPerf')}</h4>
          <div className="space-y-4">
            {activeProject?.team.map((member: any) => (
              <div key={member._id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{member.name}</span>
                  <span className="font-medium text-gray-900">
                    {t('project.view.analytics.tasksStat', { 
                      completed: member.tasksCompleted,
                      assigned: member.tasksAssigned
                    })}
                  </span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full"
                    style={{ 
                      width: `${member.tasksAssigned > 0 
                        ? Math.round((member.tasksCompleted / member.tasksAssigned) * 100)
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">{t('project.view.analytics.budgetBreakdown')}</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{t('project.view.analytics.totalBudget')}</span>
              <span className="font-semibold text-gray-900">{formatCurrency(activeProject?.budget || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{t('project.view.analytics.spent')}</span>
              <span className="font-semibold text-red-600">{formatCurrency(activeProject?.spent || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{t('project.view.analytics.remaining')}</span>
              <span className="font-semibold text-green-600">
                {formatCurrency((activeProject?.budget || 0) - (activeProject?.spent || 0))}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="w-full bg-gray-300 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-600 to-red-600 h-3 rounded-full"
                  style={{ 
                    width: `${activeProject?.budget && activeProject?.spent 
                      ? Math.min(Math.round((activeProject.spent / activeProject.budget) * 100), 100)
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">{t('project.view.analytics.activitySummary')}</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-accent-dark" />
                <span className="text-sm font-medium text-gray-900">{t('project.view.analytics.tasksCreated')}</span>
              </div>
              <span className="text-lg font-bold text-accent-dark">{activeProject?.tasks.length || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">{t('project.view.analytics.tasksCompleted')}</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {activeProject?.tasks.filter((t: any) => t.status === 'completed').length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">{t('project.view.analytics.teamMembers')}</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{activeProject?.team.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RenderSettingsViewProps {
  isDarkMode: boolean;
}

export const RenderSettingsView: React.FC<RenderSettingsViewProps> = ({ isDarkMode }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-300 p-12 text-center">
        <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('project.view.settings.title')}</h3>
        <p className="text-gray-600">{t('project.view.settings.comingSoon')}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('project.view.settings.attendanceLocation')}</h3>
        <p className="text-sm text-gray-600 mb-4">
          {t('project.view.settings.attendanceDesc')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('project.view.settings.latitude')}</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="e.g. 28.6139"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('project.view.settings.longitude')}</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="e.g. 77.2090"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                if (!navigator.geolocation) {
                  alert('Geolocation is not supported by this browser.');
                  return;
                }
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const latInput = document.querySelector<HTMLInputElement>('input[placeholder="e.g. 28.6139"]');
                    const lngInput = document.querySelector<HTMLInputElement>('input[placeholder="e.g. 77.2090"]');
                    if (latInput && lngInput) {
                      latInput.value = String(pos.coords.latitude.toFixed(6));
                      lngInput.value = String(pos.coords.longitude.toFixed(6));
                    }
                  },
                  () => {
                    alert('Unable to detect current location. Please allow location permission.');
                  }
                );
              }}
              className="w-full px-3 py-2 bg-accent text-gray-900 rounded-lg text-sm hover:bg-accent-hover"
            >
              {t('project.view.settings.useCurrentLocation')}
            </button>
            <p className="text-xs text-gray-600">
              {t('project.view.settings.uiOnly')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
