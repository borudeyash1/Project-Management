import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/api';
import { Clock, MapPin, Calendar as CalendarIcon, CheckCircle, XCircle, Home, Users } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, isToday } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface EmployeeAttendanceViewProps {
  workspaceId: string;
  config: any;
}

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'work-from-home' | 'not-marked';
  markedAt?: string;
  markedBy?: string;
  isManual?: boolean;
}

const EmployeeAttendanceView: React.FC<EmployeeAttendanceViewProps> = ({ workspaceId, config: initialConfig }) => {
  const { t } = useTranslation();
  const { dispatch, state } = useApp();
  const [mode, setMode] = useState<'automatic' | 'manual'>('manual'); // Add mode state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceHistory, setAttendanceHistory] = useState<Map<string, AttendanceRecord>>(new Map());
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [marking, setMarking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isInCheckInWindow, setIsInCheckInWindow] = useState(false);
  const [isInCheckOutWindow, setIsInCheckOutWindow] = useState(false);
  const [config, setConfig] = useState<any>(initialConfig);
  const [locationFetched, setLocationFetched] = useState({ 'check-in': false, 'check-out': false });
  const [faceScanned, setFaceScanned] = useState({ 'check-in': false, 'check-out': false });
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  const userId = state.userProfile?._id;

  // Load configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await apiService.get(`/workspace-attendance/workspace/${workspaceId}/config`);

        let cfg = null;
        if (response.data.success && response.data.data) {
          cfg = response.data.data;
        } else if (response.data.workspace) {
          cfg = response.data;
        }

        if (cfg) {
          console.log('📥 [EMPLOYEE VIEW] Loaded config:', cfg);
          setConfig(cfg);
        }
      } catch (error) {
        console.error('Failed to load config:', error);
      }
    };

    loadConfig();
  }, [workspaceId]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Check if current time is within attendance windows
  useEffect(() => {
    if (!config?.checkInTime || !config?.checkOutTime) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Check-in window
    const checkInStart = config.checkInTime.start.split(':');
    const checkInEnd = config.checkInTime.end.split(':');
    const checkInStartMinutes = parseInt(checkInStart[0]) * 60 + parseInt(checkInStart[1]);
    const checkInEndMinutes = parseInt(checkInEnd[0]) * 60 + parseInt(checkInEnd[1]);

    setIsInCheckInWindow(currentMinutes >= checkInStartMinutes && currentMinutes <= checkInEndMinutes);

    // Check-out window
    const checkOutStart = config.checkOutTime.start.split(':');
    const checkOutEnd = config.checkOutTime.end.split(':');
    const checkOutStartMinutes = parseInt(checkOutStart[0]) * 60 + parseInt(checkOutStart[1]);
    const checkOutEndMinutes = parseInt(checkOutEnd[0]) * 60 + parseInt(checkOutEnd[1]);

    setIsInCheckOutWindow(currentMinutes >= checkOutStartMinutes && currentMinutes <= checkOutEndMinutes);
  }, [currentTime, config]);

  useEffect(() => {
    if (userId) {
      loadAttendanceHistory();
      loadTodayAttendance();
    }
  }, [workspaceId, userId]);

  const loadTodayAttendance = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const response = await apiService.get(`/workspace-attendance/workspace/${workspaceId}/date/${today}`);

      console.log('📅 [TODAY ATTENDANCE] Response:', response.data);

      const records = Array.isArray(response.data) ? response.data : (response.data.data || []);
      const myRecord = records.find((r: any) => {
        const recordUserId = typeof r.user === 'object' ? r.user._id : r.user;
        return recordUserId === userId;
      });

      console.log('📅 [TODAY ATTENDANCE] My Record:', myRecord);

      if (myRecord && myRecord.slots && myRecord.slots.length > 0) {
        const slot = myRecord.slots[0];
        setTodayAttendance({
          date: today,
          status: slot.status,
          markedAt: slot.markedAt,
          markedBy: slot.markedBy,
          isManual: slot.slotName === 'Manual Entry' || slot.slotName === 'Self Check-in'
        });
      } else {
        setTodayAttendance(null);
      }
    } catch (error) {
      console.error('Failed to load today attendance:', error);
    }
  };

  const loadAttendanceHistory = async () => {
    try {
      console.log('📊 [ATTENDANCE HISTORY] Loading for user:', userId);

      // Load last 30 days of attendance
      const history = new Map<string, AttendanceRecord>();

      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = format(date, 'yyyy-MM-dd');

        try {
          const response = await apiService.get(`/workspace-attendance/workspace/${workspaceId}/date/${dateStr}`);
          const records = Array.isArray(response.data) ? response.data : (response.data.data || []);

          const myRecord = records.find((r: any) => {
            const recordUserId = typeof r.user === 'object' ? r.user._id : r.user;
            return recordUserId === userId;
          });

          if (myRecord && myRecord.slots && myRecord.slots.length > 0) {
            const slot = myRecord.slots[0];
            history.set(dateStr, {
              date: dateStr,
              status: slot.status,
              markedAt: slot.markedAt,
              markedBy: slot.markedBy,
              isManual: slot.slotName === 'Manual Entry' || slot.slotName === 'Self Check-in'
            });
          }
        } catch (err) {
          // Skip if no data for this date
        }
      }

      console.log('📊 [ATTENDANCE HISTORY] Loaded:', history.size, 'days');
      setAttendanceHistory(history);
    } catch (error) {
      console.error('Failed to load attendance history:', error);
    }
  };

  const fetchLocation = async (type: 'check-in' | 'check-out') => {
    try {
      if (!config?.location) {
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            id: Date.now().toString(),
            type: 'error',
            message: 'Location not configured by workspace owner',
            duration: 3000
          }
        });
        return;
      }

      const pos = await new Promise<GeolocationPosition | null>((resolve) => {
        if (!navigator.geolocation) {
          resolve(null);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });

      if (pos) {
        const employeeLat = pos.coords.latitude;
        const employeeLng = pos.coords.longitude;
        const configLat = config.location.lat;
        const configLng = config.location.lng;
        const allowedRadius = config.location.radiusMeters || 100;

        // Calculate distance using Haversine formula
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (configLat * Math.PI) / 180;
        const φ2 = (employeeLat * Math.PI) / 180;
        const Δφ = ((employeeLat - configLat) * Math.PI) / 180;
        const Δλ = ((employeeLng - configLng) * Math.PI) / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in meters

        // Add tolerance for GPS accuracy (add 50m buffer for testing)
        const tolerance = 50;
        const effectiveRadius = allowedRadius + tolerance;

        console.log('📍 Location Check:', {
          employeeLocation: { lat: employeeLat, lng: employeeLng },
          configLocation: { lat: configLat, lng: configLng },
          distance: distance.toFixed(2) + 'm',
          allowedRadius: allowedRadius + 'm',
          effectiveRadius: effectiveRadius + 'm',
          accuracy: pos.coords.accuracy + 'm',
          withinRange: distance <= effectiveRadius
        });

        if (distance <= effectiveRadius) {
          setCurrentLocation({
            latitude: employeeLat,
            longitude: employeeLng,
            accuracy: pos.coords.accuracy
          });
          setLocationFetched({ ...locationFetched, [type]: true });

          dispatch({
            type: 'ADD_TOAST',
            payload: {
              id: Date.now().toString(),
              type: 'success',
              message: `Location verified! (${distance.toFixed(0)}m from office, accuracy: ±${pos.coords.accuracy.toFixed(0)}m)`,
              duration: 4000
            }
          });
        } else {
          dispatch({
            type: 'ADD_TOAST',
            payload: {
              id: Date.now().toString(),
              type: 'error',
              message: `You are ${distance.toFixed(0)}m away (accuracy: ±${pos.coords.accuracy.toFixed(0)}m). Must be within ${allowedRadius}m of office.`,
              duration: 5000
            }
          });
        }
      } else {
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            id: Date.now().toString(),
            type: 'error',
            message: 'Failed to fetch location. Please enable location services and ensure high accuracy mode.',
            duration: 4000
          }
        });
      }
    } catch (error) {
      console.error('Location fetch error:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Error fetching location',
          duration: 3000
        }
      });
    }
  };

  const scanFace = async (type: 'check-in' | 'check-out') => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'info',
          message: 'Camera opened. Please look at the camera...',
          duration: 3000
        }
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Wait 2 seconds for user to position face
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const capturedImage = canvas.toDataURL('image/jpeg', 0.85);

      // Stop camera
      stream.getTracks().forEach(track => track.stop());

      // Send to backend for verification
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'info',
          message: 'Verifying face...',
          duration: 2000
        }
      });

      const response = await apiService.post('/users/verify-face', {
        capturedImage
      });

      if (response.data.success && response.data.data.matched) {
        setFaceScanned({ ...faceScanned, [type]: true });

        dispatch({
          type: 'ADD_TOAST',
          payload: {
            id: Date.now().toString(),
            type: 'success',
            message: `Face verified successfully! (${response.data.data.confidence}% match)`,
            duration: 3000
          }
        });
      } else {
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            id: Date.now().toString(),
            type: 'error',
            message: 'Face verification failed. Please try again or update your face scan in profile.',
            duration: 5000
          }
        });
      }
    } catch (error: any) {
      console.error('Face scan error:', error);

      let errorMessage = 'Face verification failed';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please allow camera access.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: errorMessage,
          duration: 3000
        }
      });
    }
  };

  const markAttendance = async (type: 'check-in' | 'check-out', isWFH: boolean) => {
    try {
      setMarking(true);

      const today = format(new Date(), 'yyyy-MM-dd');

      const requestData = {
        date: today,
        userId: userId,
        status: isWFH ? 'work-from-home' : 'present',
        location: isWFH ? undefined : currentLocation,
        notes: `${type} - ${isWFH ? 'WFH' : 'Office'}`
      };

      console.log('📝 [MARK ATTENDANCE] Request:', requestData);
      console.log('📝 [MARK ATTENDANCE] Endpoint:', `/workspace-attendance/workspace/${workspaceId}/mark-manual`);

      const response = await apiService.post(`/workspace-attendance/workspace/${workspaceId}/mark-manual`, requestData);

      console.log('✅ [MARK ATTENDANCE] Response:', response);

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: `${type === 'check-in' ? 'Check-in' : 'Check-out'} successful`,
          duration: 3000
        }
      });

      // Reset states
      setLocationFetched({ 'check-in': false, 'check-out': false });
      setFaceScanned({ 'check-in': false, 'check-out': false });
      setCurrentLocation(null);

      await loadTodayAttendance();
      await loadAttendanceHistory();
    } catch (error: any) {
      console.error('❌ [MARK ATTENDANCE] Error:', error);
      console.error('❌ [MARK ATTENDANCE] Error response:', error.response);
      console.error('❌ [MARK ATTENDANCE] Error data:', error.response?.data);

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: error.response?.data?.message || error.message || 'Failed to mark attendance',
          duration: 3000
        }
      });
    } finally {
      setMarking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'absent':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'work-from-home':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const modifiers = {
    present: Array.from(attendanceHistory.entries())
      .filter(([_, record]) => record.status === 'present')
      .map(([date]) => new Date(date)),
    absent: Array.from(attendanceHistory.entries())
      .filter(([_, record]) => record.status === 'absent')
      .map(([date]) => new Date(date)),
    wfh: Array.from(attendanceHistory.entries())
      .filter(([_, record]) => record.status === 'work-from-home')
      .map(([date]) => new Date(date)),
  };

  const modifiersStyles = {
    present: { backgroundColor: '#dcfce7', color: '#166534', fontWeight: 'bold' },
    absent: { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' },
    wfh: { backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: 'bold' },
  };

  const canMarkAttendance = todayAttendance?.isManual === false || !todayAttendance;

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Attendance Mode</span>
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
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
        /* Coming Soon Section */
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-500" />
            </div>
            <h3 className="text-3xl font-bold text-yellow-600 dark:text-yellow-500 mb-8">
              Coming Soon
            </h3>

            {/* Features List */}
            <div className="text-left space-y-6 mt-8">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Automatic Attendance Features:
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Feature 1 */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-600 dark:text-yellow-500 font-bold">✓</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">One-Click Check-in/Check-out</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mark your attendance with a single click during configured time windows</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-600 dark:text-yellow-500 font-bold">✓</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Face Recognition</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Secure facial verification to ensure authentic attendance marking</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-600 dark:text-yellow-500 font-bold">✓</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Location Verification</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">GPS-based verification to confirm you're at the office location</p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-600 dark:text-yellow-500 font-bold">✓</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Work From Home Option</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Easily mark WFH attendance without location verification</p>
                  </div>
                </div>

                {/* Feature 5 */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-600 dark:text-yellow-500 font-bold">✓</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Real-time Status Updates</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Instant confirmation and status updates when you mark attendance</p>
                  </div>
                </div>

                {/* Feature 6 */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-600 dark:text-yellow-500 font-bold">✓</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Attendance History Calendar</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View your complete attendance history in an interactive calendar</p>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300 font-medium text-center">
                  📌 This feature is currently under development. Your manager can mark attendance manually for now.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Manual Attendance - Calendar View */
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Attendance History
          </h3>

          <div className="flex justify-center">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="border-0"
            />
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-900/50"></div>
              <span className="text-gray-700 dark:text-gray-300">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-200 dark:bg-red-900/50"></div>
              <span className="text-gray-700 dark:text-gray-300">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-200 dark:bg-blue-900/50"></div>
              <span className="text-gray-700 dark:text-gray-300">WFH</span>
            </div>
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {format(selectedDate, 'MMMM d, yyyy')}
              </div>
              {(() => {
                const record = attendanceHistory.get(format(selectedDate, 'yyyy-MM-dd'));
                if (record) {
                  return (
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(record.status)}`}>
                      {record.status.replace('-', ' ').toUpperCase()}
                      {record.isManual && ' (Manual)'}
                    </div>
                  );
                } else {
                  return (
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      NOT MARKED
                    </div>
                  );
                }
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendanceView;
