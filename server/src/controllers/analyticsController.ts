import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import User from '../models/User';
import AllowedDevice from '../models/AllowedDevice';
import DesktopRelease from '../models/DesktopRelease';

// Simple in-memory cache for analytics data (2 minute TTL)
interface AnalyticsCache {
  data: any;
  timestamp: number;
}
let analyticsCache: AnalyticsCache | null = null;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

/**
 * Get comprehensive analytics data for admin dashboard
 */
export const getAnalyticsData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check cache first
    const currentCache = analyticsCache;
    if (currentCache && (Date.now() - currentCache.timestamp) < CACHE_TTL) {
      console.log('✅ [ANALYTICS] Returning cached data');
      res.status(200).json({
        success: true,
        data: currentCache.data,
        cached: true
      });
      return;
    }

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

    // User Growth Trend (last 30 days, day by day) - OPTIMIZED with aggregation
    const userGrowthTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          users: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill in missing days with 0 users
    const growthTrendMap = new Map(userGrowthTrend.map(item => [item._id, item.users]));
    const userGrowthTrendFilled = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      userGrowthTrendFilled.push({
        date: dateStr,
        users: growthTrendMap.get(dateStr) || 0
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
        userGrowthTrend: userGrowthTrendFilled
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

    // Update cache
    analyticsCache = {
      data: analyticsData,
      timestamp: Date.now()
    };

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

/**
 * Get detailed user growth data (90 days)
 */
export const getDetailedUserGrowth = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('📈 [ANALYTICS] Fetching detailed user growth...');

    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

    // 90-day trend - OPTIMIZED with aggregation
    const growthTrendAgg = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: ninetyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          users: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill in missing days with 0 users
    const growthMap = new Map(growthTrendAgg.map(item => [item._id, item.users]));
    const growthTrend = [];
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      growthTrend.push({
        date: dateStr,
        users: growthMap.get(dateStr) || 0
      });
    }

    const totalUsers = await User.countDocuments();
    const usersLast90Days = await User.countDocuments({ createdAt: { $gte: ninetyDaysAgo } });
    const avgDailyGrowth = (usersLast90Days / 90).toFixed(2);

    res.status(200).json({
      success: true,
      data: {
        growthTrend,
        totalUsers,
        usersLast90Days,
        avgDailyGrowth,
        period: '90 days'
      }
    });
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Detailed user growth error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detailed user growth'
    });
  }
};

/**
 * Get detailed device activity data (30 days)
 */
export const getDetailedDeviceActivity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('📱 [ANALYTICS] Fetching detailed device activity...');

    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const devices = await AllowedDevice.find();

    // 30-day activity trend
    const activityTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const activeCount = devices.filter(d =>
        d.lastAccess && new Date(d.lastAccess) >= date && new Date(d.lastAccess) < nextDate
      ).length;
      activityTrend.push({
        date: date.toISOString().split('T')[0],
        active: activeCount
      });
    }

    // Device type breakdown
    const deviceTypes: any = {};
    devices.forEach(d => {
      const type = (d.deviceInfo as any)?.type || 'Unknown';
      deviceTypes[type] = (deviceTypes[type] || 0) + 1;
    });

    const totalDevices = devices.length;
    const activeDevices = devices.filter(d => d.isActive).length;
    const recentlyActive = devices.filter(d =>
      d.lastAccess && new Date(d.lastAccess) >= thirtyDaysAgo
    ).length;

    res.status(200).json({
      success: true,
      data: {
        activityTrend,
        deviceTypes,
        totalDevices,
        activeDevices,
        recentlyActive,
        period: '30 days'
      }
    });
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Detailed device activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detailed device activity'
    });
  }
};

/**
 * Get detailed user distribution data
 */
