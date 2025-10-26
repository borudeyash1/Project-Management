import { Request, Response } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';

// Get all users with pagination and filters
export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      subscription = '', 
      isActive = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};

    // Search filter
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    // Subscription filter
    if (subscription) {
      query['subscription.plan'] = subscription;
    }

    // Active status filter
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshTokens -emailVerificationOTP -loginOtp')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ]);

    console.log(`✅ [USER MANAGEMENT] Retrieved ${users.length} users (Total: ${total})`);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    console.error('❌ [USER MANAGEMENT] Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user by ID
export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -refreshTokens -emailVerificationOTP -loginOtp');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    console.log(`✅ [USER MANAGEMENT] Retrieved user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error: any) {
    console.error('❌ [USER MANAGEMENT] Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user details
export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.refreshTokens;
    delete updates.emailVerificationOTP;
    delete updates.loginOtp;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens -emailVerificationOTP -loginOtp');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    console.log(`✅ [USER MANAGEMENT] Updated user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error: any) {
    console.error('❌ [USER MANAGEMENT] Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update subscription
export const updateSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { plan, status, endDate, autoRenew, billingCycle } = req.body;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Update subscription details
    if (plan) user.subscription.plan = plan;
    if (status) user.subscription.status = status;
    if (endDate) user.subscription.endDate = new Date(endDate);
    if (typeof autoRenew === 'boolean') user.subscription.autoRenew = autoRenew;
    if (billingCycle) user.subscription.billingCycle = billingCycle;

    // Update features based on plan
    if (plan) {
      switch (plan) {
        case 'free':
          user.subscription.features = {
            maxWorkspaces: 1,
            maxProjects: 3,
            maxTeamMembers: 5,
            maxStorage: 1,
            aiAssistance: true,
            advancedAnalytics: false,
            customIntegrations: false,
            prioritySupport: false,
            whiteLabeling: false,
            apiAccess: false
          };
          user.subscription.isPro = false;
          break;
        case 'pro':
          user.subscription.features = {
            maxWorkspaces: 5,
            maxProjects: 20,
            maxTeamMembers: 20,
            maxStorage: 10,
            aiAssistance: true,
            advancedAnalytics: true,
            customIntegrations: true,
            prioritySupport: true,
            whiteLabeling: false,
            apiAccess: true
          };
          user.subscription.isPro = true;
          break;
        case 'ultra':
          user.subscription.features = {
            maxWorkspaces: 999,
            maxProjects: 999,
            maxTeamMembers: 999,
            maxStorage: 100,
            aiAssistance: true,
            advancedAnalytics: true,
            customIntegrations: true,
            prioritySupport: true,
            whiteLabeling: true,
            apiAccess: true
          };
          user.subscription.isPro = true;
          break;
      }
    }

    await user.save();

    console.log(`✅ [USER MANAGEMENT] Updated subscription for: ${user.email} to ${plan}`);

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        subscription: user.subscription
      }
    });
  } catch (error: any) {
    console.error('❌ [USER MANAGEMENT] Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    console.log(`✅ [USER MANAGEMENT] Toggled status for: ${user.email} to ${user.isActive ? 'active' : 'inactive'}`);

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        isActive: user.isActive
      }
    });
  } catch (error: any) {
    console.error('❌ [USER MANAGEMENT] Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete user
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    console.log(`✅ [USER MANAGEMENT] Deleted user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ [USER MANAGEMENT] Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user statistics
export const getUserStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      freeUsers,
      proUsers,
      ultraUsers,
      verifiedUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ 'subscription.plan': 'free' }),
      User.countDocuments({ 'subscription.plan': 'pro' }),
      User.countDocuments({ 'subscription.plan': 'ultra' }),
      User.countDocuments({ isEmailVerified: true })
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      verifiedUsers,
      subscriptions: {
        free: freeUsers,
        pro: proUsers,
        ultra: ultraUsers
      }
    };

    console.log('✅ [USER MANAGEMENT] Retrieved user statistics');

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: stats
    });
  } catch (error: any) {
    console.error('❌ [USER MANAGEMENT] Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reset user password (admin)
export const resetUserPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    user.password = newPassword;
    await user.save();

    console.log(`✅ [USER MANAGEMENT] Reset password for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    console.error('❌ [USER MANAGEMENT] Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify user email (admin)
export const verifyUserEmail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save();

    console.log(`✅ [USER MANAGEMENT] Verified email for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error: any) {
    console.error('❌ [USER MANAGEMENT] Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
