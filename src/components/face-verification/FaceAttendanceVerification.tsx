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
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Eye,
  MapPin,
  Clock,
  X,
  Scan,
  Target,
  Activity,
} from 'lucide-react';
import { useFaceVerification } from '@/hooks/useFaceVerification';
import { useCamera } from '@/hooks/useCamera';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { useConvexMutation } from '@convex-dev/react-query';

interface FaceDetectionStats {
  confidence: number;
  faceSize: { width: number; height: number };
  landmarkQuality: number;
  isGoodQuality: boolean;
  feedback: string[];
}

interface FaceAttendanceVerificationProps {
  attendanceSessionId: string;
  location: { lat: number; long: number };
  onSuccess: (result: any) => void;
  onCancel: () => void;
  maxRetries?: number;
}

export const FaceAttendanceVerification: React.FC<
  FaceAttendanceVerificationProps
> = ({
  attendanceSessionId,
  location,
  onSuccess,
  onCancel,
  maxRetries = 10,
}) => {
  const [verificationStep, setVerificationStep] = useState<
    | 'setup'
    | 'detecting'
    | 'ready_to_capture'
    | 'verifying'
    | 'success'
    | 'failed'
  >('setup');
  const [retryAttempt, setRetryAttempt] = useState(1);
  const [faceDetectionStats, setFaceDetectionStats] =
    useState<FaceDetectionStats | null>(null);
  const [currentFaceDescriptor, setCurrentFaceDescriptor] =
    useState<Float32Array | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const {
    modelsLoaded,
    error: faceError,
    loadModels,
    detectFaceFromVideo,
    faceApiService,
  } = useFaceVerification();

  const {
    isActive: cameraActive,
    error: cameraError,
    videoRef,
    hasMultipleCameras,
    startCamera,
    stopCamera,
    switchCamera,
    getVideoElement,
  } = useCamera();

  // Convex mutation for marking attendance with server-side face verification
  const markAttendanceMutation = useMutation({
    mutationFn: useConvexMutation(api.attendance.checkInToAttendance),
  });

  // Load models and start camera on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await loadModels();
        await startCamera('user');
        setVerificationStep('detecting');
      } catch (error) {
        console.error('Initialization failed:', error);
        toast.error('Failed to initialize face verification');
      }
    };

    initialize();

    return () => {
      stopCamera();
    };
  }, [loadModels, startCamera, stopCamera]);

  // Continuous face detection for stats display (no automatic verification)
  useEffect(() => {
    if (verificationStep === 'detecting' && cameraActive && modelsLoaded) {
      const detectInterval = setInterval(async () => {
        const videoElement = getVideoElement();
        if (!videoElement || videoElement.readyState !== 4) return;

        try {
          // Use high accuracy detection with TinyFaceDetector and landmarks
          const result = await detectFaceFromVideo(videoElement, true);

          if (result.success && result.descriptor && result.quality) {
            // Update face detection stats for display
            const stats: FaceDetectionStats = {
              confidence: result.confidence || 0,
              faceSize: result.quality.faceSize,
              landmarkQuality: result.quality.landmarkQuality,
              isGoodQuality: result.quality.isGoodQuality,
              feedback: result.feedback || [],
            };

            setFaceDetectionStats(stats);
            // Always update the descriptor to prevent stale values
            setCurrentFaceDescriptor(result.descriptor);

            // Check if quality is good enough for capture (70%+ confidence for better success rate)
            const qualityScore = (result.confidence || 0) * 100;
            if (qualityScore >= 70 && result.quality.isGoodQuality) {
              setVerificationStep('ready_to_capture');
            }
          } else {
            // Clear stats if no face detected
            setFaceDetectionStats(null);
            setCurrentFaceDescriptor(null);
          }
        } catch (error) {
          console.error('Face detection error:', error);
        }
      }, 300); // Slower detection for continuous monitoring

      return () => {
        clearInterval(detectInterval);
      };
    }
  }, [
    verificationStep,
    cameraActive,
    modelsLoaded,
    detectFaceFromVideo,
    getVideoElement,
  ]);

  // Manual verification function - called when user clicks verify button
  const handleManualVerification = async () => {
    if (!currentFaceDescriptor) {
      toast.error('No face detected', {
        description: 'Please ensure your face is clearly visible',
      });
      return;
    }

    if (!faceDetectionStats || faceDetectionStats.confidence < 0.7) {
      toast.error('Face quality too low', {
        description: 'Please improve lighting and face positioning',
      });
      return;
    }

    setVerificationStep('verifying');

    try {
      console.log(
        'Starting server-side face verification and attendance marking...',
      );

      // Convert face descriptor to array for server transmission
      const faceDescriptorArray = faceApiService.descriptorToArray(
        currentFaceDescriptor,
      );

      // Send to server for verification and attendance marking
      const attendanceResult = await markAttendanceMutation.mutateAsync({
        attendanceSessionId: attendanceSessionId as any,
        gpsCoordinates: location,
        faceDescriptor: faceDescriptorArray,
        retryAttempt: retryAttempt,
      });

      console.log('Server attendance result:', attendanceResult);

      // Handle server response
      if (attendanceResult.verificationStatus === 'verified') {
        // Face verification succeeded on server
        setVerificationResult({
          success: true,
          matchScore: attendanceResult.faceMatchScore || 0.3,
          distance: attendanceResult.faceMatchScore || 0.3,
          threshold: 0.6,
        });
        setVerificationStep('success');

        toast.success('Face Verified Successfully!', {
          description: 'Attendance marked with face verification',
        });

        setTimeout(() => {
          onSuccess(attendanceResult);
        }, 2000);
      } else {
        // Face verification failed on server
        setVerificationResult({
          success: false,
          matchScore: attendanceResult.faceMatchScore || 0.8,
          distance: attendanceResult.faceMatchScore || 0.8,
          threshold: 0.6,
        });
        setVerificationStep('failed');

        toast.error('Face verification failed', {
          description: 'Server verification failed. Please try again.',
        });
      }
    } catch (error) {
      console.error('Server face verification error:', error);
      setVerificationStep('failed');

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('Face verification failed')) {
          setVerificationResult({
            success: false,
            matchScore: 0.8,
            distance: 0.8,
            threshold: 0.6,
          });

          toast.error('Face verification failed', {
            description: error.message,
          });
        } else if (error.message.includes('attempts remaining')) {
          toast.error('Face verification failed', {
            description: error.message,
          });
        } else {
          toast.error('Verification error', {
            description: error.message,
          });
        }
      } else {
        toast.error('Face verification failed', {
          description: 'An unexpected error occurred during verification',
        });
      }
    }
  };

  const handleRetry = () => {
    if (retryAttempt >= maxRetries) {
      toast.error('Maximum attempts reached', {
        description: 'Please meet your lecturer for manual verification.',
      });
      onCancel();
      return;
    }

    setRetryAttempt((prev) => prev + 1);
    setVerificationStep('detecting');
    setFaceDetectionStats(null);
    setCurrentFaceDescriptor(null);
    setVerificationResult(null); // Clear previous result to prevent stale values
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
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-sm">Initializing camera...</span>
        </div>
      </div>

      <div className="flex justify-center space-x-2">
        <Button onClick={onCancel} variant="outline" size="sm">
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );

  const renderReadyToVerifyStep = () => (
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
          <div className="w-48 h-48 border-4 border-green-500 rounded-full opacity-50" />
          {/* Face ready indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-green-400 rounded-lg opacity-60" />
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600/80 text-white px-3 py-1 rounded-full text-sm font-medium">
          Ready to Verify!
        </div>

        {/* Face detection stats overlay */}
        {faceDetectionStats && (
          <div className="absolute top-2 left-2 bg-green-600/80 text-white px-2 py-1 rounded text-xs space-y-1">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>
                Confidence: {Math.round(faceDetectionStats.confidence * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>Quality: Excellent</span>
            </div>
            <div className="text-xs">
              Size: {faceDetectionStats.faceSize.width}×
              {faceDetectionStats.faceSize.height}
            </div>
          </div>
        )}
      </div>

      {/* Success feedback */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-sm text-green-800">
          Face detected with high quality! You can now verify your attendance.
        </AlertDescription>
      </Alert>

      <div className="text-center space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              High quality face detected!
            </span>
          </div>
          {faceDetectionStats && (
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div className="text-center">
                <div className="font-medium">Confidence</div>
                <div className="text-green-600 font-bold">
                  {Math.round(faceDetectionStats.confidence * 100)}%
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">Quality</div>
                <div className="text-green-600 font-bold">
                  {faceDetectionStats.isGoodQuality ? 'Excellent' : 'Good'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Manual verification button */}
        <Button
          onClick={handleManualVerification}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
          disabled={!faceDetectionStats || faceDetectionStats.confidence < 0.7}
        >
          <Scan className="h-5 w-5 mr-2" />
          Verify My Face
        </Button>
      </div>

      <div className="flex justify-center space-x-2">
        {hasMultipleCameras && (
          <Button onClick={switchCamera} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-1" />
            Switch Camera
          </Button>
        )}

        <Button onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
      </div>

      <Badge variant="secondary" className="mx-auto block w-fit">
        Attempt {retryAttempt} of {maxRetries}
      </Badge>
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
          {/* Face detection indicator */}
          {faceDetectionStats && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-32 h-32 border-2 rounded-lg opacity-60 ${
                  faceDetectionStats.isGoodQuality
                    ? 'border-green-400'
                    : 'border-yellow-400'
                }`}
              />
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          {faceDetectionStats ? 'Face Detected' : 'Detecting Face...'}
        </div>

        {/* Face detection stats overlay */}
        {faceDetectionStats && (
          <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs space-y-1">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>
                Confidence: {Math.round(faceDetectionStats.confidence * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>
                Quality: {faceDetectionStats.isGoodQuality ? 'Good' : 'Low'}
              </span>
            </div>
            <div className="text-xs">
              Size: {faceDetectionStats.faceSize.width}×
              {faceDetectionStats.faceSize.height}
            </div>
          </div>
        )}
      </div>

      {/* Face detection feedback */}
      {faceDetectionStats && faceDetectionStats.feedback.length > 0 && (
        <Alert
          className={
            faceDetectionStats.isGoodQuality
              ? 'border-green-200'
              : 'border-yellow-200'
          }
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {faceDetectionStats.feedback[0]}
          </AlertDescription>
        </Alert>
      )}

      <div className="text-center space-y-2">
        {!faceDetectionStats ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Looking for your face...</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Eye className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Face detected!</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Quality: {Math.round(faceDetectionStats.confidence * 100)}%
              confidence
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-2">
        {hasMultipleCameras && (
          <Button onClick={switchCamera} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-1" />
            Switch Camera
          </Button>
        )}

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
            ? 'Maximum attempts reached. Please meet your lecturer for manual verification.'
            : 'Face verification failed. Please try again.'}
        </p>
      </div>

      {verificationResult && (
        <div className="text-xs text-muted-foreground">
          Match Score: {(verificationResult.matchScore * 100).toFixed(1)}%
          (Required: ≤60% distance)
        </div>
      )}

      <div className="flex justify-center space-x-2">
        {retryAttempt < maxRetries ? (
          <Button onClick={handleRetry} size="sm">
            Try Again ({maxRetries - retryAttempt} left)
          </Button>
        ) : (
          <Button onClick={onCancel} size="sm">
            Contact Lecturer
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
            <AlertDescription>{faceError || cameraError}</AlertDescription>
          </Alert>
        )}

        {modelsLoaded && !faceError && !cameraError && (
          <>
            {verificationStep === 'setup' && renderSetupStep()}
            {verificationStep === 'detecting' && renderDetectingStep()}
            {verificationStep === 'ready_to_capture' &&
              renderReadyToVerifyStep()}
            {verificationStep === 'verifying' && renderVerifyingStep()}
            {verificationStep === 'success' && renderSuccessStep()}
            {verificationStep === 'failed' && renderFailedStep()}
          </>
        )}
      </CardContent>
    </Card>
  );
};
