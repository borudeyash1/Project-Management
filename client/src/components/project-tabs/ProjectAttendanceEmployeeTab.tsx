import React, { useEffect, useMemo, useState } from 'react';
import apiService from '../../services/api';

interface AttendanceRecord {
  _id?: string;
  project: string;
  user: string;
  date: string;
  status: 'present' | 'absent' | 'work-from-home';
  mode: 'manual' | 'automatic';
}

interface ProjectAttendanceEmployeeTabProps {
  projectId: string;
}

const formatDateInput = (d: Date) => d.toISOString().slice(0, 10);

const ProjectAttendanceEmployeeTab: React.FC<ProjectAttendanceEmployeeTabProps> = ({ projectId }) => {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [marking, setMarking] = useState(false);
  const [today, setToday] = useState<string>(formatDateInput(new Date()));
  const [workFromHome, setWorkFromHome] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const loadHistory = async () => {
    if (!projectId) return;
    try {
      // Load history for the visible range only
      const base = currentDate;
      let from: string | undefined;
      let to: string | undefined;

      if (viewMode === 'month') {
        const start = new Date(base.getFullYear(), base.getMonth(), 1);
        const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
        from = formatDateInput(start);
        to = formatDateInput(end);
      } else {
        const day = base.getDay(); // 0 (Sun) - 6 (Sat)
        const start = new Date(base);
        start.setDate(base.getDate() - day);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        from = formatDateInput(start);
        to = formatDateInput(end);
      }

      const query = from && to ? `?from=${from}&to=${to}` : '';
      const resp = await apiService.get<any>(`/attendance/project/${projectId}/my-history${query}`);
      const data = (resp.data as AttendanceRecord[]) || [];
      setHistory(data);
    } catch (e) {
      console.error('Failed to load attendance history', e);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, viewMode, currentDate]);

  const todayRecord = history.find((r) => r.date && r.date.startsWith(today));

  const historyByDate = useMemo(() => {
    const map: Record<string, AttendanceRecord> = {};
    history.forEach((rec) => {
      const key = (rec.date || '').slice(0, 10);
      if (key) {
        map[key] = rec;
      }
    });
    return map;
  }, [history]);

  const handleMarkToday = async () => {
    if (!projectId) return;
    setError(null);
    setMarking(true);

    const getLocation = () =>
      new Promise<GeolocationPosition | null>((resolve) => {
        if (!navigator.geolocation) {
          resolve(null);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 10000 },
        );
      });

    try {
      const pos = await getLocation();
      const location = pos
        ? {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }
        : undefined;

      await apiService.post(`/attendance/project/${projectId}/mark-today`, {
        status: workFromHome ? 'work-from-home' : 'present',
        location,
        faceVerified: false,
        isWorkFromHome: workFromHome,
      });

      await loadHistory();
    } catch (e: any) {
      console.error('Failed to mark today attendance', e);
      setError(e?.message || 'Failed to mark attendance');
    } finally {
      setMarking(false);
    }
  };

  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'work-from-home':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'absent':
      default:
        return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const renderMonthGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startDay = firstOfMonth.getDay(); // 0-6 (Sun-Sat)

    const cells: { date: Date; inCurrentMonth: boolean }[] = [];

    // Start from Sunday of the first week containing the 1st
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() - startDay);

    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({ date: d, inCurrentMonth: d.getMonth() === month });
    }

    return (
      <div className="mt-3">
        <div className="grid grid-cols-7 text-xs font-medium text-gray-500 mb-1">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs">
          {cells.map(({ date, inCurrentMonth }) => {
            const key = date.toISOString().slice(0, 10);
            const rec = historyByDate[key];
            const isTodayCell = key === today;
            return (
              <div
                key={key}
                className={`h-16 border rounded-md p-1 flex flex-col justify-between ${
                  inCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                } ${isTodayCell ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold">{date.getDate()}</span>
                </div>
                {rec && (
                  <span
                    className={`mt-1 inline-flex items-center px-1 py-0.5 rounded-full border text-[10px] capitalize ${getStatusColor(
                      rec.status,
                    )}`}
                  >
                    {rec.status.replace(/-/g, ' ')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekRow = () => {
    const base = currentDate;
    const day = base.getDay();
    const start = new Date(base);
    start.setDate(base.getDate() - day);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }

    return (
      <div className="mt-3 grid grid-cols-7 gap-2 text-xs">
        {days.map((date) => {
          const key = date.toISOString().slice(0, 10);
          const rec = historyByDate[key];
          const isTodayCell = key === today;
          return (
            <div
              key={key}
              className={`h-20 border rounded-md p-2 flex flex-col justify-between ${
                isTodayCell ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                <span className="text-xs">{date.getDate()}</span>
              </div>
              {rec ? (
                <span
                  className={`inline-flex items-center px-1 py-0.5 rounded-full border text-[10px] capitalize ${getStatusColor(
                    rec.status,
                  )}`}
                >
                  {rec.status.replace(/-/g, ' ')}
                </span>
              ) : (
                <span className="text-[10px] text-gray-400">No record</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">My Attendance</h3>
          <p className="text-sm text-gray-600">Mark today&apos;s attendance and review your history.</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="flex items-center gap-3 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={workFromHome}
                onChange={(e) => setWorkFromHome(e.target.checked)}
              />
              <span className="text-gray-700">Work from home today</span>
            </label>
          </div>
          <button
            type="button"
            onClick={handleMarkToday}
            disabled={marking}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {todayRecord ? 'Update Today\'s Attendance' : "Mark Today\'s Attendance"}
          </button>
          {error && <p className="text-xs text-red-600 max-w-xs text-right">{error}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h4 className="font-medium text-gray-900 text-sm">Today</h4>
          </div>
          <div className="p-4 text-sm">
            {todayRecord ? (
              <div className="space-y-1">
                <p className="text-gray-700">
                  Status:{' '}
                  <span className="font-semibold capitalize">
                    {todayRecord.status.replace(/-/g, ' ')}
                  </span>
                </p>
                <p className="text-xs text-gray-500">Marked via {todayRecord.mode} mode.</p>
              </div>
            ) : (
              <p className="text-gray-500">You haven&apos;t marked attendance for today yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 text-sm">Attendance Calendar</h4>
              <p className="text-xs text-gray-500">View your attendance week-wise or month-wise.</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex rounded-md border border-gray-300 overflow-hidden">
                <button
                  type="button"
                  className={`px-2 py-1 ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => setViewMode('week')}
                >
                  Week
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => setViewMode('month')}
                >
                  Month
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="px-2 py-1 border border-gray-300 rounded-md"
                  onClick={() => {
                    if (viewMode === 'month') {
                      const d = new Date(currentDate);
                      d.setMonth(d.getMonth() - 1);
                      setCurrentDate(d);
                    } else {
                      const d = new Date(currentDate);
                      d.setDate(d.getDate() - 7);
                      setCurrentDate(d);
                    }
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="px-2 py-1 border border-gray-300 rounded-md"
                  onClick={() => {
                    if (viewMode === 'month') {
                      const d = new Date(currentDate);
                      d.setMonth(d.getMonth() + 1);
                      setCurrentDate(d);
                    } else {
                      const d = new Date(currentDate);
                      d.setDate(d.getDate() + 7);
                      setCurrentDate(d);
                    }
                  }}
                >
                  ›
                </button>
                <button
                  type="button"
                  className="px-2 py-1 border border-gray-300 rounded-md text-gray-700"
                  onClick={() => {
                    const now = new Date();
                    setCurrentDate(now);
                    setToday(formatDateInput(now));
                  }}
                >
                  Today
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 text-sm">
            {history.length === 0 ? (
              <div className="text-gray-500 text-center text-xs">No attendance records found for this range.</div>
            ) : viewMode === 'month' ? (
              renderMonthGrid()
            ) : (
              renderWeekRow()
            )}
            <div className="mt-4 flex items-center gap-4 text-[11px] text-gray-500">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
                <span>Present</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span>
                <span>Work from home</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
                <span>Absent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAttendanceEmployeeTab;
