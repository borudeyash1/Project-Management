import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Admin from '../models/Admin';
import { AuthenticatedRequest, JWTPayload } from '../types';

// Verify JWT token
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    console.log('🔍 [AUTH] Token decoded:', { id: decoded.id, type: decoded.type, role: decoded.role });
    
    // Check if this is an admin token
    if (decoded.type === 'admin') {
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) {
        console.log('❌ [AUTH] Admin not found for ID:', decoded.id);
        res.status(401).json({
          success: false,
          message: 'Token is valid but admin no longer exists.'
        });
        return;
      }

      if (!admin.isActive) {
        console.log('❌ [AUTH] Admin account is inactive:', admin.email);
        res.status(401).json({
          success: false,
          message: 'Admin account has been deactivated.'
        });
        return;
      }

      console.log('✅ [AUTH] Admin authenticated:', admin.email);
      req.user = admin as any;
      req.isAdmin = true;
      next();
      return;
    }
    
    // Regular user authentication
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      console.log('❌ [AUTH] User not found for ID:', decoded.userId);
      res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists.'
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ [AUTH] User account is inactive:', user.email);
      res.status(401).json({
        success: false,
        message: 'Account has been deactivated.'
      });
      return;
    }

    console.log('✅ [AUTH] User authenticated:', user.email);
    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
      return;
    }
    
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
      return;
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// Verify refresh token
export const authenticateRefresh = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token is required.'
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JWTPayload;
    
    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
      return;
    }

    // Check if refresh token exists in user's refresh tokens
    const tokenExists = user.refreshTokens.some(token => token.token === refreshToken);
    if (!tokenExists) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
      return;
    }

    req.user = user;
    req.refreshToken = refreshToken;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
      return;
    }
    
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Refresh token has expired.'
      });
      return;
    }

    console.error('Refresh auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during refresh token authentication.'
    });
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Check if user still exists
    const user = await User.findById(decoded.userId).select('-password');
    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without setting req.user
    next();
  }
};

// Check if user has specific role in workspace
export const checkWorkspaceRole = (requiredRoles: string[] = []) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { workspaceId } = req.params;
      const userId = req.user!._id;

      // Import here to avoid circular dependency
      const Workspace = require('../models/Workspace').default;
      
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        res.status(404).json({
          success: false,
          message: 'Workspace not found.'
        });
        return;
      }

      const member = workspace.members.find((m: any) => 
        m.user.toString() === userId.toString() && m.status === 'active'
      );

      if (!member) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this workspace.'
        });
        return;
      }

      if (requiredRoles.length > 0 && !requiredRoles.includes(member.role)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions for this workspace.'
        });
        return;
      }

      req.workspaceMember = member;
      req.workspace = workspace;
      next();
    } catch (error: any) {
      console.error('Workspace role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during permission check.'
      });
    }
  };
};

// Check if user has specific role in project
export const checkProjectRole = (requiredRoles: string[] = []) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const userId = req.user!._id;

      // Import here to avoid circular dependency
      const Project = require('../models/Project').default;
      
      const project = await Project.findById(projectId);
      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found.'
        });
        return;
      }

      const member = project.teamMembers.find((m: any) => 
        m.user.toString() === userId.toString()
      );

      if (!member) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this project.'
        });
        return;
      }

      if (requiredRoles.length > 0 && !requiredRoles.includes(member.role)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions for this project.'
        });
        return;
      }

      req.projectMember = member;
      req.project = project;
      next();
    } catch (error: any) {
      console.error('Project role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during permission check.'
      });
    }
  };
};
