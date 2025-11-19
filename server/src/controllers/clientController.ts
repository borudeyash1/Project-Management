import { RequestHandler } from 'express';
import Client from '../models/Client';
import Workspace from '../models/Workspace';
import { AuthenticatedRequest, ApiResponse } from '../types';

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
    const userId = user!._id;
    const { id } = req.params;
    const updates = req.body as any;

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

    Object.assign(client, updates);
    await client.save();

    const response: ApiResponse = {
      success: true,
      message: 'Client updated successfully',
      data: client,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Update client error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete client (soft delete)
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
