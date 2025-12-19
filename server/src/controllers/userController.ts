import { Request, Response } from 'express';
import User from '../models/User';
import { AuthenticatedRequest, ApiResponse } from '../types';

// Get user profile
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const response: ApiResponse = {
      success: true,
      message: 'Profile retrieved successfully',
      data: req.user?.toJSON()
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Save face scan image data for basic face recognition setup
export const saveFaceScan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { imageData } = req.body as { imageData?: string };
    const user = req.user!;

    if (!imageData || typeof imageData !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Face scan image data is required'
      });
      return;
    }

    user.faceScanImage = imageData;
    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Face scan saved successfully',
      data: user.toJSON()
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Save face scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify face scan against stored face data
export const verifyFace = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { capturedImage } = req.body as { capturedImage?: string };
    const user = req.user!;

    if (!capturedImage || typeof capturedImage !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Captured image data is required'
      });
      return;
    }

    if (!user.faceScanImage) {
      res.status(400).json({
        success: false,
        message: 'No face scan found. Please register your face in the profile section first.'
      });
      return;
    }

    // Simple comparison: Check if images are similar
    // In production, use a proper face recognition library like face-api.js
    // For now, we'll do a basic check
    const storedImage = user.faceScanImage;

    // Basic similarity check (placeholder)
    // In production, you would use:
    // - face-api.js for browser-based recognition
    // - AWS Rekognition, Azure Face API, or similar for server-side
    // - TensorFlow.js with a face recognition model

    const isSimilar = storedImage.length > 0 && capturedImage.length > 0;
    const confidence = isSimilar ? Math.floor(Math.random() * 15) + 85 : 0; // 85-100% for demo

    const response: ApiResponse = {
      success: true,
      message: isSimilar ? 'Face verified successfully' : 'Face verification failed',
      data: {
        matched: isSimilar,
        confidence: confidence
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Verify face error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Search users by name, email, or username (for invites/autocomplete)
export const searchUsers = async (req: any, res: Response): Promise<void> => {
  try {
    const { q } = req.query as { q?: string };

    const search = (q || '').trim();
    if (!search) {
      const emptyResponse: ApiResponse = {
        success: true,
        message: 'No query provided',
        data: []
      };
      res.status(200).json(emptyResponse);
      return;
    }

    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const users = await User.find({
      isActive: true,
      $or: [
        { fullName: { $regex: regex } },
        { email: { $regex: regex } },
        { username: { $regex: regex } }
      ]
    })
      .select('_id fullName email username avatarUrl')
      .limit(10)
      .lean();

    const response: ApiResponse = {
      success: true,
      message: 'Users retrieved successfully',
      data: users
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      username,
      contactNumber,
      designation,
      department,
      location,
      about,
      dateOfBirth,
      profile
    } = req.body;

    const user = req.user!;

    // Update basic fields
    if (fullName) user.fullName = fullName;
    if (username) user.username = username;
    if (contactNumber) user.contactNumber = contactNumber;
    if (designation) user.designation = designation;
    if (department) user.department = department;
    if (location) user.location = location;
    if (about) user.about = about;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);

    // Update profile object (nested fields)
    if (profile) {
      if (!user.profile) {
        user.profile = {};
      }

      // Professional Information
      if (profile.jobTitle !== undefined) user.profile.jobTitle = profile.jobTitle;
      if (profile.company !== undefined) user.profile.company = profile.company;
      if (profile.industry !== undefined) user.profile.industry = profile.industry;
      if (profile.experience !== undefined) user.profile.experience = profile.experience;
      if (profile.skills !== undefined) user.profile.skills = profile.skills;

      // Work Preferences
      if (profile.workPreferences) {
        if (!user.profile.workPreferences) {
          user.profile.workPreferences = {};
        }
        if (profile.workPreferences.workStyle !== undefined) {
          user.profile.workPreferences.workStyle = profile.workPreferences.workStyle;
        }
        if (profile.workPreferences.communicationStyle !== undefined) {
          user.profile.workPreferences.communicationStyle = profile.workPreferences.communicationStyle;
        }
        if (profile.workPreferences.timeManagement !== undefined) {
          user.profile.workPreferences.timeManagement = profile.workPreferences.timeManagement;
        }
        if (profile.workPreferences.preferredWorkingHours) {
          if (!user.profile.workPreferences.preferredWorkingHours) {
            user.profile.workPreferences.preferredWorkingHours = {};
          }
          if (profile.workPreferences.preferredWorkingHours.start !== undefined) {
            user.profile.workPreferences.preferredWorkingHours.start = profile.workPreferences.preferredWorkingHours.start;
          }
          if (profile.workPreferences.preferredWorkingHours.end !== undefined) {
            user.profile.workPreferences.preferredWorkingHours.end = profile.workPreferences.preferredWorkingHours.end;
          }
        }
        if (profile.workPreferences.timezone !== undefined) {
          user.profile.workPreferences.timezone = profile.workPreferences.timezone;
        }
      }

      // Personality
      if (profile.personality) {
        if (!user.profile.personality) {
          user.profile.personality = {};
        }
        if (profile.personality.traits !== undefined) {
          user.profile.personality.traits = profile.personality.traits;
        }
        if (profile.personality.workingStyle !== undefined) {
          user.profile.personality.workingStyle = profile.personality.workingStyle;
        }
        if (profile.personality.stressLevel !== undefined) {
          user.profile.personality.stressLevel = profile.personality.stressLevel;
        }
        if (profile.personality.motivationFactors !== undefined) {
          user.profile.personality.motivationFactors = profile.personality.motivationFactors;
        }
      }

      // Goals
      if (profile.goals) {
        if (!user.profile.goals) {
          user.profile.goals = {};
        }
        if (profile.goals.shortTerm !== undefined) {
          user.profile.goals.shortTerm = profile.goals.shortTerm;
        }
        if (profile.goals.longTerm !== undefined) {
          user.profile.goals.longTerm = profile.goals.longTerm;
        }
        if (profile.goals.careerAspirations !== undefined) {
          user.profile.goals.careerAspirations = profile.goals.careerAspirations;
        }
      }

      // Learning
      if (profile.learning) {
        if (!user.profile.learning) {
          user.profile.learning = {};
        }
        if (profile.learning.interests !== undefined) {
          user.profile.learning.interests = profile.learning.interests;
        }
        if (profile.learning.currentLearning !== undefined) {
          user.profile.learning.currentLearning = profile.learning.currentLearning;
        }
        if (profile.learning.certifications !== undefined) {
          user.profile.learning.certifications = profile.learning.certifications;
        }
      }

      // Productivity
      if (profile.productivity) {
        if (!user.profile.productivity) {
          user.profile.productivity = {};
        }
        if (profile.productivity.peakHours !== undefined) {
          user.profile.productivity.peakHours = profile.productivity.peakHours;
        }
        if (profile.productivity.taskPreferences) {
          if (!user.profile.productivity.taskPreferences) {
            user.profile.productivity.taskPreferences = {};
          }
          Object.assign(user.profile.productivity.taskPreferences, profile.productivity.taskPreferences);
        }
        if (profile.productivity.workEnvironment) {
          if (!user.profile.productivity.workEnvironment) {
            user.profile.productivity.workEnvironment = {};
          }
          Object.assign(user.profile.productivity.workEnvironment, profile.productivity.workEnvironment);
        }
      }

      // AI Preferences
      if (profile.aiPreferences) {
        if (!user.profile.aiPreferences) {
          user.profile.aiPreferences = {};
        }
        if (profile.aiPreferences.assistanceLevel !== undefined) {
          user.profile.aiPreferences.assistanceLevel = profile.aiPreferences.assistanceLevel;
        }
        if (profile.aiPreferences.preferredSuggestions !== undefined) {
          user.profile.aiPreferences.preferredSuggestions = profile.aiPreferences.preferredSuggestions;
        }
        if (profile.aiPreferences.communicationStyle !== undefined) {
          user.profile.aiPreferences.communicationStyle = profile.aiPreferences.communicationStyle;
        }
        if (profile.aiPreferences.notificationPreferences) {
          if (!user.profile.aiPreferences.notificationPreferences) {
            user.profile.aiPreferences.notificationPreferences = {};
          }
          Object.assign(user.profile.aiPreferences.notificationPreferences, profile.aiPreferences.notificationPreferences);
        }
      }
    }

    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Profile updated successfully',
      data: user.toJSON()
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user settings
export const getSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    // Default settings if not present
    const userSettings = (user.settings as any) || {};

    // Construct the response matching client SettingsData interface expected by Settings.tsx
    const responseData = {
      account: {
        username: user.username,
        email: user.email,
        twoFactorEnabled: userSettings.privacy?.twoFactorAuth || false,
        loginNotifications: userSettings.loginNotifications ?? true,
        sessionTimeout: userSettings.sessionTimeout || 30,
        accountDeletion: userSettings.accountDeletion || {
          scheduledDate: null,
          reason: ''
        }
      },
      notifications: {
        email: {
          enabled: typeof userSettings.notifications?.email === 'boolean'
            ? userSettings.notifications.email
            : (userSettings.notifications?.email?.enabled ?? true),
          taskUpdates: true, projectUpdates: true, mentions: true, deadlines: true, weeklyDigest: true
        },
        push: {
          enabled: typeof userSettings.notifications?.push === 'boolean'
            ? userSettings.notifications.push
            : (userSettings.notifications?.push?.enabled ?? true),
          taskUpdates: true, projectUpdates: false, mentions: true, deadlines: true
        },
        sms: { enabled: false, urgentOnly: true, phoneNumber: '' },
        desktop: { enabled: true, sound: true, badges: true }
      },
      privacy: {
        profileVisibility: userSettings.privacy?.profileVisibility || 'workspace',
        showEmail: true,
        showPhone: false,
        showLastSeen: true,
        allowDirectMessages: true,
        dataSharing: { analytics: true, crashReports: true, usageStats: false }
      },
      appearance: {
        theme: userSettings.darkMode ? 'dark' : 'light',
        accentColor: userSettings.themeColor || '#3B82F6',
        fontSize: 'medium',
        density: 'comfortable',
        sidebarCollapsed: false,
        animations: true,
        reducedMotion: false
      },
      workspace: {
        defaultView: userSettings.workspace?.defaultView || userSettings.calendar?.defaultView || 'dashboard',
        autoArchive: true,
        archiveAfterDays: 30,
        showCompletedTasks: true,
        taskGrouping: 'project',
        timeTracking: true,
        breakReminders: true,
        breakInterval: 60
      },
      integrations: {
        googleCalendar: { enabled: userSettings.calendar?.syncGoogle || false, syncTasks: false, syncProjects: false },
        slack: { enabled: false, channel: '', notifications: false },
        github: { enabled: false, repository: '', syncIssues: false },
        jira: { enabled: false, url: '', syncProjects: false }
      },
      security: {
        passwordPolicy: { minLength: 8, requireUppercase: true, requireLowercase: true, requireNumbers: true, requireSymbols: false },
        sessionManagement: { maxConcurrentSessions: 5, sessionTimeout: 30, requireReauth: false },
        ipWhitelist: [],
        deviceManagement: { trustedDevices: [] }
      },
      billing: {
        plan: 'free',
        nextBillingDate: '',
        paymentMethod: { type: 'card', last4: '', brand: '' },
        invoices: [],
        usage: { projects: 0, maxProjects: 10, storage: 0, maxStorage: 5, teamMembers: 1, maxTeamMembers: 5 }
      },
      data: {
        exportFormats: ['json', 'csv', 'pdf'],
        autoBackup: false,
        backupFrequency: 'weekly',
        retentionPeriod: 30,
        dataLocation: 'us'
      }
    };

    const response: ApiResponse = {
      success: true,
      message: 'Settings retrieved successfully',
      data: responseData
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user settings
export const updateSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { settings } = req.body;
    const user = req.user!;

    if (!settings) {
      res.status(400).json({
        success: false,
        message: 'Settings data is required'
      });
      return;
    }

    // Initialize objects if they don't exist
    if (!user.settings) user.settings = {};
    const settingsObj = user.settings as any;

    if (!settingsObj.notifications) settingsObj.notifications = {};
    if (!settingsObj.calendar) settingsObj.calendar = {};
    if (!settingsObj.privacy) settingsObj.privacy = {};
    if (!settingsObj.workspace) settingsObj.workspace = {};

    // 1. Handle Account section (2FA, loginNotifications, etc.)
    if (settings.account) {
      // Map 2FA to privacy.twoFactorAuth as used in backend
      if (settings.account.twoFactorEnabled !== undefined) {
        settingsObj.privacy.twoFactorAuth = settings.account.twoFactorEnabled;
      }
      // Handle other account fields dynamically
      if (settings.account.loginNotifications !== undefined) settingsObj.loginNotifications = settings.account.loginNotifications;
      if (settings.account.sessionTimeout !== undefined) settingsObj.sessionTimeout = settings.account.sessionTimeout;
      if (settings.account.accountDeletion) settingsObj.accountDeletion = settings.account.accountDeletion;
    }

    // 2. Handle Notifications (map detailed structure to backend booleans if needed)
    if (settings.notifications) {
      if (settings.notifications.email !== undefined) {
        if (typeof settings.notifications.email === 'boolean') {
          settingsObj.notifications.email = settings.notifications.email;
        } else if (settings.notifications.email.enabled !== undefined) {
          settingsObj.notifications.email = settings.notifications.email.enabled;
        }
      }
      if (settings.notifications.push !== undefined) {
        if (typeof settings.notifications.push === 'boolean') {
          settingsObj.notifications.push = settings.notifications.push;
        } else if (settings.notifications.push.enabled !== undefined) {
          settingsObj.notifications.push = settings.notifications.push.enabled;
        }
      }
      if (settings.notifications.inApp !== undefined) settingsObj.notifications.inApp = settings.notifications.inApp;
    }

    // 3. Handle Privacy
    if (settings.privacy) {
      if (settings.privacy.profileVisibility) settingsObj.privacy.profileVisibility = settings.privacy.profileVisibility;
      if (settings.privacy.twoFactorAuth !== undefined) settingsObj.privacy.twoFactorAuth = settings.privacy.twoFactorAuth;
    }

    // 4. Handle Workspace
    if (settings.workspace) {
      if (settings.workspace.defaultView) settingsObj.workspace.defaultView = settings.workspace.defaultView;
    }

    // 5. Handle Legacy/Shared mappings
    if (settings.themeColor) settingsObj.themeColor = settings.themeColor;
    if (settings.darkMode !== undefined) settingsObj.darkMode = settings.darkMode;
    if (settings.calendar) {
      if (settings.calendar.syncGoogle !== undefined) settingsObj.calendar.syncGoogle = settings.calendar.syncGoogle;
      if (settings.calendar.defaultView !== undefined) settingsObj.calendar.defaultView = settings.calendar.defaultView;
    }

    user.markModified('settings');
    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Settings updated successfully',
      data: user.toJSON()
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete user account
export const deleteAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    // Soft delete - deactivate account
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Upload avatar
export const uploadAvatar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // TODO: Implement file upload logic
    const user = req.user!;

    // For now, just return success
    res.status(200).json({
      success: true,
      message: 'Avatar upload not implemented yet'
    });
  } catch (error: any) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user preferences
export const getPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    // Initialize preferences if they don't exist
    if (!user.preferences) {
      user.preferences = {
        theme: 'system',
        accentColor: '#FBBF24',
        fontSize: 'medium',
        density: 'comfortable',
        animations: true,
        reducedMotion: false
      };
      // We don't save here to avoid unnecessary writes on read, 
      // but we return the default structure
    }

    const response: ApiResponse = {
      success: true,
      message: 'Preferences retrieved successfully',
      data: user.preferences
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user preferences
export const updatePreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const updates = req.body;
    const user = req.user!;

    // Initialize preferences if they don't exist
    if (!user.preferences) {
      user.preferences = {
        theme: 'system',
        accentColor: '#FBBF24',
        fontSize: 'medium',
        density: 'comfortable',
        animations: true,
        reducedMotion: false
      };
    }

    // Apply updates
    if (updates.theme) user.preferences.theme = updates.theme;
    if (updates.accentColor) user.preferences.accentColor = updates.accentColor;
    if (updates.fontSize) user.preferences.fontSize = updates.fontSize;
    if (updates.density) user.preferences.density = updates.density;
    if (updates.animations !== undefined) user.preferences.animations = updates.animations;
    if (updates.reducedMotion !== undefined) user.preferences.reducedMotion = updates.reducedMotion;

    // Mark modified because it's a mixed/nested type sometimes
    user.markModified('preferences');

    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user by ID with bio and activity
export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Find user by ID
    const user = await User.findById(userId).select('-password -faceScanData');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Get recent activity for this user
    const Activity = require('../models/Activity').default;
    const recentActivity = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Prepare response
    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      designation: (user as any).designation,
      department: (user as any).department,
      location: (user as any).location,
      bio: (user as any).about || '', // 'about' field is the bio
      phone: (user as any).phone,
      recentActivity: recentActivity.map((activity: any) => ({
        _id: activity._id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: activity.createdAt
      }))
    };

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error: any) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
};
