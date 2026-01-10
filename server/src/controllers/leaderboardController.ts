import { Request, Response } from 'express';
import { getLeaderboard } from '../utils/performanceRatings';
import User from '../models/User';

/**
 * GET /api/leaderboard/workspace/:workspaceId
 * Get leaderboard for a specific workspace
 */
export const getWorkspaceLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const leaderboard = await getLeaderboard(workspaceId, undefined, limit);

    res.status(200).json({
      success: true,
      message: 'Workspace leaderboard fetched successfully',
      data: leaderboard,
    });
  } catch (error: any) {
    console.error('Get workspace leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching workspace leaderboard',
    });
  }
};

/**
 * GET /api/leaderboard/project/:projectId
 * Get leaderboard for a specific project
 */
export const getProjectLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const leaderboard = await getLeaderboard(undefined, projectId, limit);

    res.status(200).json({
      success: true,
      message: 'Project leaderboard fetched successfully',
      data: leaderboard,
    });
  } catch (error: any) {
    console.error('Get project leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching project leaderboard',
    });
  }
};

/**
 * GET /api/leaderboard/user/:userId
 * Get performance ratings for a specific user
 */
export const getUserPerformanceRatings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('fullName email avatarUrl performanceRatings');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User performance ratings fetched successfully',
      data: {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        performanceRatings: user.performanceRatings,
      },
    });
  } catch (error: any) {
    console.error('Get user performance ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching user performance ratings',
    });
  }
};
