# 🎯 WORKSPACE ATTENDANCE SYSTEM - IMPLEMENTATION PLAN

## Overview
Moving attendance from project-level to workspace-level with dual check-in/check-out system.

## Requirements
1. ✅ Centralized at workspace level (not project)
2. ✅ Fetch all workspace users
3. ✅ Location settings stored in database
4. ✅ Dual attendance (check-in + check-out)
5. ✅ Owner controls for settings
6. ✅ Employee view for marking attendance
7. ✅ Proper database storage

## Database Models Created

### 1. WorkspaceAttendance
```typescript
{
  workspace: ObjectId,
  user: ObjectId,
  date: Date,
  checkIn: {
    time: Date,
    location: { lat, lng, accuracy, address, withinAllowedArea },
    faceVerified: boolean,
    mode: 'manual' | 'automatic'
  },
  checkOut: {
    time: Date,
    location: { lat, lng, accuracy, address, withinAllowedArea },
    faceVerified: boolean,
    mode: 'manual' | 'automatic'
  },
  status: 'present' | 'absent' | 'work-from-home' | 'half-day' | 'late',
  workingHours: number,
  notes: string
}
```

### 2. WorkspaceAttendanceConfig
```typescript
{
  workspace: ObjectId,
  location: {
    lat: number,
    lng: number,
    radiusMeters: number,
    address: string,
    name: string
  },
  checkInTime: { start: "09:00", end: "10:00" },
  checkOutTime: { start: "17:00", end: "18:00" },
  workingDays: [1,2,3,4,5],
  workFromHomeAllowed: boolean,
  autoModeEnabled: boolean,
  requireFaceVerification: boolean,
  requireLocation: boolean,
  lateThresholdMinutes: 15,
  halfDayThresholdHours: 4,
  fullDayThresholdHours: 8
}
```

## API Endpoints to Create

### Configuration (Owner Only)
- `GET /api/workspaces/:id/attendance/config` - Get config
- `PUT /api/workspaces/:id/attendance/config` - Update config
- `POST /api/workspaces/:id/attendance/config/location` - Set location

### Attendance Management (Owner/Manager)
- `GET /api/workspaces/:id/attendance/day/:date` - Get day attendance
- `POST /api/workspaces/:id/attendance/day/:date/manual` - Manual attendance
- `GET /api/workspaces/:id/attendance/stats` - Get statistics
- `GET /api/workspaces/:id/attendance/report` - Get attendance report

### Employee Attendance
- `POST /api/workspaces/:id/attendance/check-in` - Check in
- `POST /api/workspaces/:id/attendance/check-out` - Check out
- `GET /api/workspaces/:id/attendance/my-history` - Get own history
- `GET /api/workspaces/:id/attendance/my-today` - Get today's status

## Frontend Components to Create

### Owner View
1. **WorkspaceAttendanceSettings** - Configure location, times, rules
2. **WorkspaceAttendanceManager** - View all employees, mark manual attendance
3. **WorkspaceAttendanceReports** - Statistics and reports

### Employee View
1. **WorkspaceAttendanceEmployee** - Check-in/Check-out interface
2. **AttendanceHistory** - View own attendance history

## Implementation Steps

### Phase 1: Backend (Current)
- [x] Create WorkspaceAttendance model
- [x] Create WorkspaceAttendanceConfig model
- [ ] Create workspaceAttendanceController
- [ ] Create routes
- [ ] Add validation and error handling

### Phase 2: Frontend
- [ ] Create workspace attendance tab
- [ ] Create owner settings UI
- [ ] Create owner management UI
- [ ] Create employee check-in/out UI
- [ ] Add location services integration

### Phase 3: Integration
- [ ] Connect frontend to backend
- [ ] Test location tracking
- [ ] Test check-in/check-out flow
- [ ] Test manual attendance
- [ ] Test reports and statistics

## Features

### Check-In
- Capture time
- Capture location (if required)
- Verify within allowed radius
- Optional face verification
- Auto-calculate if late

### Check-Out
- Capture time
- Capture location (if required)
- Calculate working hours
- Determine status (full-day/half-day)

### Status Calculation
- **Present**: Checked in within time window
- **Late**: Checked in after threshold
- **Half-Day**: Working hours < threshold
- **Work-From-Home**: Manual selection
- **Absent**: No check-in

### Owner Controls
- Set office location and radius
- Set check-in/check-out time windows
- Set working days
- Enable/disable work from home
- Set late and half-day thresholds
- Require location/face verification

## Next Steps
1. Create workspaceAttendanceController.ts
2. Create routes in workspace routes
3. Create frontend components
4. Test end-to-end flow
