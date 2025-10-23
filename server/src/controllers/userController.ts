import { Response } from 'express';
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
