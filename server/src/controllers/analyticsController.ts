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

// Comprehensive admin analytics
export const getAnalyticsData = async (req: Request, res: Response) => {
  try {
    const User = require('../models/User').default;
    
    // Try to import Device/AllowedDevice model
    let Device;
    try {
      Device = require('../models/AllowedDevice').default;
    } catch (e) {
      console.log('AllowedDevice model not found, using fallback data');
      Device = null;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const usersToday = await User.countDocuments({ createdAt: { $gte: today } });
    const usersLast7Days = await User.countDocuments({ createdAt: { $gte: last7Days } });
    const usersLast30Days = await User.countDocuments({ createdAt: { $gte: last30Days } });

    // Active users (logged in recently)
    const activeToday = await User.countDocuments({ lastLogin: { $gte: today } });
    const activeLast7Days = await User.countDocuments({ lastLogin: { $gte: last7Days } });
    const activeLast30Days = await User.countDocuments({ lastLogin: { $gte: last30Days } });

    // Inactive users
    const inactive30Days = await User.countDocuments({ 
      lastLogin: { $lt: last30Days, $gte: last90Days } 
    });
    const inactive90Days = await User.countDocuments({ 
      $or: [
        { lastLogin: { $lt: last90Days } },
        { lastLogin: { $exists: false } }
      ]
    });

    // Calculate growth rates
    const usersLastWeek = await User.countDocuments({ 
      createdAt: { $gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), $lt: last7Days } 
    });
    const weeklyGrowthRate = usersLastWeek > 0 
      ? ((usersLast7Days - usersLastWeek) / usersLastWeek) * 100 
      : usersLast7Days > 0 ? 100 : 0;

    const usersYesterday = await User.countDocuments({ 
      createdAt: { $gte: new Date(today.getTime() - 24 * 60 * 60 * 1000), $lt: today } 
    });
    const dailyGrowthRate = usersYesterday > 0 
      ? ((usersToday - usersYesterday) / usersYesterday) * 100 
      : usersToday > 0 ? 100 : 0;

    // User growth trend (last 30 days)
    const userGrowthTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      
      const users = await User.countDocuments({ 
        createdAt: { $gte: startOfDay, $lt: endOfDay } 
      });
      
      userGrowthTrend.push({
        date: startOfDay.toISOString().split('T')[0],
        users
      });
    }

    // Engagement metrics
    const engagementRate = totalUsers > 0 ? (activeLast30Days / totalUsers) * 100 : 0;
    const retentionRate = totalUsers > 0 ? ((totalUsers - inactive90Days) / totalUsers) * 100 : 0;
    const churnRate = totalUsers > 0 ? (inactive90Days / totalUsers) * 100 : 0;

    // User distribution by activity
    const veryActive = await User.countDocuments({ lastLogin: { $gte: last7Days } });
    const active = await User.countDocuments({ 
      lastLogin: { $gte: last30Days, $lt: last7Days } 
    });
    const inactive = await User.countDocuments({ 
      lastLogin: { $gte: last90Days, $lt: last30Days } 
    });
    const dormant = inactive90Days;

    // Device statistics (with fallback)
    let totalDevices = 0;
    let activeDevices = 0;
    let lowRisk = 0;
    let mediumRisk = 0;
    let highRisk = 0;
    let criticalRisk = 0;
    let suspiciousDevices = 0;
    let blacklistedDevices = 0;
    let deviceActivityTrend = [];

    if (Device) {
      try {
        totalDevices = await Device.countDocuments();
        activeDevices = await Device.countDocuments({ 
          lastSeen: { $gte: last30Days } 
        });

        // Device risk levels (if field exists)
        lowRisk = await Device.countDocuments({ riskLevel: 'low' });
        mediumRisk = await Device.countDocuments({ riskLevel: 'medium' });
        highRisk = await Device.countDocuments({ riskLevel: 'high' });
        criticalRisk = await Device.countDocuments({ riskLevel: 'critical' });

        suspiciousDevices = await Device.countDocuments({ isSuspicious: true });
        blacklistedDevices = await Device.countDocuments({ isBlacklisted: true });

        // Device activity trend (last 30 days)
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
          
          const active = await Device.countDocuments({ 
            lastSeen: { $gte: startOfDay, $lt: endOfDay } 
          });
          
          deviceActivityTrend.push({
            date: startOfDay.toISOString().split('T')[0],
            active
          });
        }
      } catch (deviceError) {
        console.log('Error fetching device data, using defaults:', deviceError);
        // Use default values already set
      }
    } else {
      // Generate fallback device activity trend
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        deviceActivityTrend.push({
          date: startOfDay.toISOString().split('T')[0],
          active: 0
        });
      }
    }

    // Predictions (simple linear projection)
    const avgDailyGrowth = usersLast30Days / 30;
    const nextMonthUsers = Math.round(totalUsers + (avgDailyGrowth * 30));
    const growthRate = totalUsers > 0 ? (usersLast30Days / totalUsers) * 100 : 0;
    const trend = weeklyGrowthRate > 0 ? 'growing' : 'declining';

    const analyticsData = {
      overview: {
        totalUsers,
        usersToday,
        usersLast7Days,
        usersLast30Days,
        activeToday,
        activeLast7Days,
        activeLast30Days,
        inactive30Days,
        inactive90Days
      },
      growth: {
        dailyGrowthRate: parseFloat(dailyGrowthRate.toFixed(2)),
        weeklyGrowthRate: parseFloat(weeklyGrowthRate.toFixed(2)),
        avgDailyGrowth: avgDailyGrowth.toFixed(1),
        userGrowthTrend
      },
      engagement: {
        engagementRate: parseFloat(engagementRate.toFixed(2)),
        retentionRate: parseFloat(retentionRate.toFixed(2)),
        churnRate: parseFloat(churnRate.toFixed(2)),
        userDistribution: {
          veryActive,
          active,
          inactive,
          dormant
        }
      },
      devices: {
        total: totalDevices,
        active: activeDevices,
        byRisk: {
          low: lowRisk,
          medium: mediumRisk,
          high: highRisk,
          critical: criticalRisk
        },
        suspicious: suspiciousDevices,
        blacklisted: blacklistedDevices,
        activityTrend: deviceActivityTrend
      },
      predictions: {
        nextMonthUsers,
        growthRate: parseFloat(growthRate.toFixed(2)),
        trend
      }
    };

    console.log('✅ Analytics data generated successfully');
    res.status(200).json({ 
      success: true, 
      data: analyticsData 
    });
  } catch (error) {
    console.error('❌ Error fetching analytics data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics data',
      error: (error as Error).message 
    });
  }
};

