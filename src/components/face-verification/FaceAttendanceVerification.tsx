import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
} from 'lucide-react';
import { useFaceVerification } from '@/hooks/useFaceVerification';
import { useCamera } from '@/hooks/useCamera';
import { toast } from 'sonner';

interface FaceAttendanceVerificationProps {
  attendanceSessionId: string;
  location: { lat: number; long: number };
  onSuccess: (result: any) => void;
  onFallback: () => void;
  onCancel: () => void;
  maxRetries?: number;
}

export const FaceAttendanceVerification: React.FC<
  FaceAttendanceVerificationProps
> = ({
  attendanceSessionId,
  location,
  onSuccess,
  onFallback,
  onCancel,
  maxRetries = 2,
}) => {
  const [verificationStep, setVerificationStep] = useState<
    'setup' | 'detecting' | 'verifying' | 'success' | 'failed'
  >('setup');
  const [retryAttempt, setRetryAttempt] = useState(1);
  const [detectionAttempts, setDetectionAttempts] = useState(0);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [countdown, setCountdown] = useState(3);

  const {
    isLoading: faceLoading,
    modelsLoaded,
    error: faceError,
    loadModels,
    detectFaceFromVideo,
    verifyFaceForAttendance,
  } = useFaceVerification();

  const {
    isActive: cameraActive,
    isLoading: cameraLoading,
    error: cameraError,
    videoRef,
    hasMultipleCameras,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
    getVideoElement,
  } = useCamera();

  // Load models and start camera on mount
  useEffect(() => {
    const initialize = async () => {
      await loadModels();
      await startCamera('user');

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
    };

    initialize();

    return () => {
      stopCamera();
    };
  }, [loadModels, startCamera, stopCamera]);

  // Enhanced auto-detect and verify face with SSDMobileNet and landmarks
  useEffect(() => {
    if (verificationStep === 'detecting' && cameraActive && modelsLoaded) {
      let isDetecting = false;

      const detectInterval = setInterval(async () => {
        if (isDetecting) return; // Skip if already detecting

        const videoElement = getVideoElement();
        if (!videoElement || videoElement.readyState !== 4) return;

        isDetecting = true;

        try {
          // Use high accuracy detection with SSDMobileNet and landmarks
          const result = await detectFaceFromVideo(videoElement, true);

          if (result.success && result.descriptor) {
            // Log enhanced detection results
            console.log('Enhanced face detection result:', {
              model: result.quality ? 'SSDMobileNet' : 'TinyFaceDetector',
              confidence: result.confidence?.toFixed(3),
              quality: result.quality,
              landmarksDetected: !!result.landmarks,
              feedback: result.feedback,
            });

            setVerificationStep('verifying');
            clearInterval(detectInterval);

            try {
              const verifyResult = await verifyFaceForAttendance(
                result.descriptor,
                attendanceSessionId,
                location,
                retryAttempt,
              );

              setVerificationResult(verifyResult);

              if (verifyResult.success) {
                setVerificationStep('success');
                // Show enhanced success feedback
                if (result.quality?.isGoodQuality) {
                  toast.success('High Quality Face Verified!', {
                    description: `Excellent detection with ${Math.round((result.confidence || 0) * 100)}% confidence`,
                  });
                }
                setTimeout(() => {
                  onSuccess(verifyResult);
                }, 2000);
              } else {
                setVerificationStep('failed');
              }
            } catch (error) {
              console.error('Enhanced verification error:', error);
              setVerificationStep('failed');
            }
          } else {
            setDetectionAttempts((prev) => prev + 1);

            // Show enhanced guidance based on feedback
            if (
              detectionAttempts > 15 &&
              result.feedback &&
              result.feedback.length > 0
            ) {
              const primaryFeedback = result.feedback[0];
              toast.warning('Face Detection Tips', {
                description: primaryFeedback,
              });
              setDetectionAttempts(0);
            } else if (detectionAttempts > 25) {
              toast.warning('Face Detection Tips', {
                description:
                  'Ensure good lighting, face the camera directly, and move closer if needed.',
              });
              setDetectionAttempts(0);
            }
          }
        } catch (error) {
          console.error('Enhanced face detection error:', error);
        } finally {
          isDetecting = false;
        }
      }, 200); // Slightly faster for SSDMobileNet

      return () => clearInterval(detectInterval);
    }
  }, [
    verificationStep,
    cameraActive,
    modelsLoaded,
    detectFaceFromVideo,
    verifyFaceForAttendance,
    attendanceSessionId,
    location,
    retryAttempt,
    onSuccess,
    getVideoElement,
    detectionAttempts,
  ]);

  const handleRetry = () => {
    if (retryAttempt >= maxRetries) {
      // Max retries reached, offer fallback
      toast.info('Face Verification Failed', {
        description: 'Falling back to GPS-only verification.',
      });
      onFallback();
      return;
    }

    setRetryAttempt((prev) => prev + 1);
    setVerificationStep('detecting');
    setDetectionAttempts(0);
  };

  const handleUseFallback = () => {
    toast.info('Using GPS-Only Verification', {
      description: 'Your attendance will be marked for manual review.',
    });
    onFallback();
  };

  const renderSetupStep = () => (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <Eye className="h-12 w-12 mx-auto text-blue-600" />
        <h3 className="text-lg font-semibold">Face Verification Required</h3>
        <p className="text-sm text-muted-foreground">
          Position your face in the camera frame for verification
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-6xl font-bold text-blue-600">{countdown}</div>
        <p className="text-sm text-muted-foreground">
          Get ready for face verification...
        </p>
      </div>

      <div className="flex justify-center space-x-2">
        <Button onClick={onCancel} variant="outline" size="sm">
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );

  const renderDetectingStep = () => (
    <div className="space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-md mx-auto rounded-lg bg-black"
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 border-4 border-blue-500 rounded-full animate-pulse opacity-50" />
          {/* Landmark detection indicators */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-green-400 rounded-lg opacity-30 animate-pulse" />
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          Detecting with SSDMobileNet...
        </div>

        {/* Model info overlay */}
        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          🎯 High Accuracy Mode
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
        {hasMultipleCameras && (
          <Button onClick={switchCamera} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-1" />
            Switch Camera
          </Button>
        )}

        <Button onClick={handleUseFallback} variant="outline" size="sm">
          Use GPS Only
        </Button>

        <Button onClick={onCancel} variant="outline" size="sm">
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
        <h3 className="font-semibold">Verifying Face</h3>
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
            : 'Face verification failed. Please try again.'}
        </p>
      </div>

      {verificationResult && (
        <div className="text-xs text-muted-foreground">
          Match Score: {(verificationResult.matchScore * 100).toFixed(1)}%
          (Required: {(verificationResult.threshold * 100).toFixed(1)}%)
        </div>
      )}

      <div className="flex justify-center space-x-2">
        {retryAttempt < maxRetries ? (
          <Button onClick={handleRetry} size="sm">
            Try Again ({maxRetries - retryAttempt} left)
          </Button>
        ) : (
          <Button onClick={handleUseFallback} size="sm">
            Use GPS Only
          </Button>
        )}

        <Button onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>Face Verification</span>
        </CardTitle>
        <CardDescription>
          Verify your identity to mark attendance
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!modelsLoaded && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Loading face recognition models...
            </AlertDescription>
          </Alert>
        )}

        {(faceError || cameraError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {faceError || cameraError}
              <Button
                onClick={handleUseFallback}
                variant="link"
                className="ml-2 p-0 h-auto"
              >
                Use GPS Only
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {modelsLoaded && !faceError && !cameraError && (
          <>
            {verificationStep === 'setup' && renderSetupStep()}
            {verificationStep === 'detecting' && renderDetectingStep()}
            {verificationStep === 'verifying' && renderVerifyingStep()}
            {verificationStep === 'success' && renderSuccessStep()}
            {verificationStep === 'failed' && renderFailedStep()}
          </>
        )}
      </CardContent>
    </Card>
  );
};
