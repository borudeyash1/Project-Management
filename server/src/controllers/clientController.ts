import { RequestHandler, Response } from 'express';
import Client from '../models/Client';
import Workspace from '../models/Workspace';
import User from '../models/User';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { sendEmail } from '../services/emailService';

// OTP configuration
const OTP_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create client for a workspace
export const createClient: RequestHandler = async (req, res) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const userId = user!._id;
    const {
      name,
      email,
      phone,
      company,
      industry,
      website,
      address,
      contactPerson,
      notes,
      workspaceId,
    } = req.body as any;

    if (!workspaceId) {
      res.status(400).json({ success: false, message: 'workspaceId is required' });
      return;
    }

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.status': 'active' },
      ],
    }).select('_id');

    if (!workspace) {
      res.status(404).json({ success: false, message: 'Workspace not found or access denied' });
      return;
    }

    const client = await Client.create({
      name,
      email,
      phone,
      company,
      industry,
      website,
      address,
      contactPerson,
      notes,
      workspaceId,
      status: 'active',
    });

    const response: ApiResponse = {
      success: true,
      message: 'Client created successfully',
      data: client,
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Create client error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get clients for a workspace
export const getWorkspaceClients: RequestHandler = async (req, res) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const userId = user!._id;
    const { workspaceId } = req.params as { workspaceId?: string };

    if (!workspaceId) {
      res.status(400).json({ success: false, message: 'workspaceId is required' });
      return;
    }

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.status': 'active' },
      ],
    }).select('_id');

    if (!workspace) {
      res.status(404).json({ success: false, message: 'Workspace not found or access denied' });
      return;
    }

    const clients = await Client.find({
      workspaceId,
      status: 'active',
    }).sort({ createdAt: -1 });

    const response: ApiResponse = {
      success: true,
      message: 'Clients retrieved successfully',
      data: clients,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get workspace clients error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update client
export const updateClient: RequestHandler = async (req, res) => {
  try {
    const { user } = req as AuthenticatedRequest;
    
    if (!user || !user._id) {
      console.error('Update client error: User not authenticated');
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    
    const userId = user._id;
    const { id } = req.params;
    const updates = req.body as any;

    console.log('Updating client:', id, 'by user:', userId);

    const client = await Client.findById(id);
    if (!client) {
      console.error('Client not found:', id);
      res.status(404).json({ success: false, message: 'Client not found' });
      return;
    }

    const workspace = await Workspace.findOne({
      _id: client.workspaceId,
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.status': 'active' },
      ],
    }).select('_id');

    if (!workspace) {
      console.error('Access denied for user:', userId, 'to workspace:', client.workspaceId);
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    Object.assign(client, updates);
    await client.save();

    console.log('Client updated successfully:', client._id);

    const response: ApiResponse = {
      success: true,
      message: 'Client updated successfully',
      data: client,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Update client error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Send OTP for client deletion
export const sendClientDeletionOtp = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = req.user!._id;

    // Find the client
    const client = await Client.findById(id);
    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found'
      });
      return;
    }

    // Verify user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: client.workspaceId,
      $or: [
        { owner: currentUserId },
        { 'members.user': currentUserId, 'members.role': { $in: ['owner', 'admin'] } }
      ]
    });

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_VALIDITY_MS);

    // Store OTP in user document
    const user = await User.findById(currentUserId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const userAny = user as any;
    userAny.otp = otp;
    userAny.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Client Deletion OTP',
        html: `<p>Your OTP for client deletion is: <strong>${otp}</strong></p><p>This OTP will expire in 5 minutes.</p><p>Client: <strong>${client.name}</strong></p>`
      });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Continue anyway - OTP is stored
    }

    console.log(`Client deletion OTP for user ${currentUserId}: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error: any) {
    console.error('Send client deletion OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete client with OTP verification
export const deleteClientWithOtp = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason, otp } = req.query;
    const currentUserId = req.user!._id;

    // Verify OTP
    const user = await User.findById(currentUserId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const userAny = user as any;
    if (!userAny.otp || !userAny.otpExpiry || userAny.otp !== otp) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
      return;
    }

    if (new Date() > userAny.otpExpiry) {
      res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
      return;
    }

    // Find the client
    const client = await Client.findById(id);
    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found'
      });
      return;
    }

    // Verify user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: client.workspaceId,
      $or: [
        { owner: currentUserId },
        { 'members.user': currentUserId, 'members.role': { $in: ['owner', 'admin'] } }
      ]
    });

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

    // Soft delete the client
    client.status = 'inactive';
    await client.save();

    // Clear OTP
    userAny.otp = undefined;
    userAny.otpExpiry = undefined;
    await user.save();

    // Log the deletion with reason
    console.log(`Client ${id} (${client.name}) deleted from workspace ${client.workspaceId} by ${currentUserId}. Reason: ${reason || 'Not specified'}`);

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete client with OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete client (soft delete) - Legacy function without OTP
export const deleteClient: RequestHandler = async (req, res) => {
  try {
    const { user } = (req as AuthenticatedRequest);
    const userId = user!._id;
    const { id } = req.params;

    const client = await Client.findById(id);
    if (!client) {
      res.status(404).json({ success: false, message: 'Client not found' });
      return;
    }

    const workspace = await Workspace.findOne({
      _id: client.workspaceId,
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.status': 'active' },
      ],
    }).select('_id');

    if (!workspace) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    client.status = 'inactive';
    await client.save();

    res.status(200).json({ success: true, message: 'Client deleted successfully' });
  } catch (error: any) {
    console.error('Delete client error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
