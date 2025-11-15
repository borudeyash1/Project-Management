import mongoose, { Schema, Document } from 'mongoose';

export interface IPlannerParticipant {
  user: Schema.Types.ObjectId;
  status: 'accepted' | 'declined' | 'tentative' | 'none';
}

export interface IPlannerReminder {
  method: 'email' | 'notification' | 'both';
  minutesBefore: number;
}

export interface IPlannerEvent extends Document {
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  color?: string;
  projectId?: Schema.Types.ObjectId;
  createdBy: Schema.Types.ObjectId;
  participants: IPlannerParticipant[];
  reminders: IPlannerReminder[];
  deadlineNotifiedAt?: Date;
}

const participantSchema = new Schema<IPlannerParticipant>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['accepted', 'declined', 'tentative', 'none'],
    default: 'none',
  },
});

const reminderSchema = new Schema<IPlannerReminder>({
  method: {
    type: String,
    enum: ['email', 'notification', 'both'],
    default: 'email',
  },
  minutesBefore: {
    type: Number,
    default: 15,
    min: 0,
  },
});

const plannerEventSchema = new Schema<IPlannerEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: {
      type: [participantSchema],
      default: [],
    },
    reminders: {
      type: [reminderSchema],
      default: [],
    },
    deadlineNotifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

plannerEventSchema.index({ createdBy: 1, start: 1 });
plannerEventSchema.index({ 'participants.user': 1, start: 1 });

export default mongoose.model<IPlannerEvent>('PlannerEvent', plannerEventSchema);
