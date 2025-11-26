import { RequestHandler } from 'express';
import Workspace from '../models/Workspace';
import Message from '../models/Message';
import User from '../models/User';
import { AuthenticatedRequest, ApiResponse } from '../types';

// Get workspace threads (one per other member), including last message + unread count
export const getWorkspaceThreads: RequestHandler = async (req, res) => {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    const { user } = req as AuthenticatedRequest;
    const currentUserId = user!._id.toString();

    console.log('🔍 [INBOX] Getting threads for workspace:', workspaceId, 'User:', currentUserId);

    const workspace = await Workspace.findById(workspaceId).populate('members.user', 'fullName email username avatarUrl');
    if (!workspace || workspace.isActive === false) {
      res.status(404).json({ success: false, message: 'Workspace not found' });
      return;
    }

    // Ensure current user is an active member of this workspace
    const isMember = workspace.members.some((m: any) => {
      const userId = typeof m.user === 'string' ? m.user : m.user._id.toString();
      return userId === currentUserId && m.status === 'active';
    });
    
    if (!isMember) {
      console.log('❌ [INBOX] Access denied - user not an active member');
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const threads: any[] = [];

    // Get all active members except current user
    for (const m of workspace.members as any[]) {
      if (m.status !== 'active') continue; // Only active members
      
      const otherUser = m.user;
      const otherUserId = typeof otherUser === 'string' ? otherUser : otherUser._id.toString();
      if (otherUserId === currentUserId) continue;

      const displayName =
        typeof otherUser === 'string'
          ? otherUser
          : otherUser.fullName || otherUser.username || otherUser.email || 'Member';
      const avatarUrl = typeof otherUser === 'string' ? undefined : otherUser.avatarUrl;

      // Last message between current user and this member in this workspace
      const lastMessage = await Message.findOne({
        workspace: workspaceId,
        $or: [
          { sender: currentUserId, recipient: otherUserId },
          { sender: otherUserId, recipient: currentUserId },
        ],
      })
        .sort({ createdAt: -1 })
        .lean();

      // Unread count for current user from this member
      const unreadCount = await Message.countDocuments({
        workspace: workspaceId,
        sender: otherUserId,
        recipient: currentUserId,
        readBy: { $ne: currentUserId },
      });

      threads.push({
        userId: otherUserId,
        name: displayName,
        avatarUrl,
        lastMessage: lastMessage?.content || '',
        lastMessageTime: lastMessage?.createdAt || null,
        unreadCount,
      });
    }

    console.log('✅ [INBOX] Found', threads.length, 'threads');

    const response: ApiResponse = {
      success: true,
      message: 'Threads retrieved successfully',
      data: threads,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('❌ [INBOX] Get threads error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get messages between current user and another user in a workspace
export const getConversationMessages: RequestHandler = async (req, res) => {
  try {
    const { workspaceId, otherUserId } = req.params as { workspaceId: string; otherUserId: string };
    const { user } = req as AuthenticatedRequest;
    const currentUserId = user!._id.toString();

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || workspace.isActive === false) {
      res.status(404).json({ success: false, message: 'Workspace not found' });
      return;
    }

    const isMember = workspace.members.some((m: any) => m.user.toString() === currentUserId && m.status === 'active');
    if (!isMember) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const messages = await Message.find({
      workspace: workspaceId,
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    const response: ApiResponse = {
      success: true,
      message: 'Conversation messages retrieved successfully',
      data: messages,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Send a direct message to another workspace member
export const sendMessage: RequestHandler = async (req, res) => {
  try {
    const { workspaceId, otherUserId } = req.params as { workspaceId: string; otherUserId: string };
    const { content } = req.body as { content?: string };
    const { user } = req as AuthenticatedRequest;
    const currentUserId = user!._id.toString();

    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: 'Message content is required' });
      return;
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || workspace.isActive === false) {
      res.status(404).json({ success: false, message: 'Workspace not found' });
      return;
    }

    const isMember = workspace.members.some((m: any) => m.user.toString() === currentUserId && m.status === 'active');
    if (!isMember) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    // Ensure recipient exists and is a workspace member (active or pending)
    const otherMember = workspace.members.find((m: any) => m.user.toString() === otherUserId);
    if (!otherMember) {
      res.status(404).json({ success: false, message: 'Recipient is not part of this workspace' });
      return;
    }

    const message = await Message.create({
      workspace: workspaceId,
      sender: currentUserId,
      recipient: otherUserId,
      content: content.trim(),
      readBy: [currentUserId],
    });

    const response: ApiResponse = {
      success: true,
      message: 'Message sent successfully',
      data: message,
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Mark all messages in a conversation as read for current user
export const markConversationRead: RequestHandler = async (req, res) => {
  try {
    const { workspaceId, otherUserId } = req.params as { workspaceId: string; otherUserId: string };
    const { user } = req as AuthenticatedRequest;
    const currentUserId = user!._id.toString();

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || workspace.isActive === false) {
      res.status(404).json({ success: false, message: 'Workspace not found' });
      return;
    }

    const isMember = workspace.members.some((m: any) => m.user.toString() === currentUserId && m.status === 'active');
    if (!isMember) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    await Message.updateMany(
      {
        workspace: workspaceId,
        sender: otherUserId,
        recipient: currentUserId,
        readBy: { $ne: currentUserId },
      },
      { $addToSet: { readBy: currentUserId } },
    );

    res.status(200).json({ success: true, message: 'Conversation marked as read' });
  } catch (error: any) {
    console.error('Mark conversation read error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
