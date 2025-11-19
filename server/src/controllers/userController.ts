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
    const { fullName, contactNumber, designation, department, location, about } = req.body;
    const user = req.user!;

    // Update fields
    if (fullName) user.fullName = fullName;
    if (contactNumber) user.contactNumber = contactNumber;
    if (designation) user.designation = designation;
    if (department) user.department = department;
    if (location) user.location = location;
    if (about) user.about = about;

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
