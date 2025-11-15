import { Response } from 'express';
import mongoose, { Types } from 'mongoose';
import PlannerEvent, { IPlannerEvent, IPlannerParticipant } from '../models/PlannerEvent';
import { AuthenticatedRequest } from '../types';
import { sendEmail } from '../services/emailService';
import { scheduleReminderTrigger, clearReminderTriggers } from '../services/reminderScheduler';

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
