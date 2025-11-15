import { Schema } from 'mongoose';
import { ReminderTrigger, ReminderTriggerType, ReminderEntityType } from '../models/ReminderTrigger';

export interface ScheduleReminderOptions {
  entityType: ReminderEntityType;
  entityId: Schema.Types.ObjectId | string;
  workspaceId?: Schema.Types.ObjectId;
  userIds: (Schema.Types.ObjectId | string)[];
  triggerType: ReminderTriggerType;
  triggerTime: Date;
  repeatIntervalMinutes?: number;
  payload?: Record<string, any>;
}

export const scheduleReminderTrigger = async (options: ScheduleReminderOptions) => {
  const {
    entityType,
    entityId,
    workspaceId,
    userIds,
    triggerType,
    triggerTime,
    repeatIntervalMinutes,
    payload = {},
  } = options;

  if (!triggerTime || Number.isNaN(new Date(triggerTime).getTime())) {
    throw new Error('Invalid triggerTime supplied to scheduleReminderTrigger');
  }

  return ReminderTrigger.create({
    entityType,
    entityId,
    workspaceId,
    userIds,
    triggerType,
    triggerTime,
    repeatIntervalMinutes,
    payload,
  });
};

export const clearReminderTriggers = async (
  entityType: ReminderEntityType,
  entityId: Schema.Types.ObjectId | string,
  triggerType?: ReminderTriggerType,
) => {
  const query: Record<string, any> = { entityType, entityId };
  if (triggerType) {
    query.triggerType = triggerType;
  }

  await ReminderTrigger.deleteMany(query);
};
