import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '@/models/User';
import { AuthenticatedRequest, ApiResponse, AuthResponse, LoginRequest, RegisterRequest, JWTPayload } from '@/types';

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
};

// Generate refresh token
const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '30d' });
};

// Register user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, username, email, contactNumber, password, profile }: RegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
      return;
    }

    // Create user with enhanced profile data
    const user = new User({
      fullName,
      username,
      email,
      contactNumber,
      password,
      profile: profile || {}
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;

    await user.save();

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    // Save refresh token
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    // TODO: Send verification email

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON() as any,
        accessToken,
        refreshToken
      }
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email }, { username: email }]
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Update last login and track login information
    user.lastLogin = new Date();
    
    // Get client information
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    const machineId = req.get('X-Machine-ID') || 'unknown';
    const macAddress = req.get('X-MAC-Address') || 'unknown';
    
    // Add to login history
    if (!user.loginHistory) {
      user.loginHistory = [];
    }
    user.loginHistory.push({
      ipAddress,
      userAgent,
      machineId,
      macAddress,
      loginTime: new Date(),
      location: {
        country: 'Unknown',
        city: 'Unknown',
        region: 'Unknown'
      }
    });
    
    // Keep only last 10 login records
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }
    
    await user.save();

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    // Save refresh token
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON() as any,
        accessToken,
        refreshToken
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Logout user
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      req.user?.removeRefreshToken(refreshToken);
      await req.user?.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

// Refresh token
export const refreshToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const user = req.user!;

    // Remove old refresh token
    user.removeRefreshToken(refreshToken);

    // Generate new tokens
    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    
    // Save new refresh token
    user.refreshTokens.push({ token: newRefreshToken, createdAt: new Date() });
    await user.save();

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: user.toJSON(),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh'
    });
  }
};

// Get current user
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const response: ApiResponse = {
      success: true,
      message: 'User retrieved successfully',
      data: req.user?.toJSON()
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // TODO: Send reset email

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
      return;
    }

    // Update password
    user.set('password', password);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Google OAuth authentication
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, name, email, imageUrl, accessToken, idToken, password } = req.body;

    // Verify Google ID token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
    } catch (error) {
      console.error('Google token verification failed:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid Google token'
      });
      return;
    }

    const payload = ticket.getPayload();
    if (!payload || payload.email !== email) {
      res.status(400).json({
        success: false,
        message: 'Google token verification failed'
      });
      return;
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with Google data
      const username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);
      
      user = new User({
        fullName: name,
        username,
        email,
        password: password || crypto.randomBytes(16).toString('hex'), // Use provided password or generate random
        avatarUrl: imageUrl,
        isEmailVerified: true,
        profile: {
          jobTitle: '',
          company: '',
          experience: 'mid',
          skills: [],
          workPreferences: {
            workStyle: 'mixed',
            communicationStyle: 'direct',
            timeManagement: 'structured',
            preferredWorkingHours: {
              start: '09:00',
              end: '17:00'
            },
            timezone: 'UTC'
          },
          personality: {
            traits: [],
            workingStyle: 'results-driven',
            stressLevel: 'medium',
            motivationFactors: ['growth', 'challenge']
          },
          goals: {
            shortTerm: [],
            longTerm: [],
            careerAspirations: ''
          },
          learning: {
            interests: [],
            currentLearning: [],
            certifications: []
          },
          productivity: {
            peakHours: [],
            taskPreferences: {
              preferredTaskTypes: [],
              taskComplexity: 'mixed',
              deadlineSensitivity: 'moderate'
            },
            workEnvironment: {
              preferredEnvironment: 'moderate',
              collaborationPreference: 'medium'
            }
          },
          aiPreferences: {
            assistanceLevel: 'moderate',
            preferredSuggestions: ['task-prioritization', 'time-estimation'],
            communicationStyle: 'friendly',
            notificationPreferences: {
              taskReminders: true,
              deadlineAlerts: true,
              productivityInsights: true,
              skillRecommendations: true
            }
          }
        }
      });

      await user.save();
    } else {
      // Update existing user with Google data if needed
      if (!user.avatarUrl && imageUrl) {
        user.avatarUrl = imageUrl;
      }
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
      }
      await user.save();
    }

    // Update last login and track login information
    user.lastLogin = new Date();
    
    // Get client information
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    const machineId = req.get('X-Machine-ID') || 'unknown';
    const macAddress = req.get('X-MAC-Address') || 'unknown';
    
    // Add to login history
    if (!user.loginHistory) {
      user.loginHistory = [];
    }
    user.loginHistory.push({
      ipAddress,
      userAgent,
      machineId,
      macAddress,
      loginTime: new Date(),
      location: {
        country: 'Unknown',
        city: 'Unknown',
        region: 'Unknown'
      }
    });
    
    // Keep only last 10 login records
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }
    
    await user.save();

    // Generate tokens
    const jwtAccessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    // Save refresh token
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'Google authentication successful',
      data: {
        user: user.toJSON() as any,
        accessToken: jwtAccessToken,
        refreshToken
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Google authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during Google authentication'
    });
  }
};
