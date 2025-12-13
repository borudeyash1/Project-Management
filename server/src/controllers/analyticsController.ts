import { Request, Response } from 'express';
import Task from '../models/Task';

/**
 * Get employee performance analytics
 * Aggregates all verified task ratings for a specific employee
 */
export const getEmployeePerformanceAnalytics = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    // Get all verified tasks for this employee
    const verifiedTasks = await Task.find({
      assignee: employeeId,
      status: 'verified',
      rating: { $exists: true }
    }).select('rating ratingDetails verifiedAt title');

    if (verifiedTasks.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalVerifiedTasks: 0,
          averageRating: 0,
          dimensionAverages: {},
          ratingDistribution: {},
          recentTasks: [],
          performanceTrend: []
        }
      });
    }

    // Calculate overall statistics
    const totalTasks = verifiedTasks.length;
    const totalRating = verifiedTasks.reduce((sum, task) => {
      const rating = task.rating as number || 0;
      return sum + rating;
    }, 0);
    const averageRating = totalRating / totalTasks;

    // Calculate dimension averages
    const dimensionTotals: any = {
      timeliness: 0,
      quality: 0,
      effort: 0,
      accuracy: 0,
      collaboration: 0,
      initiative: 0,
      reliability: 0,
      learning: 0,
      compliance: 0
    };

    const dimensionCounts: any = {
      timeliness: 0,
      quality: 0,
      effort: 0,
      accuracy: 0,
      collaboration: 0,
      initiative: 0,
      reliability: 0,
      learning: 0,
      compliance: 0
    };

    verifiedTasks.forEach(task => {
      if (task.ratingDetails) {
        Object.keys(dimensionTotals).forEach(dimension => {
          const value = (task.ratingDetails as any)[dimension];
          if (value !== undefined && value !== null) {
            dimensionTotals[dimension] += value;
            dimensionCounts[dimension]++;
          }
        });
      }
    });

    const dimensionAverages: any = {};
    Object.keys(dimensionTotals).forEach(dimension => {
      if (dimensionCounts[dimension] > 0) {
        dimensionAverages[dimension] = dimensionTotals[dimension] / dimensionCounts[dimension];
      } else {
        dimensionAverages[dimension] = 0;
      }
    });

    // Calculate rating distribution
    const ratingDistribution = {
      excellent: verifiedTasks.filter(t => {
        const rating = t.rating as number || 0;
        return rating >= 4.5;
      }).length,
      good: verifiedTasks.filter(t => {
        const rating = t.rating as number || 0;
        return rating >= 3.5 && rating < 4.5;
      }).length,
      average: verifiedTasks.filter(t => {
        const rating = t.rating as number || 0;
        return rating >= 2.5 && rating < 3.5;
      }).length,
      belowAverage: verifiedTasks.filter(t => {
        const rating = t.rating as number || 0;
        return rating < 2.5;
      }).length
    };

    // Get recent tasks (last 5)
    const recentTasks = verifiedTasks
      .sort((a, b) => {
        const dateA = new Date(a.verifiedAt as Date).getTime();
        const dateB = new Date(b.verifiedAt as Date).getTime();
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(task => ({
        title: task.title,
        rating: task.rating,
        verifiedAt: task.verifiedAt
      }));

    // Calculate performance trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData: any = {};
    verifiedTasks.forEach(task => {
      const verifiedDate = task.verifiedAt as Date;
      if (verifiedDate && new Date(verifiedDate) >= sixMonthsAgo) {
        const monthKey = new Date(verifiedDate).toISOString().substring(0, 7); // YYYY-MM
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { total: 0, count: 0 };
        }
        const rating = task.rating as number || 0;
        monthlyData[monthKey].total += rating;
        monthlyData[monthKey].count++;
      }
    });

    const performanceTrend = Object.keys(monthlyData)
      .sort()
      .map(month => ({
        month,
        averageRating: monthlyData[month].total / monthlyData[month].count,
        taskCount: monthlyData[month].count
      }));

    // Find strengths and areas for improvement
    const sortedDimensions = Object.entries(dimensionAverages)
      .sort(([, a], [, b]) => (b as number) - (a as number));

    const strengths = sortedDimensions.slice(0, 3).map(([dimension]) => dimension);
    const improvements = sortedDimensions.slice(-3).map(([dimension]) => dimension);

    return res.status(200).json({
      success: true,
      data: {
        totalVerifiedTasks: totalTasks,
        averageRating: parseFloat(averageRating.toFixed(2)),
        dimensionAverages,
        ratingDistribution,
        recentTasks,
        performanceTrend,
        strengths,
        improvements
      }
    });
  } catch (error) {
    console.error('Error fetching employee performance analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch performance analytics'
    });
  }
};

// Stub functions for admin analytics (to be implemented if needed)
export const getAnalyticsData = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: {} });
};

export const getUserInsights = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: {} });
};

export const getDetailedUserGrowth = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: {} });
};

export const getDetailedDeviceActivity = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: {} });
};

export const getDetailedUserDistribution = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: {} });
};

export const getDetailedDeviceRisk = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: {} });
};

export const getDetailedGrowthMetrics = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: {} });
};

export const getDetailedDeviceSecurity = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: {} });
};
