import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Users, Check, X, Home, Edit, Save, XCircle } from 'lucide-react';
import apiService from '../../services/api';
import { useApp } from '../../context/AppContext';
import 'react-day-picker/dist/style.css';

interface ManualAttendanceViewProps {
  workspaceId: string;
}

interface WorkspaceMember {
  _id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

interface AttendanceRecord {
  user: string;
  status: 'present' | 'absent' | 'work-from-home' | 'not-marked';
  markedBy: string;
  markedAt: Date;
}

const ManualAttendanceView: React.FC<ManualAttendanceViewProps> = ({ workspaceId }) => {
  const { state, dispatch } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const [editingRecords, setEditingRecords] = useState<Record<string, 'present' | 'absent' | 'work-from-home' | 'not-marked'>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadWorkspaceMembers();
  }, [workspaceId]);

  useEffect(() => {
    if (selectedDate) {
      loadAttendanceForDate(selectedDate);
    }
  }, [selectedDate, refreshKey]);

  const loadWorkspaceMembers = async () => {
    try {
      setLoading(true);
      // Get workspace from state
      const workspace = state.workspaces.find(w => w._id === workspaceId);
      
      if (!workspace) {
        console.error('Workspace not found');
        setMembers([]);
        return;
      }

      console.log('📋 [LOAD MEMBERS] Workspace:', workspace);
      console.log('📋 [LOAD MEMBERS] Workspace members:', workspace.members);
      console.log('📋 [LOAD MEMBERS] Workspace owner:', workspace.owner);

      // Get all members from workspace (excluding owner to avoid duplication)
      const workspaceMembers = workspace.members || [];
      const allMembers: WorkspaceMember[] = [];

      // Get owner ID for comparison
      const ownerId = typeof workspace.owner === 'object' 
        ? (workspace.owner as any)._id 
        : workspace.owner;

      // Add members (excluding owner)
      workspaceMembers.forEach((member: any) => {
        const userData = member.user || member;
        
        // Skip if user data is missing or user doesn't exist
        if (!userData || !userData._id) {
          console.warn('⚠️ [LOAD MEMBERS] Skipping member with missing user data:', member);
          return;
        }
        
        // Skip if this is the owner (to avoid duplication)
        if (userData._id === ownerId) {
          return;
        }
        
        // Skip if user doesn't have basic required fields (indicates deleted/invalid user)
        if (!userData.email && !userData.fullName && !userData.username) {
          console.warn('⚠️ [LOAD MEMBERS] Skipping user with no identifying information:', userData._id);
          return;
        }
        
        // Better name fallback: fullName > username > email > 'Unknown User'
        const displayName = userData.fullName || 
                           userData.username || 
                           userData.email?.split('@')[0] || 
                           'Unknown User';
        
        allMembers.push({
          _id: userData._id,
          fullName: displayName,
          email: userData.email || '',
          avatarUrl: userData.avatarUrl,
          role: member.role || 'member'
        });
      });

      console.log('📋 [LOAD MEMBERS] All members (excluding owner):', allMembers);
      setMembers(allMembers);
    } catch (error) {
      console.error('Failed to load members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceForDate = async (date: Date) => {
    try {
      setLoading(true);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      console.log('📅 [LOAD ATTENDANCE] Loading for date:', dateStr);
      
      const response = await apiService.get(
        `/workspace-attendance/workspace/${workspaceId}/date/${dateStr}`
      );
      
      console.log('📅 [LOAD ATTENDANCE] Response:', response.data);
      
      // The response.data is the array directly (not wrapped in .data)
      const records = Array.isArray(response.data) ? response.data : (response.data.data || []);
      
      if (records && records.length > 0) {
        // Convert array to object keyed by user ID
        const recordsMap: Record<string, AttendanceRecord> = {};
        records.forEach((record: any) => {
          console.log('📅 [LOAD ATTENDANCE] Processing record:', record);
          
          if (record.user && record.slots && record.slots.length > 0) {
            const userId = record.user._id || record.user;
            recordsMap[userId] = {
              user: userId,
              status: record.slots[0].status,
              markedBy: state.userProfile._id,
              markedAt: record.slots[0].markedAt
            };
          }
        });
        
        console.log('📅 [LOAD ATTENDANCE] Records map:', recordsMap);
        setAttendanceRecords(recordsMap);
      } else {
        console.log('📅 [LOAD ATTENDANCE] No data found');
        setAttendanceRecords({});
      }
    } catch (error) {
      console.error('Failed to load attendance:', error);
      setAttendanceRecords({});
    } finally {
      setLoading(false);
    }
  };

  const enterEditMode = () => {
    // Initialize editing records with current attendance or 'not-marked'
    const initialEditingRecords: Record<string, 'present' | 'absent' | 'work-from-home' | 'not-marked'> = {};
    members.forEach(member => {
      const record = attendanceRecords[member._id];
      // Preserve existing status or default to 'not-marked'
      initialEditingRecords[member._id] = record ? record.status : 'not-marked';
    });
    setEditingRecords(initialEditingRecords);
    setIsEditMode(true);
  };

  const cancelEdit = () => {
    setEditingRecords({});
    setIsEditMode(false);
  };

  const updateMemberStatus = (userId: string, status: 'present' | 'absent' | 'work-from-home') => {
    setEditingRecords(prev => ({
      ...prev,
      [userId]: status
    }));
  };

  const saveAllAttendance = async () => {
    try {
      setSaving(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      console.log('💾 [SAVE ATTENDANCE] Starting save...', { dateStr, editingRecords });
      
      // Save each member's attendance (skip not-marked)
      const savePromises = Object.entries(editingRecords)
        .filter(([_, status]) => status !== 'not-marked')
        .map(async ([userId, status]) => {
          console.log('💾 [SAVE ATTENDANCE] Saving:', { userId, status, dateStr });
          try {
            const response = await apiService.post(`/workspace-attendance/workspace/${workspaceId}/mark-manual`, {
              userId,
              date: dateStr,
              status,
              slotName: 'Manual Entry'
            });
            return { success: true, userId, response };
          } catch (error) {
            console.error('Failed to save for user:', userId, error);
            return { success: false, userId, error };
          }
        });

      console.log('💾 [SAVE ATTENDANCE] Total promises:', savePromises.length);

      const results = await Promise.all(savePromises);
      console.log('💾 [SAVE ATTENDANCE] Results:', results);

      // Check if all succeeded
      const allSucceeded = results.every(r => r.success);
      const someSucceeded = results.some(r => r.success);

      // Trigger refresh to reload data
      setRefreshKey(prev => prev + 1);
      
      setIsEditMode(false);
      setEditingRecords({});

      if (allSucceeded) {
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            id: Date.now().toString(),
            type: 'success',
            message: 'Attendance saved successfully',
            duration: 2000
          }
        });
      } else if (someSucceeded) {
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            id: Date.now().toString(),
            type: 'warning',
            message: 'Some attendance records saved, but some failed',
            duration: 3000
          }
        });
      } else {
        throw new Error('All attendance saves failed');
      }
    } catch (error: any) {
      console.error('Failed to save attendance:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: error.response?.data?.message || 'Failed to save attendance',
          duration: 3000
        }
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'absent':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700';
      case 'work-from-home':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <Check className="w-4 h-4" />;
      case 'absent':
        return <X className="w-4 h-4" />;
      case 'work-from-home':
        return <Home className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manual Attendance</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {isEditMode ? 'Mark attendance for team members' : 'View attendance history'}
          </p>
        </div>
        
        {!isEditMode && (
          <button
            onClick={enterEditMode}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover font-semibold shadow-sm transition-all"
          >
            <Edit className="w-4 h-4" />
            Edit Attendance
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-accent" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Select Date
              </h4>
            </div>
            
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={isEditMode}
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
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Selected Date:
              </p>
              <p className="text-lg font-bold text-accent">
                {format(selectedDate, 'MMMM dd, yyyy')}
              </p>
            </div>

            {isEditMode && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  📝 Edit mode active. Make changes and click Save below.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Members List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Team Members ({members.length})
                  </h4>
                </div>
                {loading && (
                  <div className="text-sm text-gray-500">Loading...</div>
                )}
              </div>
            </div>

            <div className="p-6">
              {members.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No team members found
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => {
                    const currentStatus = isEditMode 
                      ? editingRecords[member._id] 
                      : attendanceRecords[member._id]?.status || 'not-marked';
                    
                    return (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                      >
                        {/* Member Info */}
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                            {member.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                alt={member.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-semibold text-accent">
                                {member.fullName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {member.fullName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {member.email}
                            </p>
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-2">
                          {isEditMode ? (
                            // Edit Mode - Show selection buttons
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateMemberStatus(member._id, 'present')}
                                className={`p-2 rounded-lg border-2 transition-all ${
                                  currentStatus === 'present'
                                    ? 'bg-green-500 border-green-600 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-500'
                                }`}
                                title="Present"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => updateMemberStatus(member._id, 'absent')}
                                className={`p-2 rounded-lg border-2 transition-all ${
                                  currentStatus === 'absent'
                                    ? 'bg-red-500 border-red-600 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-500'
                                }`}
                                title="Absent"
                              >
                                <X className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => updateMemberStatus(member._id, 'work-from-home')}
                                className={`p-2 rounded-lg border-2 transition-all ${
                                  currentStatus === 'work-from-home'
                                    ? 'bg-blue-500 border-blue-600 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500'
                                }`}
                                title="Work From Home"
                              >
                                <Home className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            // View Mode - Show status badge
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getStatusColor(currentStatus)}`}>
                              {getStatusIcon(currentStatus)}
                              <span className="text-sm font-semibold capitalize">
                                {currentStatus === 'not-marked' ? 'Not Marked' : currentStatus.replace('-', ' ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons in Edit Mode */}
              {isEditMode && members.length > 0 && (
                <div className="mt-6 flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={saveAllAttendance}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover font-semibold shadow-sm transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Attendance'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualAttendanceView;
