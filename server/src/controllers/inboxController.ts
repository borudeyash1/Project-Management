import { RequestHandler } from 'express';
import Workspace from '../models/Workspace';
import Message from '../models/Message';
import User from '../models/User';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { notifyInboxMessage } from '../utils/notificationUtils';

// Get workspace threads (one per other member), including last message + unread count
export const getWorkspaceThreads: RequestHandler = async (req, res) => {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    const { user } = req as AuthenticatedRequest;
    const currentUserId = user!._id.toString();

    console.log('🔍 [INBOX] Getting threads for workspace:', workspaceId, 'User:', currentUserId);

    const workspace = await Workspace.findById(workspaceId)
      .populate('members.user', 'fullName email username avatarUrl')
      .populate('owner', 'fullName email username avatarUrl');
    
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

    console.log('📋 [INBOX] Workspace owner:', workspace.owner);
    console.log('📋 [INBOX] Workspace members count:', workspace.members?.length || 0);

    // Add workspace owner to threads if not current user
    if (workspace.owner) {
      const ownerId = typeof workspace.owner === 'object' 
        ? (workspace.owner as any)._id.toString() 
        : workspace.owner.toString();
      
      console.log('👤 [INBOX] Owner ID:', ownerId, 'Current User:', currentUserId);
      
      if (ownerId !== currentUserId) {
        // Use populated owner if available, otherwise fetch
        let ownerUser;
        if (typeof workspace.owner === 'object' && (workspace.owner as any).fullName) {
          ownerUser = workspace.owner;
          console.log('✅ [INBOX] Using populated owner data');
        } else {
          ownerUser = await User.findById(ownerId).select('fullName email username avatarUrl');
          console.log('🔍 [INBOX] Fetched owner from database');
        }
        
        if (ownerUser) {
          const displayName = (ownerUser as any).fullName || (ownerUser as any).username || (ownerUser as any).email || 'Workspace Owner';
          
          // Last message with owner
          const lastMessage = await Message.findOne({
            workspace: workspaceId,
            $or: [
              { sender: currentUserId, recipient: ownerId },
              { sender: ownerId, recipient: currentUserId },
            ],
          })
            .sort({ createdAt: -1 })
            .lean();

          // Unread count from owner
          const unreadCount = await Message.countDocuments({
            workspace: workspaceId,
            sender: ownerId,
            recipient: currentUserId,
            readBy: { $ne: currentUserId },
          });

          threads.push({
            userId: ownerId,
            name: displayName,
            avatarUrl: (ownerUser as any).avatarUrl,
            lastMessage: lastMessage?.content || '',
            lastMessageTime: lastMessage?.createdAt || null,
            unreadCount,
          });
          
          console.log('✅ [INBOX] Added owner to threads:', displayName);
        } else {
          console.log('⚠️ [INBOX] Owner user not found');
        }
      } else {
        console.log('ℹ️ [INBOX] Current user is the owner, skipping');
      }
    } else {
      console.log('⚠️ [INBOX] No workspace owner found');
    }

    // Get all active members except current user
    console.log('👥 [INBOX] Processing workspace members...');
    let memberCount = 0;
    
    for (const m of workspace.members as any[]) {
      if (m.status !== 'active') {
        console.log('⏭️ [INBOX] Skipping inactive member');
        continue;
      }
      
      const otherUser = m.user;
      if (!otherUser) {
        console.log('⚠️ [INBOX] Member has no user data, skipping');
        continue;
      }
      
      const otherUserId = typeof otherUser === 'string' ? otherUser : otherUser._id?.toString();
      if (!otherUserId) {
        console.log('⚠️ [INBOX] Could not get user ID, skipping');
        continue;
      }
      
      if (otherUserId === currentUserId) {
        console.log('⏭️ [INBOX] Skipping current user');
        continue;
      }

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
      
      memberCount++;
      console.log(`✅ [INBOX] Added member ${memberCount}:`, displayName);
    }

    console.log(`✅ [INBOX] Total threads: ${threads.length} (Owner: ${workspace.owner ? 1 : 0}, Members: ${memberCount})`);

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

    // Send notification to recipient
    await notifyInboxMessage(workspaceId, currentUserId, otherUserId, content.trim());

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

// Get project threads (one per project member), including last message + unread count
export const getProjectThreads: RequestHandler = async (req, res) => {
  try {
    const { projectId } = req.params as { projectId: string };
    const { user } = req as AuthenticatedRequest;
    const currentUserId = user!._id.toString();

    console.log('🔍 [PROJECT INBOX] Getting threads for project:', projectId, 'User:', currentUserId);

    // Import Project model
    const Project = require('../models/Project').default;
    
    const project = await Project.findById(projectId)
      .populate('teamMembers.user', 'fullName email username avatarUrl')
      .populate('workspace');
    
    if (!project || project.isActive === false) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Ensure current user is a member of this project
    const isMember = project.teamMembers.some((m: any) => {
      const userId = typeof m.user === 'object' ? m.user._id.toString() : m.user.toString();
      return userId === currentUserId;
    });
    
    if (!isMember) {
      console.log('❌ [PROJECT INBOX] Access denied - user not a project member');
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const threads: any[] = [];
    const workspaceId = typeof project.workspace === 'object' ? project.workspace._id.toString() : project.workspace.toString();

    console.log('📋 [PROJECT INBOX] Project team members count:', project.teamMembers?.length || 0);

    // Get all project team members except current user
    console.log('👥 [PROJECT INBOX] Processing project team members...');
    let memberCount = 0;
    
    for (const m of project.teamMembers as any[]) {
      const otherUser = m.user;
      if (!otherUser) {
        console.log('⚠️ [PROJECT INBOX] Member has no user data, skipping');
        continue;
      }
      
      const otherUserId = typeof otherUser === 'object' ? otherUser._id?.toString() : otherUser.toString();
      if (!otherUserId) {
        console.log('⚠️ [PROJECT INBOX] Could not get user ID, skipping');
        continue;
      }
      
      if (otherUserId === currentUserId) {
        console.log('⏭️ [PROJECT INBOX] Skipping current user');
        continue;
      }

      const displayName =
        typeof otherUser === 'object'
          ? otherUser.fullName || otherUser.username || otherUser.email || 'Member'
          : 'Member';
      const avatarUrl = typeof otherUser === 'object' ? otherUser.avatarUrl : undefined;

      // Last message between current user and this member in the workspace
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
      
      memberCount++;
      console.log(`✅ [PROJECT INBOX] Added member ${memberCount}:`, displayName);
    }

    console.log(`✅ [PROJECT INBOX] Total threads: ${threads.length}`);

    const response: ApiResponse = {
      success: true,
      message: 'Project threads retrieved successfully',
      data: threads,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('❌ [PROJECT INBOX] Get threads error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

