import { Request, Response } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import { ApiResponse } from '../types';
import { createActivity } from '../utils/activityUtils';
import { getCalendarService } from '../services/sartthi/calendarService';
import { getMailService } from '../services/sartthi/mailService';
import { getSlackService } from '../services/sartthi/slackService';
import { getNotionService } from '../services/sartthi/notionService';
import { notifySlackForTask, notifySlackTaskCompleted, notifySlackTaskUpdated } from '../utils/slackNotifications';
import User from '../models/User';
import jiraService from '../services/jiraService';
import JiraIssue from '../models/JiraIssue';
import {
  notifyTaskAssigned,
  notifyTaskReassigned,
  notifyTaskStatusChanged,
  notifyTaskPriorityChanged,
  notifyTaskDeadlineChanged,
  notifyTaskCompleted,
  notifyTaskVerified,
  notifyTaskDeleted,
} from '../utils/notificationUtils';

// GET /api/tasks?projectId=...&status=...&priority=...
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { projectId, status, priority } = req.query as {
      projectId?: string;
      status?: string;
      priority?: string;
    };
    const filter: any = {};

    if (projectId) {
      filter.project = projectId;
    }

    // Add status filtering - now uses values directly
    if (status) {
      filter.status = status;
    }

    // Add priority filtering - now uses values directly
    if (priority) {
      filter.priority = priority;
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'fullName email avatarUrl')
      .sort({ dueDate: 1, createdAt: -1 });

    const response: ApiResponse = {
      success: true,
      message: 'Tasks fetched successfully',
      data: tasks,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while fetching tasks' });
  }
};

// GET /api/tasks/:id
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const task = await Task.findById(req.params.id)
      .populate('assignee', 'fullName email avatarUrl');
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Task fetched successfully',
      data: task,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while fetching task' });
  }
};

