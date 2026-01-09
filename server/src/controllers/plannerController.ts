import { Response } from 'express';
import mongoose, { Types } from 'mongoose';
import PlannerEvent, { IPlannerEvent, IPlannerParticipant } from '../models/PlannerEvent';
import { AuthenticatedRequest } from '../types';
import { sendEmail } from '../services/emailService';
import { scheduleReminderTrigger, clearReminderTriggers } from '../services/reminderScheduler';
import { notifySlackForPlannerEvent } from '../utils/slackNotifications';

const formatDateTime = (value?: Date | string) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString();
};

const toIdString = (value: any): string => {
  if (!value) return '';
  return typeof value === 'string' ? value : value.toString?.() || '';
};

const collectParticipantIds = (event: IPlannerEvent): string[] => {
  const ids = new Set<string>();

  if (event.createdBy) {
    ids.add(toIdString(event.createdBy));
  }

  (event.participants || []).forEach((participant: any) => {
    const participantId = participant.user?._id || participant.user;
    if (participantId) {
      ids.add(toIdString(participantId));
    }
  });

  return Array.from(ids);
};

const schedulePlannerEventReminders = async (event: IPlannerEvent) => {
  const userIds = collectParticipantIds(event);
  if (userIds.length === 0) {
    return;
  }

  const workspaceId = (event as any).workspace || undefined;
  const basePayload = {
    title: event.title,
    description: event.description,
    start: event.start,
    end: event.end,
  };

  const eventId = toIdString(event._id);

  // Pre-deadline reminders based on event.reminders settings
  if (Array.isArray(event.reminders)) {
    for (const reminder of event.reminders) {
      if (!reminder || typeof reminder.minutesBefore !== 'number') continue;
      const target = (event.start ? new Date(event.start) : undefined);
      if (!target) continue;
      const triggerTime = new Date(target.getTime() - reminder.minutesBefore * 60 * 1000);
      if (Number.isNaN(triggerTime.getTime()) || triggerTime <= new Date()) continue;

      await scheduleReminderTrigger({
        entityType: 'planner_event',
        entityId: eventId,
        workspaceId,
        userIds,
        triggerType: 'pre_deadline',
        triggerTime,
        payload: {
          ...basePayload,
          reminder,
          message: `Upcoming event: ${event.title}`,
        },
      });
    }
  }

  // Deadline reached reminder
  const deadline = event.end || event.start;
  if (deadline) {
    await scheduleReminderTrigger({
      entityType: 'planner_event',
      entityId: eventId,
      workspaceId,
      userIds,
      triggerType: 'deadline_reached',
      triggerTime: new Date(deadline),
      payload: {
        ...basePayload,
        message: `Deadline reached for event: ${event.title}`,
      },
    });
  }
};

const notifyParticipants = async (event: IPlannerEvent, subject: string, body: string, excludeUserId?: string) => {
  await event.populate('participants.user', 'fullName email');
  const recipients = new Set<string>();

  event.participants.forEach((participant: any) => {
    const email = participant.user?.email;
    const matchesExcluded = excludeUserId && participant.user?._id?.toString() === excludeUserId.toString();
    if (email && !matchesExcluded) {
      recipients.add(email);
    }
  });

  if (recipients.size > 0) {
    await sendEmail({
      to: Array.from(recipients),
      subject,
      html: body,
    });
  }
};

export const getPlannerEvents = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { start, end } = req.query;

    const query: any = {
      $or: [
        { createdBy: userId },
        { 'participants.user': userId },
      ],
    };

    if (start || end) {
      query.start = {};
      if (start) {
        query.start.$gte = new Date(start as string);
      }
      if (end) {
        query.start.$lte = new Date(end as string);
      }
    }

    const events = await PlannerEvent.find(query)
      .populate('participants.user', 'fullName email avatarUrl')
      .sort({ start: 1 });

    res.json({ success: true, data: events });
  } catch (error) {
    console.error('[Planner] Failed to fetch events:', error);
    res.status(500).json({ success: false, message: 'Failed to load planner events' });
  }
};

