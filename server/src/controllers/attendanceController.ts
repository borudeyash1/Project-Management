import { RequestHandler } from 'express';
import Project from '../models/Project';
import ProjectAttendance from '../models/ProjectAttendance';
import ProjectAttendanceConfig from '../models/ProjectAttendanceConfig';
import { AuthenticatedRequest, ApiResponse, IProject } from '../types';

// Helper: normalize a date string (YYYY-MM-DD) to Date at midnight
const normalizeDate = (dateStr?: string): Date => {
  if (!dateStr) {
    const now = new Date();
    const iso = now.toISOString().slice(0, 10);
    return new Date(`${iso}T00:00:00.000Z`);
  }
  return new Date(`${dateStr}T00:00:00.000Z`);
};

const isTodayDateStr = (dateStr: string): boolean => {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
};

const ensureProjectForManager = async (
  req: AuthenticatedRequest,
  projectId: string,
): Promise<IProject | null> => {
  const userId = req.user!._id;

  const project = await Project.findOne({
    _id: projectId,
    isActive: true,
    $or: [
      { createdBy: userId },
      { 'teamMembers.user': userId, 'teamMembers.role': { $in: ['owner', 'manager'] } },
    ],
  });

  return project as unknown as IProject | null;
};

const ensureProjectForMember = async (
  req: AuthenticatedRequest,
  projectId: string,
): Promise<IProject | null> => {
  const userId = req.user!._id;

  const project = await Project.findOne({
    _id: projectId,
    isActive: true,
    'teamMembers.user': userId,
  });

  return project as unknown as IProject | null;
};

