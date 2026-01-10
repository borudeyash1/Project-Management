import Notification from '../models/Notification';
import User from '../models/User';
import Task from '../models/Task';
import Project from '../models/Project';
import Workspace from '../models/Workspace';
import { emitToUser } from '../socket/realtimeSocket';

/**
 * Comprehensive Notification Utility for Task Management System
 * 
 * This utility provides centralized notification creation for all task-related events:
 * - Task assignment/reassignment
 * - Task status changes
 * - Task priority changes
 * - Deadline changes/shifts
 * - Task completion
 * - Task verification
 * - Comments on tasks
 * - Mentions in tasks
 * - Task deletion
 * - Subtask completion
 * - File uploads to tasks
 */

interface NotificationData {
  type: 'task' | 'project' | 'workspace' | 'system';
  title: string;
  message: string;
  userId: string;
  relatedId?: string;
  metadata?: Record<string, any>;
  actionStatus?: 'accepted' | 'declined' | 'pending';
}

/**
 * Create a notification and emit real-time event
 */
export async function createNotification(data: NotificationData): Promise<void> {
  try {
    const notification = await Notification.create(data);
    console.log(`✅ [NOTIFICATION] Created: ${data.title} for user ${data.userId}`);

    // Emit real-time notification to user
    emitToUser(data.userId, 'notification:new', {
      _id: notification._id,
      ...data,
      createdAt: notification.createdAt,
      isRead: false
    });

    console.log(`📡 [REALTIME] Emitted notification:new to user ${data.userId}`);
  } catch (error) {
    console.error('❌ [NOTIFICATION] Failed to create notification:', error);
  }
}

/**
 * Send notification to multiple users
 */
export async function notifyMultipleUsers(
  userIds: string[],
  data: Omit<NotificationData, 'userId'>
): Promise<void> {
  const promises = userIds.map(userId =>
    createNotification({ ...data, userId })
  );
  await Promise.all(promises);
}

/**
 * Task Assignment Notification
 */
export async function notifyTaskAssigned(
  taskId: string,
  assigneeId: string,
  assignedBy: string
): Promise<void> {
  try {
    const task: any = await Task.findById(taskId).populate('project');
    const assigner: any = await User.findById(assignedBy);

    if (!task || !assigner) return;

    await createNotification({
      type: 'task',
      title: 'New Task Assigned',
      message: `${assigner.fullName} assigned you a task: "${task.title}"`,
      userId: assigneeId,
      relatedId: taskId,
      metadata: {
        taskId,
        taskTitle: task.title,
        assignedBy: assignedBy,
        assignedByName: assigner.fullName,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: task.project?._id,
      }
    });
  } catch (error) {
    console.error('❌ [NOTIFICATION] Failed to notify task assignment:', error);
  }
}

/**
 * Task Reassignment Notification
 */
export async function notifyTaskReassigned(
  taskId: string,
  oldAssigneeId: string | undefined,
  newAssigneeId: string,
  reassignedBy: string
): Promise<void> {
  try {
    const task: any = await Task.findById(taskId);
    const reassigner: any = await User.findById(reassignedBy);

    if (!task || !reassigner) return;

    // Notify new assignee
    await createNotification({
      type: 'task',
      title: 'Task Reassigned to You',
      message: `${reassigner.fullName} reassigned task "${task.title}" to you`,
      userId: newAssigneeId,
      relatedId: taskId,
      metadata: {
        taskId,
        taskTitle: task.title,
        reassignedBy: reassignedBy,
        reassignedByName: reassigner.fullName,
        priority: task.priority,
        dueDate: task.dueDate,
      }
    });

    // Notify old assignee if exists
    if (oldAssigneeId && oldAssigneeId !== newAssigneeId) {
      await createNotification({
        type: 'task',
        title: 'Task Reassigned',
        message: `Task "${task.title}" has been reassigned to another team member`,
        userId: oldAssigneeId,
        relatedId: taskId,
        metadata: {
          taskId,
          taskTitle: task.title,
          reassignedBy: reassignedBy,
          reassignedByName: reassigner.fullName,
        }
      });
    }
  } catch (error) {
    console.error('❌ [NOTIFICATION] Failed to notify task reassignment:', error);
  }
}

