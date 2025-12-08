import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';
import { useApp } from '../../context/AppContext';
import { Clock, Settings, Users, Calendar, MapPin } from 'lucide-react';

interface WorkspaceAttendanceTabProps {
  workspaceId: string;
}

interface AttendanceSlot {
  name: string;
  time: string;
  windowMinutes: number;
  isActive: boolean;
}

interface AttendanceConfig {
  attendanceSlots?: AttendanceSlot[];
  requireLocation: boolean;
  requireFaceVerification: boolean;
  officeLocation?: {
    latitude: number;
    longitude: number;
    radiusMeters: number;
  };
}

interface AttendanceRecord {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  date: string;
  slots: Array<{
    slotName: string;
    markedAt: Date;
    status: 'present' | 'late' | 'absent' | 'work-from-home';
    location?: {
      latitude: number;
      longitude: number;
    };
    faceVerified: boolean;
  }>;
}

const formatDateInput = (d: Date) => d.toISOString().slice(0, 10);

const WorkspaceAttendanceTab: React.FC<WorkspaceAttendanceTabProps> = ({ workspaceId }) => {
  const { state, dispatch } = useApp();
  
  // Check if user is workspace owner
  const workspace = state.workspaces.find(w => w._id === workspaceId);
  const isWorkspaceOwner = workspace?.owner === state.userProfile._id;
  
  const [mode, setMode] = useState<'automatic' | 'manual'>('automatic');
  const [config, setConfig] = useState<AttendanceConfig | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Configuration state
  const [slots, setSlots] = useState<AttendanceSlot[]>([
    { name: 'Morning Check-in', time: '09:00', windowMinutes: 30, isActive: true },
    { name: 'Evening Check-out', time: '18:00', windowMinutes: 30, isActive: true }
  ]);
  const [requireLocation, setRequireLocation] = useState(true);
  const [requireFace, setRequireFace] = useState(false);
  const [officeLocation, setOfficeLocation] = useState({ latitude: 0, longitude: 0, radiusMeters: 100 });

  // Load configuration
  useEffect(() => {
    loadConfig();
  }, [workspaceId]);

  const loadConfig = async () => {
    try {
      const response = await apiService.get(`/workspace-attendance/workspace/${workspaceId}/config`);
      if (response.data.success && response.data.data) {
        const cfg = response.data.data;
        setConfig(cfg);
        if (cfg.attendanceSlots && cfg.attendanceSlots.length > 0) {
          setSlots(cfg.attendanceSlots);
        }
        setRequireLocation(cfg.requireLocation ?? true);
        setRequireFace(cfg.requireFaceVerification ?? false);
        if (cfg.officeLocation) {
          setOfficeLocation(cfg.officeLocation);
        }
      }
    } catch (error) {
      console.error('Failed to load attendance config:', error);
    }
  };

  const saveConfig = async () => {
    try {
      setLoading(true);
      await apiService.put(`/workspace-attendance/workspace/${workspaceId}/configure`, {
        attendanceSlots: slots,
        requireLocation,
        requireFaceVerification: requireFace,
        officeLocation
      });
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Attendance configuration saved successfully',
          duration: 3000
        }
      });
      
      setShowConfig(false);
      await loadConfig();
    } catch (error) {
      console.error('Failed to save config:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to save configuration',
          duration: 3000
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSlot = (index: number, field: keyof AttendanceSlot, value: any) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const addSlot = () => {
    setSlots([...slots, { name: 'New Slot', time: '12:00', windowMinutes: 30, isActive: true }]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  if (!isWorkspaceOwner) {
    return <EmployeeAttendanceView workspaceId={workspaceId} config={config} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Workspace Attendance</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage attendance for all workspace members</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="font-medium">Configure</span>
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Attendance Configuration</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Set up attendance time slots and verification requirements</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Attendance Slots */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Attendance Time Slots
              </label>
              <div className="space-y-3">
                {slots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <input
                      type="text"
                      value={slot.name}
                      onChange={(e) => updateSlot(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="Slot name"
                    />
                    <input
                      type="time"
                      value={slot.time}
                      onChange={(e) => updateSlot(index, 'time', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={slot.windowMinutes}
                        onChange={(e) => updateSlot(index, 'windowMinutes', parseInt(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                        min="0"
                        max="120"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">min</span>
                    </div>
                    <label className="flex items-center gap-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={slot.isActive}
                        onChange={(e) => updateSlot(index, 'isActive', e.target.checked)}
                        className="rounded border-gray-300 text-accent focus:ring-accent"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                    <button
                      onClick={() => removeSlot(index)}
                      className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addSlot}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-accent hover:text-accent dark:hover:border-accent dark:hover:text-accent transition-colors font-medium"
                >
                  + Add Time Slot
                </button>
              </div>
            </div>

            {/* Verification Options */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Verification Requirements
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                <input
                  type="checkbox"
                  checked={requireLocation}
                  onChange={(e) => setRequireLocation(e.target.checked)}
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Require Location Verification</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Employees must be within office radius</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                <input
                  type="checkbox"
                  checked={requireFace}
                  onChange={(e) => setRequireFace(e.target.checked)}
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Require Face Verification</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Verify identity using face recognition</p>
                </div>
              </label>
            </div>

            {/* Office Location */}
            {requireLocation && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Office Location
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={officeLocation.latitude}
                      onChange={(e) => setOfficeLocation({ ...officeLocation, latitude: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="0.000000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={officeLocation.longitude}
                      onChange={(e) => setOfficeLocation({ ...officeLocation, longitude: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="0.000000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Radius (meters)</label>
                    <input
                      type="number"
                      value={officeLocation.radiusMeters}
                      onChange={(e) => setOfficeLocation({ ...officeLocation, radiusMeters: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={() => setShowConfig(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={saveConfig}
              disabled={loading}
              className="px-6 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}

      {/* Mode Selection */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Attendance Mode:</span>
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden shadow-sm">
          <button
            onClick={() => setMode('automatic')}
            className={`px-6 py-2.5 text-sm font-medium transition-colors ${
              mode === 'automatic'
                ? 'bg-accent text-gray-900'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Automatic
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`px-6 py-2.5 text-sm font-medium transition-colors border-l border-gray-300 dark:border-gray-600 ${
              mode === 'manual'
                ? 'bg-accent text-gray-900'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Manual
          </button>
        </div>
      </div>

      {/* Content based on mode */}
      {mode === 'automatic' ? (
        <OwnerAutomaticView workspaceId={workspaceId} config={config} />
      ) : (
        <OwnerManualView workspaceId={workspaceId} />
      )}
    </div>
  );
};

// Owner Automatic View - Shows current attendance status
const OwnerAutomaticView: React.FC<{ workspaceId: string; config: AttendanceConfig | null }> = ({ workspaceId, config }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(formatDateInput(new Date()));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, [workspaceId, selectedDate]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/workspace-attendance/workspace/${workspaceId}/all?date=${selectedDate}`);
      if (response.data.success) {
        setRecords(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSlotStatus = (record: AttendanceRecord, slotName: string) => {
    const slot = record.slots.find(s => s.slotName === slotName);
    if (!slot) return { status: 'Absent', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' };
    
    switch (slot.status) {
      case 'present':
        return { status: 'Present', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' };
      case 'late':
        return { status: 'Late', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' };
      case 'work-from-home':
        return { status: 'WFH', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' };
      default:
        return { status: 'Absent', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' };
    }
  };

  const slots = config?.attendanceSlots || [
    { name: 'Morning Check-in', time: '09:00', windowMinutes: 30, isActive: true },
    { name: 'Evening Check-out', time: '18:00', windowMinutes: 30, isActive: true }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Attendance Overview</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Real-time attendance tracking for all members</p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center">
          <div className="text-gray-600 dark:text-gray-400">Loading attendance data...</div>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No attendance records for this date</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Member</th>
                  {slots.filter(s => s.isActive).map(slot => (
                    <th key={slot.name} className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                      <div>{slot.name}</div>
                      <div className="text-xs font-normal text-gray-500 dark:text-gray-400 mt-1">{slot.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {records.map(record => (
                  <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {record.user.avatarUrl ? (
                          <img src={record.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                            <span className="text-sm font-semibold text-accent-dark">{record.user.fullName.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{record.user.fullName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{record.user.email}</div>
                        </div>
                      </div>
                    </td>
                    {slots.filter(s => s.isActive).map(slot => {
                      const { status, color } = getSlotStatus(record, slot.name);
                      return (
                        <td key={slot.name} className="px-6 py-4 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
                            {status}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Owner Manual View - Allows manual marking
const OwnerManualView: React.FC<{ workspaceId: string }> = ({ workspaceId }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center">
      <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Manual Attendance Mode</h4>
      <p className="text-gray-600 dark:text-gray-400">Manual attendance marking feature coming soon</p>
    </div>
  );
};

// Employee Attendance View
const EmployeeAttendanceView: React.FC<{ workspaceId: string; config: AttendanceConfig | null }> = ({ workspaceId, config }) => {
  const { dispatch } = useApp();
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [marking, setMarking] = useState(false);
  const [workFromHome, setWorkFromHome] = useState(false);

  useEffect(() => {
    loadTodayAttendance();
  }, [workspaceId]);

  const loadTodayAttendance = async () => {
    try {
      const response = await apiService.get(`/workspace-attendance/workspace/${workspaceId}/today`);
      if (response.data.success) {
        setTodayRecord(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load today attendance:', error);
    }
  };

  const markAttendance = async (slotName: string) => {
    try {
      setMarking(true);

      // Get location if required
      let location = undefined;
      if (config?.requireLocation && !workFromHome) {
        const pos = await new Promise<GeolocationPosition | null>((resolve) => {
          if (!navigator.geolocation) {
            resolve(null);
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });

        if (pos) {
          location = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          };
        }
      }

      await apiService.post(`/workspace-attendance/workspace/${workspaceId}/mark`, {
        slotName,
        location,
        faceVerified: false,
        isWorkFromHome: workFromHome
      });

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Attendance marked successfully',
          duration: 3000
        }
      });

      await loadTodayAttendance();
    } catch (error: any) {
      console.error('Failed to mark attendance:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: error.response?.data?.message || 'Failed to mark attendance',
          duration: 3000
        }
      });
    } finally {
      setMarking(false);
    }
  };

  const slots = config?.attendanceSlots || [
    { name: 'Morning Check-in', time: '09:00', windowMinutes: 30, isActive: true },
    { name: 'Evening Check-out', time: '18:00', windowMinutes: 30, isActive: true }
  ];

  const isSlotMarked = (slotName: string) => {
    return todayRecord?.slots?.some((s: any) => s.slotName === slotName);
  };

  const getSlotStatus = (slotName: string) => {
    const slot = todayRecord?.slots?.find((s: any) => s.slotName === slotName);
    return slot?.status || 'Not marked';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Attendance</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Mark your attendance for today's time slots</p>
      </div>

      <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={workFromHome}
            onChange={(e) => setWorkFromHome(e.target.checked)}
            className="rounded border-gray-300 text-accent focus:ring-accent w-5 h-5"
          />
          <div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Work from home today</span>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Location verification will be skipped</p>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slots.filter(s => s.isActive).map(slot => (
          <div key={slot.name} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{slot.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {slot.time} <span className="text-xs">(±{slot.windowMinutes} min)</span>
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isSlotMarked(slot.name) 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {isSlotMarked(slot.name) ? '✓ Marked' : 'Pending'}
                </div>
              </div>

              {isSlotMarked(slot.name) ? (
                <div className="text-center py-6 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-2xl mb-2">✓</div>
                  <div className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">
                    Marked as {getSlotStatus(slot.name)}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    You have already marked attendance for this slot
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => markAttendance(slot.name)}
                  disabled={marking}
                  className="w-full px-6 py-3 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm transition-all transform hover:scale-[1.02]"
                >
                  {marking ? 'Marking...' : 'Mark Attendance'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceAttendanceTab;
