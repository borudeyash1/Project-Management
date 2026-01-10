import User from '../models/User';
import Task from '../models/Task';

/**
 * Updates user's performance ratings when a task is verified
 * @param userId - The ID of the user whose ratings should be updated
 * @param taskId - The ID of the verified task
 */
export const updateUserPerformanceRatings = async (userId: string, taskId: string): Promise<void> => {
  try {
    const task = await Task.findById(taskId);
    if (!task || !task.ratingDetails) {
      console.warn(`[PERFORMANCE] Task ${taskId} not found or has no ratings`);
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn(`[PERFORMANCE] User ${userId} not found`);
      return;
    }

    // Initialize performanceRatings if it doesn't exist
    if (!user.performanceRatings) {
      user.performanceRatings = {
        timeliness: { total: 0, count: 0, average: 0 },
        quality: { total: 0, count: 0, average: 0 },
        effort: { total: 0, count: 0, average: 0 },
        collaboration: { total: 0, count: 0, average: 0 },
        initiative: { total: 0, count: 0, average: 0 },
        learning: { total: 0, count: 0, average: 0 },
        compliance: { total: 0, count: 0, average: 0 },
        totalPoints: 0,
        totalTasks: 0,
        overallAverage: 0,
      };
    }

    const ratings = task.ratingDetails;
    const dimensions = ['timeliness', 'quality', 'effort', 'collaboration', 'initiative', 'learning', 'compliance'];

    let totalPoints = 0;
    let dimensionCount = 0;

    // Update each dimension
    for (const dimension of dimensions) {
      const rating = (ratings as any)[dimension];
      if (rating && rating > 0) {
        const dimRatings = (user.performanceRatings as any)[dimension];
        if (dimRatings) {
          dimRatings.total += rating;
          dimRatings.count += 1;
          dimRatings.average = dimRatings.total / dimRatings.count;
          
          totalPoints += rating;
          dimensionCount += 1;
        }
      }
    }

    // Update overall metrics
    user.performanceRatings.totalPoints = (user.performanceRatings.totalPoints || 0) + totalPoints;
    user.performanceRatings.totalTasks = (user.performanceRatings.totalTasks || 0) + 1;
    
    // Calculate overall average across all dimensions and all tasks
    const allDimensionTotals = dimensions.reduce((sum, dim) => {
      const dimRatings = (user.performanceRatings as any)[dim];
      return sum + (dimRatings?.total || 0);
    }, 0);
    
    const allDimensionCounts = dimensions.reduce((sum, dim) => {
      const dimRatings = (user.performanceRatings as any)[dim];
      return sum + (dimRatings?.count || 0);
    }, 0);
    
    user.performanceRatings.overallAverage = allDimensionCounts > 0 
      ? allDimensionTotals / allDimensionCounts 
      : 0;
    
    user.performanceRatings.lastUpdated = new Date();

    await user.save();
    
    console.log(`✅ [PERFORMANCE] Updated ratings for user ${userId}. Overall: ${user.performanceRatings.overallAverage.toFixed(2)}/5.0`);
  } catch (error) {
    console.error(`❌ [PERFORMANCE] Failed to update user ratings:`, error);
    throw error;
  }
};

/**
 * Get leaderboard for a workspace or project
 * @param workspaceId - Optional workspace ID to filter users
 * @param projectId - Optional project ID to filter users
 * @param limit - Maximum number of users to return
 */
export const getLeaderboard = async (
  workspaceId?: string,
  projectId?: string,
  limit: number = 10
): Promise<any[]> => {
  try {
    let userIds: string[] = [];

    if (projectId) {
      // Get users from project team members
      const Project = require('../models/Project').default;
      const project = await Project.findById(projectId);
      if (project) {
        userIds = project.teamMembers.map((m: any) => m.user.toString());
      }
    } else if (workspaceId) {
      // Get users from workspace members
      const Workspace = require('../models/Workspace').default;
      const workspace = await Workspace.findById(workspaceId);
      if (workspace) {
        userIds = workspace.members.map((m: any) => m.user.toString());
      }
    }

    const query = userIds.length > 0 ? { _id: { $in: userIds } } : {};

    const users = await User.find(query)
      .select('fullName email avatarUrl performanceRatings')
      .sort({ 'performanceRatings.overallAverage': -1, 'performanceRatings.totalTasks': -1 })
      .limit(limit);

    return users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      performanceRatings: user.performanceRatings,
    }));
  } catch (error) {
    console.error(`❌ [LEADERBOARD] Failed to get leaderboard:`, error);
    throw error;
  }
};