export const getDetailedUserDistribution = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('👥 [ANALYTICS] Fetching detailed user distribution...');

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const result = await User.aggregate([
      {
        $facet: {
          veryActiveUsers: [
            { $match: { lastLogin: { $gte: sevenDaysAgo } } },
            { $sort: { lastLogin: -1 } },
            { $limit: 50 },
            { $project: { username: 1, email: 1, lastLogin: 1, createdAt: 1 } }
          ],
          activeUsers: [
            { $match: { lastLogin: { $gte: thirtyDaysAgo, $lt: sevenDaysAgo } } },
            { $sort: { lastLogin: -1 } },
            { $limit: 50 },
            { $project: { username: 1, email: 1, lastLogin: 1, createdAt: 1 } }
          ],
          inactiveUsers: [
            { $match: { lastLogin: { $gte: ninetyDaysAgo, $lt: thirtyDaysAgo } } },
            { $sort: { lastLogin: -1 } },
            { $limit: 50 },
            { $project: { username: 1, email: 1, lastLogin: 1, createdAt: 1 } }
          ],
          dormantUsers: [
            { $match: { $or: [{ lastLogin: { $lt: ninetyDaysAgo } }, { lastLogin: { $exists: false } }] } },
            { $sort: { createdAt: -1 } },
            { $limit: 50 },
            { $project: { username: 1, email: 1, lastLogin: 1, createdAt: 1 } }
          ],
          counts: [
            {
              $group: {
                _id: null,
                veryActive: { $sum: { $cond: [{ $gte: ["$lastLogin", sevenDaysAgo] }, 1, 0] } },
                active: { $sum: { $cond: [{ $and: [{ $gte: ["$lastLogin", thirtyDaysAgo] }, { $lt: ["$lastLogin", sevenDaysAgo] }] }, 1, 0] } },
                inactive: { $sum: { $cond: [{ $and: [{ $gte: ["$lastLogin", ninetyDaysAgo] }, { $lt: ["$lastLogin", thirtyDaysAgo] }] }, 1, 0] } },
                dormant: { $sum: { $cond: [{ $or: [{ $lt: ["$lastLogin", ninetyDaysAgo] }, { $eq: [{ $ifNull: ["$lastLogin", null] }, null] }] }, 1, 0] } }
              }
            }
          ]
        }
      }
    ]);

    const data = result[0];
    const counts = data.counts[0] || { veryActive: 0, active: 0, inactive: 0, dormant: 0 };

    res.status(200).json({
      success: true,
      data: {
        veryActiveUsers: data.veryActiveUsers,
        activeUsers: data.activeUsers,
        inactiveUsers: data.inactiveUsers,
        dormantUsers: data.dormantUsers,
        counts: {
          veryActive: counts.veryActive,
          active: counts.active,
          inactive: counts.inactive,
          dormant: counts.dormant
        }
      }
    });
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Detailed user distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detailed user distribution'
    });
  }
};

/**
 * Get detailed device risk data
 */
export const getDetailedDeviceRisk = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('🔒 [ANALYTICS] Fetching detailed device risk...');

    // Use aggregation for risk counts
    const riskCounts = await AllowedDevice.aggregate([
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    const counts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    riskCounts.forEach(item => {
      if (item._id && item._id in counts) {
        counts[item._id as keyof typeof counts] = item.count;
      }
    });

    // Get top risky devices with aggregation
    const riskyDevices = await AllowedDevice.aggregate([
      {
        $match: {
          $or: [
            { riskLevel: 'high' },
            { riskLevel: 'critical' },
            { failedAttempts: { $gt: 3 } }
          ]
        }
      },
      { $sort: { riskLevel: -1, failedAttempts: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          deviceId: 1,
          user: { username: '$user.username', email: '$user.email' },
          riskLevel: 1,
          failedAttempts: 1,
          isBlacklisted: 1,
          lastAccess: 1,
          deviceInfo: 1
        }
      }
    ]);

    const totalDevices = await AllowedDevice.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        counts,
        riskyDevices,
        totalDevices
      }
    });
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Detailed device risk error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detailed device risk'
    });
  }
};

/**
 * Get detailed growth metrics
 */
