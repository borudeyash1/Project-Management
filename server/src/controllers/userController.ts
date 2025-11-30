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

// Update user settings
export const updateSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { settings } = req.body;
    const user = req.user!;

    // Update settings
    user.settings = { ...user.settings, ...settings };
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

