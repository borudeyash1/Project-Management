import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import WorkspaceAttendanceConfig from '../models/WorkspaceAttendanceConfig';
import WorkspaceAttendanceRecord from '../models/WorkspaceAttendanceRecord';
import DailyWorkspaceAttendance from '../models/DailyWorkspaceAttendance';
import Workspace from '../models/Workspace';

// Configure workspace attendance settings (Owner only)
export const configureWorkspaceAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { checkInTime, checkOutTime, location, holidays, requireLocation, requireFaceVerification } = req.body;
    const userId = req.user!._id;

    console.log('⚙️ [CONFIGURE ATTENDANCE] Request:', { workspaceId, checkInTime, checkOutTime, location, holidays });

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
        checkInTime,
        checkOutTime,
        location,
        holidays: holidays || [],
        requireLocation: requireLocation ?? true,
        requireFaceVerification: requireFaceVerification ?? false,
        updatedBy: userId
      },
      { upsert: true, new: true }
    );

    console.log('✅ [CONFIGURE ATTENDANCE] Configuration saved:', config._id);
    console.log('✅ [CONFIGURE ATTENDANCE] Holidays saved:', config.holidays);

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

    console.log('📥 [GET CONFIG] Looking for workspace:', workspaceId);

    const config = await WorkspaceAttendanceConfig.findOne({ workspace: workspaceId });

    console.log('📥 [GET CONFIG] Found config:', config?._id);
    console.log('📥 [GET CONFIG] Config data:', JSON.stringify(config, null, 2));

    if (!config) {
      console.log('⚠️ [GET CONFIG] No config found, returning defaults');
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

    console.log('✅ [GET CONFIG] Returning saved config');
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

// Manual Attendance Marking - Allows owner to mark for others, employees to mark for themselves
export const markManualAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { userId, date, status, slotName, location, notes } = req.body;
    const markerId = req.user!._id;

    console.log('📝 [MARK MANUAL ATTENDANCE] Request:', { workspaceId, userId, date, status, slotName, markerId });

    // Verify workspace exists
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404).json({ success: false, message: 'Workspace not found' });
      return;
    }

    const isOwner = workspace.owner.toString() === markerId.toString();
    const isSelfMarking = userId === markerId.toString();

    // Check permissions: Owner can mark for anyone, employees can only mark for themselves
    if (!isOwner && !isSelfMarking) {
      res.status(403).json({ 
        success: false, 
        message: 'You can only mark your own attendance. Only workspace owner can mark attendance for others.' 
      });
      return;
    }

    // Check if user is a member of the workspace
    const isMember = workspace.members.some(
      (member: any) => member.user.toString() === userId
    );

    if (!isMember) {
      res.status(400).json({ success: false, message: 'User is not a member of this workspace' });
      return;
    }

    // Find existing daily attendance document
    let dailyAttendance = await DailyWorkspaceAttendance.findOne({
      workspace: workspaceId,
      date: date
    });

    // Check if attendance is already marked
    if (dailyAttendance) {
      const existingAttendance = dailyAttendance.attendance.find(
        (att: any) => att.user.toString() === userId
      );

      if (existingAttendance) {
        // Check if it was marked manually by owner
        const wasMarkedByOwner = existingAttendance.markedBy && 
                                 existingAttendance.markedBy.toString() !== userId;

        if (wasMarkedByOwner && isSelfMarking) {
          res.status(400).json({ 
            success: false, 
            message: 'Your attendance has already been marked by the workspace owner. You cannot change it.' 
          });
          return;
        }

        if (isSelfMarking && existingAttendance.markedBy?.toString() === userId) {
          res.status(400).json({ 
            success: false, 
            message: 'You have already marked your attendance for today.' 
          });
          return;
        }
      }
    }

    // Mark attendance
    if (dailyAttendance) {
      // Update existing document
      const userIndex = dailyAttendance.attendance.findIndex(
        (att: any) => att.user.toString() === userId
      );

      const attendanceEntry = {
        user: userId as any,
        status,
        markedAt: new Date(),
        markedBy: markerId as any,
        slotName: slotName || (isSelfMarking ? 'Self Check-in' : 'Manual Entry'),
        location: location,
        notes: notes || (isSelfMarking ? `Self-marked` : `Manually marked by ${req.user!.fullName}`)
      };

      if (userIndex >= 0) {
        // Update existing user attendance
        dailyAttendance.attendance[userIndex] = attendanceEntry;
      } else {
        // Add new user attendance
        dailyAttendance.attendance.push(attendanceEntry);
      }

      await dailyAttendance.save();
    } else {
      // Create new daily attendance document
      dailyAttendance = await DailyWorkspaceAttendance.create({
        workspace: workspaceId,
        date: date,
        attendance: [{
          user: userId,
          status,
          markedAt: new Date(),
          markedBy: markerId,
          slotName: slotName || (isSelfMarking ? 'Self Check-in' : 'Manual Entry'),
          location: location,
          notes: notes || (isSelfMarking ? `Self-marked` : `Manually marked by ${req.user!.fullName}`)
        }]
      });
    }

    console.log('✅ [MARK MANUAL ATTENDANCE] Success:', dailyAttendance._id);

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: dailyAttendance
    });
  } catch (error: any) {
    console.error('❌ [MARK MANUAL ATTENDANCE] Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get Attendance by Date - Optimized Version
export const getAttendanceByDate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId, date } = req.params;

    console.log('📅 [GET ATTENDANCE BY DATE] Request:', { workspaceId, date });

    // Verify workspace exists
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404).json({ success: false, message: 'Workspace not found' });
      return;
    }

    // Get daily attendance document
    const dailyAttendance = await DailyWorkspaceAttendance.findOne({
      workspace: workspaceId,
      date: date
    }).populate('attendance.user', 'fullName email avatarUrl');

    if (!dailyAttendance) {
      console.log('✅ [GET ATTENDANCE BY DATE] No records found');
      res.status(200).json({
        success: true,
        data: []
      });
      return;
    }

    // Transform to match old format for compatibility
    const records = dailyAttendance.attendance.map((att: any) => ({
      user: att.user,
      slots: [{
        slotName: att.slotName,
        status: att.status,
        markedAt: att.markedAt,
        faceVerified: att.faceVerified,
        notes: att.notes
      }]
    }));

    console.log(`✅ [GET ATTENDANCE BY DATE] Found ${records.length} records`);

    res.status(200).json({
      success: true,
      data: records
    });
  } catch (error: any) {
    console.error('❌ [GET ATTENDANCE BY DATE] Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
