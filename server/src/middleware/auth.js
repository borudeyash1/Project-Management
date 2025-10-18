const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// Verify refresh token
const authenticateRefresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required.'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }

    // Check if refresh token exists in user's refresh tokens
    const tokenExists = user.refreshTokens.some(token => token.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }

    req.user = user;
    req.refreshToken = refreshToken;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token has expired.'
      });
    }

    console.error('Refresh auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during refresh token authentication.'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
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
const checkWorkspaceRole = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.user._id;

      // Import here to avoid circular dependency
      const Workspace = require('../models/Workspace');
      
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({
          success: false,
          message: 'Workspace not found.'
        });
      }

      const member = workspace.members.find(m => 
        m.user.toString() === userId.toString() && m.status === 'active'
      );

      if (!member) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this workspace.'
        });
      }

      if (requiredRoles.length > 0 && !requiredRoles.includes(member.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions for this workspace.'
        });
      }

      req.workspaceMember = member;
      req.workspace = workspace;
      next();
    } catch (error) {
      console.error('Workspace role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during permission check.'
      });
    }
  };
};

// Check if user has specific role in project
const checkProjectRole = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const userId = req.user._id;

      // Import here to avoid circular dependency
      const Project = require('../models/Project');
      
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found.'
        });
      }

      const member = project.teamMembers.find(m => 
        m.user.toString() === userId.toString()
      );

      if (!member) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this project.'
        });
      }

      if (requiredRoles.length > 0 && !requiredRoles.includes(member.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions for this project.'
        });
      }

      req.projectMember = member;
      req.project = project;
      next();
    } catch (error) {
      console.error('Project role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during permission check.'
      });
    }
  };
};

module.exports = {
  authenticate,
  authenticateRefresh,
  optionalAuth,
  checkWorkspaceRole,
  checkProjectRole
};
