import { Task } from '../context/PlannerContext';

/**
 * Safe accessors for task properties that might be undefined
 */

export const getTaskSubtasks = (task: Task) => task.subtasks ?? [];
export const getTaskTags = (task: Task) => task.tags ?? [];
export const getTaskComments = (task: Task) => task.comments ?? [];
export const getTaskAttachments = (task: Task) => task.attachments ?? [];
export const getTaskAssignees = (task: Task) => task.assignees ?? [];
export const getTaskEstimatedTime = (task: Task) => task.estimatedTime ?? task.estimatedHours ?? 0;

export const getCompletedSubtasksCount = (task: Task) => {
  const subtasks = getTaskSubtasks(task);
  return subtasks.filter(st => st.completed).length;
};

export const getTotalSubtasksCount = (task: Task) => {
  return getTaskSubtasks(task).length;
};
