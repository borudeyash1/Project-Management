import React, { useState } from 'react';
import {
  CheckCircle, Circle, Clock, Flag, Plus,
  ChevronDown, ChevronRight, Calendar, User, AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlanner } from '../../../context/PlannerContext';
import { Task } from '../../../context/PlannerContext';
import { useApp } from '../../../context/AppContext';

interface MyWorkViewProps {
  searchQuery: string;
}

const MyWorkView: React.FC<MyWorkViewProps> = ({ searchQuery }) => {
  const { tasks, updateTask } = usePlanner();
  const { state } = useApp();
  const { t, i18n } = useTranslation();
  const [expandedSections, setExpandedSections] = useState({
    overdue: true,
    today: true,
    thisWeek: true,
    later: false
  });


  const currentUserId = state.userProfile?._id;

  // Filter tasks to show only those assigned to the current user
  const myTasks = tasks.filter(task => {
    // If no user is logged in, show no tasks
    if (!currentUserId) return false;
    
    // Check if task is assigned to current user
    // Handle different assignee formats: string ID, object with _id, or null/undefined
    const isAssignedToMe = 
      task.assignee === currentUserId || 
      task.assignee?._id === currentUserId ||
      task.assignee?.toString() === currentUserId;
    
    return (
      isAssignedToMe &&
      task.status !== 'completed' &&
      (!searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Categorize tasks
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const overdueTasks = myTasks.filter(task => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < today;
  });

  const todayTasks = myTasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate < tomorrow;
  });

  const thisWeekTasks = myTasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= tomorrow && dueDate < nextWeek;
  });

  const laterTasks = myTasks.filter(task => {
    if (!task.dueDate) return true;
    return new Date(task.dueDate) >= nextWeek;
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !(prev as any)[section]
    }));
  };

  const handleToggleComplete = (taskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (task) {
      updateTask(taskId, {
        status: task.status === 'completed' ? 'pending' : 'completed'
      });
    }
  };



  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-accent-dark bg-blue-50 border-blue-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    const colors = {
      urgent: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-yellow-600',
      low: 'text-gray-600'
    };
    return <Flag className={`w-4 h-4 ${colors[priority as keyof typeof colors] || 'text-gray-600'}`} />;
  };

  const TaskItem = ({ task }: { task: Task }) => (
    <div className="group flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow">
      {/* Checkbox */}
      <button
        onClick={() => handleToggleComplete(task._id)}
        className="flex-shrink-0"
      >
        {task.status === 'completed' ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <Circle className="w-5 h-5 text-gray-600 hover:text-accent-dark" />
        )}
      </button>

      {/* Task Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-medium text-gray-900 dark:text-white truncate ${task.status === 'completed' ? 'line-through text-gray-500' : ''
            }`}>
            {task.title}
          </h4>
          {getPriorityIcon(task.priority)}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-200">
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString(i18n.language, {
                month: 'short',
                day: 'numeric'
              })}
            </span>
          )}
          {task.estimatedTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.estimatedTime}h
            </span>
          )}
          {task.project && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-700 rounded">
              {typeof task.project === 'object' ? (task.project?.name || 'No Project') : (task.project || 'No Project')}
            </span>
          )}
        </div>
      </div>

      {/* Quick Actions */}

    </div>
  );

  const Section = ({
    title,
    count,
    tasks,
    sectionKey,
    icon: Icon,
    color
  }: {
    title: string;
    count: number;
    tasks: Task[];
    sectionKey: string;
    icon: any;
    color: string;
  }) => (
    <div className="mb-6">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          {(expandedSections as any)[sectionKey] ? (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
          <Icon className={`w-5 h-5 ${color}`} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-700 rounded-full">
            {count}
          </span>
        </div>
      </button>

      {(expandedSections as any)[sectionKey] && (
        <div className="mt-3 space-y-2">
          {tasks.length > 0 ? (
            tasks.map(task => <TaskItem key={task._id} task={task} />)
          ) : (
            <div className="p-8 text-center text-gray-600 dark:text-gray-200">
              {t('planner.myWork.noTasksInSection')}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('planner.myWork.title')}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {t('planner.myWork.activeTasks', { count: myTasks.length })}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Overdue */}
          {overdueTasks.length > 0 && (
            <Section
              title={t('planner.myWork.sections.overdue')}
              count={overdueTasks.length}
              tasks={overdueTasks}
              sectionKey="overdue"
              icon={AlertCircle}
              color="text-red-600"
            />
          )}

          {/* Today */}
          <Section
            title={t('planner.myWork.sections.today')}
            count={todayTasks.length}
            tasks={todayTasks}
            sectionKey="today"
            icon={Calendar}
            color="text-accent-dark"
          />

          {/* This Week */}
          <Section
            title={t('planner.myWork.sections.thisWeek')}
            count={thisWeekTasks.length}
            tasks={thisWeekTasks}
            sectionKey="thisWeek"
            icon={Calendar}
            color="text-green-600"
          />

          {/* Later */}
          <Section
            title={t('planner.myWork.sections.later')}
            count={laterTasks.length}
            tasks={laterTasks}
            sectionKey="later"
            icon={Clock}
            color="text-gray-600"
          />

          {myTasks.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('planner.myWork.allCaughtUp')}
              </h3>
              <p className="text-gray-600 dark:text-gray-200">
                {t('planner.myWork.noActiveTasks')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyWorkView;
