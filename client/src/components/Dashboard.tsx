import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Building, 
  Plus, 
  TrendingUp, 
  Timer, 
  BadgeCheck, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  FolderPlus,
  Kanban,
  Calendar,
  GanttChart,
  Lock,
  MoreHorizontal,
  Check,
  Target,
  Bell,
  CalendarDays,
  BarChart3,
  Users,
  FileText,
  Home,
  LayoutDashboard
} from 'lucide-react';
import { WorkspaceCreationRestriction } from './FeatureRestriction';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
  const { state, dispatch } = useApp();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const toggleModal = (modalName: keyof typeof state.modals) => {
    dispatch({ type: 'TOGGLE_MODAL', payload: modalName });
  };

  const enterWorkspace = (name: string) => {
    dispatch({ type: 'SET_WORKSPACE', payload: name });
    dispatch({ type: 'SET_SECTION', payload: 'workspaceOwner' });
  };

  const enterProject = (name: string) => {
    dispatch({ type: 'SET_PROJECT', payload: name });
    dispatch({ type: 'SET_SECTION', payload: 'project' });
  };

  const openTaskDrawer = (title: string) => {
    dispatch({ type: 'SET_TASK_DRAWER_TITLE', payload: title });
    dispatch({ type: 'TOGGLE_TASK_DRAWER', payload: true });
  };

  const toggleCheck = (e: React.MouseEvent<HTMLButtonElement>) => {
    const icon = e.currentTarget.querySelector('i') || e.currentTarget;
    const isOn = icon.classList.contains('opacity-100');
    icon.classList.toggle('opacity-100', !isOn);
    icon.classList.toggle('opacity-0', isOn);
    e.currentTarget.classList.toggle('bg-emerald-50', !isOn);
    e.currentTarget.classList.toggle('border-emerald-200', !isOn);
  };

  // Get current page based on route
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/home') return 'home';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/projects') return 'projects';
    if (path === '/planner') return 'planner';
    if (path === '/tracker') return 'tracker';
    if (path === '/reminders') return 'reminders';
    if (path === '/workspace') return 'workspace';
    if (path === '/reports') return 'reports';
    if (path === '/team') return 'team';
    if (path === '/goals') return 'goals';
    return 'home';
  };

  const currentPage = getCurrentPage();

  // Tab configuration for different pages
  const getTabsForPage = (page: string) => {
    switch (page) {
      case 'home':
        return [
          { id: 'overview', label: t('tabs.overview'), icon: Home },
          { id: 'recent', label: t('tabs.recent'), icon: Timer },
          { id: 'favorites', label: t('tabs.favorites'), icon: Target }
        ];
      case 'dashboard':
        return [
          { id: 'overview', label: t('tabs.overview'), icon: LayoutDashboard },
          { id: 'analytics', label: t('tabs.analytics'), icon: BarChart3 },
          { id: 'activity', label: t('tabs.activity'), icon: Bell }
        ];
      case 'projects':
        return [
          { id: 'list', label: t('tabs.list'), icon: FileText },
          { id: 'kanban', label: t('tabs.kanban'), icon: Kanban },
          { id: 'calendar', label: t('tabs.calendar'), icon: Calendar },
          { id: 'gantt', label: t('tabs.gantt'), icon: GanttChart }
        ];
      case 'reports':
        return [
          { id: 'overview', label: t('tabs.overview'), icon: BarChart3 },
          { id: 'productivity', label: t('tabs.productivity'), icon: TrendingUp },
          { id: 'time', label: t('tabs.time'), icon: Timer },
          { id: 'team', label: t('tabs.team'), icon: Users }
        ];
      case 'team':
        return [
          { id: 'members', label: t('tabs.members'), icon: Users },
          { id: 'roles', label: t('tabs.roles'), icon: Target },
          { id: 'performance', label: t('tabs.performance'), icon: BarChart3 }
        ];
      case 'goals':
        return [
          { id: 'personal', label: t('tabs.personal'), icon: Target },
          { id: 'team', label: t('tabs.team'), icon: Users },
          { id: 'company', label: t('tabs.company'), icon: Building }
        ];
      default:
        return [{ id: 'overview', label: t('tabs.overview'), icon: Home }];
    }
  };

  const tabs = getTabsForPage(currentPage);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Page Header with Tabs */}
      <div className="bg-white border border-border rounded-xl">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 capitalize">
                {t(`headers.${currentPage}`)}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {t(`descriptions.${currentPage}`)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <WorkspaceCreationRestriction>
                <button 
                  className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
                  onClick={() => navigate('/workspace')}
                >
                  <Building className="w-4 h-4 mr-1 inline-block" />
                  {t('workspace.create')}
                </button>
              </WorkspaceCreationRestriction>
              <button 
                className="px-3 py-2 rounded-lg text-white text-sm hover:opacity-95 bg-accent"
                onClick={() => showToast('Quick add', 'info')}
              >
                <Plus className="w-4 h-4 mr-1 inline-block" />
                {t('common.add')}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 py-3">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-yellow-100 text-yellow-900 border border-yellow-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Route-specific content based on current page and active tab */}
      {currentPage === 'home' && (
        <HomeContent activeTab={activeTab} />
      )}

      {currentPage === 'dashboard' && (
        <DashboardContent activeTab={activeTab} />
      )}

      {currentPage === 'projects' && (
        <ProjectsContent activeTab={activeTab} />
      )}

      {currentPage === 'reports' && (
        <ReportsContent activeTab={activeTab} />
      )}

      {currentPage === 'team' && (
        <TeamContent activeTab={activeTab} />
      )}

      {currentPage === 'goals' && (
        <GoalsContent activeTab={activeTab} />
      )}

      {/* Default content for other pages */}
      {(currentPage === 'planner' || currentPage === 'tracker' || currentPage === 'reminders' || currentPage === 'workspace') && (
        <DefaultContent currentPage={currentPage} activeTab={activeTab} />
      )}
    </div>
  );
};

