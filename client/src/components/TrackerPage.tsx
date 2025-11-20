import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Square, Clock, Target, Users, TrendingUp, 
  BarChart3, Calendar, Filter, Search, MoreVertical,
  Edit, Trash2, Eye, CheckCircle, AlertCircle, Zap,
  Bot, Crown, Star, Flag, Tag, MessageSquare, FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';

interface TimeEntry {
  _id: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  description?: string;
  isRunning: boolean;
  tags: string[];
  billable: boolean;
  hourlyRate?: number;
}

interface Project {
  _id: string;
  name: string;
  color: string;
  totalTime: number;
  billableTime: number;
  tasks: Array<{
    _id: string;
    title: string;
    totalTime: number;
    billableTime: number;
  }>;
}

const TrackerPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const { canUseAdvancedAnalytics } = useFeatureAccess();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [description, setDescription] = useState('');
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [activeTab, setActiveTab] = useState<'timer' | 'entries' | 'reports'>('timer');
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedAt, setPausedAt] = useState<Date | null>(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0); // in seconds

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockTimeEntries: TimeEntry[] = [
      {
        _id: '1',
        taskId: 't1',
        taskTitle: 'Design review meeting',
        projectId: 'p1',
        projectName: 'E-commerce Platform',
        startTime: new Date('2024-03-20T09:00:00'),
        endTime: new Date('2024-03-20T11:00:00'),
        duration: 120,
        description: 'Reviewed UI mockups with the team',
        isRunning: false,
        tags: ['meeting', 'design'],
        billable: true,
        hourlyRate: 75
      },
      {
        _id: '2',
        taskId: 't2',
        taskTitle: 'Code review for authentication',
        projectId: 'p1',
        projectName: 'E-commerce Platform',
        startTime: new Date('2024-03-20T14:00:00'),
        endTime: new Date('2024-03-20T16:30:00'),
        duration: 150,
        description: 'Reviewed JWT implementation',
        isRunning: false,
        tags: ['code', 'review'],
        billable: true,
        hourlyRate: 75
      },
      {
        _id: '3',
        taskId: 't3',
        taskTitle: 'Client presentation prep',
        projectId: 'p2',
        projectName: 'Mobile App',
        startTime: new Date('2024-03-21T10:00:00'),
        endTime: undefined,
        duration: 0,
        description: 'Preparing slides and demo',
        isRunning: true,
        tags: ['presentation', 'client'],
        billable: true,
        hourlyRate: 100
      }
    ];

    const mockProjects: Project[] = [
      {
        _id: 'p1',
        name: 'E-commerce Platform',
        color: 'bg-accent',
        totalTime: 270,
        billableTime: 270,
        tasks: [
          { _id: 't1', title: 'Design review meeting', totalTime: 120, billableTime: 120 },
          { _id: 't2', title: 'Code review for authentication', totalTime: 150, billableTime: 150 }
        ]
      },
      {
        _id: 'p2',
        name: 'Mobile App',
        color: 'bg-green-500',
        totalTime: 0,
        billableTime: 0,
        tasks: [
          { _id: 't3', title: 'Client presentation prep', totalTime: 0, billableTime: 0 }
        ]
      }
    ];

    setTimeEntries(mockTimeEntries);
    setProjects(mockProjects);
    
    // Find running entry
    const runningEntry = mockTimeEntries.find(entry => entry.isRunning);
    if (runningEntry) {
      setCurrentEntry(runningEntry);
      setIsTracking(true);
    }
  }, []);

  // Timer effect - updates elapsed time every second
  useEffect(() => {
    if (isTracking && currentEntry && !isPaused) {
      const interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - currentEntry.startTime.getTime()) / 1000) - totalPausedTime;
        setElapsedTime(elapsed);
        
        // Update the current entry duration
        setTimeEntries(entries =>
          entries.map(entry =>
            entry._id === currentEntry._id
              ? { ...entry, duration: Math.floor(elapsed / 60) }
              : entry
          )
        );
      }, 1000);
      
      setTimerInterval(interval);
      
      return () => {
        clearInterval(interval);
        setTimerInterval(null);
      };
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  }, [isTracking, currentEntry, isPaused, totalPausedTime]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const startTracking = () => {
    if (!selectedProject || !selectedTask) return;

    const project = projects.find(p => p._id === selectedProject);
    const task = project?.tasks.find(t => t._id === selectedTask);

    const newEntry: TimeEntry = {
      _id: Date.now().toString(),
      taskId: selectedTask,
      taskTitle: task?.title || '',
      projectId: selectedProject,
      projectName: project?.name || '',
      startTime: new Date(),
      duration: 0,
      description,
      isRunning: true,
      tags: [],
      billable: true,
      hourlyRate: 75
    };

    setTimeEntries([newEntry, ...timeEntries]);
    setCurrentEntry(newEntry);
    setIsTracking(true);
    setIsPaused(false);
    setPausedAt(null);
    setTotalPausedTime(0);
    setElapsedTime(0);
    setShowAddEntry(false);
  };

  const stopTracking = () => {
    if (!currentEntry) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - currentEntry.startTime.getTime()) / (1000 * 60)) - Math.floor(totalPausedTime / 60);

    setTimeEntries(entries =>
      entries.map(entry =>
        entry._id === currentEntry._id
          ? { ...entry, endTime, duration, isRunning: false }
          : entry
      )
    );

    setCurrentEntry(null);
    setIsTracking(false);
    setIsPaused(false);
    setPausedAt(null);
    setTotalPausedTime(0);
    setElapsedTime(0);
  };

  const pauseTracking = () => {
    if (!currentEntry) return;
    
    if (isPaused) {
      // Resume tracking
      if (pausedAt) {
        const pauseDuration = Math.floor((new Date().getTime() - pausedAt.getTime()) / 1000);
        setTotalPausedTime(prev => prev + pauseDuration);
      }
      setIsPaused(false);
      setPausedAt(null);
    } else {
      // Pause tracking
      setIsPaused(true);
      setPausedAt(new Date());
    }
  };

  const getTotalTimeToday = () => {
    const today = new Date();
    return timeEntries
      .filter(entry => 
        !entry.isRunning && 
        new Date(entry.startTime).toDateString() === today.toDateString()
      )
      .reduce((total, entry) => total + entry.duration, 0);
  };

  const getTotalTimeThisWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    return timeEntries
      .filter(entry => 
        !entry.isRunning && 
        new Date(entry.startTime) >= startOfWeek
      )
      .reduce((total, entry) => total + entry.duration, 0);
  };

  const getBillableAmount = () => {
    return timeEntries
      .filter(entry => entry.billable && !entry.isRunning)
      .reduce((total, entry) => total + (entry.duration / 60) * (entry.hourlyRate || 0), 0);
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Time Tracker</h1>
            <p className="text-gray-600 mt-1">Track your time and productivity</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddEntry(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
            >
              <Clock className="w-4 h-4" />
              Add Entry
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer Section */}
            <div className="bg-white rounded-lg border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Timer</h2>
                <div className="flex items-center gap-2">
                  {['timer', 'entries', 'reports'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        activeTab === tab
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'timer' && (
                <div className="space-y-6">
                  {/* Current Timer */}
                  {isTracking && currentEntry ? (
                    <div className={`text-center p-8 rounded-lg ${
                      isPaused ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-blue-50'
                    }`}>
                      <div className="text-4xl font-mono font-bold mb-2 ${
                        isPaused ? 'text-yellow-600' : 'text-accent-dark'
                      }">
                        {formatElapsedTime(elapsedTime)}
                      </div>
                      {isPaused && (
                        <div className="text-lg text-yellow-700 mb-2 font-medium">
                          ⏸️ Timer Paused
                        </div>
                      )}
                      <div className="text-lg text-gray-700 mb-4">
                        {currentEntry.projectName} - {currentEntry.taskTitle}
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={pauseTracking}
                          className={`p-3 text-white rounded-lg ${
                            isPaused 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : 'bg-yellow-500 hover:bg-yellow-600'
                          }`}
                        >
                          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={stopTracking}
                          className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <Square className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No active timer</h3>
                      <p className="text-gray-600 mb-4">Start tracking time for your tasks</p>
                      <button
                        onClick={() => setShowAddEntry(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                      >
                        <Play className="w-4 h-4" />
                        Start Timer
                      </button>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{formatDuration(getTotalTimeToday())}</div>
                      <div className="text-sm text-gray-600">Today</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{formatDuration(getTotalTimeThisWeek())}</div>
                      <div className="text-sm text-gray-600">This Week</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">${getBillableAmount().toFixed(0)}</div>
                      <div className="text-sm text-gray-600">Billable</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'entries' && (
                <div className="space-y-4">
                  {timeEntries.map(entry => (
                    <div key={entry._id} className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${entry.projectId === 'p1' ? 'bg-accent' : 'bg-green-500'}`} />
                          <h3 className="font-medium text-gray-900">{entry.taskTitle}</h3>
                          <span className="text-sm text-gray-600">{entry.projectName}</span>
                        </div>
                        {entry.description && (
                          <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{formatTime(entry.startTime)}</span>
                          {entry.endTime && <span>- {formatTime(entry.endTime)}</span>}
                          <span>{formatDuration(entry.duration)}</span>
                          {entry.billable && (
                            <span className="text-green-600">${((entry.duration / 60) * (entry.hourlyRate || 0)).toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.isRunning && (
                          <div className="flex items-center gap-1 text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm">Running</span>
                          </div>
                        )}
                        <button className="p-2 text-gray-600 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-6">
                  {canUseAdvancedAnalytics() ? (
                    <div className="text-center py-8">
                      <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Reports</h3>
                      <p className="text-gray-600">Detailed time tracking reports and analytics</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Crown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Upgrade Required</h3>
                      <p className="text-gray-600">Advanced reports are available in Pro and Ultra plans</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Assistant */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-5 h-5" />
                <h3 className="font-semibold">AI Time Assistant</h3>
              </div>
              <p className="text-sm text-purple-100 mb-3">
                Get insights on your productivity patterns and time optimization suggestions.
              </p>
              <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-2 text-sm font-medium transition-colors">
                Ask AI
              </button>
            </div>

            {/* Projects */}
            <div className="bg-white rounded-lg border border-gray-300 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Projects</h3>
              <div className="space-y-3">
                {projects.map(project => (
                  <div key={project._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${project.color}`} />
                      <span className="text-sm font-medium text-gray-900">{project.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDuration(project.totalTime)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-300 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {timeEntries.slice(0, 5).map(entry => (
                  <div key={entry._id} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${entry.projectId === 'p1' ? 'bg-accent' : 'bg-green-500'}`} />
                    <span className="text-gray-900">{entry.taskTitle}</span>
                    <span className="text-gray-600 ml-auto">{formatDuration(entry.duration)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Start Timer</h3>
              <button
                onClick={() => setShowAddEntry(false)}
                className="text-gray-600 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Select project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Select task</option>
                  {selectedProject && projects.find(p => p._id === selectedProject)?.tasks.map(task => (
                    <option key={task._id} value={task._id}>{task.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="What are you working on?"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddEntry(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={startTracking}
                  disabled={!selectedProject || !selectedTask}
                  className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Timer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackerPage;