/**
 * Task Status Change Notification
 */
export async function notifyTaskStatusChanged(
  taskId: string,
  oldStatus: string,
  newStatus: string,
  changedBy: string
): Promise<void> {
  try {
    const task: any = await Task.findById(taskId).populate('assignee reporter');
    const changer: any = await User.findById(changedBy);

    if (!task || !changer) return;

    const statusMessages: Record<string, string> = {
      'pending': 'marked as pending',
      'todo': 'moved to To Do',
      'in-progress': 'started working on',
      'review': 'submitted for review',
      'in-review': 'is now in review',
      'completed': 'completed',
      'done': 'marked as done',
      'blocked': 'marked as blocked',
      'verified': 'verified',
    };

    const message = `${changer.fullName} ${statusMessages[newStatus] || 'updated'} task "${task.title}"`;

    // Notify assignee (if not the one who changed it)
    if (task.assignee && task.assignee._id.toString() !== changedBy) {
      await createNotification({
        type: 'task',
        title: 'Task Status Updated',
        message,
        userId: task.assignee._id.toString(),
        relatedId: taskId,
        metadata: {
          taskId,
          taskTitle: task.title,
          oldStatus,
          newStatus,
          changedBy,
          changedByName: changer.fullName,
        }
      });
    }

    // Notify reporter (if different from assignee and changer)
    if (
      task.reporter &&
      task.reporter._id.toString() !== changedBy &&
      task.reporter._id.toString() !== task.assignee?._id.toString()
    ) {
      await createNotification({
        type: 'task',
        title: 'Task Status Updated',
        message,
        userId: task.reporter._id.toString(),
        relatedId: taskId,
        metadata: {
          taskId,
          taskTitle: task.title,
          oldStatus,
          newStatus,
          changedBy,
          changedByName: changer.fullName,
        }
      });
    }
  } catch (error) {
    console.error('❌ [NOTIFICATION] Failed to notify task status change:', error);
  }
}

/**
 * Task Priority Change Notification
 */
export async function notifyTaskPriorityChanged(
  taskId: string,
  oldPriority: string,
  newPriority: string,
  changedBy: string
): Promise<void> {
  try {
    const task: any = await Task.findById(taskId).populate('assignee reporter');
    const changer: any = await User.findById(changedBy);

    if (!task || !changer) return;

    const message = `${changer.fullName} changed priority of task "${task.title}" from ${oldPriority} to ${newPriority}`;

    // Notify assignee
    if (task.assignee && task.assignee._id.toString() !== changedBy) {
      await createNotification({
        type: 'task',
        title: 'Task Priority Changed',
        message,
        userId: task.assignee._id.toString(),
        relatedId: taskId,
        metadata: {
          taskId,
          taskTitle: task.title,
          oldPriority,
          newPriority,
          changedBy,
          changedByName: changer.fullName,
        }
      });
    }

    // Notify reporter if different
    if (
      task.reporter &&
      task.reporter._id.toString() !== changedBy &&
      task.reporter._id.toString() !== task.assignee?._id.toString()
    ) {
      await createNotification({
        type: 'task',
        title: 'Task Priority Changed',
        message,
        userId: task.reporter._id.toString(),
        relatedId: taskId,
        metadata: {
          taskId,
          taskTitle: task.title,
          oldPriority,
          newPriority,
          changedBy,
          changedByName: changer.fullName,
        }
      });
    }
  } catch (error) {
    console.error('❌ [NOTIFICATION] Failed to notify task priority change:', error);
  }
}

/**
 * Task Deadline Change Notification
 */