export const createPlannerEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const {
      title,
      description,
      start,
      end,
      allDay = false,
      color,
      projectId,
      participants = [],
      reminders = [],
    } = req.body;

    const participantIds: string[] = Array.isArray(participants) ? participants : [];
    const participantEntries: IPlannerParticipant[] = participantIds
      .filter((participantId) => !!participantId)
      .map((participantId) => ({ user: new Types.ObjectId(participantId) as any, status: 'none' }));

    if (!participantEntries.some((participant) => participant.user.toString() === userId.toString())) {
      participantEntries.push({ user: new Types.ObjectId(userId) as any, status: 'accepted' });
    }

    const event = new PlannerEvent({
      title,
      description,
      start,
      end,
      allDay,
      color,
      projectId,
      createdBy: new Types.ObjectId(userId),
      participants: participantEntries,
      reminders,
    });

    await event.save();
    await event.populate('participants.user', 'fullName email avatarUrl');
    await event.populate('createdBy', 'fullName email');

    const eventId = toIdString(event._id);
    await clearReminderTriggers('planner_event', eventId);
    await schedulePlannerEventReminders(event);

    await notifyParticipants(
      event,
      `New event: ${event.title}`,
      `
        <h2>You have been invited to an event</h2>
        <p><strong>${event.title}</strong></p>
        <p>${event.description || 'No description provided.'}</p>
        <p><strong>When:</strong> ${formatDateTime(event.start)}${event.end ? ' - ' + formatDateTime(event.end) : ''}</p>
      `,
      userId.toString(),
    );

    // Send Slack notification if channel is configured
    if (event.slackChannelId) {
      try {
        await notifySlackForPlannerEvent(event, userId.toString(), event.slackChannelId);
      } catch (error) {
        console.error('Failed to send Slack notification for planner event:', error);
      }
    }

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error('[Planner] Failed to create event:', error);
    res.status(500).json({ success: false, message: 'Failed to create planner event' });
  }
};

export const updatePlannerEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;
    const updateData = req.body;

    const event = await PlannerEvent.findOne({ _id: id, createdBy: userId });

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or insufficient permissions' });
      return;
    }

    Object.assign(event, updateData);
    await event.save();
    await event.populate('participants.user', 'fullName email avatarUrl');

    const eventId = toIdString(event._id);
    await clearReminderTriggers('planner_event', eventId);
    await schedulePlannerEventReminders(event);

    await notifyParticipants(
      event,
      `Event updated: ${event.title}`,
      `
        <h2>An event was updated</h2>
        <p><strong>${event.title}</strong></p>
        <p>${event.description || 'No description provided.'}</p>
        <p><strong>When:</strong> ${formatDateTime(event.start)}${event.end ? ' - ' + formatDateTime(event.end) : ''}</p>
      `,
      userId.toString(),
    );

    res.json({ success: true, data: event });
  } catch (error) {
    console.error('[Planner] Failed to update event:', error);
    res.status(500).json({ success: false, message: 'Failed to update planner event' });
  }
};

export const deletePlannerEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const event = await PlannerEvent.findOne({ _id: id, createdBy: userId });

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or insufficient permissions' });
      return;
    }

    await notifyParticipants(
      event,
      `Event cancelled: ${event.title}`,
      `
        <h2>An event was cancelled</h2>
        <p><strong>${event.title}</strong> scheduled for ${formatDateTime(event.start)} has been cancelled.</p>
      `,
      userId.toString(),
    );

    const eventId = toIdString(event._id);
    await event.deleteOne();
    await clearReminderTriggers('planner_event', eventId);
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('[Planner] Failed to delete event:', error);
    res.status(500).json({ success: false, message: 'Failed to delete planner event' });
  }
};

export const updateParticipation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'declined', 'tentative'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid participation status' });
      return;
    }

    const event = await PlannerEvent.findOne({
      _id: id,
      'participants.user': userId,
    });

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    const updatedParticipants = event.participants.map((participant: any) => {
      const participantObj = participant.toObject ? participant.toObject() : participant;
      if (participant.user.toString() === userId.toString()) {
        return { ...participantObj, status };
      }
      return participantObj;
    });

    event.participants = updatedParticipants as any;

    await event.save();
    await event.populate('participants.user', 'fullName email');
    await event.populate('createdBy', 'fullName email');

    // Notify organizer
    if (event.createdBy && event.createdBy.toString() !== userId.toString()) {
      const organizerEmail = (event as any).createdBy?.email;
      await sendEmail({
        to: organizerEmail || req.user?.email,
        subject: `Participation update for ${event.title}`,
        html: `
          <h2>Participation Updated</h2>
          <p>${req.user?.fullName || 'A participant'} marked their status as <strong>${status}</strong> for <strong>${event.title}</strong>.</p>
        `,
      }).catch((err) => console.error('Failed to send participation email', err));
    }

    res.json({ success: true, data: event });
  } catch (error) {
    console.error('[Planner] Failed to update participation:', error);
    res.status(500).json({ success: false, message: 'Failed to update participation' });
  }
};

