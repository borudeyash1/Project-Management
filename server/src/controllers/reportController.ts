import { Response } from 'express';
import { Report } from '../models/Report';
import Project from '../models/Project';
import Task from '../models/Task';
import User from '../models/User';
import { AuthenticatedRequest, ApiResponse } from '../types';

// Get reports summary for home page widget
export const getReportsSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    // Get date range for this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    // Get tasks completed this week
    const tasksThisWeek = await Task.find({
      $or: [{ assignee: userId }, { createdBy: userId }],
      status: 'completed',
      updatedAt: { $gte: startOfWeek }
    }).lean();

    // Get tasks completed last week for comparison
    const tasksLastWeek = await Task.find({
      $or: [{ assignee: userId }, { createdBy: userId }],
      status: 'completed',
      updatedAt: { $gte: startOfLastWeek, $lt: startOfWeek }
    }).lean();

    const tasksCompletedThisWeek = tasksThisWeek.length;
    const tasksCompletedLastWeek = tasksLastWeek.length;
    const tasksCompletedChange = tasksCompletedLastWeek > 0
      ? Math.round(((tasksCompletedThisWeek - tasksCompletedLastWeek) / tasksCompletedLastWeek) * 100)
      : 0;

    // Get projects data
    const projects = await Project.find({
      $or: [
        { createdBy: userId },
        { 'teamMembers.user': userId }
      ],
      isActive: true
    }).lean();

    const totalProjects = projects.length;
    const projectsOnTrack = projects.filter(p =>
      p.status === 'active'
    ).length;
    const projectsAtRisk = projects.filter(p => {
      if (p.dueDate) {
        const daysUntilDue = Math.ceil((new Date(p.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDue < 7 && daysUntilDue >= 0 && p.status !== 'completed';
      }
      return false;
    }).length;

    // Calculate productivity score
    const allTasks = await Task.find({
      $or: [{ assignee: userId }, { createdBy: userId }],
      updatedAt: { $gte: startOfWeek }
    }).lean();

    const completedTasksCount = allTasks.filter(t => t.status === 'completed').length;
    const productivityScore = allTasks.length > 0
      ? Math.round((completedTasksCount / allTasks.length) * 100)
      : 0;

    // Calculate productivity change
    const allTasksLastWeek = await Task.find({
      $or: [{ assignee: userId }, { createdBy: userId }],
      updatedAt: { $gte: startOfLastWeek, $lt: startOfWeek }
    }).lean();

    const completedTasksLastWeek = allTasksLastWeek.filter(t => t.status === 'completed').length;
    const productivityScoreLastWeek = allTasksLastWeek.length > 0
      ? Math.round((completedTasksLastWeek / allTasksLastWeek.length) * 100)
      : 0;

    const productivityChange = productivityScoreLastWeek > 0
      ? productivityScore - productivityScoreLastWeek
      : 0;

    const summary = {
      tasksCompletedThisWeek,
      tasksCompletedChange,
      projectsOnTrack,
      totalProjects,
      projectsAtRisk,
      productivityScore,
      productivityChange
    };

    res.status(200).json(summary);
  } catch (error: any) {
    console.error('Get reports summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reports summary',
      error: error.message
    });
  }
};

// Get all reports for the authenticated user
export const getReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { type, isPublic } = req.query;

    const filter: any = {
      $or: [
        { createdBy: userId },
        { isPublic: true }
      ]
    };

    if (type) {
      filter.type = type;
    }

    if (isPublic !== undefined) {
      filter.isPublic = isPublic === 'true';
    }

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'fullName email avatarUrl')
      .lean();

    const response: ApiResponse = {
      success: true,
      message: 'Reports retrieved successfully',
      data: reports
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reports',
      error: error.message
    });
  }
};

// Create a new report
export const createReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { name, description, type, dateRange, filters, tags, isPublic } = req.body;

    if (!name || !type || !dateRange) {
      res.status(400).json({
        success: false,
        message: 'Name, type, and date range are required'
      });
      return;
    }

    // Generate report data based on type
    const reportData = await generateReportData(type, dateRange, filters, userId);

    const report = new Report({
      name,
      description,
      type,
      dateRange,
      filters,
      data: reportData,
      createdBy: userId,
      isPublic: isPublic || false,
      tags: tags || []
    });

    await report.save();

    const populatedReport = await Report.findById(report._id)
      .populate('createdBy', 'fullName email avatarUrl')
      .lean();

    const response: ApiResponse = {
      success: true,
      message: 'Report created successfully',
      data: populatedReport
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report',
      error: error.message
    });
  }
};