export async function notifyTaskDeadlineChanged(
  taskId: string,
  oldDeadline: Date | undefined,
  newDeadline: Date | undefined,
  changedBy: string
): Promise<void> {
  try {
    const task: any = await Task.findById(taskId).populate('assignee reporter');
    const changer: any = await User.findById(changedBy);

    if (!task || !changer) return;

    const formatDate = (date: Date | undefined) =>
      date ? new Date(date).toLocaleDateString() : 'Not set';

    const message = `${changer.fullName} changed deadline of task "${task.title}" from ${formatDate(oldDeadline)} to ${formatDate(newDeadline)}`;

    // Notify assignee
    if (task.assignee && task.assignee._id.toString() !== changedBy) {
      await createNotification({
        type: 'task',
        title: 'Task Deadline Changed',
        message,
        userId: task.assignee._id.toString(),
        relatedId: taskId,
        metadata: {
          taskId,
          taskTitle: task.title,
          oldDeadline,
          newDeadline,
          changedBy,
          changedByName: changer.fullName,
        }
      });
    }

    // Notify reporter if different
    if (
      task.reporter &&
      task.reporter._id.toString() !== changedBy &&
      task.reporter._id.toString() !== task.assignee?._id.toString()
    ) {
      await createNotification({
        type: 'task',
        title: 'Task Deadline Changed',
        message,
        userId: task.reporter._id.toString(),
        relatedId: taskId,
        metadata: {
          taskId,
          taskTitle: task.title,
          oldDeadline,
          newDeadline,
          changedBy,
          changedByName: changer.fullName,
        }
      });
    }
  } catch (error) {
    console.error('❌ [NOTIFICATION] Failed to notify task deadline change:', error);
  }
}

/**
 * Task Completion Notification
 */