// POST /api/tasks
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      title,
      description,
      project: projectId,
      workspace: workspaceId,
      assignee,
      status,
      priority,
      category,
      type,
      taskType,
      startDate,
      dueDate,
      estimatedHours,
      progress,
      subtasks,
      links,
      requiresLink,
      requiresFile,
      slackChannelId, // Added for Slack integration
      slackAccountId,
      syncToNotion, // Added for Notion integration
    } = req.body;

    // Only title is required now - project and workspace are optional
    if (!title) {
      res.status(400).json({ success: false, message: 'Title is required' });
      return;
    }

    // Validate project if provided
    let project = null;
    if (projectId) {
      project = await Project.findById(projectId);
      if (!project) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }
    }

    const taskData: any = {
      title,
      description,
      reporter: authUser._id,
      status: status || 'pending',
      priority: priority || 'medium',
      type: type || 'task',
      taskType: taskType || 'general',
      category,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours,
      progress: typeof progress === 'number' ? progress : 0,
      requiresLink: requiresLink || false,
      requiresFile: requiresFile || false,
    };

    // Add optional fields
    if (projectId) taskData.project = projectId;
    if (workspaceId) taskData.workspace = workspaceId;
    else if (project) taskData.workspace = project.workspace;
    if (assignee) taskData.assignee = assignee;
    if (subtasks && Array.isArray(subtasks)) taskData.subtasks = subtasks;
    if (links && Array.isArray(links)) taskData.links = links;

    console.log('🔍 [CREATE TASK] taskType from request:', taskType);
    console.log('🔍 [CREATE TASK] taskData.taskType:', taskData.taskType);
    console.log('🔍 [CREATE TASK] Full taskData:', JSON.stringify(taskData, null, 2));

    const task = new Task(taskData);

    await task.save();

    // Create activity
    await createActivity(
      authUser._id,
      'task_created',
      `Created task: ${task.title}`,
      `New task "${task.title}" was created`,
      'Task',
      String(task._id)
    );

    // Send notification to assignee if task is assigned
    if (assignee) {
      await notifyTaskAssigned(
        String(task._id),
        assignee,
        authUser._id.toString()
      );
    }

    // Sartthi Integration: Calendar Sync
    const calendarService = getCalendarService();
    if (calendarService && task.dueDate) {
      await calendarService.createEventFromTask(task);
    }

    // Sartthi Integration: Mail Notification
    const mailService = getMailService();
    if (mailService && task.assignee) {
      const assigneeUser = await User.findById(task.assignee);
      if (assigneeUser && assigneeUser.email) {
        await mailService.sendTaskAssignmentNotification(task, assigneeUser.email);
      }
    }

    // Sartthi Integration: Slack Notification
    // Priority: Task-level channel > Project primary channel
    let targetChannelId = null;
    let targetChannelName = null;

    // Get project's configured Slack channels
    const projectChannels = project?.integrations?.slack?.channels || [];

    // 1. Check if user selected a specific channel for this task
    if (slackChannelId && slackChannelId !== 'none' && slackChannelId !== "Don't post to Slack" && slackChannelId !== '') {
      // Validate that the selected channel is configured in the project
      const selectedChannel = projectChannels.find(c => c.id === slackChannelId);

      if (selectedChannel) {
        targetChannelId = selectedChannel.id;
        targetChannelName = selectedChannel.name;
        console.log('📤 [SLACK] Using task-specific channel:', targetChannelName);
      } else {
        console.warn('⚠️ [SLACK] Selected channel not configured in project, using primary channel');
        // Fall back to primary if selected channel is not configured
        const primaryChannel = projectChannels.find(c => c.isPrimary);
        if (primaryChannel) {
          targetChannelId = primaryChannel.id;
          targetChannelName = primaryChannel.name;
        }
      }
    }
    // 2. Fall back to project's primary channel
    else if (projectChannels.length > 0) {
      const primaryChannel = projectChannels.find(c => c.isPrimary) || projectChannels[0];
      if (primaryChannel) {
        targetChannelId = primaryChannel.id;
        targetChannelName = primaryChannel.name;
        console.log('📤 [SLACK] Using project primary channel:', targetChannelName);
      }
    }

    // Send notification if we have a target channel
    if (targetChannelId) {
      try {
        console.log('📤 [SLACK] Sending notification to channel:', targetChannelName);
        await notifySlackForTask(
          task,
          authUser._id,
          targetChannelId,
          slackAccountId
        );
        console.log('✅ [SLACK] Notification sent successfully');
      } catch (error) {
        console.error('❌ [SLACK] Failed to send notification:', error);
      }
    } else {
      console.log('ℹ️ [SLACK] No Slack channels configured for this project');
    }

    // Sartthi Integration: Notion Sync
    if (syncToNotion) {
      try {
        console.log('📝 [NOTION] Syncing task to Notion...');
        const notionService = getNotionService();

        // Build Notion blocks from task data
        const notionBlocks: any[] = [];

        if (description) {
          notionBlocks.push({
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: description } }]
            }
          });
        }

        // Add task metadata
        notionBlocks.push({
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: 'Task Details' } }]
          }
        });

        const metadata = [
          `Status: ${status || 'pending'}`,
          `Priority: ${priority || 'medium'}`,
          `Type: ${type || 'task'}`,
        ];

        if (dueDate) {
          metadata.push(`Due Date: ${new Date(dueDate).toLocaleDateString()}`);
        }

        metadata.forEach(item => {
          notionBlocks.push({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [{ type: 'text', text: { content: item } }]
            }
          });
        });

        // Add subtasks if any
        if (subtasks && subtasks.length > 0) {
          notionBlocks.push({
            object: 'block',
            type: 'heading_3',
            heading_3: {
              rich_text: [{ type: 'text', text: { content: 'Subtasks' } }]
            }
          });

          subtasks.forEach((subtask: any) => {
            notionBlocks.push({
              object: 'block',
              type: 'to_do',
              to_do: {
                rich_text: [{ type: 'text', text: { content: subtask.title || subtask } }],
                checked: false
              }
            });
          });
        }

        // Fetch user's default database setting
        const { ConnectedAccount } = require('../models/ConnectedAccount');
        const notionAccount = await ConnectedAccount.findOne({
          userId: authUser._id,
          service: 'notion',
          isActive: true
        });

        const defaultDatabaseId = notionAccount?.settings?.notion?.defaultDatabaseId;

        const syncResult = await notionService.createPage(
          authUser._id,
          {
            title,
            content: notionBlocks,
            properties: {
              Status: {
                status: {
                  name: status === 'completed' ? 'Done' : status === 'in-progress' ? 'In progress' : 'Not started'
                }
              },
              Priority: { select: { name: priority || 'medium' } },
            },
            parentDatabase: defaultDatabaseId // Use user's selected database
          }
        );

        // Update task with Notion sync info
        task.notionSync = {
          pageId: syncResult.pageId,
          url: syncResult.url,
          lastSyncedAt: new Date(),
          syncEnabled: true
        };
        await task.save();

        console.log('✅ [NOTION] Task synced successfully:', syncResult.url);
      } catch (error) {
        console.error('❌ [NOTION] Failed to sync task:', error);
        // Don't fail task creation if Notion sync fails
      }
    }

    // Populate assignee to return full user details
    await task.populate('assignee', 'fullName email avatarUrl');

    const response: ApiResponse = {
      success: true,
      message: 'Task created successfully',
      data: task,
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while creating task' });
  }
};

