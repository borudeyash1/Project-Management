import { Request, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import User from '../models/User';
import { Report } from '../models/Report';
import { TimeEntry } from '../models/TimeEntry';
import { Goal } from '../models/Goal';
import { Reminder } from '../models/Reminder';

// Get all reports
export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { type, isPublic } = req.query;

    let query: any = { createdBy: userId };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }

    const reports = await Report.find(query)
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reports,
      count: reports.length
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create a new report
export const createReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const reportData = {
      ...req.body,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const report = new Report(reportData);
    await report.save();

    res.status(201).json({
      success: true,
      data: report,
      message: 'Report created successfully'
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get a specific report
export const getReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const report = await Report.findOne({ _id: id, createdBy: userId })
      .populate('createdBy', 'name email avatar');

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update a report
export const updateReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const report = await Report.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('createdBy', 'name email avatar');

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: report,
      message: 'Report updated successfully'
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a report
export const deleteReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const report = await Report.findOneAndDelete({ _id: id, createdBy: userId });

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Export a report
export const exportReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;
    const userId = (req as any).user.id;

    const report = await Report.findOne({ _id: id, createdBy: userId });

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      });
      return;
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${report.name}.json"`);
      res.json(report.data);
      return;
    } else if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(report.data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${report.name}.csv"`);
      res.send(csv);
      return;
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format'
      });
      return;
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get project metrics
export const getProjectMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // Fetch projects where the user is a member, owner, or creator
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { createdBy: userId },
        { 'members.user': userId },
        { 'teamMembers.user': userId }
      ]
    }).lean();

    const projectMetrics = await Promise.all(projects.map(async (project: any) => {
      const projectId = project._id;
      
      // Get task counts
      const totalTasks = await Task.countDocuments({ project: projectId });
      const completedTasks = await Task.countDocuments({ project: projectId, status: 'done' });
      
      // Calculate team size
      const members = project.members || project.teamMembers || [];
      const teamSize = Array.isArray(members) ? members.length : 0;
      
      return {
        _id: projectId,
        name: project.name,
        totalTasks,
        completedTasks,
        progress: project.progress || (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0),
        budget: project.budget || 0,
        spent: 0, // In a real app, this would come from expenses/time logs
        teamSize,
        startDate: project.startDate || project.createdAt,
        endDate: project.dueDate || project.endDate,
        status: project.status || 'active'
      };
    }));

    res.status(200).json({
      success: true,
      data: projectMetrics
    });
  } catch (error) {
    console.error('Error fetching project metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get team performance
export const getTeamPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // Get projects to find team members
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { createdBy: userId },
        { 'members.user': userId },
        { 'teamMembers.user': userId }
      ]
    }).populate('members.user teamMembers.user', 'fullName email avatarUrl lastActive').lean();

    // Aggregate unique users
    const uniqueUsersMap = new Map<string, any>();
    
    projects.forEach((project: any) => {
      const members = project.members || project.teamMembers || [];
      members.forEach((member: any) => {
        const user = member.user;
        if (user && user._id) {
          uniqueUsersMap.set(user._id.toString(), user);
        }
      });
    });

    const uniqueUsers = Array.from(uniqueUsersMap.values());

    const teamPerformance = await Promise.all(uniqueUsers.map(async (user: any) => {
      const tasks = await Task.find({ assignee: user._id });
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      
      // Calculate simplified productivity score
      const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      return {
        _id: user._id,
        name: user.fullName || user.email,
        avatar: user.avatarUrl,
        role: user.role || 'Member', // Assuming role exists on user or we default
        tasksCompleted: completedTasks,
        totalTasks: totalTasks,
        completionRate: productivityScore,
        averageRating: 0, // Placeholder
        hoursWorked: 0, // Placeholder needs time tracking integration
        productivityScore: productivityScore, // Simplified
        lastActive: user.lastActive || new Date()
      };
    }));

    res.status(200).json({
      success: true,
      data: teamPerformance
    });
  } catch (error) {
    console.error('Error fetching team performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team performance',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get time tracking data
export const getTimeTrackingData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { period = 'week' } = req.query;

    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case 'day':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
    }

    const timeEntries = await TimeEntry.find({
      userId,
      startTime: { $gte: startDate, $lte: endDate },
      isRunning: false
    });

    const dailyData = await TimeEntry.aggregate([
      {
        $match: {
          userId: userId,
          startTime: { $gte: startDate, $lte: endDate },
          isRunning: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$startTime' }
          },
          hours: { $sum: { $divide: ['$duration', 60] } },
          billableHours: { 
            $sum: { 
              $cond: ['$billable', { $divide: ['$duration', 60] }, 0] 
            } 
          }
        }
      },
      {
        $project: {
          date: '$_id',
          hours: { $round: ['$hours', 2] },
          billableHours: { $round: ['$billableHours', 2] }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        dailyData,
        totalHours: timeEntries.reduce((sum, entry) => sum + (entry.duration / 60), 0),
        totalEntries: timeEntries.length
      }
    });
  } catch (error) {
    console.error('Error fetching time tracking data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time tracking data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get productivity stats
export const getProductivityStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // Get goals stats
    const totalGoals = await Goal.countDocuments({ createdBy: userId });
    const completedGoals = await Goal.countDocuments({ 
      createdBy: userId, 
      status: 'completed' 
    });

    // Get reminders stats
    const totalReminders = await Reminder.countDocuments({ createdBy: userId });
    const completedReminders = await Reminder.countDocuments({ 
      createdBy: userId, 
      completed: true 
    });

    // Get time tracking stats
    const timeEntries = await TimeEntry.find({ 
      userId, 
      isRunning: false 
    });
    const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration / 60), 0);

    res.status(200).json({
      success: true,
      data: {
        goals: {
          total: totalGoals,
          completed: completedGoals,
          completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0
        },
        reminders: {
          total: totalReminders,
          completed: completedReminders,
          completionRate: totalReminders > 0 ? (completedReminders / totalReminders) * 100 : 0
        },
        timeTracking: {
          totalHours: Math.round(totalHours * 100) / 100,
          totalEntries: timeEntries.length
        },
        overallProductivity: totalGoals > 0 && totalReminders > 0 ? 
          ((completedGoals / totalGoals) + (completedReminders / totalReminders)) / 2 * 100 : 0
      }
    });
  } catch (error) {
    console.error('Error fetching productivity stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch productivity statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Generate AI report
export const generateAIReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // Mock AI report generation
    const aiReport = {
      _id: new Date().getTime().toString(),
      name: `AI Generated Report - ${new Date().toLocaleDateString()}`,
      type: 'productivity',
      description: 'AI-powered analysis of team productivity and recommendations',
      data: {
        insights: [
          'Team productivity increased by 15% this month',
          'Peak productivity hours are 10 AM - 2 PM',
          'Mobile App project is ahead of schedule',
          'Recommend focusing on Dashboard Redesign next week'
        ],
        recommendations: [
          'Schedule important tasks during peak hours',
          'Consider pair programming for complex features',
          'Implement daily standups for better communication'
        ]
      },
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
      tags: ['ai', 'productivity', 'recommendations']
    };

    res.status(201).json({
      success: true,
      data: aiReport,
      message: 'AI report generated successfully'
    });
  } catch (error) {
    console.error('Error generating AI report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper function to convert data to CSV
const convertToCSV = (data: any): string => {
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header] || '').join(','))
    ].join('\n');
    
    return csvContent;
  }
  
  return JSON.stringify(data);
};
