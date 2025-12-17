import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Loader, CheckCircle, AlertCircle, User } from 'lucide-react';
import { faceRecognitionService } from '../../utils/faceRecognition';

interface FaceEnrollmentModalProps {
  onClose: () => void;
  onSuccess: (faceData: string[]) => void;
}

type Step = 'instructions' | 'capture' | 'processing' | 'success' | 'error';

const FaceEnrollmentModal: React.FC<FaceEnrollmentModalProps> = ({
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<Step>('instructions');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [currentCapture, setCurrentCapture] = useState(0);
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const requiredCaptures = 3; // Capture 3 different angles

  const captureInstructions = [
    { title: 'Front Face', description: 'Look directly at the camera' },
    { title: 'Turn Left', description: 'Turn your head slightly to the left' },
    { title: 'Turn Right', description: 'Turn your head slightly to the right' }
  ];

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Start camera when in capture step
  useEffect(() => {
    if (step === 'capture') {
      startCamera();
    }
  }, [step]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
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

  const startCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          captureFace();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const captureFace = async () => {
    if (!videoRef.current) return;

    try {
      // Capture image from video
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Initialize face recognition if needed
      await faceRecognitionService.initialize();

      // Detect face
      const detection = await faceRecognitionService.detectFace(imageData);
      if (!detection) {
        setError('No face detected. Please position your face in the frame.');
        return;
      }

      // Check liveness
      const livenessResult = await faceRecognitionService.checkLiveness(imageData);
      if (!livenessResult.isLive) {
        setError('Liveness check failed. Please ensure you are a real person.');
        return;
      }

      // Convert to base64
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Add to captured images
      const newImages = [...capturedImages, imageDataUrl];
      setCapturedImages(newImages);

      // Move to next capture or finish
      if (currentCapture + 1 < requiredCaptures) {
        setCurrentCapture(currentCapture + 1);
      } else {
        // All captures done, stop camera
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        // Process and save
        await processFaceData(newImages);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to capture face');
    }
  };

  const processFaceData = async (images: string[]) => {
    setStep('processing');

    try {
      // In production, you would:
      // 1. Extract features from all images
      // 2. Verify quality
      // 3. Upload to server
      // 4. Store face descriptors

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStep('success');
      setTimeout(() => {
        onSuccess(images);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to process face data');
      setStep('error');
    }
  };

  const handleStart = () => {
    setStep('capture');
  };

  const handleRetry = () => {
    setCapturedImages([]);
    setCurrentCapture(0);
    setError('');
    setStep('capture');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Face Enrollment
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
          {/* Instructions */}
          {step === 'instructions' && (
            <div className="space-y-6">
              <div className="text-center">
                <User className="w-16 h-16 mx-auto mb-4 text-accent" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Register Your Face
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We'll capture your face from multiple angles to ensure accurate recognition
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Instructions:
                </h4>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <li>• Ensure good lighting on your face</li>
                  <li>• Remove glasses if possible</li>
                  <li>• Look directly at the camera</li>
                  <li>• Keep a neutral expression</li>
                  <li>• We'll capture {requiredCaptures} images from different angles</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Capture Sequence:
                </h4>
                {captureInstructions.map((instruction, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent text-gray-900 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {instruction.title}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {instruction.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleStart}
                className="w-full px-6 py-3 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover font-semibold"
              >
                Start Face Enrollment
              </button>
            </div>
          )}

          {/* Capture */}
          {step === 'capture' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {captureInstructions[currentCapture].title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {captureInstructions[currentCapture].description}
                </p>
                <div className="mt-2 text-sm font-semibold text-accent">
                  Capture {currentCapture + 1} of {requiredCaptures}
                </div>
              </div>

              {/* Video Preview */}
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-96 object-cover"
                />
                
                {/* Face guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-80 border-4 border-accent/50 rounded-full" />
                </div>

                {/* Countdown overlay */}
                {countdown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-8xl font-bold text-white">
                      {countdown}
                    </div>
                  </div>
                )}
              </div>

              {/* Captured previews */}
              {capturedImages.length > 0 && (
                <div className="flex gap-2 justify-center">
                  {capturedImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Capture ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-green-500"
                      />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={startCountdown}
                disabled={countdown > 0}
                className="w-full px-6 py-3 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover disabled:opacity-50 font-semibold"
              >
                {countdown > 0 ? `Capturing in ${countdown}...` : '📸 Capture Face'}
              </button>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader className="w-16 h-16 mx-auto mb-4 text-accent animate-spin" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Processing Face Data...
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analyzing and storing your facial features
              </p>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
                Face Enrolled Successfully!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can now use face recognition for attendance
              </p>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                Enrollment Failed
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <button
                onClick={handleRetry}
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

export default FaceEnrollmentModal;
