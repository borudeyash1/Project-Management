import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Star, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Calendar,
  Award,
  Target,
  BarChart3
} from 'lucide-react';

const TaskRatingModal = () => {
  const { state, dispatch } = useApp();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [activeTab, setActiveTab] = useState('rate');

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const closeModal = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: 'taskRating' });
    setRating(0);
    setFeedback('');
  };

  const submitRating = () => {
    if (rating === 0) {
      showToast('Please select a rating', 'error');
      return;
    }
    
    showToast('Task rated successfully', 'success');
    closeModal();
  };

  // Mock data for task rating and performance
  const taskData = {
    id: 1,
    title: 'Design homepage mockup',
    assignee: 'Maria Garcia',
    completedAt: '2024-10-24T15:30:00Z',
    dueDate: '2024-10-25',
    quality: 'High',
    timeliness: 'On Time'
  };

  const performanceData = {
    overallRating: 4.2,
    totalTasks: 24,
    completedTasks: 22,
    onTimeTasks: 20,
    averageRating: 4.1,
    recentRatings: [
      { task: 'UI Review', rating: 5, date: '2024-10-23' },
      { task: 'Mobile Design', rating: 4, date: '2024-10-22' },
      { task: 'Logo Design', rating: 5, date: '2024-10-21' },
      { task: 'Banner Creation', rating: 3, date: '2024-10-20' },
      { task: 'Icon Set', rating: 4, date: '2024-10-19' }
    ],
    metrics: {
      completionRate: 91.7,
      onTimeRate: 83.3,
      averageQuality: 4.1,
      improvementTrend: '+0.3'
    }
  };

  const renderStars = (count, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        className={`p-1 ${interactive ? 'hover:scale-110 transition-transform' : ''}`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
        disabled={!interactive}
      >
        <Star 
          className={`w-5 h-5 ${
            i < count 
              ? 'text-yellow-500 fill-yellow-500' 
              : 'text-slate-300'
          }`} 
        />
      </button>
    ));
  };

  if (!state.modals.taskRating) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Task Rating & Performance</h2>
            <p className="text-sm text-slate-500">Rate completed task and view performance metrics</p>
          </div>
          <button 
            className="p-2 rounded-lg hover:bg-slate-100"
            onClick={closeModal}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'rate' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('rate')}
            >
              Rate Task
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'performance' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('performance')}
            >
              Performance Overview
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Rate Task Tab */}
          {activeTab === 'rate' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border p-4">
                <h3 className="text-lg font-semibold mb-4">Rate Completed Task</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{taskData.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {taskData.assignee}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Completed: {new Date(taskData.completedAt).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        taskData.timeliness === 'On Time' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {taskData.timeliness}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Overall Rating</label>
                    <div className="flex items-center gap-2">
                      {renderStars(rating, true)}
                      <span className="text-sm text-slate-600 ml-2">
                        {rating > 0 ? `${rating}/5` : 'Select rating'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Quality Assessment</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Code Quality</label>
                        <div className="flex items-center gap-1">
                          {renderStars(4, true)}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Communication</label>
                        <div className="flex items-center gap-1">
                          {renderStars(5, true)}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Problem Solving</label>
                        <div className="flex items-center gap-1">
                          {renderStars(4, true)}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Timeliness</label>
                        <div className="flex items-center gap-1">
                          {renderStars(5, true)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Feedback</label>
                    <textarea 
                      rows="4" 
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                      placeholder="Provide detailed feedback on the task completion..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Overview Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-semibold">
                    MG
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{taskData.assignee}</h3>
                    <p className="text-sm text-slate-500">UI Designer • 6 months experience</p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-2xl font-bold text-yellow-600">{performanceData.overallRating}</div>
                    <div className="flex items-center gap-1">
                      {renderStars(Math.round(performanceData.overallRating))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{performanceData.metrics.completionRate}%</div>
                    <div className="text-sm text-slate-500">Completion Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{performanceData.metrics.onTimeRate}%</div>
                    <div className="text-sm text-slate-500">On Time Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{performanceData.metrics.averageQuality}</div>
                    <div className="text-sm text-slate-500">Avg Quality</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{performanceData.metrics.improvementTrend}</div>
                    <div className="text-sm text-slate-500">Improvement</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-4">
                  <h4 className="font-semibold mb-3">Recent Task Ratings</h4>
                  <div className="space-y-2">
                    {performanceData.recentRatings.map((rating, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <div>
                          <div className="text-sm font-medium">{rating.task}</div>
                          <div className="text-xs text-slate-500">{rating.date}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(rating.rating)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <h4 className="font-semibold mb-3">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Task Completion</span>
                        <span>{performanceData.completedTasks}/{performanceData.totalTasks}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full">
                        <div 
                          className="h-2 rounded-full bg-emerald-500" 
                          style={{width: `${performanceData.metrics.completionRate}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>On-Time Delivery</span>
                        <span>{performanceData.onTimeTasks}/{performanceData.completedTasks}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full">
                        <div 
                          className="h-2 rounded-full bg-blue-500" 
                          style={{width: `${performanceData.metrics.onTimeRate}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h4 className="font-semibold mb-3">Achievements & Recognition</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <div>
                      <div className="text-sm font-medium">Quality Champion</div>
                      <div className="text-xs text-slate-500">Consistent 4+ ratings</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <Target className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-sm font-medium">Deadline Master</div>
                      <div className="text-xs text-slate-500">90%+ on-time delivery</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium">Rising Star</div>
                      <div className="text-xs text-slate-500">Improving performance</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <button 
            className="px-4 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
            onClick={closeModal}
          >
            Cancel
          </button>
          {activeTab === 'rate' && (
            <button 
              className="px-4 py-2 rounded-lg text-white text-sm bg-yellow-500"
              onClick={submitRating}
            >
              Submit Rating
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskRatingModal;
