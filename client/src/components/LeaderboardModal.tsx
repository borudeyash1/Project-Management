import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Star, TrendingUp, X, Medal } from 'lucide-react';
import apiService from '../services/api';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  performanceRatings?: {
    overallAverage?: number;
    totalTasks?: number;
    timeliness?: { average: number };
    quality?: { average: number };
    effort?: { average: number };
    collaboration?: { average: number };
    initiative?: { average: number };
    learning?: { average: number };
    compliance?: { average: number };
  };
}

const LeaderboardModal: React.FC = () => {
  const { state, dispatch } = useApp();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.modals.leaderboard) {
      fetchLeaderboard();
    }
  }, [state.modals.leaderboard, state.currentWorkspace, state.currentProject]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (state.currentProject) {
        response = await apiService.get(`/leaderboard/project/${state.currentProject}`);
      } else if (state.currentWorkspace) {
        response = await apiService.get(`/leaderboard/workspace/${state.currentWorkspace}`);
      } else {
        setError('No workspace or project selected');
        setLoading(false);
        return;
      }

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
    if (rank === 1) return <Medal className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">#{rank}</span>;
  };

  if (!state.modals.leaderboard) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Performance Leaderboard
            </h2>
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'leaderboard' })}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={fetchLeaderboard}
                className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                Retry
              </button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No performance data available yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Complete and verify tasks to appear on the leaderboard
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`p-4 rounded-lg border ${
                    entry.rank <= 3
                      ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                  }`}>
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 flex items-center justify-center">
                      {getMedalIcon(entry.rank)}
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {entry.avatarUrl ? (
                        <img
                          src={entry.avatarUrl}
                          alt={entry.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-semibold">
                          {entry.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {entry.fullName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {entry.performanceRatings?.totalTasks || 0} verified tasks
                      </p>
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-1 text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                        <Star className="w-6 h-6 fill-current" />
                        {entry.performanceRatings?.overallAverage?.toFixed(1) || '0.0'}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Overall Score</div>
                    </div>
                  </div>

                  {/* Performance Breakdown */}
                  {entry.performanceRatings && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { key: 'timeliness', label: 'Timeliness' },
                        { key: 'quality', label: 'Quality' },
                        { key: 'collaboration', label: 'Collaboration' },
                        { key: 'initiative', label: 'Initiative' }
                      ].map(({ key, label }) => {
                        const rating = (entry.performanceRatings as any)?.[key]?.average || 0;
                        return (
                          <div key={key} className="text-center p-2 rounded bg-gray-50 dark:bg-gray-800">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                              {rating.toFixed(1)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
