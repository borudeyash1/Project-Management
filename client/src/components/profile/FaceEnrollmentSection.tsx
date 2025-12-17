import React, { useState } from 'react';
import { Camera, CheckCircle, AlertCircle } from 'lucide-react';
import FaceEnrollmentModal from '../workspace-detail/FaceEnrollmentModal';
import apiService from '../../services/api';

interface FaceEnrollmentSectionProps {
  userId: string;
  faceData?: {
    verified: boolean;
    lastUpdated: Date;
    images: string[];
  };
  onUpdate: () => void;
}

const FaceEnrollmentSection: React.FC<FaceEnrollmentSectionProps> = ({
  userId,
  faceData,
  onUpdate
}) => {
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEnrollmentSuccess = async (faceImages: string[]) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiService.post('/users/profile/enroll-face', {
        faceImages
      });

      setSuccess('Face enrolled successfully! You can now use face recognition for attendance.');
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enroll face');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFace = async () => {
    if (!window.confirm('Are you sure you want to remove your face data? You will need to re-enroll to use face recognition.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiService.delete('/users/profile/face-data');
      setSuccess('Face data removed successfully');
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove face data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Face Recognition
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {faceData?.verified ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div className="flex-1">
              <div className="font-semibold text-green-900 dark:text-green-100">
                Face Enrolled
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Last updated: {new Date(faceData.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </div>

          {faceData.images && faceData.images.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enrolled Images ({faceData.images.length})
              </div>
              <div className="flex gap-2 flex-wrap">
                {faceData.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Face ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border-2 border-green-500"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowEnrollment(true)}
              disabled={loading}
              className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover disabled:opacity-50 font-semibold"
            >
              Re-enroll Face
            </button>
            <button
              onClick={handleRemoveFace}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold"
            >
              Remove Face Data
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Enable Face Recognition
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Enroll your face to use face recognition for attendance marking. 
                  This is a secure and convenient way to verify your identity.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Secure and encrypted storage</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Liveness detection prevents spoofing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Quick and contactless attendance</span>
            </div>
          </div>

          <button
            onClick={() => setShowEnrollment(true)}
            disabled={loading}
            className="w-full px-6 py-3 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Enroll Face Now
          </button>
        </div>
      )}

      {showEnrollment && (
        <FaceEnrollmentModal
          onClose={() => setShowEnrollment(false)}
          onSuccess={handleEnrollmentSuccess}
        />
      )}
    </div>
  );
};

export default FaceEnrollmentSection;