// Get attendance config for a project
export const getAttendanceConfig: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { projectId } = req.params as { projectId: string };

    const project = await ensureProjectForMember(authReq, projectId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found or access denied' });
      return;
    }

    let config = await ProjectAttendanceConfig.findOne({ project: projectId });

    if (!config) {
      config = new ProjectAttendanceConfig({
        project: projectId,
        workspace: project.workspace,
        workFromHomeAllowed: true,
        autoModeEnabled: true,
      });
      await config.save();
    }

    const response: ApiResponse = {
      success: true,
      message: 'Attendance config retrieved successfully',
      data: config,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get attendance config error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update attendance config (PM / owner only)
export const updateAttendanceConfig: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { projectId } = req.params as { projectId: string };
    const userId = authReq.user!._id;

    const project = await ensureProjectForManager(authReq, projectId);
    if (!project) {
      res.status(403).json({ success: false, message: 'Access denied for attendance configuration' });
      return;
    }

    const { location, workFromHomeAllowed, autoModeEnabled } = req.body as {
      location?: { lat: number; lng: number; radiusMeters?: number; address?: string };
      workFromHomeAllowed?: boolean;
      autoModeEnabled?: boolean;
    };

    let config = await ProjectAttendanceConfig.findOne({ project: projectId });
    if (!config) {
      config = new ProjectAttendanceConfig({
        project: projectId,
        workspace: project.workspace,
      });
    }

    if (location) {
      config.location = {
        lat: location.lat,
        lng: location.lng,
        radiusMeters: location.radiusMeters ?? config.location?.radiusMeters ?? 100,
        address: location.address ?? config.location?.address,
      } as any;
    }

    if (typeof workFromHomeAllowed === 'boolean') {
      config.workFromHomeAllowed = workFromHomeAllowed;
    }

    if (typeof autoModeEnabled === 'boolean') {
      config.autoModeEnabled = autoModeEnabled;
    }

    await config.save();

    const response: ApiResponse = {
      success: true,
      message: 'Attendance config updated successfully',
      data: config,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Update attendance config error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get day-wise attendance for a project (PM / owner)
export const getProjectDayAttendance: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { projectId, date } = req.params as { projectId: string; date: string };

    const project = await ensureProjectForManager(authReq, projectId);
    if (!project) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const targetDate = normalizeDate(date);

    const records = await ProjectAttendance.find({
      project: projectId,
      date: targetDate,
    }).lean();

    const response: ApiResponse = {
      success: true,
      message: 'Attendance records retrieved successfully',
      data: records,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get project day attendance error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PM sets/manual-updates attendance for today only
export const setProjectDayAttendanceManual: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { projectId, date } = req.params as { projectId: string; date: string };

    if (!isTodayDateStr(date)) {
      res.status(400).json({ success: false, message: 'Manual attendance can only be edited for today' });
      return;
    }

    const project = await ensureProjectForManager(authReq, projectId);
    if (!project) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const userId = authReq.user!._id;
    const { entries } = req.body as {
      entries: Array<{ userId: string; status: 'present' | 'absent' | 'work-from-home' }>;
    };

    if (!Array.isArray(entries)) {
      res.status(400).json({ success: false, message: 'Invalid entries payload' });
      return;
    }

    const targetDate = normalizeDate(date);

    for (const entry of entries) {
      if (!entry.userId || !entry.status) continue;

      await ProjectAttendance.findOneAndUpdate(
        {
          project: projectId,
          user: entry.userId,
          date: targetDate,
        },
        {
          project: projectId,
          user: entry.userId,
          date: targetDate,
          status: entry.status,
          mode: 'manual',
          createdBy: userId,
          updatedBy: userId,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }

    const records = await ProjectAttendance.find({
      project: projectId,
      date: targetDate,
    }).lean();

    const response: ApiResponse = {
      success: true,
      message: 'Attendance updated successfully',
      data: records,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Set project day attendance manual error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Employee marks today attendance (automatic flow: location + faceVerified handled on client)
export const markTodayAttendance: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { projectId } = req.params as { projectId: string };
    const userId = authReq.user!._id;

    const project = await ensureProjectForMember(authReq, projectId);
    if (!project) {
      res.status(403).json({ success: false, message: 'You are not part of this project' });
      return;
    }

    const { status, location, faceVerified, isWorkFromHome } = req.body as {
      status?: 'present' | 'absent' | 'work-from-home';
      location?: { lat: number; lng: number; accuracy?: number; address?: string; withinAllowedArea?: boolean };
      faceVerified?: boolean;
      isWorkFromHome?: boolean;
    };

    const dateStr = new Date().toISOString().slice(0, 10);
    const targetDate = normalizeDate(dateStr);

    const finalStatus: 'present' | 'absent' | 'work-from-home' =
      isWorkFromHome ? 'work-from-home' : status || 'present';

    const record = await ProjectAttendance.findOneAndUpdate(
      {
        project: projectId,
        user: userId,
        date: targetDate,
      },
      {
        project: projectId,
        user: userId,
        date: targetDate,
        status: finalStatus,
        mode: 'automatic',
        location,
        faceVerified: !!faceVerified,
        createdBy: userId,
        updatedBy: userId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const response: ApiResponse = {
      success: true,
      message: 'Attendance marked successfully',
      data: record,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Mark today attendance error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Employee: get own attendance history for a project
export const getMyAttendanceHistory: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { projectId } = req.params as { projectId: string };
    const userId = authReq.user!._id;

    const project = await ensureProjectForMember(authReq, projectId);
    if (!project) {
      res.status(403).json({ success: false, message: 'You are not part of this project' });
      return;
    }

    const { from, to } = req.query as { from?: string; to?: string };

    const query: any = {
      project: projectId,
      user: userId,
    };

    if (from || to) {
      query.date = {};
      if (from) {
        query.date.$gte = normalizeDate(from);
      }
      if (to) {
        query.date.$lte = normalizeDate(to);
      }
    }

    const records = await ProjectAttendance.find(query).sort({ date: -1 }).lean();

    const response: ApiResponse = {
      success: true,
      message: 'Attendance history retrieved successfully',
      data: records,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get my attendance history error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PM: get aggregated stats (day/month/all)
export const getProjectAttendanceStats: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { projectId } = req.params as { projectId: string };
    const { range, date } = req.query as { range?: string; date?: string };

    const project = await ensureProjectForManager(authReq, projectId);
    if (!project) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    let match: any = { project: projectId };

    if (range === 'day' && date) {
      const target = normalizeDate(date);
      match.date = target;
    } else if (range === 'month' && date) {
      const base = normalizeDate(date);
      const year = base.getUTCFullYear();
      const month = base.getUTCMonth();
      const start = new Date(Date.UTC(year, month, 1));
      const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
      match.date = { $gte: start, $lte: end };
    }

    const stats = await ProjectAttendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const formatted: Record<string, number> = {};
    stats.forEach((s: any) => {
      formatted[s._id] = s.count;
    });

    const response: ApiResponse = {
      success: true,
      message: 'Attendance stats retrieved successfully',
      data: formatted,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get project attendance stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