export const getDetailedGrowthMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('📊 [ANALYTICS] Fetching detailed growth metrics...');

    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

    const result = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          usersToday: { $sum: { $cond: [{ $gte: ["$createdAt", today] }, 1, 0] } },
          usersYesterday: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", yesterday] }, { $lt: ["$createdAt", today] }] }, 1, 0] } },
          usersLast7Days: { $sum: { $cond: [{ $gte: ["$createdAt", sevenDaysAgo] }, 1, 0] } },
          usersLast30Days: { $sum: { $cond: [{ $gte: ["$createdAt", thirtyDaysAgo] }, 1, 0] } },
          usersLast60Days: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", sixtyDaysAgo] }, { $lt: ["$createdAt", thirtyDaysAgo] }] }, 1, 0] } },
          usersLast90Days: { $sum: { $cond: [{ $gte: ["$createdAt", ninetyDaysAgo] }, 1, 0] } }
        }
      }
    ]);

    const stats = result[0] || {
      totalUsers: 0,
      usersToday: 0,
      usersYesterday: 0,
      usersLast7Days: 0,
      usersLast30Days: 0,
      usersLast60Days: 0,
      usersLast90Days: 0
    };

    const {
      totalUsers,
      usersToday,
      usersYesterday,
      usersLast7Days,
      usersLast30Days,
      usersLast60Days,
      usersLast90Days
    } = stats;

    // Calculate growth rates
    const dailyGrowthRate = usersYesterday > 0 ? ((usersToday - usersYesterday) / usersYesterday * 100) : 0;
    const weeklyGrowthRate = usersLast60Days > 0 ? ((usersLast30Days - usersLast60Days) / usersLast60Days * 100) : 0;
    const monthlyGrowthRate = totalUsers > 0 ? (usersLast30Days / totalUsers * 100) : 0;

    // Projections
    const avgDailyGrowth = usersLast30Days / 30;
    const projectedNextWeek = Math.round(totalUsers + (avgDailyGrowth * 7));
    const projectedNextMonth = Math.round(totalUsers + (avgDailyGrowth * 30));
    const projectedNext90Days = Math.round(totalUsers + (avgDailyGrowth * 90));

    res.status(200).json({
      success: true,
      data: {
        current: {
          totalUsers,
          usersToday,
          usersLast7Days,
          usersLast30Days,
          usersLast90Days
        },
        growthRates: {
          daily: dailyGrowthRate.toFixed(2),
          weekly: weeklyGrowthRate.toFixed(2),
          monthly: monthlyGrowthRate.toFixed(2)
        },
        projections: {
          nextWeek: projectedNextWeek,
          nextMonth: projectedNextMonth,
          next90Days: projectedNext90Days,
          avgDailyGrowth: avgDailyGrowth.toFixed(2)
        }
      }
    });
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Detailed growth metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detailed growth metrics'
    });
  }
};

/**
 * Get detailed device security data
 */
export const getDetailedDeviceSecurity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('🔐 [ANALYTICS] Fetching detailed device security...');

    const totalDevices = await AllowedDevice.countDocuments();
    const activeDevices = await AllowedDevice.countDocuments({ isActive: true });
    const blacklistedDevices = await AllowedDevice.countDocuments({ isBlacklisted: true });
    const suspiciousDevices = await AllowedDevice.countDocuments({ failedAttempts: { $gt: 5 } });

    // Security events (devices with failed attempts)
    const securityEvents = await AllowedDevice.aggregate([
      { $match: { failedAttempts: { $gt: 0 } } },
      { $sort: { failedAttempts: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          deviceId: 1,
          user: { username: '$user.username', email: '$user.email' },
          failedAttempts: 1,
          riskLevel: 1,
          isBlacklisted: 1,
          lastAccess: 1,
          deviceInfo: 1
        }
      }
    ]);

    // Blacklist history
    const blacklistHistory = await AllowedDevice.aggregate([
      { $match: { isBlacklisted: true } },
      { $sort: { lastAccess: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          deviceId: 1,
          user: { username: '$user.username', email: '$user.email' },
          failedAttempts: 1,
          riskLevel: 1,
          lastAccess: 1
        }
      }
    ]);

    // Risk distribution
    const riskCounts = await AllowedDevice.aggregate([
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    const riskDistribution = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    riskCounts.forEach(item => {
      if (item._id && item._id in riskDistribution) {
        riskDistribution[item._id as keyof typeof riskDistribution] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalDevices,
          activeDevices,
          blacklistedDevices,
          suspiciousDevices
        },
        securityEvents,
        blacklistHistory,
        riskDistribution
      }
    });
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Detailed device security error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detailed device security'
    });
  }
};

export default {
  getAnalyticsData,
  getUserInsights,
  getDetailedUserGrowth,
  getDetailedDeviceActivity,
  getDetailedUserDistribution,
  getDetailedDeviceRisk,
  getDetailedGrowthMetrics,
  getDetailedDeviceSecurity
};
