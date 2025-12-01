import React, { useState, useEffect } from 'react';
import { 
  Target, Plus, Search, Filter, MoreVertical, Edit, Trash2, 
  Eye, CheckCircle, Clock, AlertCircle, Star, Flag, Calendar,
  TrendingUp, BarChart3, Users, Zap, Bot, Crown, Award,
  ArrowUp, ArrowDown, Minus, Play, Pause, Square, RotateCcw,
  MessageSquare, FileText, Share2, Download, Settings, Grid, List
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import AddGoalModal from './goals/AddGoalModal';
import { goalService, Goal, GoalStats } from '../services/goalService';

const GoalsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { state, dispatch } = useApp();
  const { canUseAI, canCreateGoals, canManageGoals } = useFeatureAccess();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalStats, setGoalStats] = useState<GoalStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'team' | 'project' | 'company'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'not_started' | 'in_progress' | 'completed' | 'paused' | 'cancelled'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'productivity' | 'learning' | 'health' | 'financial' | 'career' | 'other'>('all');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [sortBy, setSortBy] = useState<'created' | 'due_date' | 'progress' | 'priority'>('due_date');
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const [goalsResponse, statsData] = await Promise.all([
        goalService.getGoals(),
        goalService.getGoalStats()
      ]);
      if (goalsResponse && goalsResponse.data) {
        setGoals(goalsResponse.data);
      }
      if (statsData) {
        setGoalStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      setGoals([]);
      setGoalStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'not_started': return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-800 bg-yellow-200';
      case 'low': return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'personal': return 'text-purple-600 bg-purple-100';
      case 'team': return 'text-blue-600 bg-blue-100';
      case 'project': return 'text-green-600 bg-green-100';
      case 'company': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

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

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(i18n.language === 'ja' ? 'ja-JP' : 'en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (targetDate: Date | string, status: string) => {
    if (status === 'completed' || status === 'cancelled') return false;
    const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
    return target < new Date();
  };

  const getFilteredGoals = () => {
    if (!goals || goals.length === 0) return [];
    let filtered = goals;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((goal: Goal) => 
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((goal: Goal) => goal.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((goal: Goal) => goal.status === filterStatus);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((goal: Goal) => goal.category === filterCategory);
    }

    // Sort
    filtered.sort((a: Goal, b: Goal) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'due_date':
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        case 'progress':
          return b.progress - a.progress;
        case 'priority': {
          const priorityOrder: { [key: string]: number } = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        }
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredGoals = getFilteredGoals();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-700 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('goals.title')}</h1>
                <p className="text-gray-600 dark:text-gray-400">{t('goals.subtitle')}</p>
              </div>
            </div>
            {canCreateGoals() && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-3 py-2 border border-transparent rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-accent text-gray-900 dark:text-gray-100 hover:bg-accent/90 transition-all"
              >
                <Plus className="w-4 h-4 text-gray-900 dark:text-gray-100" />
                <span className="text-gray-900 dark:text-gray-100 font-medium">{t('goals.newGoal')}</span>
              </button>
            )}
          </div>

          {/* Stats */}
          {goalStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('goals.totalGoals')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{goalStats.totalGoals}</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('goals.completed')}</p>
                    <p className="text-2xl font-bold text-green-600">{goalStats.completedGoals}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('goals.inProgress')}</p>
                    <p className="text-2xl font-bold text-blue-600">{goalStats.inProgressGoals}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('goals.avgProgress')}</p>
                    <p className="text-2xl font-bold text-orange-600">{Math.round(goalStats.averageProgress)}%</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={t('goals.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">{t('goals.allTypes')}</option>
                  <option value="personal">{t('goals.type.personal')}</option>
                  <option value="team">{t('goals.type.team')}</option>
                  <option value="project">{t('goals.type.project')}</option>
                  <option value="company">{t('goals.type.company')}</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">{t('goals.allStatus')}</option>
                  <option value="not_started">{t('goals.status.notStarted')}</option>
                  <option value="in_progress">{t('goals.status.inProgress')}</option>
                  <option value="completed">{t('goals.status.completed')}</option>
                  <option value="paused">{t('goals.status.paused')}</option>
                  <option value="cancelled">{t('goals.status.cancelled')}</option>
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">{t('goals.allCategories')}</option>
                  <option value="productivity">{t('goals.category.productivity')}</option>
                  <option value="learning">{t('goals.category.learning')}</option>
                  <option value="health">{t('goals.category.health')}</option>
                  <option value="financial">{t('goals.category.financial')}</option>
                  <option value="career">{t('goals.category.career')}</option>
                  <option value="other">{t('goals.category.other')}</option>
                </select>

                <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                  {[
                    { id: 'grid', icon: Grid },
                    { id: 'list', icon: List },
                    { id: 'timeline', icon: Calendar }
                  ].map(mode => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setViewMode(mode.id as any)}
                        className={`p-2 rounded ${viewMode === mode.id ? 'bg-purple-100 text-purple-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700'}`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('goals.goalsCount', { count: filteredGoals.length })}
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
            </div>
          ) : filteredGoals.length === 0 ? (
            <div className="p-12 text-center">
              <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {goals.length === 0 ? t('goals.noGoalsYet') : t('goals.noMatchingGoals')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {goals.length === 0 ? t('goals.createFirstGoal') : t('goals.tryDifferentFilters')}
              </p>
              {goals.length === 0 && canCreateGoals() && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-transparent rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-accent text-gray-900 dark:text-gray-100 hover:bg-accent/90 transition-all"
                >
                  <Plus className="w-4 h-4 text-gray-900 dark:text-gray-100" />
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{t('goals.newGoal')}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-4">
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredGoals.map(goal => (
                    <div key={goal._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedGoal(goal)}>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 flex-1">{goal.title}</h3>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                          {t(`goals.status.${goal.status}`)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{goal.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(goal.type)}`}>
                          {t(`goals.type.${goal.type}`)}
                        </span>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                          {t(`goals.priority.${goal.priority}`)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t('goals.progress')}</span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {t('goals.due', { date: formatDate(goal.targetDate) })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <div className="divide-y divide-gray-200">
                  {filteredGoals.map(goal => (
                    <div key={goal._id} className="p-4 hover:bg-gray-50 dark:bg-gray-700 cursor-pointer" onClick={() => setSelectedGoal(goal)}>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{goal.title}</h3>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(goal.type)}`}>
                              {t(`goals.type.${goal.type}`)}
                            </span>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                              {t(`goals.priority.${goal.priority}`)}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                              {getStatusIcon(goal.status)}
                              {t(`goals.status.${goal.status}`)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{goal.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{t('goals.due', { date: formatDate(goal.targetDate) })}</span>
                            <span>{goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} {t('goals.milestones')}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{goal.progress}%</div>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'timeline' && (
                <div className="space-y-4">
                  {filteredGoals.map(goal => (
                    <div key={goal._id} className="flex items-start gap-4 cursor-pointer" onClick={() => setSelectedGoal(goal)}>
                      <div className="flex-shrink-0">
                        <div className={`w-4 h-4 rounded-full ${goal.status === 'completed' ? 'bg-green-500' : 'bg-purple-500'}`} />
                      </div>
                      <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">{goal.title}</h3>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(goal.type)}`}>
                            {t(`goals.type.${goal.type}`)}
                          </span>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                            {t(`goals.priority.${goal.priority}`)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{goal.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <span>{t('goals.start', { date: formatDate(goal.startDate) })}</span>
                          <span>→</span>
                          <span>{t('goals.due', { date: formatDate(goal.targetDate) })}</span>
                          <span className="ml-auto">{goal.progress}% {t('goals.complete')}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <AddGoalModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchGoals();
            setShowAddModal(false);
          }}
        />
      )}

      {/* Goal Detail Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedGoal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{selectedGoal.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{selectedGoal.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedGoal.type)}`}>
                      {t(`goals.type.${selectedGoal.type}`)}
                    </span>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedGoal.priority)}`}>
                      {t(`goals.priority.${selectedGoal.priority}`)}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedGoal.status)}`}>
                      {getStatusIcon(selectedGoal.status)}
                      {t(`goals.status.${selectedGoal.status}`)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGoal(null)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-400 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Progress */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">{t('goals.progress')}</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('goals.overallProgress')}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedGoal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                      style={{ width: `${selectedGoal.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Milestones */}
              {selectedGoal.milestones && selectedGoal.milestones.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">{t('goals.milestones')}</h4>
                  <div className="space-y-3">
                    {selectedGoal.milestones.map(milestone => (
                      <div key={milestone._id} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                          milestone.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300'
                        }`}>
                          {milestone.completed && <CheckCircle className="w-3 h-3" />}
                        </div>
                        <div className="flex-1">
                          <h5 className={`font-medium ${milestone.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                            {milestone.title}
                          </h5>
                          {milestone.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{milestone.description}</p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t('goals.due', { date: formatDate(milestone.dueDate) })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('goals.startDate')}</label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(selectedGoal.startDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('goals.targetDate')}</label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(selectedGoal.targetDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('goals.createdByLabel')}</label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{selectedGoal.createdBy.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('goals.categoryLabel')}</label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 capitalize">{t(`goals.category.${selectedGoal.category}`)}</p>
                </div>
              </div>

              {/* Tags */}
              {selectedGoal.tags && selectedGoal.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('goals.tags')}</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedGoal.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
