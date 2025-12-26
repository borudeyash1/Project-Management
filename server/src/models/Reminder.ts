import mongoose, { Document, Schema } from 'mongoose';

export interface INotification {
  type: 'email' | 'push' | 'sms' | 'slack';
  time: Date;
  sent: boolean;
}

export interface IRecurring {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
}

export interface IReminder extends Document {
  title: string;
  description?: string;
  type: 'task' | 'meeting' | 'deadline' | 'milestone' | 'personal';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  workspace?: mongoose.Types.ObjectId;
  tags: string[];
  recurring?: IRecurring;
  notifications: INotification[];
  location?: string;
  meetingLink?: string;
  notes?: string;
  slackChannelId?: string;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  type: {
    type: String,
    enum: ['email', 'push', 'sms', 'slack'],
    required: true
  },
  time: {
    type: Date,
    required: true
  },
  sent: {
    type: Boolean,
    default: false
  }
});

const recurringSchema = new Schema<IRecurring>({
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  interval: {
    type: Number,
    required: true,
    min: 1
  },
  endDate: {
    type: Date
  }
});

const reminderSchema = new Schema<IReminder>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['task', 'meeting', 'deadline', 'milestone', 'personal'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  workspace: {
    type: Schema.Types.ObjectId,
    ref: 'Workspace'
  },
  tags: [{
    type: String,
    trim: true
  }],
  recurring: recurringSchema,
  notifications: [notificationSchema],
  location: {
    type: String,
    trim: true,
    maxlength: 500
  },
  meetingLink: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  slackChannelId: {
    type: String,
    trim: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reminderSchema.index({ createdBy: 1, completed: 1 });
reminderSchema.index({ createdBy: 1, type: 1 });
reminderSchema.index({ createdBy: 1, priority: 1 });
reminderSchema.index({ createdBy: 1, dueDate: 1 });
reminderSchema.index({ title: 'text', description: 'text', tags: 'text' });
reminderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Reminder = mongoose.model<IReminder>('Reminder', reminderSchema);