// Import models for tasks, reminders, and milestones
import Task from '../models/Task';
import { Reminder } from '../models/Reminder';
import Milestone from '../models/Milestone';
import JiraIssue from '../models/JiraIssue';
// import NotionTask from '../models/NotionTask';  // TODO: Create NotionTask model
import User from '../models/User';
import LinearIssue from '../models/LinearIssue';



// Helper: Map Jira status to planner status (exclude Review)
function mapJiraStatusToPlanner(jiraStatus: string): string {
  const statusMap: Record<string, string> = {
    'To Do': 'To Do',
    'Backlog': 'To Do',
    'In Progress': 'In Progress',
    'In Development': 'In Progress',
    'Done': 'Done',
    'Completed': 'Done',
    'Closed': 'Done'
  };
  return statusMap[jiraStatus] || 'To Do';
}

// Helper: Map Notion status to planner status (exclude Review)
function mapNotionStatusToPlanner(notionStatus: string): string {
  const statusMap: Record<string, string> = {
    'Not started': 'To Do',
    'In progress': 'In Progress',
    'Done': 'Done',
    'Complete': 'Done'
  };
  return statusMap[notionStatus] || 'To Do';
}

// Helper: Map Linear status to planner status
function mapLinearStatusToPlanner(linearState: string, type: string): string {
  if (type === 'completed' || type === 'canceled') return 'Done';
  if (type === 'started') return 'In Progress';
  return 'To Do'; // backlog, unstarted, triage
}

// Helper: Transform Jira issue to task format
function transformJiraIssueToTask(issue: any): any {
  return {
    _id: issue._id,
    title: issue.summary,
    description: issue.description || '',
    status: mapJiraStatusToPlanner(issue.status),
    priority: issue.priority || 'Medium',
    dueDate: issue.dueDate,
    startDate: null,
    workspace: issue.workspaceId,
    assignee: null, // Could map if email matches
    reporter: null,
    project: null,
    isActive: true,
    progress: issue.status === 'Done' ? 100 : issue.status === 'In Progress' ? 50 : 0,
    // Sync metadata
    source: 'jira',
    externalId: issue.issueKey,
    externalUrl: `https://sartthi.atlassian.net/browse/${issue.issueKey}`,
    syncedAt: issue.lastSyncedAt
  };
}

// Helper: Transform Notion task to task format
function transformNotionTaskToTask(notionTask: any): any {
  return {
    _id: notionTask._id,
    title: notionTask.title,
    description: notionTask.description || '',
    status: mapNotionStatusToPlanner(notionTask.status),
    priority: notionTask.priority || 'Medium',
    dueDate: notionTask.dueDate,
    startDate: null,
    workspace: notionTask.workspaceId,
    assignee: null,
    reporter: null,
    project: null,
    isActive: true,
    progress: notionTask.status === 'Done' ? 100 : notionTask.status === 'In progress' ? 50 : 0,
    // Sync metadata
    source: 'notion',
    externalId: notionTask.pageId,
    externalUrl: `https://notion.so/${notionTask.pageId}`,
    syncedAt: notionTask.lastSyncedAt
  };
}

// Helper: Transform Linear issue to task format
function transformLinearIssueToTask(issue: any): any {
  return {
    _id: issue._id,
    title: issue.title,
    description: issue.description || '',
    status: mapLinearStatusToPlanner(issue.state.name, issue.state.type),
    priority: issue.priorityLabel || 'Medium', // Map priority number if label missing
    dueDate: issue.dueDate,
    startDate: null,
    workspace: issue.workspaceId,
    assignee: null,
    reporter: null,
    project: issue.projectName ? { name: issue.projectName } : null,
    isActive: true, // Only fetch active/relevant ones
    progress: issue.state.type === 'completed' ? 100 : issue.state.type === 'started' ? 50 : 0,
    // Sync metadata
    source: 'linear',
    externalId: issue.identifier,
    externalUrl: issue.url,
    syncedAt: issue.lastSyncedAt,
    tags: issue.labels
  };
}

