import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import WorkspaceAttendanceConfig from '../models/WorkspaceAttendanceConfig';
import WorkspaceAttendanceRecord from '../models/WorkspaceAttendanceRecord';
import Workspace from '../models/Workspace';

// Configure workspace attendance settings (Owner only)
export const configureWorkspaceAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { attendanceSlots, requireLocation, requireFaceVerification, officeLocation } = req.body;
    const userId = req.user!._id;

    // Check if user is workspace owner
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404).json({ success: false, message: 'Workspace not found' });
      return;
    }

    if (workspace.owner.toString() !== userId.toString()) {
      res.status(403).json({ success: false, message: 'Only workspace owner can configure attendance' });
      return;
    }

    // Update or create configuration
    const config = await WorkspaceAttendanceConfig.findOneAndUpdate(
      { workspace: workspaceId },
      {
        workspace: workspaceId,
        attendanceSlots,
        requireLocation,
        requireFaceVerification,
        officeLocation
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Attendance configuration updated successfully',
      data: config
    });
  } catch (error: any) {
    console.error('❌ [CONFIGURE ATTENDANCE] Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get workspace attendance configuration
export const getWorkspaceAttendanceConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;

    const config = await WorkspaceAttendanceConfig.findOne({ workspace: workspaceId, isActive: true });

    if (!config) {
      // Return default configuration
      res.status(200).json({
        success: true,
        data: {
          workspace: workspaceId,
          attendanceSlots: [
            { name: 'Morning Check-in', time: '09:00', windowMinutes: 30, isActive: true },
            { name: 'Evening Check-out', time: '18:00', windowMinutes: 30, isActive: true }
          ],
          requireLocation: true,
          requireFaceVerification: false,
          isActive: true
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error: any) {
    console.error('❌ [GET ATTENDANCE CONFIG] Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Mark attendance for a specific slot
export const markWorkspaceAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { slotName, location, faceVerified, isWorkFromHome } = req.body;
    const userId = req.user!._id;

    console.log('📍 [MARK ATTENDANCE] Workspace:', workspaceId, 'User:', userId, 'Slot:', slotName);

    // Get workspace attendance configuration
    const config = await WorkspaceAttendanceConfig.findOne({ workspace: workspaceId, isActive: true });
    
    if (!config) {
      res.status(404).json({ success: false, message: 'Attendance not configured for this workspace' });
      return;
    }

    // Find the slot
    const slot = (config.attendanceSlots as any[]).find((s: any) => s.name === slotName && s.isActive);
    if (!slot) {
      res.status(400).json({ success: false, message: 'Invalid attendance slot' });
      return;
    }

    // Check if marking within time window
    const now = new Date();
    const [hours, minutes] = slot.time.split(':').map(Number);
    const slotTime = new Date(now);
    slotTime.setHours(hours, minutes, 0, 0);

    const diffMinutes = Math.abs((now.getTime() - slotTime.getTime()) / (1000 * 60));
    const isLate = diffMinutes > slot.windowMinutes;
    const status = isWorkFromHome ? 'work-from-home' : (isLate ? 'late' : 'present');

    // Get today's date
    const today = now.toISOString().slice(0, 10);

    // Find or create attendance record for today
    let record = await WorkspaceAttendanceRecord.findOne({
      workspace: workspaceId,
      user: userId,
      date: today
    });

    if (!record) {
      record = new WorkspaceAttendanceRecord({
        workspace: workspaceId,
        user: userId,
        date: today,
        slots: []
      });
    }

    // Check if already marked for this slot
    const existingSlotIndex = record.slots.findIndex(s => s.slotName === slotName);
    
    const slotData = {
      slotName,
      markedAt: now,
      status,
      location,
      faceVerified: faceVerified || false
    };

    if (existingSlotIndex >= 0) {
      // Update existing slot
      record.slots[existingSlotIndex] = slotData as any;
    } else {
      // Add new slot
      record.slots.push(slotData as any);
    }

    await record.save();

    console.log('✅ [MARK ATTENDANCE] Marked successfully:', status);

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: record
    });
  } catch (error: any) {
    console.error('❌ [MARK ATTENDANCE] Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get today's attendance for current user
export const getTodayAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user!._id;

    const today = new Date().toISOString().slice(0, 10);

    const record = await WorkspaceAttendanceRecord.findOne({
      workspace: workspaceId,
      user: userId,
      date: today
    });

    res.status(200).json({
      success: true,
      data: record || null
    });
  } catch (error: any) {
    console.error('❌ [GET TODAY ATTENDANCE] Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get attendance history for current user
export const getMyAttendanceHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { from, to } = req.query;
    const userId = req.user!._id;

    const query: any = {
      workspace: workspaceId,
      user: userId,
      isActive: true
    };

    if (from && to) {
      query.date = { $gte: from, $lte: to };
    }

    const records = await WorkspaceAttendanceRecord.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: records
    });
  } catch (error: any) {
    console.error('❌ [GET ATTENDANCE HISTORY] Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all workspace attendance (Owner only)
export const getWorkspaceAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { date } = req.query;
    const userId = req.user!._id;

    // Check if user is workspace owner
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404).json({ success: false, message: 'Workspace not found' });
      return;
    }

    if (workspace.owner.toString() !== userId.toString()) {
      res.status(403).json({ success: false, message: 'Only workspace owner can view all attendance' });
      return;
    }

    const query: any = {
      workspace: workspaceId,
      isActive: true
    };

    if (date) {
      query.date = date;
    } else {
      query.date = new Date().toISOString().slice(0, 10);
    }

    const records = await WorkspaceAttendanceRecord.find(query)
      .populate('user', 'fullName email avatarUrl')
      .sort({ 'user.fullName': 1 });

    res.status(200).json({
      success: true,
      data: records
    });
  } catch (error: any) {
    console.error('❌ [GET WORKSPACE ATTENDANCE] Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
