import mongoose, { Schema, Document } from "mongoose";
import { ITask } from "../types";
import { scheduleReminderTrigger, clearReminderTriggers } from '../services/reminderScheduler';

const taskSchema: Schema<any> = new Schema<any>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Task title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: false,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "blocked", "verified"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    type: {
      type: String,
      enum: ["task", "bug", "feature", "story", "epic"],
      default: "task",
    },
    taskType: {
      type: String,
      enum: ["general", "submission", "task"],
      default: "general",
    },
    requiresFile: {
      type: Boolean,
      default: false,
    },
    requiresLink: {
      type: Boolean,
      default: false,
    },
    links: [
      {
        type: String,
        trim: true,
      },
    ],
    files: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    category: {
      type: String,
      trim: true,
      maxlength: [50, "Category cannot exceed 50 characters"],
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [30, "Tag cannot exceed 30 characters"],
      },
    ],
    startDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    estimatedHours: {
      type: Number,
      min: 0,
    },
    actualHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    dependencies: [
      {
        task: {
          type: Schema.Types.ObjectId,
          ref: "Task",
        },
        type: {
          type: String,
          enum: ["blocks", "blocked-by", "relates-to"],
          default: "relates-to",
        },
      },
    ],
    subtasks: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
        },
      },
    ],
    attachments: [
      {
        filename: {
          type: String,
          required: true,
        },
        originalName: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
        mimeType: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        content: {
          type: String,
          required: true,
          trim: true,
        },
        author: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        isEdited: {
          type: Boolean,
          default: false,
        },
      },
    ],
    timeEntries: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        description: {
          type: String,
          trim: true,
        },
        startTime: {
          type: Date,
          required: true,
        },
        endTime: {
          type: Date,
        },
        duration: {
          type: Number,
          min: 0,
        },
        isActive: {
          type: Boolean,
          default: false,
        },
      },
    ],
    customFields: [
      {
        name: {
          type: String,
          required: true,
        },
        value: {
          type: Schema.Types.Mixed,
        },
        type: {
          type: String,
          enum: ["text", "number", "date", "boolean", "select"],
          default: "text",
        },
      },
    ],
    // Performance Rating & Verification
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    ratingDetails: {
      // 9 Performance Dimensions
      timeliness: {
        type: Number,
        min: 0,
        max: 5,
      },
      quality: {
        type: Number,
        min: 0,
        max: 5,
      },
      effort: {
        type: Number,
        min: 0,
        max: 5,
      },
      accuracy: {
        type: Number,
        min: 0,
        max: 5,
      },
      collaboration: {
        type: Number,
        min: 0,
        max: 5,
      },
      initiative: {
        type: Number,
        min: 0,
        max: 5,
      },
      reliability: {
        type: Number,
        min: 0,
        max: 5,
      },
      learning: {
        type: Number,
        min: 0,
        max: 5,
      },
      compliance: {
        type: Number,
        min: 0,
        max: 5,
      },
      // Additional metadata
      comments: {
        type: String,
        trim: true,
      },
      overallRating: {
        type: Number,
        min: 0,
        max: 5,
      },
      ratedAt: {
        type: Date,
      },
      ratedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
taskSchema.index({ project: 1 });
taskSchema.index({ workspace: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ reporter: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ type: 1 });

taskSchema.virtual("completionPercentage").get(function () {
  if ((this as any).subtasks.length === 0) return (this as any).progress;

  const completedSubtasks = (this.subtasks as any[]).filter(
    (subtask: any) => subtask.completed,
  ).length;

  return Math.round((completedSubtasks / (this as any).subtasks.length) * 100);
});

// Virtual for total time spent
taskSchema.virtual("totalTimeSpent").get(function (this: ITask & Document) {
  return this.timeEntries.reduce(
    (total: number, entry: { duration?: number }) => {
      if (entry.duration) {
        return total + entry.duration;
      }
      return total;
    },
    0,
  );
});

// Method to add subtask
taskSchema.methods.addSubtask = function (title: string) {
  this.subtasks.push({
    title: title,
    completed: false,
  });
  return this.save();
};

// Method to complete subtask
taskSchema.methods.completeSubtask = function (subtaskIndex: number) {
  if (this.subtasks[subtaskIndex]) {
    this.subtasks[subtaskIndex].completed = true;
    this.subtasks[subtaskIndex].completedAt = new Date();
  }
  return this.save();
};

// Method to add comment
taskSchema.methods.addComment = function (content: string, authorId: string) {
  this.comments.push({
    content: content,
    author: authorId,
  });
  return this.save();
};

// Method to add time entry
taskSchema.methods.addTimeEntry = function (
  userId: string,
  description: string,
  startTime: Date,
) {
  this.timeEntries.push({
    user: userId,
    description: description,
    startTime: startTime,
    isActive: true,
  });
  return this.save();
};

// Method to stop time entry
taskSchema.methods.stopTimeEntry = function (userId: string) {
  const activeEntry = this.timeEntries.find(
    (entry: any) =>
      entry.user.toString() === userId.toString() && entry.isActive,
  );

  if (activeEntry) {
    activeEntry.endTime = new Date();
    activeEntry.duration =
      activeEntry.endTime.getTime() - activeEntry.startTime.getTime();
    activeEntry.isActive = false;
  }

  return this.save();
};

// Method to update status
taskSchema.methods.updateStatus = function (status: string) {
  this.status = status;

  if (status === "completed" || status === "verified") {
    this.completedDate = new Date();
    this.progress = 100;
  } else if (status === "blocked") {
    // Keep current progress for blocked tasks
  }

  return this.save();
};

// Transform JSON output
taskSchema.methods.toJSON = function () {
  const taskObject = this.toObject();
  taskObject.completionPercentage = this.completionPercentage;
  taskObject.totalTimeSpent = this.totalTimeSpent;
  return taskObject;
};

export default mongoose.model("Task", taskSchema);

const toIdString = (value: any): string => {
  if (!value) return '';
  return typeof value === 'string' ? value : value.toString?.() || '';
};

const rescheduleTaskReminders = async (task: any) => {
  const taskId = toIdString(task._id);
  if (!taskId) return;

  await clearReminderTriggers('task', taskId);

  const recipientIds = new Set<string>();
  if (task.assignee) recipientIds.add(toIdString(task.assignee));
  if (task.reporter) recipientIds.add(toIdString(task.reporter));

  if (recipientIds.size === 0) {
    return;
  }

  const userIds = Array.from(recipientIds).filter(Boolean);
  const payloadBase = {
    title: task.title,
    project: toIdString(task.project),
    workspace: toIdString(task.workspace),
    dueDate: task.dueDate,
    priority: task.priority,
  };

  await scheduleReminderTrigger({
    entityType: 'task',
    entityId: taskId,
    userIds,
    triggerType: 'immediate',
    triggerTime: new Date(),
    payload: {
      ...payloadBase,
      message: `Task assigned: ${task.title}`,
    },
  });

  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);

    const preDeadline = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
    if (preDeadline > new Date()) {
      await scheduleReminderTrigger({
        entityType: 'task',
        entityId: taskId,
        userIds,
        triggerType: 'pre_deadline',
        triggerTime: preDeadline,
        payload: {
          ...payloadBase,
          message: `Task due soon: ${task.title}`,
        },
      });
    }

    await scheduleReminderTrigger({
      entityType: 'task',
      entityId: taskId,
      userIds,
      triggerType: 'deadline_reached',
      triggerTime: dueDate,
      payload: {
        ...payloadBase,
        message: `Task deadline reached: ${task.title}`,
      },
    });
  }
};

taskSchema.post('save', function(doc) {
  rescheduleTaskReminders(doc).catch((err) => {
    console.error('[Task] Failed to schedule reminders after save:', err);
  });
});

taskSchema.post('findOneAndUpdate', function(doc: any) {
  if (doc) {
    rescheduleTaskReminders(doc).catch((err) => {
      console.error('[Task] Failed to schedule reminders after update:', err);
    });
  }
});

taskSchema.post('deleteOne', { document: true, query: false }, function(doc: any) {
  if (doc) {
    clearReminderTriggers('task', toIdString(doc._id)).catch((err) => {
      console.error('[Task] Failed to clear reminders after delete:', err);
    });
  }
});