// Get all planner data (tasks, reminders, milestones, events)
export const getAllPlannerData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { workspaceId, startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.$gte = new Date(startDate as string);
      dateFilter.$lte = new Date(endDate as string);
    }

    // Base query
    const baseQuery: any = {};
    if (workspaceId) {
      baseQuery.workspace = workspaceId;
    }

    // Fetch tasks
    // Include only tasks assigned to the user (not tasks created by or reported by the user)
    const taskQuery: any = { isActive: true };
    
    if (workspaceId) {
      // If workspace is specified, get workspace tasks assigned to user OR user's personal tasks
      taskQuery.$or = [
        { workspace: workspaceId, assignee: userId }, // Workspace tasks assigned to user
        { assignee: userId, workspace: { $exists: false } }, // Personal tasks assigned to user
      ];
    } else {
      // If no workspace specified, get only tasks assigned to the user
      taskQuery.assignee = userId;
    }
    
    if (Object.keys(dateFilter).length > 0) {
      taskQuery.$and = taskQuery.$and || [];
      taskQuery.$and.push({
        $or: [
          { startDate: dateFilter },
          { dueDate: dateFilter }
        ]
      });
    }

    console.log('[Planner] Task query:', JSON.stringify(taskQuery, null, 2));

    const tasks = await Task.find(taskQuery)
      .populate('assignee', 'fullName email avatarUrl')
      .populate('reporter', 'fullName email avatarUrl')
      .populate('project', 'name')
      .sort({ dueDate: 1 });

    console.log(`[Planner] Found ${tasks.length} tasks for user ${userId}`);
    console.log('[Planner] Task details:', tasks.map(t => ({
      id: t._id,
      title: t.title,
      status: t.status,
      assignee: (t.assignee as any)?._id,
      reporter: (t.reporter as any)?._id,
      workspace: t.workspace,
      project: (t.project as any)?.name
    })));

    // Fetch Jira issues if connected
    let jiraTasks: any[] = [];
    try {
      const user = await User.findById(userId).select('connectedAccounts');
      const hasJira = (user?.connectedAccounts?.jira?.accounts?.length ?? 0) > 0;

      if (hasJira && workspaceId) {
        const jiraIssues = await JiraIssue.find({ workspaceId });
        jiraTasks = jiraIssues.map(transformJiraIssueToTask);
        console.log(`[Planner] Fetched ${jiraTasks.length} Jira tasks for workspace ${workspaceId}`);
      }
    } catch (error) {
      console.error('[Planner] Failed to fetch Jira tasks:', error);
    }

    // Fetch Notion tasks if connected
    let notionTasks: any[] = [];
    try {
      const user = await User.findById(userId).select('connectedAccounts');
      const hasNotion = (user?.connectedAccounts?.notion?.accounts?.length ?? 0) > 0;

      if (hasNotion && workspaceId) {
        // const notionPages = await NotionTask.find({ workspaceId });  // TODO: Create NotionTask model
        const notionPages: any[] = [];  // Placeholder until model is created
        notionTasks = notionPages.map(transformNotionTaskToTask);
        console.log(`[Planner] Fetched ${notionTasks.length} Notion tasks for workspace ${workspaceId}`);
      }
    } catch (error) {
      console.error('[Planner] Failed to fetch Notion tasks:', error);
    }

    // Fetch Linear issues if connected
    let linearTasks: any[] = [];
    try {
      const user = await User.findById(userId).select('connectedAccounts');
      const hasLinear = (user?.connectedAccounts?.linear?.accounts?.length ?? 0) > 0;

      if (hasLinear && workspaceId) {
        const linearIssues = await LinearIssue.find({ workspaceId });
        linearTasks = linearIssues.map(transformLinearIssueToTask);
        console.log(`[Planner] Fetched ${linearTasks.length} Linear issues for workspace ${workspaceId}`);
      }
    } catch (error) {
      console.error('[Planner] Failed to fetch Linear issues:', error);
    }

    // Merge all tasks (regular + Jira + Notion + Linear)
    const allTasks = [...tasks, ...jiraTasks, ...notionTasks, ...linearTasks];

    // Fetch reminders
    const reminderQuery: any = { ...baseQuery, isActive: true };
    if (Object.keys(dateFilter).length > 0) {
      reminderQuery.dueDate = dateFilter;
    }

    const reminders = await Reminder.find(reminderQuery)
      .populate('assignedTo', 'fullName email avatarUrl')
      .populate('createdBy', 'fullName email avatarUrl')
      .sort({ dueDate: 1 });

    // Fetch milestones
    const milestoneQuery: any = { ...baseQuery, isActive: true };
    if (Object.keys(dateFilter).length > 0) {
      milestoneQuery.dueDate = dateFilter;
    }

    const milestones = await Milestone.find(milestoneQuery)
      .populate('createdBy', 'fullName email avatarUrl')
      .populate('project', 'name')
      .populate('tasks', 'title status progress')
      .sort({ dueDate: 1 });

    // Fetch events
    const eventQuery: any = {
      $or: [
        { createdBy: userId },
        { 'participants.user': userId }
      ]
    };
    if (Object.keys(dateFilter).length > 0) {
      eventQuery.start = dateFilter;
    }

    const events = await PlannerEvent.find(eventQuery)
      .populate('participants.user', 'fullName email avatarUrl')
      .sort({ start: 1 });

    res.json({
      success: true,
      data: {
        tasks: allTasks,  // Return merged tasks
        reminders,
        milestones,
        events
      }
    });
  } catch (error) {
    console.error('[Planner] Failed to fetch all data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch planner data' });
  }
};

