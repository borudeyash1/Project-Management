import React, { useEffect, useState } from 'react';
import { Trophy, Star, Medal, TrendingUp, Users, Award } from 'lucide-react';
import { useParams } from 'react-router-dom';
import apiService from '../../services/api';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  performanceRatings?: {
    overallAverage?: number;
    totalTasks?: number;
    timeliness?: { average: number; count: number };
    quality?: { average: number; count: number };
    effort?: { average: number; count: number };
    collaboration?: { average: number; count: number };
    initiative?: { average: number; count: number };
    learning?: { average: number; count: number };
    compliance?: { average: number; count: number };
  };
}

const ProjectLeaderboard: React.FC = () => {
  const { projectId } = useParams();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [projectId]);

  const fetchLeaderboard = async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get(`/leaderboard/project/${projectId}`);
      if (response.success) {
        setLeaderboard(response.data);
      } else {
        setError('Failed to load leaderboard');
      }
    } catch (err: any) {
      console.error('Failed to fetch leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Medal className="w-8 h-8 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />;
    if (rank === 3) return <Medal className="w-8 h-8 text-orange-600" />;
    return <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">#{rank}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchLeaderboard}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Performance Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Team members ranked by their overall performance ratings
          </p>
        </div>
        <button
          onClick={fetchLeaderboard}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          Refresh
        </button>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Trophy className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Performance Data Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Complete and verify tasks to appear on the leaderboard
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <div className="pt-12">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 text-center border-2 border-gray-300 dark:border-gray-600">
                  <Medal className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <div className="w-16 h-16 mx-auto mb-3">
                    {leaderboard[1].avatarUrl ? (
                      <img
                        src={leaderboard[1].avatarUrl}
                        alt={leaderboard[1].fullName}
                        className="w-full h-full rounded-full object-cover border-4 border-gray-400"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-400">
                        {leaderboard[1].fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{leaderboard[1].fullName}</h3>
                  <div className="flex items-center justify-center gap-1 mt-2 text-xl font-bold text-gray-600 dark:text-gray-400">
                    <Star className="w-5 h-5 fill-current" />
                    {leaderboard[1].performanceRatings?.overallAverage?.toFixed(1) || '0.0'}
                  </div>
                </div>
              </div>

              {/* 1st Place */}
              <div>
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl p-6 text-center border-4 border-yellow-400 dark:border-yellow-600 relative">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <Award className="w-12 h-12 text-yellow-500" />
                  </div>
                  <Medal className="w-16 h-16 text-yellow-500 mx-auto mb-3 mt-4" />
                  <div className="w-20 h-20 mx-auto mb-3">
                    {leaderboard[0].avatarUrl ? (
                      <img
                        src={leaderboard[0].avatarUrl}
                        alt={leaderboard[0].fullName}
                        className="w-full h-full rounded-full object-cover border-4 border-yellow-500"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-yellow-500">
                        {leaderboard[0].fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{leaderboard[0].fullName}</h3>
                  <div className="flex items-center justify-center gap-1 mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                    <Star className="w-6 h-6 fill-current" />
                    {leaderboard[0].performanceRatings?.overallAverage?.toFixed(1) || '0.0'}
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="pt-12">
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-6 text-center border-2 border-orange-400 dark:border-orange-600">
                  <Medal className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                  <div className="w-16 h-16 mx-auto mb-3">
                    {leaderboard[2].avatarUrl ? (
                      <img
                        src={leaderboard[2].avatarUrl}
                        alt={leaderboard[2].fullName}
                        className="w-full h-full rounded-full object-cover border-4 border-orange-500"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-orange-500">
                        {leaderboard[2].fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{leaderboard[2].fullName}</h3>
                  <div className="flex items-center justify-center gap-1 mt-2 text-xl font-bold text-orange-600 dark:text-orange-500">
                    <Star className="w-5 h-5 fill-current" />
                    {leaderboard[2].performanceRatings?.overallAverage?.toFixed(1) || '0.0'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard List */}
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 border ${
                  entry.rank <= 3
                    ? 'border-yellow-300 dark:border-yellow-700'
                    : 'border-gray-200 dark:border-gray-700'
                }`}>
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-16 flex items-center justify-center">
                    {getMedalIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt={entry.fullName}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xl font-semibold">
                        {entry.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">
                      {entry.fullName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {entry.performanceRatings?.totalTasks || 0} verified tasks
                    </p>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 text-3xl font-bold text-yellow-600 dark:text-yellow-500">
                      <Star className="w-7 h-7 fill-current" />
                      {entry.performanceRatings?.overallAverage?.toFixed(1) || '0.0'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Overall Score</div>
                  </div>
                </div>

                {/* Performance Breakdown */}
                {entry.performanceRatings && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {[
                      { key: 'timeliness', label: 'Timeliness' },
                      { key: 'quality', label: 'Quality' },
                      { key: 'effort', label: 'Effort' },
                      { key: 'collaboration', label: 'Collaboration' },
                      { key: 'initiative', label: 'Initiative' },
                      { key: 'learning', label: 'Learning' },
                      { key: 'compliance', label: 'Compliance' }
                    ].map(({ key, label }) => {
                      const rating = (entry.performanceRatings as any)?.[key];
                      const average = rating?.average || 0;
                      const count = rating?.count || 0;

                      return (
                        <div key={key} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</div>
                          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {average.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">({count})</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectLeaderboard;
