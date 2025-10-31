import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import User from '../models/User';
import AllowedDevice from '../models/AllowedDevice';
import DesktopRelease from '../models/DesktopRelease';

/**
 * Get comprehensive analytics data for admin dashboard
 */
export const getAnalyticsData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('📊 [ANALYTICS] Fetching comprehensive analytics...');

    // Time periods
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

    // User Analytics
    const totalUsers = await User.countDocuments();
    const usersToday = await User.countDocuments({ createdAt: { $gte: today } });
    const usersYesterday = await User.countDocuments({ 
      createdAt: { $gte: yesterday, $lt: today } 
    });
    const usersLast7Days = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const usersLast30Days = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const usersLast60Days = await User.countDocuments({ 
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
    });

    // Active Users
    const activeToday = await User.countDocuments({ lastLogin: { $gte: today } });
    const activeLast7Days = await User.countDocuments({ lastLogin: { $gte: sevenDaysAgo } });
    const activeLast30Days = await User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });

    // Inactive Users
    const inactive30Days = await User.countDocuments({
      lastLogin: { $lt: thirtyDaysAgo, $gte: ninetyDaysAgo }
    });
    const inactive90Days = await User.countDocuments({
      lastLogin: { $lt: ninetyDaysAgo }
    });

    // Growth Rate Calculations
    const dailyGrowthRate = usersYesterday > 0 
      ? ((usersToday - usersYesterday) / usersYesterday * 100).toFixed(2)
      : '0';
    
    const weeklyGrowthRate = usersLast60Days > 0
      ? ((usersLast30Days - usersLast60Days) / usersLast60Days * 100).toFixed(2)
      : '0';

    // User Growth Trend (last 30 days, day by day)
    const userGrowthTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const count = await User.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });
      userGrowthTrend.push({
        date: date.toISOString().split('T')[0],
        users: count
      });
    }

    // Device Security Analytics
    const devices = await AllowedDevice.find();
    const totalDevices = devices.length;
    const activeDevices = devices.filter(d => d.isActive).length;
    const devicesByRisk = {
      low: devices.filter(d => d.riskLevel === 'low').length,
      medium: devices.filter(d => d.riskLevel === 'medium').length,
      high: devices.filter(d => d.riskLevel === 'high').length,
      critical: devices.filter(d => d.riskLevel === 'critical').length
    };
    const suspiciousDevices = devices.filter(d => d.failedAttempts > 5).length;
    const blacklistedDevices = devices.filter(d => d.isBlacklisted).length;

    // Device Activity Trend (last 7 days)
    const deviceActivityTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const activeCount = devices.filter(d => 
        d.lastAccess && new Date(d.lastAccess) >= date && new Date(d.lastAccess) < nextDate
      ).length;
      deviceActivityTrend.push({
        date: date.toISOString().split('T')[0],
        active: activeCount
      });
    }

    // Release Analytics
    const releases = await DesktopRelease.find().sort({ createdAt: -1 });
    const totalReleases = releases.length;
    const latestRelease = releases[0];

    // Engagement Metrics
    const engagementRate = totalUsers > 0 
      ? ((activeLast30Days / totalUsers) * 100).toFixed(2)
      : '0';
    
    const retentionRate = usersLast30Days > 0
      ? ((activeLast30Days / usersLast30Days) * 100).toFixed(2)
      : '0';

    const churnRate = totalUsers > 0
      ? ((inactive90Days / totalUsers) * 100).toFixed(2)
      : '0';

    // Predictive Analytics
    const avgDailyGrowth = usersLast30Days / 30;
    const predictedUsersNextMonth = Math.round(totalUsers + (avgDailyGrowth * 30));
    const predictedGrowthRate = totalUsers > 0
      ? ((predictedUsersNextMonth - totalUsers) / totalUsers * 100).toFixed(2)
      : '0';

    // User Distribution by Activity
    const userDistribution = {
      veryActive: activeLast7Days,
      active: activeLast30Days - activeLast7Days,
      inactive: inactive30Days,
      dormant: inactive90Days
    };

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
        dailyGrowthRate: parseFloat(dailyGrowthRate),
        weeklyGrowthRate: parseFloat(weeklyGrowthRate),
        avgDailyGrowth: avgDailyGrowth.toFixed(2),
        userGrowthTrend
      },
      engagement: {
        engagementRate: parseFloat(engagementRate),
        retentionRate: parseFloat(retentionRate),
        churnRate: parseFloat(churnRate),
        userDistribution
      },
      devices: {
        total: totalDevices,
        active: activeDevices,
        byRisk: devicesByRisk,
        suspicious: suspiciousDevices,
        blacklisted: blacklistedDevices,
        activityTrend: deviceActivityTrend
      },
      releases: {
        total: totalReleases,
        latest: latestRelease ? {
          version: latestRelease.version,
          date: latestRelease.createdAt
        } : null
      },
      predictions: {
        nextMonthUsers: predictedUsersNextMonth,
        growthRate: parseFloat(predictedGrowthRate),
        trend: parseFloat(predictedGrowthRate) > 0 ? 'growing' : 'declining'
      },
      timestamp: new Date()
    };

    console.log('✅ [ANALYTICS] Analytics data compiled successfully');

    res.status(200).json({
      success: true,
      data: analyticsData
    });
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
};

/**
 * Get user insights with detailed breakdown
 */
export const getUserInsights = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('👥 [ANALYTICS] Fetching user insights...');

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const total = await User.countDocuments();
    const active = await User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });
    const inactive = await User.countDocuments({ 
      lastLogin: { $lt: thirtyDaysAgo, $gte: ninetyDaysAgo } 
    });
    const dormant = await User.countDocuments({ 
      $or: [
        { lastLogin: { $lt: ninetyDaysAgo } },
        { lastLogin: { $exists: false } }
      ]
    });
    const recentSignups = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    const insights = {
      total,
      active,
      inactive,
      dormant,
      recentSignups
    };

    res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error: any) {
    console.error('❌ [ANALYTICS] User insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user insights'
    });
  }
};

export default {
  getAnalyticsData,
  getUserInsights
};