// Get project analytics
export const getProjectAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    // Get projects where user is a team member or creator
    const projects = await Project.find({
      $or: [
        { createdBy: userId },
        { 'teamMembers.user': userId }
      ],
      isActive: true
    }).lean();

    const projectMetrics = await Promise.all(
      projects.map(async (project) => {
        // Get tasks for this project
        const tasks = await Task.find({ project: project._id }).lean();
        const completedTasks = tasks.filter(t => t.status === 'completed').length;

        return {
          _id: project._id,
          name: project.name,
          totalTasks: tasks.length,
          completedTasks,
          progress: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
          budget: project.budget?.amount || 0,
          spent: project.budget?.spent || 0,
          teamSize: project.teamMembers?.length || 0,
          startDate: project.startDate || new Date(),
          endDate: project.dueDate,
          status: project.status
        };
      })
    );

    const response: ApiResponse = {
      success: true,
      message: 'Project analytics retrieved successfully',
      data: projectMetrics
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get project analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve project analytics',
      error: error.message
    });
  }
};

// Get team performance analytics
export const getTeamAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    // Get projects where user is involved
    const projects = await Project.find({
      $or: [
        { createdBy: userId },
        { 'teamMembers.user': userId }
      ],
      isActive: true
    }).lean();

    const projectIds = projects.map(p => p._id);

    // Get all team members from these projects
    const teamMemberIds = new Set<string>();
    projects.forEach(project => {
      project.teamMembers?.forEach((member: any) => {
        teamMemberIds.add(member.user.toString());
      });
    });

    // Get performance data for each team member
    const teamPerformance = await Promise.all(
      Array.from(teamMemberIds).map(async (memberId) => {
        const user = await User.findById(memberId).select('fullName email avatarUrl designation').lean();
        if (!user) return null;

        // Get tasks assigned to this member
        const tasks = await Task.find({
          assignee: memberId,
          project: { $in: projectIds }
        }).lean();

        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const totalTasks = tasks.length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Calculate average rating
        const ratedTasks = tasks.filter(t => t.rating);
        const averageRating = ratedTasks.length > 0
          ? ratedTasks.reduce((sum, t) => sum + (Number(t.rating) || 0), 0) / ratedTasks.length
          : 0;

        // Calculate hours worked
        const hoursWorked = tasks.reduce((sum, t) => sum + (Number(t.actualHours) || 0), 0);

        // Calculate productivity score (combination of completion rate and rating)
        const productivityScore = Math.round((completionRate * 0.7) + (averageRating * 10 * 0.3));

        return {
          _id: memberId,
          name: user.fullName,
          avatar: user.avatarUrl,
          role: user.designation || 'Team Member',
          tasksCompleted: completedTasks,
          totalTasks,
          completionRate,
          averageRating: Math.round(averageRating * 10) / 10,
          hoursWorked: Math.round(hoursWorked * 10) / 10,
          productivityScore,
          lastActive: new Date() // You can track this separately if needed
        };
      })
    );

    const filteredPerformance = teamPerformance.filter(p => p !== null);

    const response: ApiResponse = {
      success: true,
      message: 'Team analytics retrieved successfully',
      data: filteredPerformance
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get team analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve team analytics',
      error: error.message
    });
  }
};