// PUT /api/tasks/:id
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const {
      title,
      description,
      assignee,
      status,
      priority,
      category,
      startDate,
      dueDate,
      estimatedHours,
      progress,
      subtasks,
      links,
      files,
      taskType,
      requiresFile,
      requiresLink,
      rating,
      ratingDetails,
      verifiedBy,
      verifiedAt,
    } = req.body;

    // Store old values for notifications
    const oldStatus = task.status as string;
    const oldPriority = task.priority as string;
    const oldDueDate = task.dueDate as Date | undefined;
    const oldAssignee = task.assignee;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignee !== undefined) task.assignee = assignee || undefined;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    if (startDate !== undefined) task.startDate = startDate ? new Date(startDate) : undefined;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (progress !== undefined) task.progress = progress;
    if (subtasks !== undefined) task.subtasks = subtasks;
    if (links !== undefined) task.links = links;
    if (files !== undefined) task.files = files;
    if (taskType !== undefined) task.taskType = taskType;
    if (requiresFile !== undefined) task.requiresFile = requiresFile;
    if (requiresLink !== undefined) task.requiresLink = requiresLink;

    // Handle verification and rating fields
    if (rating !== undefined) task.rating = rating;
    if (ratingDetails !== undefined) task.ratingDetails = ratingDetails;
    if (verifiedBy !== undefined) task.verifiedBy = verifiedBy;
    if (verifiedAt !== undefined) task.verifiedAt = verifiedAt ? new Date(verifiedAt) : undefined;

    await task.save();

    // Send notifications for changes
    const taskId = String(task._id);
    const userId = authUser._id.toString();

    // Notify status change
    if (status !== undefined && oldStatus !== status) {
      await notifyTaskStatusChanged(taskId, oldStatus, status as string, userId);
    }

    // Notify priority change
    if (priority !== undefined && oldPriority !== priority) {
      await notifyTaskPriorityChanged(taskId, oldPriority, priority as string, userId);
    }

    // Notify deadline change
    if (dueDate !== undefined && oldDueDate?.getTime() !== (task.dueDate as Date | undefined)?.getTime()) {
      await notifyTaskDeadlineChanged(taskId, oldDueDate, task.dueDate as Date | undefined, userId);
    }

    // Notify assignee change (reassignment)
    if (assignee !== undefined && oldAssignee?.toString() !== task.assignee?.toString()) {
      await notifyTaskReassigned(
        taskId,
        oldAssignee?.toString(),
        task.assignee?.toString() || '',
        userId
      );
    }

    // Notify verification
    if (verifiedBy !== undefined && task.status === 'verified') {
      await notifyTaskVerified(taskId, userId);
    }

    // Sync status change to Notion if task is synced
    if (status !== undefined && (task as any).notionSync?.pageId) {
      try {
        const notionService = getNotionService();
        const notionStatus = status === 'completed' ? 'Done' :
          status === 'in-progress' ? 'In progress' :
            'Not started';

        await notionService.updatePage(
          authUser._id,
          (task as any).notionSync.pageId,
          {
            properties: {
              Status: { status: { name: notionStatus } }
            }
          }
        );

        console.log(`✅ [NOTION] Synced status update to Notion: ${status} → ${notionStatus}`);
      } catch (error) {
        console.error('❌ [NOTION] Failed to sync status to Notion:', error);
        // Don't fail the task update if Notion sync fails
      }
    }

    // Sync changes to Jira if task is from Jira
    if ((task as any).source === 'jira' && (task as any).externalId) {
      try {
        const user = await User.findById(authUser._id).select('connectedAccounts');
        const hasJira = (user?.connectedAccounts?.jira?.accounts?.length ?? 0) > 0;

        if (hasJira) {
          // Get Jira config
          const jiraAccount: any = user?.connectedAccounts?.jira?.accounts?.[0];
          if (!jiraAccount?.cloudId || !jiraAccount?.accessToken) {
            console.warn('[JIRA] Missing Jira credentials');
            throw new Error('Jira credentials not found');
          }

          const config = {
            baseUrl: `https://api.atlassian.com/ex/jira/${jiraAccount.cloudId}`,
            apiToken: jiraAccount.accessToken,
            email: jiraAccount.email || ''
          };

          const issueKey = (task as any).externalId;

          // Sync status change (transition)
          if (status !== undefined) {
            await jiraService.syncTaskStatusToJira(issueKey, status, config);
          }

          // Sync other field updates
          const updates: any = {};
          if (title !== undefined) updates.title = title;
          if (description !== undefined) updates.description = description;
          if (priority !== undefined) updates.priority = priority;
          if (dueDate !== undefined) updates.dueDate = dueDate;

          if (Object.keys(updates).length > 0) {
            await jiraService.syncTaskUpdatesToJira(issueKey, updates, config);
          }

          // Update local JiraIssue document
          await JiraIssue.findOneAndUpdate(
            { issueKey },
            {
              summary: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate,
              lastSyncedAt: new Date()
            }
          );

          console.log(`✅ [JIRA] Synced task updates to Jira: ${issueKey}`);
        }
      } catch (error) {
        console.error('❌ [JIRA] Failed to sync to Jira:', error);
        // Don't fail the task update if Jira sync fails
      }
    }

    // Create activity for task update
    const isCompleted = oldStatus !== 'completed' && oldStatus !== 'verified' && (task.status === 'completed' || task.status === 'verified');
    if (isCompleted) {
      await createActivity(
        authUser._id,
        'task_completed',
        `Completed task: ${task.title}`,
        `Task "${task.title}" was marked as completed`,
        'Task',
        String(task._id)
      );

      // Notify via Slack
      await notifySlackTaskCompleted(task, authUser._id);
    } else {
      await createActivity(
        authUser._id,
        'task_updated',
        `Updated task: ${task.title}`,
        `Task "${task.title}" was updated`,
        'Task',
        String(task._id)
      );

      // Notify via Slack
      const changes = [];
      if (status !== undefined) changes.push(`Status: ${status}`);
      if (priority !== undefined) changes.push(`Priority: ${priority}`);
      if (assignee !== undefined) changes.push('Assignee changed');
      if (dueDate !== undefined) changes.push('Due date changed');

      if (changes.length > 0) {
        await notifySlackTaskUpdated(task, authUser._id, changes.join(', '));
      }
    }

    // Sartthi Integration: Calendar Sync
    const calendarService = getCalendarService();
    if (calendarService && (dueDate !== undefined || title !== undefined)) {
      // Logic to update event would go here
    }

    // Sartthi Integration: Mail Notification
    const mailService = getMailService();
    if (mailService && assignee !== undefined) {
      const assigneeUser = await User.findById(assignee);
      if (assigneeUser && assigneeUser.email) {
        await mailService.sendTaskAssignmentNotification(task, assigneeUser.email);
      }
    }

    // Populate assignee before returning
    await task.populate('assignee', 'fullName email avatarUrl');

    const response: ApiResponse = {
      success: true,
      message: 'Task updated successfully',
      data: task,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while updating task' });
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Store task info before deletion for notification
    const taskTitle: string = task.title as string;
    const assigneeId = task.assignee?.toString();

    await task.deleteOne();

    // Send notification to assignee if task was assigned
    if (assigneeId) {
      await notifyTaskDeleted(taskTitle, assigneeId, authUser._id.toString());
    }

    const response: ApiResponse = {
      success: true,
      message: 'Task deleted successfully',
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while deleting task' });
  }
};

