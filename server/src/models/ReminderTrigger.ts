import mongoose, { Document, Schema } from 'mongoose';

export type ReminderEntityType =
  | 'planner_event'
  | 'task'
  | 'tracker_time_entry'
  | 'project'
  | 'custom';

export type ReminderTriggerType =
  | 'immediate'
  | 'pre_deadline'
  | 'deadline_reached'
  | 'overdue'
  | 'custom';

export interface IReminderTrigger extends Document {
  entityType: ReminderEntityType;
  entityId: Schema.Types.ObjectId | string;
  workspaceId?: Schema.Types.ObjectId;
  userIds: Schema.Types.ObjectId[];
  triggerType: ReminderTriggerType;
  triggerTime: Date;
  repeatIntervalMinutes?: number;
  lastNotifiedAt?: Date;
  payload: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reminderTriggerSchema = new Schema<IReminderTrigger>(
  {
    entityType: {
      type: String,
      required: true,
      enum: ['planner_event', 'task', 'tracker_time_entry', 'project', 'custom'],
    },
    entityId: {
      type: Schema.Types.Mixed,
      required: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
    },
    userIds: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
    },
    triggerType: {
      type: String,
      required: true,
      enum: ['immediate', 'pre_deadline', 'deadline_reached', 'overdue', 'custom'],
    },
    triggerTime: {
      type: Date,
      required: true,
    },
    repeatIntervalMinutes: {
      type: Number,
      min: 1,
    },
    lastNotifiedAt: {
      type: Date,
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {},
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

reminderTriggerSchema.index({ triggerTime: 1, triggerType: 1 });
reminderTriggerSchema.index({ entityType: 1, entityId: 1 });
reminderTriggerSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ReminderTrigger = mongoose.model<IReminderTrigger>(
  'ReminderTrigger',
  reminderTriggerSchema
);
