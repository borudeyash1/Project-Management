import React, { useState } from 'react';
import { X, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import GlassmorphicCard from './ui/GlassmorphicCard';

interface RatingDimension {
  key: string;
  label: string;
  description: string;
  rating: number;
}

interface TaskVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (ratings: RatingDimension[], comments: string) => void;
  taskTitle: string;
}

const TaskVerificationModal: React.FC<TaskVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  taskTitle
}) => {
  const { isDarkMode } = useTheme();
  const [verifyText, setVerifyText] = useState('');
  const [showRatings, setShowRatings] = useState(false);
  const [comments, setComments] = useState('');

  const [ratings, setRatings] = useState<RatingDimension[]>([
    {
      key: 'timeliness',
      label: 'Timeliness & Reliability',
      description: 'On-time delivery, meeting deadlines consistently. Regularity and dependability across tasks.',
      rating: 0
    },
    {
      key: 'quality',
      label: 'Quality & Accuracy',
      description: 'Meeting acceptance criteria, minimal defects or rework. Deliverables match requirements and specifications.',
      rating: 0
    },
    {
      key: 'effort',
      label: 'Effort & Complexity Handling',
      description: 'Efficiency relative to estimated effort. Ability to manage varying task complexity effectively.',
      rating: 0
    },
    {
      key: 'collaboration',
      label: 'Collaboration & Communication',
      description: 'Team coordination, responsiveness, clarity, and quality of handoffs.',
      rating: 0
    },
    {
      key: 'initiative',
      label: 'Initiative & Problem Solving',
      description: 'Proactive approach, ownership, and resolving blockers independently.',
      rating: 0
    },
    {
      key: 'learning',
      label: 'Learning & Improvement',
      description: 'Incorporates feedback, improves over time, reduces repeated mistakes.',
      rating: 0
    },
    {
      key: 'compliance',
      label: 'Compliance & Security Awareness',
      description: 'Follows processes, policies, and data/security guidelines.',
      rating: 0
    }
  ]);

  const handleVerifyConfirm = () => {
    if (verifyText.toUpperCase() === 'VERIFY') {
      setShowRatings(true);
    }
  };

  const handleRatingChange = (index: number, rating: number) => {
    const newRatings = [...ratings];
    newRatings[index].rating = rating;
    setRatings(newRatings);
  };

  const handleSubmit = () => {
    // Check if all ratings are provided
    const allRated = ratings.every(r => r.rating > 0);
    if (!allRated) {
      alert('Please rate all dimensions before submitting');
      return;
    }

    onVerify(ratings, comments);
    handleClose();
  };

  const handleClose = () => {
    setVerifyText('');
    setShowRatings(false);
    setComments('');
    setRatings(ratings.map(r => ({ ...r, rating: 0 })));
    onClose();
  };

  const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  const allRated = ratings.every(r => r.rating > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassmorphicCard className="w-full max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Verify Task Completion
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {taskTitle}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!showRatings ? (
            /* Step 1: Confirmation */
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-900 dark:text-yellow-200">
                      Important: Task Verification
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                      By verifying this task, you confirm that:
                    </p>
                    <ul className="text-sm text-yellow-800 dark:text-yellow-300 mt-2 space-y-1 list-disc list-inside">
                      <li>The task has been completed satisfactorily</li>
                      <li>All deliverables meet the required standards</li>
                      <li>The task will be marked as verified and moved to history</li>
                      <li>You will provide a comprehensive performance rating</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type <span className="font-bold text-red-600">VERIFY</span> to confirm
                </label>
                <input
                  type="text"
                  value={verifyText}
                  onChange={(e) => setVerifyText(e.target.value)}
                  placeholder="Type VERIFY to continue"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-mono"
                  autoFocus
                />
                {verifyText && verifyText.toUpperCase() !== 'VERIFY' && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    Please type exactly "VERIFY" to continue
                  </p>
                )}
              </div>

              <button
                onClick={handleVerifyConfirm}
                disabled={verifyText.toUpperCase() !== 'VERIFY'}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Continue to Rating
              </button>
            </div>
          ) : (
            /* Step 2: Rating Dimensions */
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-200">
                      Performance Rating
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                      Rate the employee's performance across {ratings.length} dimensions
                    </p>
                  </div>
                  {allRated && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {averageRating.toFixed(1)}
                      </div>
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        Average Rating
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating Dimensions */}
              <div className="space-y-4">
                {ratings.map((dimension, index) => (
                  <div
                    key={dimension.key}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {index + 1}. {dimension.label}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {dimension.description}
                        </p>
                      </div>
                      {dimension.rating > 0 && (
                        <div className="ml-4 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                          {dimension.rating}/5
                        </div>
                      )}
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRatingChange(index, star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${star <= dimension.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                              }`}
                          />
                        </button>
                      ))}
                      {dimension.rating > 0 && (
                        <button
                          onClick={() => handleRatingChange(index, 0)}
                          className="ml-2 text-xs text-red-600 dark:text-red-400 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  placeholder="Provide additional feedback, observations, or recommendations..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {showRatings && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowRatings(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Back
              </button>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {ratings.filter(r => r.rating > 0).length} / {ratings.length} rated
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!allRated}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Verify & Complete
                </button>
              </div>
            </div>
          </div>
        )}
      </GlassmorphicCard>
    </div>
  );
};

export default TaskVerificationModal;
