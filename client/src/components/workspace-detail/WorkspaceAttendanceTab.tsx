import React, { useEffect, useMemo, useState } from 'react';
import apiService from '../../services/api';
import { useApp } from '../../context/AppContext';

interface WorkspaceMember {
  _id: string;
  name: string;
  email?: string;
  role?: string;
}

interface WorkspaceAttendanceTabProps {
  workspaceId: string;
}

interface AttendanceRecord {
  _id?: string;
  project: string;
  user: string;
  date: string;
  status: 'present' | 'absent' | 'work-from-home';
  mode: 'manual' | 'automatic';
}

const formatDateInput = (d: Date) => d.toISOString().slice(0, 10);

const WorkspaceAttendanceTab: React.FC<WorkspaceAttendanceTabProps> = ({ workspaceId }) => {
  const { state } = useApp();
  const [mode, setMode] = useState<'manual' | 'automatic'>('manual');
  const [selectedDate, setSelectedDate] = useState<string>(formatDateInput(new Date()));
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [attendanceStarted, setAttendanceStarted] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);

  const memberStatusMap = useMemo(() => {
    const map: Record<string, AttendanceRecord> = {};
    records.forEach((r) => {
      map[r.user] = r;
    });
    return map;
  }, [records]);

  // Fetch workspace members
  useEffect(() => {
    const fetchWorkspaceMembers = async () => {
      if (!workspaceId) return;
      
      setLoading(true);
      try {
        const response = await apiService.get(`/messages/workspace/${workspaceId}/members`);
        console.log('✅ [WORKSPACE ATTENDANCE] Fetched members:', response.data);
        
        if (response.data.success && response.data.data) {
          const members = response.data.data.map((m: any) => ({
            _id: m._id || m.user?._id,
            name: m.fullName || m.name || 'Unknown',
            email: m.email || '',
            role: m.role || 'member'
          }));
          
          console.log('📊 [WORKSPACE ATTENDANCE] Mapped members:', members);
          setWorkspaceMembers(members);
        }
      } catch (error) {
        console.error('❌ [WORKSPACE ATTENDANCE] Failed to load members:', error);
        
        // Fallback to workspace members from context
        const workspace = state.workspaces.find(w => w._id === workspaceId);
        if (workspace?.members) {
          const contextMembers = workspace.members
            .filter((m: any) => m.status === 'active')
            .map((m: any) => ({
              _id: m.user._id || m.user,
              name: m.user?.fullName || m.user?.name || 'Unknown',
              email: m.user?.email || '',
              role: m.role || 'member'
            }));
          console.log('⚠️ [WORKSPACE ATTENDANCE] Using fallback members:', contextMembers);
          setWorkspaceMembers(contextMembers);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceMembers();
  }, [workspaceId, state.workspaces]);

  const loadDayAttendance = async () => {
    if (!workspaceId || !selectedDate) return;
    setLoading(true);
    try {
      // For now, using project attendance endpoint - will be replaced with workspace endpoint
      const resp = await apiService.get<any>(`/attendance/project/${workspaceId}/day/${selectedDate}`);
      const data = (resp.data as AttendanceRecord[]) || [];
      setRecords(data);
    } catch (e) {
      console.error('Failed to load workspace day attendance', e);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!workspaceId || !selectedDate) return;
    try {
      const resp = await apiService.get<any>(`/attendance/project/${workspaceId}/stats?range=day&date=${selectedDate}`);
      const data = (resp.data as Record<string, number>) || {};
      setStats(data);
    } catch (e) {
      console.error('Failed to load attendance stats', e);
    }
  };

  useEffect(() => {
    loadDayAttendance();
    loadStats();
    setAttendanceStarted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, selectedDate]);

  const handleStartAttendance = () => {
    if (!attendanceStarted) {
      setAttendanceStarted(true);
    }
  };

  const handleStatusChange = (userId: string, status: AttendanceRecord['status']) => {
    setRecords((prev) => {
      const existing = prev.find((r) => r.user === userId);
      if (existing) {
        return prev.map((r) => (r.user === userId ? { ...r, status, mode: 'manual' } : r));
      }
      const newRec: AttendanceRecord = {
        project: workspaceId,
        user: userId,
        date: selectedDate,
        status,
        mode: 'manual',
      } as any;
      return [...prev, newRec];
    });
  };

  const handleSave = async () => {
    if (!workspaceId || !selectedDate) return;
    setSaving(true);
    try {
      const entries = records.map((r) => ({ userId: r.user, status: r.status }));
      await apiService.post(`/attendance/project/${workspaceId}/day/${selectedDate}/manual`, { entries });
      await loadDayAttendance();
      await loadStats();
    } catch (e: any) {
      console.error('Failed to save attendance', e);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = stats['present'] || 0;
  const absentCount = stats['absent'] || 0;
  const wfhCount = stats['work-from-home'] || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Workspace Attendance</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Manage attendance for all workspace members</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden text-sm">
            <button
              type="button"
              className={`px-3 py-1 ${mode === 'manual' ? 'bg-accent text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              onClick={() => setMode('manual')}
            >
              Manual
            </button>
            <button
              type="button"
              className={`px-3 py-1 ${mode === 'automatic' ? 'bg-accent text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              onClick={() => setMode('automatic')}
            >
              Automatic
            </button>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          {mode === 'manual' && !attendanceStarted && (
            <button
              type="button"
              onClick={handleStartAttendance}
              className="px-4 py-2 bg-accent text-gray-900 rounded-lg text-sm hover:bg-accent-hover"
            >
              Start Attendance
            </button>
          )}
          {mode === 'manual' && attendanceStarted && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-accent text-gray-900 rounded-lg text-sm hover:bg-accent-hover disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-300 dark:border-gray-600 flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Team Attendance - {selectedDate}</h4>
            {loading && <span className="text-xs text-gray-600 dark:text-gray-300">Loading...</span>}
          </div>
          {mode === 'automatic' && (
            <div className="p-4 border-b border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700">
              Automatic attendance is based on employee self check-in (location + face verification). You can
              still review the summary on the right.
            </div>
          )}
          {mode === 'manual' && !attendanceStarted && (
            <div className="p-4 text-sm text-gray-600 dark:text-gray-300">
              Click <span className="font-medium">Start Attendance</span> above to begin marking today&apos;s
              statuses for your team.
            </div>
          )}
          {(mode === 'automatic' || (mode === 'manual' && attendanceStarted)) && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Member</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Role</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workspaceMembers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-gray-600 dark:text-gray-300">
                        No workspace members found.
                      </td>
                    </tr>
                  )}
                  {workspaceMembers.map((member) => {
                    const rec = memberStatusMap[member._id];
                    const currentStatus = rec?.status || 'absent';
                    return (
                      <tr key={member._id} className="border-t border-gray-300 dark:border-gray-600">
                        <td className="px-4 py-2">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{member.name}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">{member.email}</div>
                        </td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300 capitalize">{member.role || 'member'}</td>
                        <td className="px-4 py-2">
                          {mode === 'manual' ? (
                            <div className="flex items-center gap-4 text-xs md:text-sm">
                              <label className="inline-flex items-center gap-1">
                                <input
                                  type="radio"
                                  name={`status-${member._id}`}
                                  value="present"
                                  checked={currentStatus === 'present'}
                                  onChange={() => handleStatusChange(member._id, 'present')}
                                />
                                <span>Present</span>
                              </label>
                              <label className="inline-flex items-center gap-1">
                                <input
                                  type="radio"
                                  name={`status-${member._id}`}
                                  value="absent"
                                  checked={currentStatus === 'absent'}
                                  onChange={() => handleStatusChange(member._id, 'absent')}
                                />
                                <span>Absent</span>
                              </label>
                              <label className="inline-flex items-center gap-1">
                                <input
                                  type="radio"
                                  name={`status-${member._id}`}
                                  value="work-from-home"
                                  checked={currentStatus === 'work-from-home'}
                                  onChange={() => handleStatusChange(member._id, 'work-from-home')}
                                />
                                <span>Work From Home</span>
                              </label>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                              {currentStatus.replace(/-/g, ' ')}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-4 text-sm">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Today&apos;s Summary</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Present</span>
              <span className="font-semibold text-green-600">{ presentCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Absent</span>
              <span className="font-semibold text-red-600">{absentCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Work From Home</span>
              <span className="font-semibold text-accent-dark">{wfhCount}</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Manual changes are only allowed for the current day, as enforced by the backend.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceAttendanceTab;
