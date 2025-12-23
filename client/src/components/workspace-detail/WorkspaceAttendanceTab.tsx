import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { Clock, Settings, Users, Calendar, MapPin } from 'lucide-react';
import ManualAttendanceView from './ManualAttendanceView';
import EmployeeAttendanceView from './EmployeeAttendanceView';
import AttendanceConfigModal from './AttendanceConfigModal';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

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
  const { t } = useTranslation();

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
  const [requireLocation, setRequireLocation] = useState(true); // Always required
  const [requireFace, setRequireFace] = useState(false); // Disabled by default
  const [officeLocation, setOfficeLocation] = useState({ latitude: 0, longitude: 0, radiusMeters: 100 });

  // Load configuration
  useEffect(() => {
    loadConfig();
  }, [workspaceId]);

  const loadConfig = async () => {
    try {
      console.log('⚙️ [LOAD CONFIG] Loading configuration for workspace:', workspaceId);

      const response = await apiService.get(`/workspace-attendance/workspace/${workspaceId}/config`);

      console.log('⚙️ [LOAD CONFIG] Response:', response.data);

      if (response.data.success && response.data.data) {
        const cfg = response.data.data;
        console.log('⚙️ [LOAD CONFIG] Config data:', cfg);
        console.log('⚙️ [LOAD CONFIG] attendanceSlots:', cfg.attendanceSlots);

        setConfig(cfg);

        // Load attendanceSlots
        if (cfg.attendanceSlots && cfg.attendanceSlots.length > 0) {
          console.log('⚙️ [LOAD CONFIG] ✅ Loading slots:', cfg.attendanceSlots);
          console.log('⚙️ [LOAD CONFIG] Slot times:', cfg.attendanceSlots.map((s: any) => `${s.name}: ${s.time}`));
          setSlots(cfg.attendanceSlots);
        }

        setRequireLocation(cfg.requireLocation ?? true);
        setRequireFace(cfg.requireFaceVerification ?? false);

        // Handle location
        if (cfg.location) {
          console.log('⚙️ [LOAD CONFIG] Setting office location:', cfg.location);
          setOfficeLocation({
            latitude: cfg.location.lat || 0,
            longitude: cfg.location.lng || 0,
            radiusMeters: cfg.location.radiusMeters || 100
          });
        }

        console.log('⚙️ [LOAD CONFIG] Configuration loaded successfully');
      } else {
        console.log('⚙️ [LOAD CONFIG] No configuration found');
      }
    } catch (error) {
      console.error('❌ [LOAD CONFIG] Failed to load attendance config:', error);
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
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('workspace.attendance.title')}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('workspace.attendance.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="font-medium">{t('workspace.attendance.configure')}</span>
          </button>
        </div>
      </div>


      {/* Configuration Modal */}
      {showConfig && (
        <AttendanceConfigModal
          workspaceId={workspaceId}
          onClose={() => setShowConfig(false)}
          onSave={() => {
            loadConfig();
            setShowConfig(false);
          }}
        />
      )}

      {/* Mode Selection */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('workspace.attendance.modeLabel')}</span>
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden shadow-sm">
          <button
            onClick={() => setMode('automatic')}
            className={`px-6 py-2.5 text-sm font-medium transition-colors ${mode === 'automatic'
                ? 'bg-accent text-gray-900'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            {t('workspace.attendance.mode.automatic')}
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`px-6 py-2.5 text-sm font-medium transition-colors border-l border-gray-300 dark:border-gray-600 ${mode === 'manual'
                ? 'bg-accent text-gray-900'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            {t('workspace.attendance.mode.manual')}
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
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'ja' ? ja : enUS;
  const dateFormat = i18n.language === 'ja' ? 'yyyy年MM月dd日' : 'MMMM dd, yyyy';
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(formatDateInput(new Date()));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    setSelectedDateStr(dateStr);
    loadAttendance();
  }, [workspaceId, selectedDate]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      console.log('📊 [OWNER AUTO VIEW] Loading attendance for date:', dateStr);

      // Use the new date-based endpoint
      const response = await apiService.get(`/workspace-attendance/workspace/${workspaceId}/date/${dateStr}`);

      console.log('📊 [OWNER AUTO VIEW] Response:', response.data);

      // Handle array response (new format)
      const records = Array.isArray(response.data) ? response.data : (response.data.data || []);

      console.log('📊 [OWNER AUTO VIEW] Parsed records:', records);
      setRecords(records);
    } catch (error) {
      console.error('Failed to load attendance:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const getSlotStatus = (record: AttendanceRecord, slotName: string) => {
    // Check if this is manual attendance (slotName will be 'Manual Entry')
    const isManualAttendance = record.slots.some(s => s.slotName === 'Manual Entry');

    if (isManualAttendance) {
      // For manual attendance, use the first slot's status for all columns
      const manualSlot = record.slots[0];
      switch (manualSlot.status) {
        case 'present':
          return { status: 'Present', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' };
        case 'work-from-home':
          return { status: 'WFH', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' };
        case 'absent':
          return { status: 'Absent', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' };
        default:
          return { status: 'Not Marked', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' };
      }
    }

    // For automatic attendance, check specific slot
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Section */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-accent" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('workspace.attendance.selectDate')}</h4>
          </div>

          <DayPicker
            locale={dateLocale}
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rdp-custom"
            classNames={{
              months: "flex flex-col",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium text-gray-900 dark:text-gray-100",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md",
              day_selected: "bg-accent text-gray-900 hover:bg-accent hover:text-gray-900 focus:bg-accent focus:text-gray-900",
              day_today: "bg-gray-100 dark:bg-gray-700 text-accent font-bold",
              day_outside: "text-gray-400 dark:text-gray-600 opacity-50",
              day_disabled: "text-gray-400 dark:text-gray-600 opacity-50",
              day_hidden: "invisible",
            }}
          />

          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('workspace.attendance.selectedDateLabel')}</p>
            <p className="text-lg font-bold text-accent">{format(selectedDate, dateFormat, { locale: dateLocale })}</p>
          </div>
        </div>
      </div>

      {/* Attendance Table Section */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('workspace.attendance.overviewTitle')}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('workspace.attendance.overviewSubtitle')}</p>
          </div>

          {loading ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center">
              <div className="text-gray-600 dark:text-gray-400">{t('workspace.attendance.loading')}</div>
            </div>
          ) : records.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">{t('workspace.attendance.noRecords')}</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">{t('workspace.attendance.table.member')}</th>
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
      </div>
    </div>
  );
};

// Owner Manual View - Allows manual marking
const OwnerManualView: React.FC<{ workspaceId: string }> = ({ workspaceId }) => {
  return <ManualAttendanceView workspaceId={workspaceId} />;
};

export default WorkspaceAttendanceTab;
