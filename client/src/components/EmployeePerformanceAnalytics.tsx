import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Award, Target, Star, Calendar, CheckCircle, Activity, Zap } from 'lucide-react';
import axios from 'axios';

interface PerformanceData {
  totalVerifiedTasks: number;
  averageRating: number;
  dimensionAverages: {
    timeliness: number;
    quality: number;
    effort: number;
    accuracy: number;
    collaboration: number;
    initiative: number;
    reliability: number;
    learning: number;
    compliance: number;
  };
  ratingDistribution: {
    excellent: number;
    good: number;
    average: number;
    belowAverage: number;
  };
  recentTasks: Array<{
    title: string;
    rating: number;
    verifiedAt: Date;
  }>;
  performanceTrend: Array<{
    month: string;
    averageRating: number;
    taskCount: number;
  }>;
  strengths: string[];
  improvements: string[];
}

interface EmployeePerformanceAnalyticsProps {
  employeeId: string;
}

const EmployeePerformanceAnalytics: React.FC<EmployeePerformanceAnalyticsProps> = ({ employeeId }) => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, [employeeId]);

  const fetchPerformanceData = async () => {
    try {
      const response = await axios.get(`/api/analytics/employee/${employeeId}/performance`);
      setPerformanceData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDimensionLabel = (key: string): string => {
    const labels: { [key: string]: string } = {
      timeliness: 'Timeliness',
      quality: 'Quality',
      effort: 'Effort',
      accuracy: 'Accuracy',
      collaboration: 'Collaboration',
      initiative: 'Initiative',
      reliability: 'Reliability',
      learning: 'Learning',
      compliance: 'Compliance'
    };
    return labels[key] || key;
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return '#10b981';
    if (rating >= 3.5) return '#3b82f6';
    if (rating >= 2.5) return '#f59e0b';
    return '#ef4444';
  };

  const getRatingBgColor = (rating: number): string => {
    if (rating >= 4.5) return 'bg-green-100';
    if (rating >= 3.5) return 'bg-blue-100';
    if (rating >= 2.5) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance analytics...</p>
        </div>
      </div>
    );
  }

  if (!performanceData || performanceData.totalVerifiedTasks === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-12 text-center">
        <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <BarChart3 className="w-12 h-12 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">No Performance Data Yet</h3>
        <p className="text-gray-600 text-lg">
          Complete and verify tasks to unlock your performance analytics dashboard.
        </p>
      </div>
    );
  }

  const totalTasks = performanceData.totalVerifiedTasks;
  const maxRating = 5;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Performance Analytics</h2>
            <p className="text-blue-100 text-lg">Track your growth and achievements</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Activity className="w-12 h-12" />
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <span className="text-4xl font-bold text-gray-800">{performanceData.totalVerifiedTasks}</span>
          </div>
          <p className="text-gray-600 font-medium">Verified Tasks</p>
          <p className="text-sm text-gray-500 mt-1">Total completed</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 rounded-lg p-3">
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <span className="text-4xl font-bold" style={{ color: getRatingColor(performanceData.averageRating) }}>
              {performanceData.averageRating.toFixed(1)}
            </span>
          </div>
          <p className="text-gray-600 font-medium">Average Rating</p>
          <div className="flex items-center mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= performanceData.averageRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-lg p-3">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <span className="text-4xl font-bold text-green-600">
              {performanceData.ratingDistribution.excellent}
            </span>
          </div>
          <p className="text-gray-600 font-medium">Excellent Tasks</p>
          <p className="text-sm text-gray-500 mt-1">Rated 4.5+</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 rounded-lg p-3">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-gray-600 font-medium">Top Strength</p>
          <p className="text-sm text-purple-600 font-semibold mt-1">
            {getDimensionLabel(performanceData.strengths[0])}
          </p>
        </div>
      </div>

      {/* Performance Dimensions - Bar Chart */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          Performance Dimensions
        </h3>
        <div className="space-y-4">
          {Object.entries(performanceData.dimensionAverages).map(([key, value]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{getDimensionLabel(key)}</span>
                <span className="text-lg font-bold" style={{ color: getRatingColor(value) }}>
                  {value.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="relative w-full h-8 bg-gray-200 rounded-lg overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-lg transition-all duration-500"
                  style={{
                    width: `${(value / maxRating) * 100}%`,
                    backgroundColor: getRatingColor(value)
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rating Distribution - Pie Chart Alternative */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          Rating Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {performanceData.ratingDistribution.excellent}
            </div>
            <div className="text-sm font-medium text-green-700">Excellent</div>
            <div className="text-xs text-green-600 mt-1">4.5+ rating</div>
            <div className="mt-3 text-xs text-gray-600">
              {totalTasks > 0 ? ((performanceData.ratingDistribution.excellent / totalTasks) * 100).toFixed(0) : 0}%
            </div>
          </div>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {performanceData.ratingDistribution.good}
            </div>
            <div className="text-sm font-medium text-blue-700">Good</div>
            <div className="text-xs text-blue-600 mt-1">3.5-4.5 rating</div>
            <div className="mt-3 text-xs text-gray-600">
              {totalTasks > 0 ? ((performanceData.ratingDistribution.good / totalTasks) * 100).toFixed(0) : 0}%
            </div>
          </div>
          
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-yellow-600 mb-2">
              {performanceData.ratingDistribution.average}
            </div>
            <div className="text-sm font-medium text-yellow-700">Average</div>
            <div className="text-xs text-yellow-600 mt-1">2.5-3.5 rating</div>
            <div className="mt-3 text-xs text-gray-600">
              {totalTasks > 0 ? ((performanceData.ratingDistribution.average / totalTasks) * 100).toFixed(0) : 0}%
            </div>
          </div>
          
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">
              {performanceData.ratingDistribution.belowAverage}
            </div>
            <div className="text-sm font-medium text-red-700">Below Avg</div>
            <div className="text-xs text-red-600 mt-1">&lt;2.5 rating</div>
            <div className="mt-3 text-xs text-gray-600">
              {totalTasks > 0 ? ((performanceData.ratingDistribution.belowAverage / totalTasks) * 100).toFixed(0) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trend - Line Chart Alternative */}
      {performanceData.performanceTrend.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Performance Trend (Last 6 Months)
          </h3>
          <div className="space-y-4">
            {performanceData.performanceTrend.map((item, index) => {
              const monthName = new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-gray-700">{monthName}</div>
                  <div className="flex-1">
                    <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-lg transition-all duration-500"
                        style={{
                          width: `${(item.averageRating / maxRating) * 100}%`,
                          backgroundColor: getRatingColor(item.averageRating)
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-between px-3">
                        <span className="text-sm font-bold text-white drop-shadow-lg">
                          {item.averageRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-600">
                          {item.taskCount} tasks
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-lg">
          <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-green-600" />
            Top Strengths
          </h3>
          <div className="space-y-3">
            {performanceData.strengths.map((strength, index) => {
              const score = performanceData.dimensionAverages[strength as keyof typeof performanceData.dimensionAverages];
              return (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-semibold text-gray-800">{getDimensionLabel(strength)}</span>
                    </div>
                    <span className="text-green-600 font-bold text-lg">{score.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(score / maxRating) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-lg">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            Growth Opportunities
          </h3>
          <div className="space-y-3">
            {performanceData.improvements.map((improvement, index) => {
              const score = performanceData.dimensionAverages[improvement as keyof typeof performanceData.dimensionAverages];
              return (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-semibold text-gray-800">{getDimensionLabel(improvement)}</span>
                    </div>
                    <span className="text-blue-600 font-bold text-lg">{score.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(score / maxRating) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-600" />
          Recent Verified Tasks
        </h3>
        <div className="space-y-3">
          {performanceData.recentTasks.map((task, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{task.title}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(task.verifiedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-xl" style={{ color: getRatingColor(task.rating) }}>
                  {task.rating.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeePerformanceAnalytics;