export const getUserInsights = async (req: Request, res: Response) => {
  try {
    const User = require('../models/User').default;
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });

    res.status(200).json({ 
      success: true, 
      data: { totalUsers, activeUsers } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user insights' });
  }
};

export const getDetailedUserGrowth = async (req: Request, res: Response) => {
  try {
    const User = require('../models/User').default;
    
    // Get user growth data for last 90 days
    const growthData = [];
    for (let i = 89; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      
      const newUsers = await User.countDocuments({ 
        createdAt: { $gte: startOfDay, $lt: endOfDay } 
      });
      
      growthData.push({
        date: startOfDay.toISOString().split('T')[0],
        newUsers,
        cumulativeUsers: await User.countDocuments({ createdAt: { $lt: endOfDay } })
      });
    }

    res.status(200).json({ 
      success: true, 
      data: { growthData } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user growth details' });
  }
};

export const getDetailedDeviceActivity = async (req: Request, res: Response) => {
  try {
    let Device;
    try {
      Device = require('../models/AllowedDevice').default;
    } catch (e) {
      return res.status(200).json({ 
        success: true, 
        data: { 
          activityData: [],
          totalDevices: 0,
          activeDevices: 0
        } 
      });
    }

    const activityData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      
      const activeDevices = await Device.countDocuments({ 
        lastSeen: { $gte: startOfDay, $lt: endOfDay } 
      });
      
      activityData.push({
        date: startOfDay.toISOString().split('T')[0],
        activeDevices
      });
    }

    const totalDevices = await Device.countDocuments();
    const activeDevices = await Device.countDocuments({ 
      lastSeen: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });

    return res.status(200).json({ 
      success: true, 
      data: { activityData, totalDevices, activeDevices } 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch device activity details' });
  }
};

export const getDetailedUserDistribution = async (req: Request, res: Response) => {
  try {
    const User = require('../models/User').default;
    
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const veryActive = await User.countDocuments({ lastLogin: { $gte: last7Days } });
    const active = await User.countDocuments({ 
      lastLogin: { $gte: last30Days, $lt: last7Days } 
    });
    const inactive = await User.countDocuments({ 
      lastLogin: { $gte: last90Days, $lt: last30Days } 
    });
    const dormant = await User.countDocuments({ 
      $or: [
        { lastLogin: { $lt: last90Days } },
        { lastLogin: { $exists: false } }
      ]
    });

    res.status(200).json({ 
      success: true, 
      data: { 
        distribution: { veryActive, active, inactive, dormant },
        total: veryActive + active + inactive + dormant
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user distribution details' });
  }
};

export const getDetailedDeviceRisk = async (req: Request, res: Response) => {
  try {
    let Device;
    try {
      Device = require('../models/AllowedDevice').default;
    } catch (e) {
      return res.status(200).json({ 
        success: true, 
        data: { 
          riskLevels: { low: 0, medium: 0, high: 0, critical: 0 },
          total: 0
        } 
      });
    }

    const low = await Device.countDocuments({ riskLevel: 'low' });
    const medium = await Device.countDocuments({ riskLevel: 'medium' });
    const high = await Device.countDocuments({ riskLevel: 'high' });
    const critical = await Device.countDocuments({ riskLevel: 'critical' });

    return res.status(200).json({ 
      success: true, 
      data: { 
        riskLevels: { low, medium, high, critical },
        total: low + medium + high + critical
      } 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch device risk details' });
  }
};

export const getDetailedGrowthMetrics = async (req: Request, res: Response) => {
  try {
    const User = require('../models/User').default;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalUsers = await User.countDocuments();
    const usersToday = await User.countDocuments({ createdAt: { $gte: today } });
    const usersLast7Days = await User.countDocuments({ createdAt: { $gte: last7Days } });
    const usersLast30Days = await User.countDocuments({ createdAt: { $gte: last30Days } });

    const usersLastWeek = await User.countDocuments({ 
      createdAt: { $gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), $lt: last7Days } 
    });
    const weeklyGrowthRate = usersLastWeek > 0 
      ? ((usersLast7Days - usersLastWeek) / usersLastWeek) * 100 
      : usersLast7Days > 0 ? 100 : 0;

    const avgDailyGrowth = usersLast30Days / 30;

    res.status(200).json({ 
      success: true, 
      data: { 
        totalUsers,
        usersToday,
        usersLast7Days,
        usersLast30Days,
        weeklyGrowthRate: parseFloat(weeklyGrowthRate.toFixed(2)),
        avgDailyGrowth: parseFloat(avgDailyGrowth.toFixed(1))
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch growth metrics details' });
  }
};

export const getDetailedDeviceSecurity = async (req: Request, res: Response) => {
  try {
    let Device;
    try {
      Device = require('../models/AllowedDevice').default;
    } catch (e) {
      return res.status(200).json({ 
        success: true, 
        data: { 
          total: 0,
          active: 0,
          suspicious: 0,
          blacklisted: 0,
          securityScore: 100
        } 
      });
    }

    const total = await Device.countDocuments();
    const active = await Device.countDocuments({ 
      lastSeen: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });
    const suspicious = await Device.countDocuments({ isSuspicious: true });
    const blacklisted = await Device.countDocuments({ isBlacklisted: true });

    const securityScore = total > 0 
      ? ((total - suspicious - blacklisted) / total) * 100 
      : 100;

    return res.status(200).json({ 
      success: true, 
      data: { 
        total,
        active,
        suspicious,
        blacklisted,
        securityScore: parseFloat(securityScore.toFixed(1))
      } 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch device security details' });
  }
};
