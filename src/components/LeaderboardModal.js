import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Trophy, 
  Medal, 
  Award, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Target,
  Clock,
  CheckCircle,
  Users,
  BarChart3
} from 'lucide-react';

const LeaderboardModal = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('overall');
  const [timeframe, setTimeframe] = useState('month');

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const closeModal = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: 'leaderboard' });
  };

  // Mock leaderboard data
  const leaderboardData = {
    overall: [
      {
        id: 1,
        name: 'Maria Garcia',
        role: 'UI Designer',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
        rating: 4.8,
        tasksCompleted: 28,
        onTimeRate: 96.4,
        qualityScore: 4.7,
        improvement: '+0.3',
        achievements: ['Quality Champion', 'Deadline Master', 'Team Player'],
        rank: 1
      },
      {
        id: 2,
        name: 'Alex Johnson',
        role: 'Project Manager',
        avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=100&auto=format&fit=crop',
        rating: 4.6,
        tasksCompleted: 32,
        onTimeRate: 93.8,
        qualityScore: 4.5,
        improvement: '+0.2',
        achievements: ['Leadership Excellence', 'Communication Pro'],
        rank: 2
      },
      {
        id: 3,
        name: 'Priya Patel',
        role: 'Frontend Developer',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=100&auto=format&fit=crop',
        rating: 4.4,
        tasksCompleted: 25,
        onTimeRate: 88.0,
        qualityScore: 4.3,
        improvement: '+0.5',
        achievements: ['Code Quality', 'Innovation'],
        rank: 3
      },
      {
        id: 4,
        name: 'Sam Wilson',
        role: 'Backend Developer',
        avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=100&auto=format&fit=crop',
        rating: 4.2,
        tasksCompleted: 22,
        onTimeRate: 86.4,
        qualityScore: 4.1,
        improvement: '+0.1',
        achievements: ['Problem Solver'],
        rank: 4
      },
      {
        id: 5,
        name: 'David Chen',
        role: 'QA Engineer',
        avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=100&auto=format&fit=crop',
        rating: 4.0,
        tasksCompleted: 20,
        onTimeRate: 85.0,
        qualityScore: 4.0,
        improvement: '+0.2',
        achievements: ['Detail Oriented'],
        rank: 5
      }
    ],
    quality: [
      {
        id: 1,
        name: 'Maria Garcia',
        role: 'UI Designer',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
        qualityScore: 4.7,
        tasksCompleted: 28,
        averageRating: 4.8,
        rank: 1
      },
      {
        id: 2,
        name: 'Alex Johnson',
        role: 'Project Manager',
        avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=100&auto=format&fit=crop',
        qualityScore: 4.5,
        tasksCompleted: 32,
        averageRating: 4.6,
        rank: 2
      },
      {
        id: 3,
        name: 'Priya Patel',
        role: 'Frontend Developer',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=100&auto=format&fit=crop',
        qualityScore: 4.3,
        tasksCompleted: 25,
        averageRating: 4.4,
        rank: 3
      }
    ],
    productivity: [
      {
        id: 1,
        name: 'Alex Johnson',
        role: 'Project Manager',
        avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=100&auto=format&fit=crop',
        tasksCompleted: 32,
        onTimeRate: 93.8,
        averageTime: '2.3 days',
        rank: 1
      },
      {
        id: 2,
        name: 'Maria Garcia',
        role: 'UI Designer',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
        tasksCompleted: 28,
        onTimeRate: 96.4,
        averageTime: '1.8 days',
        rank: 2
      },
      {
        id: 3,
        name: 'Priya Patel',
        role: 'Frontend Developer',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=100&auto=format&fit=crop',
        tasksCompleted: 25,
        onTimeRate: 88.0,
        averageTime: '2.1 days',
        rank: 3
      }
    ]
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold">{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-50 border-yellow-200';
      case 2: return 'bg-gray-50 border-gray-200';
      case 3: return 'bg-amber-50 border-amber-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const getImprovementColor = (improvement) => {
    const value = parseFloat(improvement);
    if (value > 0) return 'text-emerald-600';
    if (value < 0) return 'text-red-600';
    return 'text-slate-600';
  };

  if (!state.modals.leaderboard) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Employee Leaderboard</h2>
            <p className="text-sm text-slate-500">Performance rankings and achievements</p>
          </div>
          <div className="flex items-center gap-2">
            <select 
              className="rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button 
              className="p-2 rounded-lg hover:bg-slate-100"
              onClick={closeModal}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'overall' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('overall')}
            >
              <Trophy className="w-4 h-4 mr-1 inline-block" />
              Overall
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'quality' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('quality')}
            >
              <Star className="w-4 h-4 mr-1 inline-block" />
              Quality
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'productivity' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('productivity')}
            >
              <Target className="w-4 h-4 mr-1 inline-block" />
              Productivity
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Overall Leaderboard */}
          {activeTab === 'overall' && (
            <div className="space-y-3">
              {leaderboardData.overall.map((employee) => (
                <div key={employee.id} className={`rounded-lg border p-4 ${getRankColor(employee.rank)}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center">
                      {getRankIcon(employee.rank)}
                    </div>
                    
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img 
                        src={employee.avatar} 
                        alt={employee.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{employee.name}</h3>
                        <span className="text-sm text-slate-500">{employee.role}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          employee.improvement.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-700'
                        }`}>
                          {employee.improvement}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {employee.rating}/5
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          {employee.tasksCompleted} tasks
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-blue-500" />
                          {employee.onTimeRate}% on-time
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-2">
                        {employee.achievements.map((achievement, index) => (
                          <span key={index} className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-600">{employee.rating}</div>
                      <div className="text-sm text-slate-500">Overall Rating</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quality Leaderboard */}
          {activeTab === 'quality' && (
            <div className="space-y-3">
              {leaderboardData.quality.map((employee) => (
                <div key={employee.id} className={`rounded-lg border p-4 ${getRankColor(employee.rank)}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center">
                      {getRankIcon(employee.rank)}
                    </div>
                    
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img 
                        src={employee.avatar} 
                        alt={employee.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{employee.name}</h3>
                        <span className="text-sm text-slate-500">{employee.role}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {employee.averageRating}/5 avg rating
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          {employee.tasksCompleted} tasks completed
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{employee.qualityScore}</div>
                      <div className="text-sm text-slate-500">Quality Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Productivity Leaderboard */}
          {activeTab === 'productivity' && (
            <div className="space-y-3">
              {leaderboardData.productivity.map((employee) => (
                <div key={employee.id} className={`rounded-lg border p-4 ${getRankColor(employee.rank)}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center">
                      {getRankIcon(employee.rank)}
                    </div>
                    
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img 
                        src={employee.avatar} 
                        alt={employee.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{employee.name}</h3>
                        <span className="text-sm text-slate-500">{employee.role}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          {employee.tasksCompleted} tasks completed
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-blue-500" />
                          {employee.onTimeRate}% on-time
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4 text-purple-500" />
                          {employee.averageTime} avg time
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{employee.tasksCompleted}</div>
                      <div className="text-sm text-slate-500">Tasks Completed</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-6 rounded-lg border border-border p-4">
            <h3 className="font-semibold mb-3">Team Performance Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">4.4</div>
                <div className="text-sm text-slate-500">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">127</div>
                <div className="text-sm text-slate-500">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">91.2%</div>
                <div className="text-sm text-slate-500">On-Time Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">+0.3</div>
                <div className="text-sm text-slate-500">Improvement</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