// Get calendar view data
export const getCalendarViewData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { workspaceId, month, year } = req.query;

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const baseQuery: any = { isActive: true };
    if (workspaceId) {
      baseQuery.workspace = workspaceId;
    }

    // Fetch all data types
    const [tasks, reminders, milestones, events] = await Promise.all([
      Task.find({
        ...baseQuery,
        $or: [
          { startDate: { $gte: startDate, $lte: endDate } },
          { dueDate: { $gte: startDate, $lte: endDate } }
        ]
      })
        .populate('assignee', 'fullName email avatarUrl')
        .populate('project', 'name')
        .select('title status priority dueDate startDate project assignee'),

      Reminder.find({
        ...baseQuery,
        dueDate: { $gte: startDate, $lte: endDate }
      })
        .populate('assignedTo', 'fullName email avatarUrl')
        .select('title dueDate priority assignedTo'),

      Milestone.find({
        ...baseQuery,
        dueDate: { $gte: startDate, $lte: endDate }
      })
        .populate('project', 'name')
        .select('title status dueDate progress project'),

      PlannerEvent.find({
        $or: [
          { createdBy: userId },
          { 'participants.user': userId }
        ],
        start: { $gte: startDate, $lte: endDate }
      })
        .populate('participants.user', 'fullName email avatarUrl')
        .select('title start end allDay color')
    ]);

    // Format for calendar
    const calendarEvents = [
      ...tasks.map(task => ({
        id: task._id,
        type: 'task',
        title: task.title,
        start: task.startDate,
        end: task.dueDate,
        status: task.status,
        priority: task.priority,
        project: task.project,
        assignee: task.assignee
      })),
      ...reminders.map(reminder => ({
        id: reminder._id,
        type: 'reminder',
        title: reminder.title,
        start: reminder.dueDate,
        end: reminder.dueDate,
        priority: reminder.priority,
        assignee: reminder.assignedTo
      })),
      ...milestones.map(milestone => ({
        id: milestone._id,
        type: 'milestone',
        title: milestone.title,
        start: milestone.dueDate,
        end: milestone.dueDate,
        status: milestone.status,
        progress: milestone.progress,
        project: milestone.project
      })),
      ...events.map(event => ({
        id: event._id,
        type: 'event',
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        color: event.color
      }))
    ];

    res.json({ success: true, data: calendarEvents });
  } catch (error) {
    console.error('[Planner] Failed to fetch calendar data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch calendar data' });
  }
};

// Get timeline view data
export const getTimelineViewData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId, projectId } = req.query;

    const query: any = { isActive: true };
    if (workspaceId) query.workspace = workspaceId;
    if (projectId) query.project = projectId;

    const milestones = await Milestone.find(query)
      .populate('project', 'name')
      .populate({
        path: 'tasks',
        populate: { path: 'assignee', select: 'fullName email avatarUrl' }
      })
      .sort({ startDate: 1, dueDate: 1 });

    const milestoneTaskIds = milestones.flatMap(m => m.tasks.map((t: any) => t._id));
    const standaloneTasks = await Task.find({
      ...query,
      _id: { $nin: milestoneTaskIds }
    })
      .populate('assignee', 'fullName email avatarUrl')
      .populate('project', 'name')
      .sort({ startDate: 1, dueDate: 1 });

    res.json({
      success: true,
      data: { milestones, standaloneTasks }
    });
  } catch (error) {
    console.error('[Planner] Failed to fetch timeline data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timeline data' });
  }
};

// Get kanban view data
export const getKanbanViewData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId, projectId } = req.query;

    const query: any = { isActive: true };
    if (workspaceId) query.workspace = workspaceId;
    if (projectId) query.project = projectId;

    const tasks = await Task.find(query)
      .populate('assignee', 'fullName email avatarUrl')
      .populate('reporter', 'fullName email avatarUrl')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    const kanbanData = {
      todo: tasks.filter(t => t.status === 'todo'),
      'in-progress': tasks.filter(t => t.status === 'in-progress'),
      'in-review': tasks.filter(t => t.status === 'in-review'),
      done: tasks.filter(t => t.status === 'done'),
      cancelled: tasks.filter(t => t.status === 'cancelled')
    };

    res.json({ success: true, data: kanbanData });
  } catch (error) {
    console.error('[Planner] Failed to fetch kanban data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch kanban data' });
  }
};
