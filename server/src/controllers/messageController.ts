import { RequestHandler } from 'express';
import Message from '../models/Message';
import Workspace from '../models/Workspace';
import { AuthenticatedRequest, ApiResponse } from '../types';

// Get messages for current user in workspace
export const getWorkspaceMessages: RequestHandler = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const authReq = req as AuthenticatedRequest;
    const currentUserId = authReq.user!._id;

    console.log('🔍 [GET MESSAGES] Workspace:', workspaceId, 'User:', currentUserId);

    // Verify user is member of workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [
        { owner: currentUserId },
        { 'members.user': currentUserId, 'members.status': 'active' }
      ]
    });

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

    // Get messages where user is sender or recipient
    const messages = await Message.find({
      workspace: workspaceId,
      $or: [
        { sender: currentUserId },
        { recipient: currentUserId }
      ]
    })
      .populate('sender', 'fullName email avatarUrl')
      .populate('recipient', 'fullName email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(100);

    console.log('✅ [GET MESSAGES] Found', messages.length, 'messages');

    const response: ApiResponse = {
      success: true,
      message: 'Messages retrieved successfully',
      data: messages
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('❌ [GET MESSAGES] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get workspace members for inbox
export const getWorkspaceMembers: RequestHandler = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const authReq = req as AuthenticatedRequest;
    const currentUserId = authReq.user!._id;

    console.log('🔍 [GET WORKSPACE MEMBERS] Workspace:', workspaceId);

    // Verify user is member and get workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [
        { owner: currentUserId },
        { 'members.user': currentUserId, 'members.status': 'active' }
      ]
    }).populate('members.user', 'fullName email avatarUrl username');

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

    // Filter active members and exclude current user
    const members = workspace.members
      .filter((m: any) =>
        m.status === 'active' &&
        m.user._id.toString() !== currentUserId.toString()
      )
      .map((m: any) => ({
        _id: m.user._id,
        fullName: m.user.fullName,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl,
        username: m.user.username,
        role: m.role
      }));

    console.log('✅ [GET WORKSPACE MEMBERS] Found', members.length, 'members');

    const response: ApiResponse = {
      success: true,
      message: 'Members retrieved successfully',
      data: members
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('❌ [GET WORKSPACE MEMBERS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send message to workspace member
export const sendWorkspaceMessage: RequestHandler = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { recipientId, content } = req.body;
    const authReq = req as AuthenticatedRequest;
    const currentUserId = authReq.user!._id;

    console.log('🔍 [SEND MESSAGE] From:', currentUserId, 'To:', recipientId);

    if (!content || !content.trim()) {
      res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
      return;
    }

    // Verify both users are members
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      'members.user': { $all: [currentUserId, recipientId] },
      'members.status': 'active'
    });

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or users not members'
      });
      return;
    }

    // Create message
    const message = new Message({
      workspace: workspaceId,
      sender: currentUserId,
      recipient: recipientId,
      content: content.trim(),
      readBy: [currentUserId] // Sender has read it
    });

    await message.save();

    // Populate user details
    await message.populate('sender', 'fullName email avatarUrl');
    await message.populate('recipient', 'fullName email avatarUrl');

    console.log('✅ [SEND MESSAGE] Message sent and encrypted');

    const response: ApiResponse = {
      success: true,
      message: 'Message sent successfully',
      data: message
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('❌ [SEND MESSAGE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark message as read
export const markMessageAsRead: RequestHandler = async (req, res) => {
  try {
    const { messageId } = req.params;
    const authReq = req as AuthenticatedRequest;
    const currentUserId = authReq.user!._id;

    const message = await Message.findOne({
      _id: messageId,
      recipient: currentUserId
    });

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Message not found'
      });
      return;
    }

    // Add user to readBy array if not already there
    if (!message.readBy.includes(currentUserId)) {
      message.readBy.push(currentUserId);
      await message.save();
    }

    console.log('✅ [MARK READ] Message marked as read');

    const response: ApiResponse = {
      success: true,
      message: 'Message marked as read',
      data: message
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('❌ [MARK READ] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get conversation between two users
export const getConversation: RequestHandler = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;
    const authReq = req as AuthenticatedRequest;
    const currentUserId = authReq.user!._id;

    console.log('🔍 [GET CONVERSATION] Between:', currentUserId, 'and', userId);

    // Get messages between the two users
    const messages = await Message.find({
      workspace: workspaceId,
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId }
      ]
    })
      .populate('sender', 'fullName email avatarUrl')
      .populate('recipient', 'fullName email avatarUrl')
      .sort({ createdAt: 1 }) // Oldest first for conversation
      .limit(200);

    console.log('✅ [GET CONVERSATION] Found', messages.length, 'messages');

    const response: ApiResponse = {
      success: true,
      message: 'Conversation retrieved successfully',
      data: messages
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('❌ [GET CONVERSATION] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