export async function notifyTaskCompleted(
  taskId: string,
  completedBy: string
): Promise<void> {
  try {
    const task: any = await Task.findById(taskId).populate('assignee reporter project');
    const completer: any = await User.findById(completedBy);

    if (!task || !completer) return;

    const message = `${completer.fullName} completed task "${task.title}"`;

    // Notify reporter
    if (task.reporter && task.reporter._id.toString() !== completedBy) {
      await createNotification({
        type: 'task',
        title: 'Task Completed',
        message,
        userId: task.reporter._id.toString(),
        relatedId: taskId,
        metadata: {
          taskId,
          taskTitle: task.title,
          completedBy,
          completedByName: completer.fullName,
          completedAt: new Date(),
        }
      });
    }

    // Notify project manager if exists
    if (task.project) {
      const project: any = await Project.findById(task.project._id);
      if (project) {
        const managers = project.members.filter((m: any) =>
          m.role === 'manager' && m.user.toString() !== completedBy
        );

        for (const manager of managers) {
          await createNotification({
            type: 'task',
            title: 'Task Completed',
            message,
            userId: manager.user.toString(),
            relatedId: taskId,
            metadata: {
              taskId,
              taskTitle: task.title,
              completedBy,
              completedByName: completer.fullName,
              projectId: project._id,
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('❌ [NOTIFICATION] Failed to notify task completion:', error);
  }
}

/**
 * Task Verification Notification
 */
export async function notifyTaskVerified(
  taskId: string,
  verifiedBy: string
): Promise<void> {
  try {
    const task: any = await Task.findById(taskId).populate('assignee');
    const verifier: any = await User.findById(verifiedBy);

    if (!task || !verifier) return;

    // Notify assignee
    if (task.assignee && task.assignee._id.toString() !== verifiedBy) {
      await createNotification({
        type: 'task',
        title: 'Task Verified',
        message: `${verifier.fullName} verified your task "${task.title}"`,
        userId: task.assignee._id.toString(),
        relatedId: taskId,
        metadata: {
          taskId,
          taskTitle: task.title,
          verifiedBy,
          verifiedByName: verifier.fullName,
          verifiedAt: new Date(),
        }
      });
    }
  } catch (error) {
    console.error('❌ [NOTIFICATION] Failed to notify task verification:', error);
  }
}

/**
 * Task Comment Notification
 */
export async function notifyTaskComment(
  taskId: string,
  commentAuthorId: string,
  commentContent: string
): Promise<void> {
  try {
    const task: any = await Task.findById(taskId).populate('assignee reporter');
    const author: any = await User.findById(commentAuthorId);

    if (!task || !author) return;

    const message = `${author.fullName} commented on task "${task.title}": ${commentContent.substring(0, 100)}${commentContent.length > 100 ? '...' : ''}`;

    const notifiedUsers = new Set<string>();

    // Notify assignee
    if (task.assignee && task.assignee._id.toString() !== commentAuthorId) {
      notifiedUsers.add(task.assignee._id.toString());
      await createNotification({
        type: 'task',
        title: 'New Comment on Task',
        message,
        userId: task.assignee._id.toString(),
        relatedId: taskId,
        metadata: {
          taskId,
          taskTitle: task.title,
          commentAuthorId,
          commentAuthorName: author.fullName,
          commentContent: commentContent.substring(0, 200),
        }
      });
    }

    // Notify reporter
    if (
      task.reporter &&
      task.reporter._id.toString() !== commentAuthorId &&
      !notifiedUsers.has(task.reporter._id.toString())
    ) {
      await createNotification({
        type: 'task',
        title: 'New Comment on Task',
        message,
        userId: task.reporter._id.toString(),
        relatedId: taskId,
        metadata: {
          taskId,
          taskTitle: task.title,
          commentAuthorId,
          commentAuthorName: author.fullName,
          commentContent: commentContent.substring(0, 200),
        }
      });
    }
  } catch (error) {
    console.error('❌ [NOTIFICATION] Failed to notify task comment:', error);
  }
}

/**
 * Task Deletion Notification
 */
export async function notifyTaskDeleted(
  taskTitle: string,
  assigneeId: string | undefined,
  deletedBy: string
): Promise<void> {
  try {
    const deleter: any = await User.findById(deletedBy);

    if (!deleter) return;

    // Notify assignee
    if (assigneeId && assigneeId !== deletedBy) {
      await createNotification({
        type: 'task',
        title: 'Task Deleted',
        message: `${deleter.fullName} deleted task "${taskTitle}"`,
        userId: assigneeId,
        metadata: {
          taskTitle,
          deletedBy,
          deletedByName: deleter.fullName,
          deletedAt: new Date(),
        }
      });
    }
  } catch (error) {
    console.error('❌ [NOTIFICATION] Failed to notify task deletion:', error);
  }
}

/**
 * Task File Upload Notification
 */
export async function notifyTaskFileUploaded(
  taskId: string,
  fileName: string,
  uploadedBy: string
): Promise<void> {
  try {
    const task: any = await Task.findById(taskId).populate('assignee reporter');
    const uploader: any = await User.findById(uploadedBy);

    if (!task || !uploader) return;

    const message = `${uploader.fullName} uploaded a file "${fileName}" to task "${task.title}"`;

    // Notify assignee
    if (task.assignee && task.assignee._id.toString() !== uploadedBy) {
      await createNotification({
        type: 'task',
        title: 'File Uploaded to Task',
        message,
        userId: task.assignee._id.toString(),
        relatedId: taskId,
        metadata: {
          taskId,
          taskTitle: task.title,
          fileName,
          uploadedBy,
          uploadedByName: uploader.fullName,
        }
      });
    }

    // Notify reporter
    if (
      task.reporter &&
      task.reporter._id.toString() !== uploadedBy &&
      task.reporter._id.toString() !== task.assignee?._id.toString()
    ) {
      await createNotification({
        type: 'task',
        title: 'File Uploaded to Task',
        message,
        userId: task.reporter._id.toString(),
        relatedId: taskId,
        metadata: {
          taskId,
          taskTitle: task.title,
          fileName,
          uploadedBy,
          uploadedByName: uploader.fullName,
        }
      });
    }
  } catch (error) {
    console.error('❌ [NOTIFICATION] Failed to notify file upload:', error);
  }
}

/**
 * Subtask Completion Notification
 */
export async function notifySubtaskCompleted(
  taskId: string,
  subtaskTitle: string,
  completedBy: string
): Promise<void> {
  try {
    const task: any = await Task.findById(taskId).populate('assignee reporter');
    const completer: any = await User.findById(completedBy);

    if (!task || !completer) return;

    const message = `${completer.fullName} completed subtask "${subtaskTitle}" in task "${task.title}"`;

    // Notify assignee
    if (task.assignee && task.assignee._id.toString() !== completedBy) {
      await createNotification({
        type: 'task',
        title: 'Subtask Completed',
        message,
        userId: task.assignee._id.toString(),
        relatedId: taskId,
        metadata: {
          taskId,
          taskTitle: task.title,
          subtaskTitle,
          completedBy,
          completedByName: completer.fullName,
        }
      });
    }

    // Notify reporter
    if (
      task.reporter &&
      task.reporter._id.toString() !== completedBy &&
      task.reporter._id.toString() !== task.assignee?._id.toString()
    ) {
      await createNotification({
        type: 'task',
        title: 'Subtask Completed',
        message,
        userId: task.reporter._id.toString(),
        relatedId: taskId,
        metadata: {
          taskId,
          taskTitle: task.title,
          subtaskTitle,
          completedBy,
          completedByName: completer.fullName,
        }
      });
    }
  } catch (error) {
    console.error('❌ [NOTIFICATION] Failed to notify subtask completion:', error);
  }
}

/**
 * Task Mention Notification
 */
export async function notifyTaskMention(
  taskId: string,
  mentionedUserId: string,
  mentionedBy: string,
  context: string
): Promise<void> {
  try {
    const task: any = await Task.findById(taskId);
    const mentioner: any = await User.findById(mentionedBy);

    if (!task || !mentioner) return;

    await createNotification({
      type: 'task',
      title: 'You Were Mentioned',
      message: `${mentioner.fullName} mentioned you in task "${task.title}"`,
      userId: mentionedUserId,
      relatedId: taskId,
      metadata: {
        taskId,
        taskTitle: task.title,
        mentionedBy,
        mentionedByName: mentioner.fullName,
        context: context.substring(0, 200),
      }
    });
  } catch (error) {
    console.error('❌ [NOTIFICATION] Failed to notify mention:', error);
  }
}

/**
 * Task Overdue Notification
 */
export async function notifyTaskOverdue(taskId: string): Promise<void> {
  try {
    const task: any = await Task.findById(taskId).populate('assignee reporter');

    if (!task) return;

    const message = `Task "${task.title}" is overdue!`;

    // Notify assignee
    if (task.assignee) {
      await createNotification({
        type: 'task',
        title: 'Task Overdue',
        message,
        userId: task.assignee._id.toString(),
        relatedId: taskId,
        metadata: {
          taskId,
          taskTitle: task.title,
          dueDate: task.dueDate,
          priority: task.priority,
        }
      });
    }

    // Notify reporter
    if (task.reporter && task.reporter._id.toString() !== task.assignee?._id.toString()) {
      await createNotification({
        type: 'task',
        title: 'Task Overdue',
        message,
        userId: task.reporter._id.toString(),
        relatedId: taskId,
        metadata: {
          taskId,
          taskTitle: task.title,
          dueDate: task.dueDate,
          priority: task.priority,
        }
      });
    }
  } catch (error) {
    console.error('❌ [NOTIFICATION] Failed to notify task overdue:', error);
  }
}

/**
 * Inbox Message Notification
 */
export async function notifyInboxMessage(
  workspaceId: string,
  senderId: string,
  recipientId: string,
  messageContent: string
): Promise<void> {
  try {
    const sender: any = await User.findById(senderId);
    const workspace: any = await Workspace.findById(workspaceId);

    if (!sender || !workspace) return;

    // Don't notify the sender
    if (senderId === recipientId) return;

    const truncatedMessage = messageContent.length > 100
      ? messageContent.substring(0, 100) + '...'
      : messageContent;

    await createNotification({
      type: 'workspace',
      title: 'New Message',
      message: `${sender.fullName} sent you a message: "${truncatedMessage}"`,
      userId: recipientId,
      relatedId: workspaceId,
      metadata: {
        workspaceId,
        workspaceName: workspace.name,
        senderId,
        senderName: sender.fullName,
        messagePreview: truncatedMessage,
        messageType: 'inbox',
      }
    });

    console.log(`✅ [NOTIFICATION] Inbox message notification sent to user ${recipientId}`);
  } catch (error) {
    console.error('❌ [NOTIFICATION] Failed to notify inbox message:', error);
  }
}

