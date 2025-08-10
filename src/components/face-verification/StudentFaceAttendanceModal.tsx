import React, { useState, useEffect, useCallback, useRef } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  Camera,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Eye,
  MapPin,
  Clock,
  X,
  Navigation,
  Target,
} from 'lucide-react';
import { useFaceVerification } from '@/hooks/useFaceVerification';
import { useStudentTakeAttendance } from '@/feature/attendance/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  parseFaceVerificationError,
  getFaceVerificationTips,
  getFaceVerificationSuccessMessage,
} from '@/utils/faceVerificationErrors';
import type { Id } from 'convex/_generated/dataModel';

interface StudentFaceAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendanceSessionId: Id<'attendanceSessions'>;
  location: { lat: number; long: number };
  courseName: string;
  onSuccess: () => void;
  maxRetries?: number;
}

export const StudentFaceAttendanceModal: React.FC<
  StudentFaceAttendanceModalProps
> = ({
  isOpen,
  onClose,
  attendanceSessionId,
  location,
  courseName,
  onSuccess,
  maxRetries = 2,
}) => {
  const [verificationStep, setVerificationStep] = useState<
    'setup' | 'detecting' | 'verifying' | 'success' | 'failed'
  >('setup');
  const [retryAttempt, setRetryAttempt] = useState(1);
  const [detectionAttempts, setDetectionAttempts] = useState(0);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [countdown, setCountdown] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const webcamRef = useRef<Webcam>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { mutateAsync: takeAttendance } = useStudentTakeAttendance();

  const {
    isLoading: faceLoading,
    modelsLoaded,
    error: faceError,
    loadModels,
    detectFaceFromVideo,
  } = useFaceVerification();

  // Get available camera devices
  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === 'videoinput',
      );
      setDevices(videoDevices);

      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error getting devices:', error);
    }
  }, [selectedDeviceId]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setVerificationStep('setup');
      setRetryAttempt(1);
      setDetectionAttempts(0);
      setVerificationResult(null);
      setCountdown(3);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Load models and get devices on mount
  useEffect(() => {
    if (!isOpen) return;

    const initialize = async () => {
      try {
        await loadModels();
        await getDevices();

        // Start countdown
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setVerificationStep('detecting');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (error) {
        console.error('Initialization failed:', error);
        toast.error('Camera initialization failed');
      }
    };

    initialize();

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isOpen, loadModels, getDevices]);

  // Auto-detect and verify face
  useEffect(() => {
    if (verificationStep === 'detecting' && modelsLoaded && webcamRef.current) {
      let isDetecting = false;

      detectionIntervalRef.current = setInterval(async () => {
        if (isDetecting || isSubmitting) return;

        const webcam = webcamRef.current;
        if (!webcam) return;

        const videoElement = webcam.video;
        if (!videoElement || videoElement.readyState !== 4) return;

        isDetecting = true;

        try {
          const result = await detectFaceFromVideo(videoElement, false);

          if (result.success && result.descriptor) {
            setVerificationStep('verifying');
            if (detectionIntervalRef.current) {
              clearInterval(detectionIntervalRef.current);
            }

            try {
              setIsSubmitting(true);

              // Submit attendance with face verification
              const attendanceResult = await takeAttendance({
                attendanceSessionId,
                gpsCoordinates: location,
                faceDescriptor: Array.from(result.descriptor),
                retryAttempt,
              });

              setVerificationResult({
                success: true,
                matchScore: attendanceResult.faceMatchScore || 0,
                verificationStatus: attendanceResult.verificationStatus,
              });

              setVerificationStep('success');

              const successMessage = getFaceVerificationSuccessMessage(
                attendanceResult.faceMatchScore || 0,
              );
              toast.success('Face Verified!', {
                description: `${successMessage} - Attendance marked for ${courseName}`,
              });

              setTimeout(() => {
                onSuccess();
                onClose();
              }, 2000);
            } catch (error) {
              console.error('Verification error:', error);

              const parsedError = parseFaceVerificationError(error);

              if (parsedError.retryable && retryAttempt < maxRetries) {
                setVerificationResult({
                  success: false,
                  error: parsedError.message,
                  title: parsedError.title,
                  type: parsedError.type,
                });
                setVerificationStep('failed');
              } else {
                // Non-retryable error or max retries reached
                toast.error(parsedError.title, {
                  description: parsedError.message,
                });

                if (parsedError.actionable) {
                  // Allow fallback for actionable errors
                  setVerificationResult({
                    success: false,
                    error: parsedError.message,
                    title: parsedError.title,
                    type: parsedError.type,
                  });
                  setVerificationStep('failed');
                } else {
                  onClose();
                }
              }
            } finally {
              setIsSubmitting(false);
            }
          } else {
            setDetectionAttempts((prev) => prev + 1);

            // Show guidance less frequently
            if (detectionAttempts > 20) {
              toast.warning('Face Detection Tips', {
                description:
                  'Ensure good lighting and look directly at the camera.',
              });
              setDetectionAttempts(0);
            }
          }
        } catch (error) {
          console.error('Face detection error:', error);
        } finally {
          isDetecting = false;
        }
      }, 250);

      return () => {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
        }
      };
    }
  }, [
    verificationStep,
    modelsLoaded,
    detectFaceFromVideo,
    attendanceSessionId,
    location,
    retryAttempt,
    takeAttendance,
    courseName,
    onSuccess,
    onClose,
    detectionAttempts,
    isSubmitting,
    maxRetries,
  ]);

  const handleRetry = () => {
    if (retryAttempt >= maxRetries) {
      toast.info('Maximum attempts reached', {
        description: 'Please try GPS-only verification.',
      });
      onClose();
      return;
    }

    setRetryAttempt((prev) => prev + 1);
    setVerificationStep('detecting');
    setDetectionAttempts(0);
    setVerificationResult(null);
  };

  const handleFallbackToGPS = async () => {
    try {
      setIsSubmitting(true);

      // Submit attendance without face verification (GPS only)
      await takeAttendance({
        attendanceSessionId,
        gpsCoordinates: location,
        // No face descriptor - will use GPS-only fallback
      });

      toast.success('Attendance Marked', {
        description: `GPS-only verification used for ${courseName}`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Attendance Failed', {
        description:
          error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSetupStep = () => (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <Eye className="h-12 w-12 mx-auto text-blue-600" />
        <h3 className="text-lg font-semibold">Face Verification Required</h3>
        <p className="text-sm text-muted-foreground">
          Position your face in the camera frame for automatic verification
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-6xl font-bold text-blue-600">{countdown}</div>
        <p className="text-sm text-muted-foreground">
          Get ready for face verification...
        </p>
      </div>

      <div className="flex justify-center space-x-2">
        <Button onClick={onClose} variant="outline" size="sm">
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );

  const handleSwitchCamera = () => {
    const currentIndex = devices.findIndex(
      (device) => device.deviceId === selectedDeviceId,
    );
    const nextIndex = (currentIndex + 1) % devices.length;
    setSelectedDeviceId(devices[nextIndex].deviceId);
  };

  const renderDetectingStep = () => (
    <div className="space-y-4">
      <div className="relative">
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={{
            deviceId: selectedDeviceId
              ? { exact: selectedDeviceId }
              : undefined,
            facingMode: facingMode,
            width: 640,
            height: 480,
          }}
          className="w-full max-w-md mx-auto rounded-lg bg-black"
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 border-4 border-blue-500 rounded-full animate-pulse opacity-50" />
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          Detecting face...
        </div>
      </div>

      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Looking for your face...</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Keep your face centered and well-lit
        </p>
      </div>

      <div className="flex justify-center space-x-2">
        {devices.length > 1 && (
          <Button onClick={handleSwitchCamera} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-1" />
            Switch Camera
          </Button>
        )}

        <Button
          onClick={handleFallbackToGPS}
          variant="outline"
          size="sm"
          disabled={isSubmitting}
        >
          Use GPS Only
        </Button>

        <Button onClick={onClose} variant="outline" size="sm">
          Cancel
        </Button>
      </div>

      <Badge variant="secondary" className="mx-auto block w-fit">
        Attempt {retryAttempt} of {maxRetries}
      </Badge>
    </div>
  );

  const renderVerifyingStep = () => (
    <div className="space-y-4 text-center">
      <div className="space-y-2">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <h3 className="font-semibold">Verifying Face & Marking Attendance</h3>
        <p className="text-sm text-muted-foreground">
          Comparing with your registered face data...
        </p>
      </div>

      <Progress value={75} className="w-full max-w-xs mx-auto" />
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-4 text-center">
      <div className="space-y-2">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
        <h3 className="text-lg font-semibold text-green-600">Face Verified!</h3>
        <p className="text-sm text-muted-foreground">
          Your attendance has been recorded successfully
        </p>
      </div>

      {verificationResult && (
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-center space-x-2">
            <Eye className="h-3 w-3" />
            <span>
              Match Score: {(verificationResult.matchScore * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <MapPin className="h-3 w-3" />
            <span>GPS Verified</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-3 w-3" />
            <span>Verified at {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderFailedStep = () => (
    <div className="space-y-4 text-center">
      <div className="space-y-2">
        <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
        <h3 className="text-lg font-semibold text-red-600">
          Verification Failed
        </h3>
        <p className="text-sm text-muted-foreground">
          {retryAttempt >= maxRetries
            ? 'Maximum attempts reached. You can use GPS-only verification.'
            : verificationResult?.error ||
              'Face verification failed. Please try again.'}
        </p>
      </div>

      {verificationResult?.matchScore && (
        <div className="text-xs text-muted-foreground">
          Match Score: {((1 - verificationResult.matchScore) * 100).toFixed(1)}%
          (Required: 60% minimum)
        </div>
      )}

      {verificationResult?.type === 'face_mismatch' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            💡 Tips for better verification:
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            {getFaceVerificationTips().map((tip, index) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-center space-x-2">
        {retryAttempt < maxRetries ? (
          <Button onClick={handleRetry} size="sm">
            Try Again ({maxRetries - retryAttempt} left)
          </Button>
        ) : (
          <Button
            onClick={handleFallbackToGPS}
            size="sm"
            disabled={isSubmitting}
          >
            Use GPS Only
          </Button>
        )}

        <Button onClick={onClose} variant="outline" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Face Verification</span>
          </DialogTitle>
          <DialogDescription>
            Verify your identity to mark attendance for {courseName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!modelsLoaded && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Loading face recognition models...
              </AlertDescription>
            </Alert>
          )}

          {faceError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {faceError}
                <Button
                  onClick={handleFallbackToGPS}
                  variant="link"
                  className="ml-2 p-0 h-auto"
                  disabled={isSubmitting}
                >
                  Use GPS Only
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {modelsLoaded && !faceError && (
            <>
              {verificationStep === 'setup' && renderSetupStep()}
              {verificationStep === 'detecting' && renderDetectingStep()}
              {verificationStep === 'verifying' && renderVerifyingStep()}
              {verificationStep === 'success' && renderSuccessStep()}
              {verificationStep === 'failed' && renderFailedStep()}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