// Home Content Component
const HomeContent: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { state } = useApp();
  const { t } = useTranslation();

  if (activeTab === 'overview') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Welcome + KPI */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[22px] tracking-tight font-semibold">{t('dashboard.goodAfternoon', { name: state.userProfile.fullName.split(' ')[0] })}</h2>
                <p className="text-sm text-slate-600 mt-1">{t('dashboard.workOverview')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">{t('dashboard.activeProjects')}</div>
                <div className="text-xl font-semibold tracking-tight mt-1">12</div>
                <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {t('dashboard.productivityIncrease')}
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">{t('dashboard.tasksDue')}</div>
                <div className="text-xl font-semibold tracking-tight mt-1">26</div>
                <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5" />
                  5 {t('dashboard.overdue')}
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">{t('dashboard.weeksHours')}</div>
                <div className="text-xl font-semibold tracking-tight mt-1">38.5</div>
                <div className="text-xs text-slate-500 mt-1">{t('dashboard.timesheetSynced')}</div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">{t('dashboard.payrollStatus')}</div>
                <div className="text-xl font-semibold tracking-tight mt-1">$24,380</div>
                <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {t('dashboard.ready')}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="bg-white border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] tracking-tight font-semibold">{t('dashboard.upcomingTasks')}</h3>
              <button className="text-sm text-slate-600 hover:text-slate-900">{t('buttons.viewAll')}</button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Marketing site launch</div>
                  <div className="text-xs text-slate-500">Due today • 5:00 PM</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">{t('tasks.high')}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Payroll approval</div>
                  <div className="text-xs text-slate-500">Due tomorrow • 11:00 AM</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">{t('projects.onTrack')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'recent') {
    return (
      <div className="bg-white border border-border rounded-xl p-5">
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.recentActivity')}</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-accent-dark" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Created new project "Website Redesign"</div>
              <div className="text-xs text-slate-500">2 hours ago</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Completed task "Update user interface"</div>
              <div className="text-xs text-slate-500">4 hours ago</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <h3 className="text-lg font-semibold mb-4">{t('tabs.favorites')}</h3>
      <div className="text-slate-500">{t('common.none')}</div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { t } = useTranslation();
  if (activeTab === 'overview') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4">{t('projects.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border">
                <div className="text-sm text-slate-500">{t('projects.allProjects')}</div>
                <div className="text-2xl font-semibold">12</div>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <div className="text-sm text-slate-500">{t('projects.active')}</div>
                <div className="text-2xl font-semibold">47</div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4">{t('dashboard.quickActions')}</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-slate-50">
                <div className="font-medium">{t('projects.newProject')}</div>
                <div className="text-sm text-slate-500">{t('projects.newProject')}</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-slate-50">
                <div className="font-medium">{t('tasks.newTask')}</div>
                <div className="text-sm text-slate-500">{t('tasks.newTask')}</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'analytics') {
    return (
      <div className="bg-white border border-border rounded-xl p-5">
        <h3 className="text-lg font-semibold mb-4">{t('tabs.analytics')}</h3>
        <div className="text-slate-500">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <h3 className="text-lg font-semibold mb-4">{t('tabs.activity')}</h3>
      <div className="text-slate-500">{t('common.loading')}</div>
    </div>
  );
};

// Projects Content Component
const ProjectsContent: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { state } = useApp();
  const { t } = useTranslation();

  if (activeTab === 'list') {
    return (
      <div className="bg-white border border-border rounded-xl">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-[18px] tracking-tight font-semibold">{t('projects.title')}</h3>
            <p className="text-xs text-slate-500">{t('projects.projectDescription')}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  className="w-48 rounded-lg border border-border bg-white pl-8 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
                  placeholder={t('common.search')}
                />
              </div>
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm">
                <SlidersHorizontal className="w-4 h-4 mr-1 inline-block" />
                {t('common.filter')}
              </button>
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm">
                <ArrowUpDown className="w-4 h-4 mr-1 inline-block" />
                {t('reports.sortBy')}
              </button>
            </div>
            <button className="px-3 py-2 rounded-lg text-white text-sm hover:opacity-95 bg-accent">
              <FolderPlus className="w-4 h-4 mr-1 inline-block" />
              {t('projects.newProject')}
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-5">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600">
                <tr className="border-b border-border">
                  <th className="text-left font-medium py-2 pr-3">{t('projects.projectName')}</th>
                  <th className="text-left font-medium py-2 pr-3">{t('projects.client')}</th>
                  <th className="text-left font-medium py-2 pr-3">{t('common.status')}</th>
                  <th className="text-left font-medium py-2 pr-3">{t('tasks.dueDate')}</th>
                  <th className="text-left font-medium py-2 pr-3">{t('projects.members')}</th>
                  <th className="text-right font-medium py-2 pl-3">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {state.projects.map((project) => (
                  <tr key={project._id} className="hover:bg-slate-50">
                    <td className="py-3 pr-3">
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-slate-500">Marketing • {t('tasks.' + project.priority.toLowerCase())} {t('tasks.priority')}</div>
                    </td>
                    <td className="py-3 pr-3">{project.client}</td>
                    <td className="py-3 pr-3">
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        project.status === 'active' ? 'bg-blue-50 text-accent-dark border-blue-200' :
                        project.status === 'on-hold' ? 'bg-slate-100 text-slate-700 border-border' :
                        'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                        {t('projects.' + project.status.toLowerCase().replace(' ', ''))}
                      </span>
                    </td>
                    <td className="py-3 pr-3">{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : t('common.none')}</td>
                    <td className="py-3 pr-3">
                      <div className="flex -space-x-2">
                        {project.teamMembers.slice(0, 2).map((member, index) => (
                          <div 
                            key={index}
                            className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs text-slate-600"
                          >
                            {member.user.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {project.teamMembers.length > 2 && (
                          <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs text-slate-600">
                            +{project.teamMembers.length - 2}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50">
                        {t('common.view')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'kanban') {
    return (
      <div className="bg-white border border-border rounded-xl p-5">
        <h3 className="text-lg font-semibold mb-4">Kanban Board</h3>
        <div className="text-slate-500">Kanban board coming soon...</div>
      </div>
    );
  }

  if (activeTab === 'calendar') {
    return (
      <div className="bg-white border border-border rounded-xl p-5">
        <h3 className="text-lg font-semibold mb-4">Project Calendar</h3>
        <div className="text-slate-500">Project calendar coming soon...</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <h3 className="text-lg font-semibold mb-4">Gantt Chart</h3>
      <div className="text-slate-500">Gantt chart coming soon...</div>
    </div>
  );
};

// Reports Content Component
const ReportsContent: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <h3 className="text-lg font-semibold mb-4">
        {activeTab === 'overview' ? t('reports.title') + ' ' + t('dashboard.overview') :
         activeTab === 'productivity' ? t('reports.productivity') :
         activeTab === 'time' ? t('reports.timeTracking') :
         activeTab === 'team' ? t('reports.teamPerformance') : t('reports.title')}
      </h3>
      <div className="text-slate-500">{t('common.comingSoon')}</div>
    </div>
  );
};

// Team Content Component
const TeamContent: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <h3 className="text-lg font-semibold mb-4">
        {activeTab === 'members' ? t('team.members') :
         activeTab === 'roles' ? t('tabs.roles') :
         activeTab === 'performance' ? t('reports.teamPerformance') : t('team.title')}
      </h3>
      <div className="text-slate-500">{t('common.comingSoon')}</div>
    </div>
  );
};

// Goals Content Component
const GoalsContent: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <h3 className="text-lg font-semibold mb-4">
        {activeTab === 'personal' ? t('tabs.personal') + ' ' + t('headers.goals') :
         activeTab === 'team' ? t('tabs.team') + ' ' + t('headers.goals') :
         activeTab === 'company' ? t('tabs.company') + ' ' + t('headers.goals') : t('headers.goals')}
      </h3>
      <div className="text-slate-500">{t('common.comingSoon')}</div>
    </div>
  );
};

// Default Content Component
const DefaultContent: React.FC<{ currentPage: string; activeTab: string }> = ({ currentPage, activeTab }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <h3 className="text-lg font-semibold mb-4 capitalize">
        {t(`headers.${currentPage}`)} - {activeTab}
      </h3>
      <div className="text-slate-500">{t('common.contentComingSoon', { page: t('headers.' + currentPage) })}</div>
    </div>
  );
};

export default Dashboard;