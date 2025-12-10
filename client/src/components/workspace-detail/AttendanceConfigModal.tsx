import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import apiService from '../../services/api';
import { useApp } from '../../context/AppContext';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, addDays, getDay } from 'date-fns';

interface AttendanceConfigModalProps {
  workspaceId: string;
  onClose: () => void;
  onSave: () => void;
}

const AttendanceConfigModal: React.FC<AttendanceConfigModalProps> = ({ workspaceId, onClose, onSave }) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Configuration state
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [radius, setRadius] = useState(100);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [holidays, setHolidays] = useState<string[]>([]); // Array of date strings in YYYY-MM-DD format
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  useEffect(() => {
    loadConfiguration();
  }, [workspaceId]);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      console.log('📥 [LOAD CONFIG] Loading for workspace:', workspaceId);
      
      const response = await apiService.get(`/workspace-attendance/workspace/${workspaceId}/config`);
      
      console.log('📥 [LOAD CONFIG] Full response:', response);
      console.log('📥 [LOAD CONFIG] Response.data:', response.data);
      
      // Handle both response formats: {success, data: {...}} or direct {...}
      let cfg = null;
      
      if (response.data.success && response.data.data) {
        // Wrapped format
        cfg = response.data.data;
        console.log('📥 [LOAD CONFIG] Using wrapped format');
      } else if (response.data.workspace) {
        // Direct format (already unwrapped by apiService)
        cfg = response.data;
        console.log('📥 [LOAD CONFIG] Using direct format');
      }
      
      if (cfg) {
        console.log('📥 [LOAD CONFIG] Config object:', cfg);
        
        // Load times from checkInTime/checkOutTime
        if (cfg.checkInTime?.start) {
          console.log('📥 [LOAD CONFIG] Setting start time:', cfg.checkInTime.start);
          setStartTime(cfg.checkInTime.start);
        }
        if (cfg.checkOutTime?.end) {
          console.log('📥 [LOAD CONFIG] Setting end time:', cfg.checkOutTime.end);
          setEndTime(cfg.checkOutTime.end);
        }
        
        // Load location
        if (cfg.location) {
          console.log('📥 [LOAD CONFIG] Setting location:', cfg.location);
          setLatitude(cfg.location.lat || 0);
          setLongitude(cfg.location.lng || 0);
          setRadius(cfg.location.radiusMeters || 100);
        }
        
        // Load holidays
        if (cfg.holidays && Array.isArray(cfg.holidays)) {
          console.log('📥 [LOAD CONFIG] Setting holidays:', cfg.holidays);
          setHolidays(cfg.holidays);
        }
        
        console.log('✅ [LOAD CONFIG] Configuration loaded successfully');
      } else {
        console.log('⚠️ [LOAD CONFIG] No configuration found');
      }
    } catch (error) {
      console.error('❌ [LOAD CONFIG] Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHoliday = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setHolidays(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr];
      }
    });
  };

  const isSunday = (date: Date) => {
    return date.getDay() === 0;
  };

  const isHoliday = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return holidays.includes(dateStr) || isSunday(date);
  };

  const fetchLiveLocation = () => {
    if (!navigator.geolocation) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Geolocation is not supported by your browser',
          duration: 3000
        }
      });
      return;
    }

    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setFetchingLocation(false);
        
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            id: Date.now().toString(),
            type: 'success',
            message: 'Location fetched successfully',
            duration: 2000
          }
        });
      },
      (error) => {
        setFetchingLocation(false);
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            id: Date.now().toString(),
            type: 'error',
            message: 'Failed to fetch location: ' + error.message,
            duration: 3000
          }
        });
      }
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const configData = {
        checkInTime: {
          start: startTime,
          end: addHours(startTime, 1) // 1 hour window
        },
        checkOutTime: {
          start: subtractHours(endTime, 1), // 1 hour before
          end: endTime
        },
        location: {
          lat: latitude,
          lng: longitude,
          radiusMeters: radius
        },
        holidays: holidays, // Save holidays array
        requireLocation: true,
        requireFaceVerification: false
      };

      console.log('💾 [SAVE CONFIG] Sending data:', configData);

      await apiService.put(`/workspace-attendance/workspace/${workspaceId}/configure`, configData);

      console.log('✅ [SAVE CONFIG] Configuration saved successfully');

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Configuration saved successfully',
          duration: 2000
        }
      });

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Failed to save config:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: error.response?.data?.message || 'Failed to save configuration',
          duration: 3000
        }
      });
    } finally {
      setSaving(false);
    }
  };

  // Helper functions
  const addHours = (time: string, hours: number): string => {
    const [h, m] = time.split(':').map(Number);
    const newHour = (h + hours) % 24;
    return `${String(newHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const subtractHours = (time: string, hours: number): string => {
    const [h, m] = time.split(':').map(Number);
    const newHour = (h - hours + 24) % 24;
    return `${String(newHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Attendance Configuration</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="text-gray-600 dark:text-gray-400">Loading configuration...</div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Start Time */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                <Clock className="w-4 h-4 inline mr-2" />
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Attendance window: {startTime} - {addHours(startTime, 1)} (1 hour)
              </p>
            </div>

            {/* End Time */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                <Clock className="w-4 h-4 inline mr-2" />
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Attendance window: {subtractHours(endTime, 1)} - {endTime} (1 hour before)
              </p>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                <MapPin className="w-4 h-4 inline mr-2" />
                Office Location
              </label>
              
              {/* Fetch Live Location Button */}
              <button
                onClick={fetchLiveLocation}
                disabled={fetchingLocation}
                className="w-full px-4 py-3 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover font-semibold disabled:opacity-50 transition-all"
              >
                {fetchingLocation ? 'Fetching Location...' : 'Fetch Live Location'}
              </button>

              {/* Manual Input */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="0.000000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="0.000000"
                  />
                </div>
              </div>

              {/* Radius */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Radius (meters)
                </label>
                <input
                  type="number"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value) || 100)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="100"
                  min="10"
                />
              </div>
            </div>

            {/* Holiday Calendar */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                <Clock className="w-4 h-4 inline mr-2" />
                Holidays & Non-Working Days
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Sundays are automatically marked. Double-click any date to toggle holiday.
              </p>
              
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {format(selectedMonth, 'MMMM yyyy')}
                </div>
                <button
                  onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const start = startOfMonth(selectedMonth);
                    const end = endOfMonth(selectedMonth);
                    const days = [];
                    
                    // Add empty cells for days before month starts
                    const startDay = getDay(start);
                    for (let i = 0; i < startDay; i++) {
                      days.push(<div key={`empty-${i}`} className="aspect-square" />);
                    }
                    
                    // Add all days of the month
                    let currentDate = start;
                    while (currentDate <= end) {
                      const date = new Date(currentDate);
                      const isHol = isHoliday(date);
                      const isSun = isSunday(date);
                      
                      days.push(
                        <div
                          key={date.toISOString()}
                          onDoubleClick={() => !isSun && toggleHoliday(date)}
                          className={`
                            aspect-square flex items-center justify-center text-xs rounded cursor-pointer
                            transition-colors
                            ${isHol 
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-bold' 
                              : 'bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                            ${isSun ? 'cursor-not-allowed' : ''}
                          `}
                          title={isSun ? 'Sunday (auto-holiday)' : isHol ? 'Holiday (double-click to remove)' : 'Double-click to mark as holiday'}
                        >
                          {format(date, 'd')}
                        </div>
                      );
                      
                      currentDate = addDays(currentDate, 1);
                    }
                    
                    return days;
                  })()}
                </div>
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {holidays.length} custom holiday{holidays.length !== 1 ? 's' : ''} marked
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceConfigModal;