// Reassign task to another user
export const reassignTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { assignedTo } = req.body;

    console.log('👥 [REASSIGN TASK] Task:', req.params.id, 'New Assignee:', assignedTo);

    if (!assignedTo) {
      res.status(400).json({ success: false, message: 'New assignee is required' });
      return;
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const oldAssignee = task.assignee;
    task.assignee = assignedTo;
    await task.save();

    // Populate the assignee field to return full user details
    await task.populate('assignee', 'fullName email avatarUrl');

    // Create activity for task reassignment
    await createActivity(
      authUser._id,
      'task_reassigned',
      `Reassigned task: ${task.title}`,
      task.project?.toString() || ''
    );

    // Send notification to new assignee
    const mailService = getMailService();
    if (mailService && task.assignee) {
      const assigneeUser = await User.findById(task.assignee);
      if (assigneeUser && assigneeUser.email) {
        await mailService.sendTaskAssignmentNotification(task, assigneeUser.email);
      }
    }

    console.log('✅ [REASSIGN TASK] Task reassigned successfully from', oldAssignee, 'to', assignedTo);

    const response: ApiResponse = {
      success: true,
      message: 'Task reassigned successfully',
      data: task
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('❌ [REASSIGN TASK] Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while reassigning task' });
  }
};
// Sync tasks from Notion (Two-way sync)
export const syncProjectTasksFromNotion = async (req: Request, res: Response): Promise<any> => {
  try {
    const authUser = (req as any).user;
    const { projectId } = req.params;

    // Get Notion service
    const notionService = getNotionService();

    // 1. Get user's connected Notion account to find default database
    const { ConnectedAccount } = require('../models/ConnectedAccount');
    const notionAccount = await ConnectedAccount.findOne({
      userId: authUser._id,
      service: 'notion',
      isActive: true
    });

    if (!notionAccount || !notionAccount.settings?.notion?.defaultDatabaseId) {
      return res.status(400).json({
        message: 'Notion not connected or default database not selected. Please configure in Settings.'
      });
    }

    const databaseId = notionAccount.settings.notion.defaultDatabaseId;
    const lastSyncedAt = notionAccount.lastSynced;

    // 2. Fetch updates from Notion since last sync
    const updates = await notionService.getDatabaseUpdates(
      authUser._id,
      databaseId,
      lastSyncedAt ? new Date(lastSyncedAt) : undefined
    );

    if (updates.length === 0) {
      return res.json({ message: 'No updates found in Notion', updatedCount: 0 });
    }

    // 3. Update Sartthi tasks matching the Notion pages
    let updatedCount = 0;

    for (const update of updates) {
      // Map Notion status to Sartthi status
      let sartthiStatus: string | undefined;
      const notionStatus = update.status?.toLowerCase();

      if (notionStatus === 'not started') sartthiStatus = 'pending';
      else if (notionStatus === 'in progress') sartthiStatus = 'in-progress';
      else if (notionStatus === 'done') sartthiStatus = 'completed';

      if (sartthiStatus) {
        // Find task by Notion page ID
        const task: any = await Task.findOne({
          'notionSync.pageId': update.id,
          // Optionally filter by project if needed, but pageId is unique enough
        });

        if (task && task.status !== sartthiStatus) {
          task.status = sartthiStatus;
          task.notionSync.lastSyncedAt = new Date(); // Update sync timestamp
          await task.save();
          updatedCount++;
        }
      }
    }

    // Update account last sync time
    notionAccount.lastSynced = new Date();
    await notionAccount.save();

    res.json({
      success: true,
      message: `Synced ${updatedCount} tasks from Notion`,
      updatedCount
    });

  } catch (error: any) {
    console.error('Error syncing from Notion:', error);
    res.status(500).json({ message: error.message || 'Failed to sync from Notion' });
  }
};
