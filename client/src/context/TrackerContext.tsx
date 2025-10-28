import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ==================== CORE DATA MODELS ====================

export interface TimeEntry {
  _id: string;
  userId: string;
  userName: string;
  taskId?: string;
  taskTitle?: string;
  projectId?: string;
  projectName?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  billable: boolean;
  notes?: string;
  location?: string;
  status: 'running' | 'stopped' | 'submitted' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityEvent {
  _id: string;
  type: 'task_status_change' | 'file_upload' | 'comment' | 'approval' | 'commit' | 'pr_merge' | 'meeting' | 'timer_start' | 'timer_stop' | 'issue_created' | 'issue_resolved';
  actor: string;
  actorName: string;
  timestamp: Date;
  taskId?: string;
  taskTitle?: string;
  projectId?: string;
  projectName?: string;
  description: string;
  metadata?: Record<string, any>;
  severity?: 'info' | 'warning' | 'critical';
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'in_progress' | 'resolved' | 'closed';
  linkedTaskId?: string;
  linkedTaskTitle?: string;
  projectId?: string;
  projectName?: string;
  reporter: string;
  reporterName: string;
  assignee?: string;
  assigneeName?: string;
  rootCause?: string;
  eta?: Date;
  slaDeadline?: Date;
  slaBreached: boolean;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface ProgressSnapshot {
  _id: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  percentComplete: number;
  hoursLogged: number;
  remainingEstimate: number;
  aiRiskScore: number; // 0-100
  velocity: number; // hours per day
  predictedCompletion?: Date;
  timestamp: Date;
}

export interface Worklog {
  _id: string;
  userId: string;
  userName: string;
  weekStartDate: Date;
  weekEndDate: Date;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  overtimeHours: number;
  entries: TimeEntry[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

export interface SLARule {
  _id: string;
  name: string;
  type: 'deadline_breach' | 'overtime_hours' | 'budget_burn' | 'idle_timer' | 'issue_resolution';
  threshold: number;
  unit: 'hours' | 'days' | 'percentage' | 'count';
  projectId?: string;
  enabled: boolean;
  alertChannels: ('in_app' | 'email' | 'slack')[];
  escalationRules?: {
    delay: number; // minutes
    escalateTo: string[];
  };
}

export interface Alert {
  _id: string;
  ruleId: string;
  ruleName: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  taskId?: string;
  projectId?: string;
  userId?: string;
  triggeredAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface TeamMetrics {
  totalHoursToday: number;
  totalHoursWeek: number;
  utilizationPercent: number;
  activeTimers: number;
  idleAlerts: number;
  billablePercent: number;
  overtimeHours: number;
  avgCycleTime: number; // hours
  issuesMTTR: number; // hours
}

export interface UserUtilization {
  userId: string;
  userName: string;
  hoursLogged: number;
  capacity: number; // expected hours
  utilization: number; // percentage
  activeProjects: number;
  runningTimer: boolean;
  lastActivity?: Date;
}

// ==================== CONTEXT ====================

interface TrackerContextType {
  // State
  timeEntries: TimeEntry[];
  activityEvents: ActivityEvent[];
  issues: Issue[];
  progressSnapshots: ProgressSnapshot[];
  worklogs: Worklog[];
  slaRules: SLARule[];
  alerts: Alert[];
  teamMetrics: TeamMetrics;
  userUtilizations: UserUtilization[];
  activeTimer: TimeEntry | null;

  // Time Tracking
  startTimer: (taskId?: string, projectId?: string, notes?: string) => void;
  stopTimer: () => void;
  addManualEntry: (entry: Partial<TimeEntry>) => void;
  updateTimeEntry: (entryId: string, updates: Partial<TimeEntry>) => void;
  deleteTimeEntry: (entryId: string) => void;
  bulkImportEntries: (entries: Partial<TimeEntry>[]) => void;

  // Activity Events
  logActivity: (event: Partial<ActivityEvent>) => void;
  getActivitiesByTask: (taskId: string) => ActivityEvent[];
  getActivitiesByProject: (projectId: string) => ActivityEvent[];

  // Issue Management
  createIssue: (issue: Partial<Issue>) => void;
  updateIssue: (issueId: string, updates: Partial<Issue>) => void;
  resolveIssue: (issueId: string, resolution: string) => void;
  deleteIssue: (issueId: string) => void;

  // Worklogs & Timesheets
  generateWorklog: (userId: string, weekStart: Date) => Worklog;
  submitWorklog: (worklogId: string) => void;
  approveWorklog: (worklogId: string, approverId: string) => void;
  rejectWorklog: (worklogId: string, reason: string) => void;

  // SLA & Alerts
  createSLARule: (rule: Partial<SLARule>) => void;
  updateSLARule: (ruleId: string, updates: Partial<SLARule>) => void;
  deleteSLARule: (ruleId: string) => void;
  acknowledgeAlert: (alertId: string, userId: string) => void;
  resolveAlert: (alertId: string) => void;

  // Analytics
  getTeamMetrics: () => TeamMetrics;
  getUserUtilization: (userId: string) => UserUtilization | undefined;
  getProjectHours: (projectId: string, startDate: Date, endDate: Date) => number;
  getBillableRatio: (userId?: string, projectId?: string) => number;
  getCycleTime: (taskId: string) => number;

  // Progress Snapshots
  captureSnapshot: (taskId: string) => void;
  getTaskSnapshots: (taskId: string) => ProgressSnapshot[];
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within TrackerProvider');
  }
  return context;
};

// ==================== PROVIDER ====================

interface TrackerProviderProps {
  children: ReactNode;
}

export const TrackerProvider: React.FC<TrackerProviderProps> = ({ children }) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [progressSnapshots, setProgressSnapshots] = useState<ProgressSnapshot[]>([]);
  const [worklogs, setWorklogs] = useState<Worklog[]>([]);
  const [slaRules, setSlaRules] = useState<SLARule[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);

  // Initialize with sample data
  useEffect(() => {
    initializeSampleData();
  }, []);

  const initializeSampleData = () => {
    // Sample SLA Rules
    const sampleRules: SLARule[] = [
      {
        _id: '1',
        name: 'Deadline Breach Alert',
        type: 'deadline_breach',
        threshold: 24,
        unit: 'hours',
        enabled: true,
        alertChannels: ['in_app', 'email']
      },
      {
        _id: '2',
        name: 'Overtime Warning',
        type: 'overtime_hours',
        threshold: 40,
        unit: 'hours',
        enabled: true,
        alertChannels: ['in_app']
      }
    ];
    setSlaRules(sampleRules);

    // Sample Issues
    const sampleIssues: Issue[] = [
      {
        _id: '1',
        title: 'API timeout on production',
        description: 'Users experiencing 504 errors on checkout',
        severity: 'critical',
        status: 'in_progress',
        linkedTaskId: 'task-1',
        linkedTaskTitle: 'Fix payment gateway',
        reporter: 'user-1',
        reporterName: 'John Doe',
        assignee: 'user-2',
        assigneeName: 'Jane Smith',
        slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
        slaBreached: false,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];
    setIssues(sampleIssues);
  };

  // ==================== TIME TRACKING ====================

  const startTimer = (taskId?: string, projectId?: string, notes?: string) => {
    // Stop any existing timer
    if (activeTimer) {
      stopTimer();
    }

    const newEntry: TimeEntry = {
      _id: Date.now().toString(),
      userId: 'current-user',
      userName: 'Current User',
      taskId,
      taskTitle: taskId ? `Task ${taskId}` : undefined,
      projectId,
      projectName: projectId ? `Project ${projectId}` : undefined,
      startTime: new Date(),
      duration: 0,
      billable: true,
      notes,
      status: 'running',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setActiveTimer(newEntry);
    setTimeEntries([...timeEntries, newEntry]);

    // Log activity
    logActivity({
      type: 'timer_start',
      actor: 'current-user',
      actorName: 'Current User',
      timestamp: new Date(),
      taskId,
      projectId,
      description: `Started timer${taskId ? ` on ${newEntry.taskTitle}` : ''}`
    });
  };

  const stopTimer = () => {
    if (!activeTimer) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeTimer.startTime.getTime()) / 60000); // minutes

    const updatedEntry: TimeEntry = {
      ...activeTimer,
      endTime,
      duration,
      status: 'stopped',
      updatedAt: new Date()
    };

    setTimeEntries(timeEntries.map(e => e._id === activeTimer._id ? updatedEntry : e));
    setActiveTimer(null);

    // Log activity
    logActivity({
      type: 'timer_stop',
      actor: 'current-user',
      actorName: 'Current User',
      timestamp: new Date(),
      taskId: activeTimer.taskId,
      projectId: activeTimer.projectId,
      description: `Stopped timer (${duration} minutes)${activeTimer.taskId ? ` on ${activeTimer.taskTitle}` : ''}`
    });
  };

  const addManualEntry = (entry: Partial<TimeEntry>) => {
    const newEntry: TimeEntry = {
      _id: Date.now().toString(),
      userId: entry.userId || 'current-user',
      userName: entry.userName || 'Current User',
      taskId: entry.taskId,
      taskTitle: entry.taskTitle,
      projectId: entry.projectId,
      projectName: entry.projectName,
      startTime: entry.startTime || new Date(),
      endTime: entry.endTime,
      duration: entry.duration || 0,
      billable: entry.billable ?? true,
      notes: entry.notes,
      location: entry.location,
      status: 'stopped',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTimeEntries([...timeEntries, newEntry]);
  };

  const updateTimeEntry = (entryId: string, updates: Partial<TimeEntry>) => {
    setTimeEntries(timeEntries.map(entry =>
      entry._id === entryId ? { ...entry, ...updates, updatedAt: new Date() } : entry
    ));
  };

  const deleteTimeEntry = (entryId: string) => {
    setTimeEntries(timeEntries.filter(e => e._id !== entryId));
  };

  const bulkImportEntries = (entries: Partial<TimeEntry>[]) => {
    const newEntries = entries.map((entry, idx) => ({
      _id: `${Date.now()}-${idx}`,
      userId: entry.userId || 'current-user',
      userName: entry.userName || 'Current User',
      taskId: entry.taskId,
      taskTitle: entry.taskTitle,
      projectId: entry.projectId,
      projectName: entry.projectName,
      startTime: entry.startTime || new Date(),
      endTime: entry.endTime,
      duration: entry.duration || 0,
      billable: entry.billable ?? true,
      notes: entry.notes,
      location: entry.location,
      status: 'stopped' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    setTimeEntries([...timeEntries, ...newEntries]);
  };

  // ==================== ACTIVITY EVENTS ====================

  const logActivity = (event: Partial<ActivityEvent>) => {
    const newEvent: ActivityEvent = {
      _id: Date.now().toString(),
      type: event.type || 'comment',
      actor: event.actor || 'current-user',
      actorName: event.actorName || 'Current User',
      timestamp: event.timestamp || new Date(),
      taskId: event.taskId,
      taskTitle: event.taskTitle,
      projectId: event.projectId,
      projectName: event.projectName,
      description: event.description || '',
      metadata: event.metadata,
      severity: event.severity || 'info'
    };

    setActivityEvents([newEvent, ...activityEvents]);
  };

  const getActivitiesByTask = (taskId: string) => {
    return activityEvents.filter(e => e.taskId === taskId);
  };

  const getActivitiesByProject = (projectId: string) => {
    return activityEvents.filter(e => e.projectId === projectId);
  };

  // ==================== ISSUE MANAGEMENT ====================

  const createIssue = (issue: Partial<Issue>) => {
    const newIssue: Issue = {
      _id: Date.now().toString(),
      title: issue.title || 'New Issue',
      description: issue.description || '',
      severity: issue.severity || 'medium',
      status: 'reported',
      linkedTaskId: issue.linkedTaskId,
      linkedTaskTitle: issue.linkedTaskTitle,
      projectId: issue.projectId,
      projectName: issue.projectName,
      reporter: issue.reporter || 'current-user',
      reporterName: issue.reporterName || 'Current User',
      assignee: issue.assignee,
      assigneeName: issue.assigneeName,
      rootCause: issue.rootCause,
      eta: issue.eta,
      slaDeadline: issue.slaDeadline,
      slaBreached: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setIssues([...issues, newIssue]);

    // Log activity
    logActivity({
      type: 'issue_created',
      actor: newIssue.reporter,
      actorName: newIssue.reporterName,
      timestamp: new Date(),
      taskId: newIssue.linkedTaskId,
      projectId: newIssue.projectId,
      description: `Created issue: ${newIssue.title}`,
      severity: newIssue.severity === 'critical' ? 'critical' : 'warning'
    });
  };

  const updateIssue = (issueId: string, updates: Partial<Issue>) => {
    setIssues(issues.map(issue =>
      issue._id === issueId ? { ...issue, ...updates, updatedAt: new Date() } : issue
    ));
  };

  const resolveIssue = (issueId: string, resolution: string) => {
    const issue = issues.find(i => i._id === issueId);
    if (!issue) return;

    updateIssue(issueId, {
      status: 'resolved',
      resolution,
      resolvedAt: new Date()
    });

    // Log activity
    logActivity({
      type: 'issue_resolved',
      actor: 'current-user',
      actorName: 'Current User',
      timestamp: new Date(),
      taskId: issue.linkedTaskId,
      projectId: issue.projectId,
      description: `Resolved issue: ${issue.title}`,
      severity: 'info'
    });
  };

  const deleteIssue = (issueId: string) => {
    setIssues(issues.filter(i => i._id !== issueId));
  };

  // ==================== WORKLOGS & TIMESHEETS ====================

  const generateWorklog = (userId: string, weekStart: Date): Worklog => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const userEntries = timeEntries.filter(e =>
      e.userId === userId &&
      e.startTime >= weekStart &&
      e.startTime <= weekEnd
    );

    const totalHours = userEntries.reduce((sum, e) => sum + e.duration / 60, 0);
    const billableHours = userEntries.filter(e => e.billable).reduce((sum, e) => sum + e.duration / 60, 0);
    const nonBillableHours = totalHours - billableHours;
    const overtimeHours = Math.max(0, totalHours - 40);

    const worklog: Worklog = {
      _id: Date.now().toString(),
      userId,
      userName: userEntries[0]?.userName || 'User',
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      totalHours,
      billableHours,
      nonBillableHours,
      overtimeHours,
      entries: userEntries,
      status: 'draft'
    };

    setWorklogs([...worklogs, worklog]);
    return worklog;
  };

  const submitWorklog = (worklogId: string) => {
    setWorklogs(worklogs.map(w =>
      w._id === worklogId ? { ...w, status: 'submitted', submittedAt: new Date() } : w
    ));
  };

  const approveWorklog = (worklogId: string, approverId: string) => {
    setWorklogs(worklogs.map(w =>
      w._id === worklogId ? {
        ...w,
        status: 'approved',
        approvedBy: approverId,
        approvedAt: new Date()
      } : w
    ));
  };

  const rejectWorklog = (worklogId: string, reason: string) => {
    setWorklogs(worklogs.map(w =>
      w._id === worklogId ? { ...w, status: 'rejected', rejectionReason: reason } : w
    ));
  };

  // ==================== SLA & ALERTS ====================

  const createSLARule = (rule: Partial<SLARule>) => {
    const newRule: SLARule = {
      _id: Date.now().toString(),
      name: rule.name || 'New Rule',
      type: rule.type || 'deadline_breach',
      threshold: rule.threshold || 0,
      unit: rule.unit || 'hours',
      projectId: rule.projectId,
      enabled: rule.enabled ?? true,
      alertChannels: rule.alertChannels || ['in_app'],
      escalationRules: rule.escalationRules
    };

    setSlaRules([...slaRules, newRule]);
  };

  const updateSLARule = (ruleId: string, updates: Partial<SLARule>) => {
    setSlaRules(slaRules.map(rule =>
      rule._id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const deleteSLARule = (ruleId: string) => {
    setSlaRules(slaRules.filter(r => r._id !== ruleId));
  };

  const acknowledgeAlert = (alertId: string, userId: string) => {
    setAlerts(alerts.map(alert =>
      alert._id === alertId ? {
        ...alert,
        acknowledged: true,
        acknowledgedBy: userId,
        acknowledgedAt: new Date()
      } : alert
    ));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(alerts.map(alert =>
      alert._id === alertId ? {
        ...alert,
        resolved: true,
        resolvedAt: new Date()
      } : alert
    ));
  };

  // ==================== ANALYTICS ====================

  const getTeamMetrics = (): TeamMetrics => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const todayEntries = timeEntries.filter(e => e.startTime >= today);
    const weekEntries = timeEntries.filter(e => e.startTime >= weekStart);

    const totalHoursToday = todayEntries.reduce((sum, e) => sum + e.duration / 60, 0);
    const totalHoursWeek = weekEntries.reduce((sum, e) => sum + e.duration / 60, 0);
    const billableHours = weekEntries.filter(e => e.billable).reduce((sum, e) => sum + e.duration / 60, 0);
    const overtimeHours = Math.max(0, totalHoursWeek - 40);

    return {
      totalHoursToday,
      totalHoursWeek,
      utilizationPercent: (totalHoursWeek / 40) * 100,
      activeTimers: activeTimer ? 1 : 0,
      idleAlerts: 0,
      billablePercent: totalHoursWeek > 0 ? (billableHours / totalHoursWeek) * 100 : 0,
      overtimeHours,
      avgCycleTime: 24,
      issuesMTTR: 4
    };
  };

  const getUserUtilization = (userId: string): UserUtilization | undefined => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const userEntries = timeEntries.filter(e =>
      e.userId === userId && e.startTime >= weekStart
    );

    const hoursLogged = userEntries.reduce((sum, e) => sum + e.duration / 60, 0);
    const capacity = 40;

    return {
      userId,
      userName: userEntries[0]?.userName || 'User',
      hoursLogged,
      capacity,
      utilization: (hoursLogged / capacity) * 100,
      activeProjects: new Set(userEntries.map(e => e.projectId).filter(Boolean)).size,
      runningTimer: activeTimer?.userId === userId,
      lastActivity: userEntries[0]?.startTime
    };
  };

  const getProjectHours = (projectId: string, startDate: Date, endDate: Date): number => {
    const projectEntries = timeEntries.filter(e =>
      e.projectId === projectId &&
      e.startTime >= startDate &&
      e.startTime <= endDate
    );

    return projectEntries.reduce((sum, e) => sum + e.duration / 60, 0);
  };

  const getBillableRatio = (userId?: string, projectId?: string): number => {
    let entries = timeEntries;

    if (userId) entries = entries.filter(e => e.userId === userId);
    if (projectId) entries = entries.filter(e => e.projectId === projectId);

    const totalHours = entries.reduce((sum, e) => sum + e.duration / 60, 0);
    const billableHours = entries.filter(e => e.billable).reduce((sum, e) => sum + e.duration / 60, 0);

    return totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
  };

  const getCycleTime = (taskId: string): number => {
    const taskEvents = activityEvents.filter(e => e.taskId === taskId);
    if (taskEvents.length < 2) return 0;

    const start = taskEvents[taskEvents.length - 1].timestamp;
    const end = taskEvents[0].timestamp;

    return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
  };

  // ==================== PROGRESS SNAPSHOTS ====================

  const captureSnapshot = (taskId: string) => {
    const taskEntries = timeEntries.filter(e => e.taskId === taskId);
    const hoursLogged = taskEntries.reduce((sum, e) => sum + e.duration / 60, 0);

    const snapshot: ProgressSnapshot = {
      _id: Date.now().toString(),
      taskId,
      taskTitle: taskEntries[0]?.taskTitle || 'Task',
      projectId: taskEntries[0]?.projectId || '',
      projectName: taskEntries[0]?.projectName || 'Project',
      percentComplete: 50,
      hoursLogged,
      remainingEstimate: Math.max(0, 10 - hoursLogged),
      aiRiskScore: Math.random() * 100,
      velocity: hoursLogged / 7,
      timestamp: new Date()
    };

    setProgressSnapshots([...progressSnapshots, snapshot]);
  };

  const getTaskSnapshots = (taskId: string): ProgressSnapshot[] => {
    return progressSnapshots.filter(s => s.taskId === taskId);
  };

  const teamMetrics = getTeamMetrics();
  const userUtilizations: UserUtilization[] = [];

  const value: TrackerContextType = {
    timeEntries,
    activityEvents,
    issues,
    progressSnapshots,
    worklogs,
    slaRules,
    alerts,
    teamMetrics,
    userUtilizations,
    activeTimer,
    startTimer,
    stopTimer,
    addManualEntry,
    updateTimeEntry,
    deleteTimeEntry,
    bulkImportEntries,
    logActivity,
    getActivitiesByTask,
    getActivitiesByProject,
    createIssue,
    updateIssue,
    resolveIssue,
    deleteIssue,
    generateWorklog,
    submitWorklog,
    approveWorklog,
    rejectWorklog,
    createSLARule,
    updateSLARule,
    deleteSLARule,
    acknowledgeAlert,
    resolveAlert,
    getTeamMetrics,
    getUserUtilization,
    getProjectHours,
    getBillableRatio,
    getCycleTime,
    captureSnapshot,
    getTaskSnapshots
  };

  return (
    <TrackerContext.Provider value={value}>
      {children}
    </TrackerContext.Provider>
  );
};
