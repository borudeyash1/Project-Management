import React from 'react';
import { usePlanner } from '../../../context/PlannerContext';
import { useJiraPlanner } from '../../../context/JiraPlannerContext';
import { useNotionPlanner } from '../../../context/NotionPlannerContext';
import { TimelineTask, TimelineResource, DEFAULT_TASK_DURATION } from '../../../types/timeline';
import TimelineView from '../timeline/TimelineView';
import TaskDetailModal from '../TaskDetailModal';
import QuickAddModal from '../QuickAddModal';

interface TimelineViewWrapperProps {
  searchQuery: string;
}

const TimelineViewWrapper: React.FC<TimelineViewWrapperProps> = ({ searchQuery }) => {
  // Try JiraPlanner first, then NotionPlanner, fall back to regular Planner
  const jiraContext = useJiraPlanner();
  const notionContext = useNotionPlanner();
  const plannerContext = usePlanner();

  // Use whichever context is available
  const { tasks, updateTask } = jiraContext || notionContext || plannerContext;

  console.log('[TimelineView] Using', jiraContext ? 'JiraPlannerContext' : 'PlannerContext');
  const [selectedTask, setSelectedTask] = React.useState<any>(null);
  const [showTaskCreate, setShowTaskCreate] = React.useState(false);

  // Convert planner tasks to timeline tasks
  const timelineTasks: TimelineTask[] = React.useMemo(() => {
    return tasks
      .filter(task =>
        !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status as 'todo' | 'in-progress' | 'in-review' | 'done',
        priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
        startDate: task.startDate ? (task.startDate instanceof Date ? task.startDate.toISOString() : task.startDate) : null,
        duration: task.estimatedTime
          ? task.estimatedTime * 60 * 60 * 1000
          : DEFAULT_TASK_DURATION,
        resourceId: task.assignees?.[0] || undefined,
        assignees: task.assignees || [],
        tags: task.tags || [],
        project: task.project,
      }));
  }, [tasks, searchQuery]);

  // Create resources from unique assignees
  const resources: TimelineResource[] = React.useMemo(() => {
    const assigneeMap = new Map<string, TimelineResource>();

    tasks.forEach(task => {
      if (task.assignees && task.assignees.length > 0) {
        task.assignees.forEach(assignee => {
          const assigneeId = typeof assignee === 'string' ? assignee : assignee._id;
          const assigneeName = typeof assignee === 'string' ? assignee : (assignee.fullName || assignee.username || assignee.email);

          if (!assigneeMap.has(assigneeId)) {
            assigneeMap.set(assigneeId, {
              id: assigneeId,
              name: assigneeName || 'Unknown',
              type: 'user',
              color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            });
          }
        });
      }
    });

    return Array.from(assigneeMap.values());
  }, [tasks]);

  const handleTaskUpdate = (taskId: string, updates: Partial<TimelineTask>) => {
    // Convert timeline updates back to planner task format
    const plannerUpdates: any = {};

    if (updates.startDate !== undefined) {
      plannerUpdates.startDate = updates.startDate;
    }

    if (updates.duration !== undefined) {
      plannerUpdates.estimatedTime = updates.duration / (60 * 60 * 1000);
    }

    updateTask(taskId, plannerUpdates);
  };

  const handleTaskClick = (task: TimelineTask) => {
    // Find the original planner task
    const plannerTask = tasks.find(t => t._id === task.id);
    if (plannerTask) {
      setSelectedTask(plannerTask);
    }
  };

  const handleAddTask = () => {
    setShowTaskCreate(true);
  };

  return (
    <>
      <TimelineView
        tasks={timelineTasks}
        resources={resources}
        onTaskUpdate={handleTaskUpdate}
        onTaskClick={handleTaskClick}
        onAddTask={handleAddTask}
        startHour={0}
        endHour={24}
      />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {showTaskCreate && (
        <QuickAddModal
          onClose={() => setShowTaskCreate(false)}
          defaultStatus="pending"
        />
      )}
    </>
  );
};

export default TimelineViewWrapper;
