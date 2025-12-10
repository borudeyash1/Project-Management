import React, { useState, useRef, useEffect } from 'react';
import { X, MapPin, Camera, Loader, CheckCircle, AlertCircle } from 'lucide-react';

interface AttendanceMarkingModalProps {
  slot: {
    name: string;
    time: string;
    windowMinutes: number;
  };
  workspaceId: string;
  config: {
    requireLocation: boolean;
    requireFaceVerification: boolean;
    location?: {
      lat: number;
      lng: number;
      radiusMeters: number;
      address?: string;
    };
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'wfh-select' | 'location' | 'face' | 'processing' | 'success' | 'error';

const AttendanceMarkingModal: React.FC<AttendanceMarkingModalProps> = ({
  slot,
  workspaceId,
  config,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<Step>('wfh-select');
  const [isWFH, setIsWFH] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Step 1: WFH Selection
  const handleWFHSelection = (wfh: boolean) => {
    setIsWFH(wfh);
    setStep('location');
  };

  // Step 2: Location Capture
  const captureLocation = async () => {
    setProcessing(true);
    setError('');
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const userLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      setLocation(userLocation);

      // If WFH or location not required, skip to face or submit
      if (isWFH || !config?.requireLocation) {
        if (config?.requireFaceVerification) {
          setStep('face');
        } else {
          await submitAttendance(userLocation, null);
        }
      } else {
        // Verify location distance on frontend (optional, backend will verify too)
        if (config?.requireFaceVerification) {
          setStep('face');
        } else {
          await submitAttendance(userLocation, null);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
      setStep('error');
    } finally {
      setProcessing(false);
    }
  };

  // Step 3: Face Capture
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setError('Failed to access camera: ' + err.message);
      setStep('error');
    }
  };

  const captureFace = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setFaceImage(imageData);
      
      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Submit attendance
      submitAttendance(location, imageData);
    }
  };

  useEffect(() => {
    if (step === 'face') {
      startCamera();
    }
  }, [step]);

  // Submit Attendance
  const submitAttendance = async (loc: { latitude: number; longitude: number } | null, face: string | null) => {
    setStep('processing');
    setProcessing(true);

    try {
      const apiService = (await import('../../services/api')).default;
      
      await apiService.post(`/workspace-attendance/workspace/${workspaceId}/mark`, {
        slotName: slot.name,
        location: loc,
        faceImage: face,
        isWorkFromHome: isWFH
      });

      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
      setStep('error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Mark Attendance - {slot.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* WFH Selection */}
          {step === 'wfh-select' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Where are you working today?
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleWFHSelection(false)}
                  className="p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent hover:bg-accent/10 transition-all"
                >
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <div className="font-semibold">Office</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Location verification required
                  </div>
                </button>
                <button
                  onClick={() => handleWFHSelection(true)}
                  className="p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent hover:bg-accent/10 transition-all"
                >
                  <Camera className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <div className="font-semibold">Work From Home</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Face verification required
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Location Step */}
          {step === 'location' && (
            <div className="space-y-4">
              <div className="text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-accent" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {isWFH ? 'Share Your Location' : 'Verify Your Location'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isWFH 
                    ? 'We need your location for attendance tracking'
                    : `You must be within ${config?.location?.radiusMeters || 100}m of the office`
                  }
                </p>
                {!isWFH && config?.location?.address && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Office: {config.location.address}
                  </p>
                )}
              </div>
              <button
                onClick={captureLocation}
                disabled={processing}
                className="w-full px-6 py-3 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover disabled:opacity-50 font-semibold"
              >
                {processing ? 'Getting Location...' : '📍 Share Location'}
              </button>
            </div>
          )}

          {/* Face Capture Step */}
          {step === 'face' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Camera className="w-16 h-16 mx-auto mb-4 text-accent" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Face Verification
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Position your face in the camera and capture
                </p>
              </div>
              
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 border-4 border-accent/50 rounded-lg pointer-events-none" />
              </div>

              <button
                onClick={captureFace}
                className="w-full px-6 py-3 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover font-semibold"
              >
                📸 Capture Face
              </button>
            </div>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader className="w-16 h-16 mx-auto mb-4 text-accent animate-spin" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Processing...
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verifying your attendance
              </p>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
                Attendance Marked!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your attendance has been recorded successfully
              </p>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                Failed
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <button
                onClick={() => setStep('wfh-select')}
                className="px-6 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover font-semibold"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceMarkingModal;
