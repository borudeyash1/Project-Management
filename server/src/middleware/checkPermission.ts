import { Response, NextFunction } from 'express';
import Workspace from '../models/Workspace';
import { AuthenticatedRequest } from '../types';

/**
 * Middleware to check if user has specific permission in workspace
 * @param permission - The permission to check (e.g., 'canManageMembers')
 */
export const checkPermission = (permission: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params.workspaceId || req.params.id;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          message: 'Workspace ID required'
        });
      }

      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        return res.status(404).json({
          success: false,
          message: 'Workspace not found'
        });
      }

      // Owner always has all permissions
      if (workspace.owner === userId) {
        return next();
      }

      // Find member in workspace
      const member = workspace.members.find(
        (m: any) => m.user.toString() === userId.toString()
      );

      if (!member) {
        return res.status(403).json({
          success: false,
          message: 'Not a workspace member'
        });
      }

      // Check if member is active
      if (member.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Workspace membership is not active'
        });
      }

      // Check specific permission
      if (!member.permissions || !(member.permissions as any)[permission]) {
        return res.status(403).json({
          success: false,
          message: `Permission denied: ${permission.replace(/^can/, '').replace(/([A-Z])/g, ' $1').trim()}`
        });
      }

      // Permission granted
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while checking permissions'
      });
    }
  };
};

/**
 * Middleware to check if user is workspace owner
 */
export const checkOwner = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.params.workspaceId || req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    if (workspace.owner !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only workspace owner can perform this action'
      });
    }

    return next();
  } catch (error) {
    console.error('Owner check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking ownership'
    });
  }
};

/**
 * Middleware to check if user is workspace member (any role)
 */
export const checkMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.params.workspaceId || req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Owner is always a member
    if (workspace.owner === userId) {
      return next();
    }

    // Check if user is in members list
    const member = workspace.members.find(
      (m: any) => m.user.toString() === userId.toString() && m.status === 'active'
    );

    if (!member) {
      return res.status(403).json({
        success: false,
        message: 'Not a workspace member'
      });
    }

    next();
  } catch (error) {
    console.error('Member check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking membership'
    });
  }
};