// Get time tracking analytics
export const getTimeAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { days = 30 } = req.query;

    const daysNum = parseInt(days as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    // Get tasks with time entries
    const tasks = await Task.find({
      $or: [
        { assignee: userId },
        { createdBy: userId }
      ],
      updatedAt: { $gte: startDate }
    }).lean();

    // Aggregate time data by date
    const timeByDate = new Map<string, { hours: number; billableHours: number }>();

    tasks
      .filter(task => task.updatedAt)
      .forEach(task => {
        const taskDate: string = new Date(task.updatedAt! as any).toISOString().split('T')[0] as string;
        const hours = Number(task.actualHours) || 0;
        const billableHours = hours * 0.8; // Assume 80% is billable

        if (timeByDate.has(taskDate)) {
          const existing = timeByDate.get(taskDate)!;
          existing.hours += hours;
          existing.billableHours += billableHours;
        } else {
          timeByDate.set(taskDate, { hours, billableHours });
        }
      });

    // Convert to array format
    const dailyData = Array.from(timeByDate.entries()).map(([date, data]) => ({
      date,
      hours: Math.round(data.hours * 10) / 10,
      billableHours: Math.round(data.billableHours * 10) / 10,
      projects: [] // Can be enhanced to show project breakdown
    }));

    const response: ApiResponse = {
      success: true,
      message: 'Time analytics retrieved successfully',
      data: {
        dailyData: dailyData.sort((a, b) => a.date.localeCompare(b.date)),
        totalHours: dailyData.reduce((sum, d) => sum + d.hours, 0),
        totalBillableHours: dailyData.reduce((sum, d) => sum + d.billableHours, 0)
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get time analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve time analytics',
      error: error.message
    });
  }
};

// Helper function to generate report data based on type
async function generateReportData(
  type: string,
  dateRange: { startDate: Date; endDate: Date },
  filters: any,
  userId: string
): Promise<any> {
  const { startDate, endDate } = dateRange;

  switch (type) {
    case 'productivity':
      return await generateProductivityReport(startDate, endDate, userId);
    case 'time':
      return await generateTimeReport(startDate, endDate, userId);
    case 'team':
      return await generateTeamReport(startDate, endDate, userId);
    case 'project':
      return await generateProjectReport(startDate, endDate, userId, filters);
    default:
      return { summary: 'Report data will be populated based on selected criteria' };
  }
}

async function generateProductivityReport(startDate: Date, endDate: Date, userId: string) {
  const tasks = await Task.find({
    $or: [{ assignee: userId }, { createdBy: userId }],
    createdAt: { $gte: startDate, $lte: endDate }
  }).lean();

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return {
    totalTasks,
    completedTasks,
    completionRate: Math.round(completionRate),
    averageTimePerTask: tasks.length > 0
      ? tasks.reduce((sum, t) => sum + (Number(t.actualHours) || 0), 0) / tasks.length
      : 0,
    summary: `Completed ${completedTasks} out of ${totalTasks} tasks (${Math.round(completionRate)}% completion rate)`
  };
}

async function generateTimeReport(startDate: Date, endDate: Date, userId: string) {
  const tasks = await Task.find({
    $or: [{ assignee: userId }, { createdBy: userId }],
    updatedAt: { $gte: startDate, $lte: endDate }
  }).lean();

  const totalHours = tasks.reduce((sum, t) => sum + (Number(t.actualHours) || 0), 0);
  const billableHours = totalHours * 0.8;

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    billableHours: Math.round(billableHours * 10) / 10,
    tasksTracked: tasks.length,
    summary: `Tracked ${Math.round(totalHours)} hours across ${tasks.length} tasks`
  };
}

async function generateTeamReport(startDate: Date, endDate: Date, userId: string) {
  const projects = await Project.find({
    $or: [{ createdBy: userId }, { 'teamMembers.user': userId }]
  }).lean();

  const totalMembers = new Set();
  projects.forEach(p => {
    p.teamMembers?.forEach((m: any) => totalMembers.add(m.user.toString()));
  });

  return {
    totalProjects: projects.length,
    totalTeamMembers: totalMembers.size,
    activeProjects: projects.filter(p => p.status === 'active').length,
    summary: `Managing ${projects.length} projects with ${totalMembers.size} team members`
  };
}

async function generateProjectReport(startDate: Date, endDate: Date, userId: string, filters: any) {
  const query: any = {
    $or: [{ createdBy: userId }, { 'teamMembers.user': userId }],
    createdAt: { $gte: startDate, $lte: endDate }
  };

  if (filters?.projects?.length) {
    query._id = { $in: filters.projects };
  }

  const projects = await Project.find(query).lean();
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  return {
    totalProjects: projects.length,
    completedProjects,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completionRate: projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0,
    summary: `${completedProjects} out of ${projects.length} projects completed`
  };
}

// Delete a report
export const deleteReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const report = await Report.findOne({ _id: id, createdBy: userId });

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found or you do not have permission to delete it'
      });
      return;
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message
    });
  }
};
