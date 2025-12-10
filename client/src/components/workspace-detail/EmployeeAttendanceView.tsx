import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
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
  const { dispatch, state } = useApp();
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
      
      const records = Array.isArray(response.data) ? response.data : (response.data.data || []);
      const myRecord = records.find((r: any) => r.user === userId);
      
      if (myRecord && myRecord.slots && myRecord.slots.length > 0) {
        const slot = myRecord.slots[0];
        setTodayAttendance({
          date: today,
          status: slot.status,
          markedAt: slot.markedAt,
          markedBy: slot.markedBy,
          isManual: slot.slotName === 'Manual Entry'
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
      // Load last 30 days of attendance
      const history = new Map<string, AttendanceRecord>();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        try {
          const response = await apiService.get(`/workspace-attendance/workspace/${workspaceId}/date/${dateStr}`);
          const records = Array.isArray(response.data) ? response.data : (response.data.data || []);
          const myRecord = records.find((r: any) => r.user === userId);
          
          if (myRecord && myRecord.slots && myRecord.slots.length > 0) {
            const slot = myRecord.slots[0];
            history.set(dateStr, {
              date: dateStr,
              status: slot.status,
              markedAt: slot.markedAt,
              markedBy: slot.markedBy,
              isManual: slot.slotName === 'Manual Entry'
            });
          }
        } catch (err) {
          // Skip if no data for this date
        }
      }
      
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
          { enableHighAccuracy: true, timeout: 10000 }
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

        console.log('📍 Location Check:', {
          employeeLocation: { lat: employeeLat, lng: employeeLng },
          configLocation: { lat: configLat, lng: configLng },
          distance: distance.toFixed(2) + 'm',
          allowedRadius: allowedRadius + 'm',
          withinRange: distance <= allowedRadius
        });

        if (distance <= allowedRadius) {
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
              message: `Location verified! (${distance.toFixed(0)}m from office)`,
              duration: 3000
            }
          });
        } else {
          dispatch({
            type: 'ADD_TOAST',
            payload: {
              id: Date.now().toString(),
              type: 'error',
              message: `You are ${distance.toFixed(0)}m away. Must be within ${allowedRadius}m of office location.`,
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
            message: 'Failed to fetch location. Please enable location services.',
            duration: 3000
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
      // TODO: Implement actual face recognition
      // For now, simulate face scan with a delay
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'info',
          message: 'Scanning face...',
          duration: 2000
        }
      });

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Placeholder: Always succeed for now
      // In production, this would call a face recognition API
      setFaceScanned({ ...faceScanned, [type]: true });
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Face verified successfully!',
          duration: 2000
        }
      });
    } catch (error) {
      console.error('Face scan error:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Face verification failed',
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
      {/* Attendance Timing Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Attendance Timings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Check-In Window</div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {config?.checkInTime?.start || '09:00'} - {config?.checkInTime?.end || '10:00'}
            </div>
            {isInCheckInWindow && (
              <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                ✓ Window is OPEN
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Check-Out Window</div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {config?.checkOutTime?.start || '17:00'} - {config?.checkOutTime?.end || '18:00'}
            </div>
            {isInCheckOutWindow && (
              <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                ✓ Window is OPEN
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mark Attendance Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Today's Attendance</h3>
        
        {todayAttendance ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${getStatusColor(todayAttendance.status)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg capitalize">{todayAttendance.status.replace('-', ' ')}</div>
                  <div className="text-sm mt-1">
                    Marked at: {todayAttendance.markedAt ? format(new Date(todayAttendance.markedAt), 'hh:mm a') : 'N/A'}
                  </div>
                  {todayAttendance.isManual && (
                    <div className="text-xs mt-1 font-semibold">
                      ⚠️ Marked manually by owner
                    </div>
                  )}
                </div>
                {todayAttendance.status === 'present' && <CheckCircle className="w-8 h-8" />}
                {todayAttendance.status === 'absent' && <XCircle className="w-8 h-8" />}
                {todayAttendance.status === 'work-from-home' && <Home className="w-8 h-8" />}
              </div>
            </div>
            
            {todayAttendance.isManual && (
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                Your attendance has been marked manually by the workspace owner. You cannot change it.
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Check-In Section */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Check-In</h4>
                {isInCheckInWindow ? (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-semibold">
                    OPEN
                  </span>
                ) : (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                    CLOSED
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                Window: {config?.checkInTime?.start} - {config?.checkInTime?.end}
              </div>

              {/* Location Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <MapPin className="w-4 h-4" />
                  <div className="flex-1">
                    <span className="text-sm block">Location</span>
                    {locationFetched['check-in'] ? (
                      <span className="text-xs text-green-600 dark:text-green-400 font-semibold">✓ Verified</span>
                    ) : (
                      <span className="text-xs text-gray-500">Not fetched</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => fetchLocation('check-in')}
                  disabled={!isInCheckInWindow || marking || locationFetched['check-in']}
                  className="text-xs px-3 py-1 bg-accent text-gray-900 rounded hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {locationFetched['check-in'] ? 'Fetched' : 'Fetch'}
                </button>
              </div>

              {/* Face Scan Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <Users className="w-4 h-4" />
                  <div className="flex-1">
                    <span className="text-sm block">Face Scan</span>
                    {faceScanned['check-in'] ? (
                      <span className="text-xs text-green-600 dark:text-green-400 font-semibold">✓ Verified</span>
                    ) : (
                      <span className="text-xs text-gray-500">Not scanned</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => scanFace('check-in')}
                  disabled={!isInCheckInWindow || marking || faceScanned['check-in']}
                  className="text-xs px-3 py-1 bg-accent text-gray-900 rounded hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {faceScanned['check-in'] ? 'Scanned' : 'Scan'}
                </button>
              </div>

              {/* Mark Button */}
              <button
                onClick={() => markAttendance('check-in', false)}
                disabled={!isInCheckInWindow || marking || !canMarkAttendance || !locationFetched['check-in'] || !faceScanned['check-in']}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {marking ? 'Marking...' : 'Mark Check-In'}
              </button>

              {/* Verification Status Message */}
              {(!locationFetched['check-in'] || !faceScanned['check-in']) && isInCheckInWindow && (
                <div className="text-xs text-center text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                  {!locationFetched['check-in'] && !faceScanned['check-in'] && 'Fetch location and scan face to enable'}
                  {locationFetched['check-in'] && !faceScanned['check-in'] && 'Scan face to enable'}
                  {!locationFetched['check-in'] && faceScanned['check-in'] && 'Fetch location to enable'}
                </div>
              )}

              {/* WFH Button */}
              <button
                onClick={() => markAttendance('check-in', true)}
                disabled={!isInCheckInWindow || marking || !canMarkAttendance}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                {marking ? 'Marking...' : 'Work From Home'}
              </button>
            </div>

            {/* Check-Out Section */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Check-Out</h4>
                {isInCheckOutWindow ? (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-semibold">
                    OPEN
                  </span>
                ) : (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                    CLOSED
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                Window: {config?.checkOutTime?.start} - {config?.checkOutTime?.end}
              </div>

              {/* Location Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <MapPin className="w-4 h-4" />
                  <div className="flex-1">
                    <span className="text-sm block">Location</span>
                    {locationFetched['check-out'] ? (
                      <span className="text-xs text-green-600 dark:text-green-400 font-semibold">✓ Verified</span>
                    ) : (
                      <span className="text-xs text-gray-500">Not fetched</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => fetchLocation('check-out')}
                  disabled={!isInCheckOutWindow || marking || locationFetched['check-out']}
                  className="text-xs px-3 py-1 bg-accent text-gray-900 rounded hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {locationFetched['check-out'] ? 'Fetched' : 'Fetch'}
                </button>
              </div>

              {/* Face Scan Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <Users className="w-4 h-4" />
                  <div className="flex-1">
                    <span className="text-sm block">Face Scan</span>
                    {faceScanned['check-out'] ? (
                      <span className="text-xs text-green-600 dark:text-green-400 font-semibold">✓ Verified</span>
                    ) : (
                      <span className="text-xs text-gray-500">Not scanned</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => scanFace('check-out')}
                  disabled={!isInCheckOutWindow || marking || faceScanned['check-out']}
                  className="text-xs px-3 py-1 bg-accent text-gray-900 rounded hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {faceScanned['check-out'] ? 'Scanned' : 'Scan'}
                </button>
              </div>

              {/* Mark Button */}
              <button
                onClick={() => markAttendance('check-out', false)}
                disabled={!isInCheckOutWindow || marking || !canMarkAttendance || !locationFetched['check-out'] || !faceScanned['check-out']}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {marking ? 'Marking...' : 'Mark Check-Out'}
              </button>

              {/* Verification Status Message */}
              {(!locationFetched['check-out'] || !faceScanned['check-out']) && isInCheckOutWindow && (
                <div className="text-xs text-center text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                  {!locationFetched['check-out'] && !faceScanned['check-out'] && 'Fetch location and scan face to enable'}
                  {locationFetched['check-out'] && !faceScanned['check-out'] && 'Scan face to enable'}
                  {!locationFetched['check-out'] && faceScanned['check-out'] && 'Fetch location to enable'}
                </div>
              )}

              {/* WFH Button */}
              <button
                onClick={() => markAttendance('check-out', true)}
                disabled={!isInCheckOutWindow || marking || !canMarkAttendance}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                {marking ? 'Marking...' : 'Work From Home'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Calendar View */}
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
        {selectedDate && attendanceHistory.has(format(selectedDate, 'yyyy-MM-dd')) && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {format(selectedDate, 'MMMM d, yyyy')}
            </div>
            {(() => {
              const record = attendanceHistory.get(format(selectedDate, 'yyyy-MM-dd'));
              return record && (
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(record.status)}`}>
                  {record.status.replace('-', ' ').toUpperCase()}
                  {record.isManual && ' (Manual)'}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendanceView;
