import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
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
import {
  Loader2,
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useFaceVerification } from '@/hooks/useFaceVerification';
import { toast } from 'sonner';

interface FaceOnboardingCaptureProps {
  onComplete: () => void;
  // onSkip removed - face verification is mandatory
}

export const FaceOnboardingCapture: React.FC<FaceOnboardingCaptureProps> = ({
  onComplete,
}) => {
  const [captureMode, setCaptureMode] = useState<'camera' | 'upload' | null>(
    null,
  );
  const [captureStep, setCaptureStep] = useState<
    'setup' | 'detecting' | 'captured' | 'processing'
  >('setup');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectionAttempts, setDetectionAttempts] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isLoading: faceLoading,
    modelsLoaded,
    error: faceError,
    loadModels,
    detectFaceFromVideo,
    detectFaceFromImage,
    saveFaceDescriptor,
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

  // Load models and get devices on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('FaceOnboardingCapture: Starting model loading...');
        await loadModels();
        console.log('FaceOnboardingCapture: Models loaded successfully');
        await getDevices();
      } catch (error) {
        console.error('FaceOnboardingCapture: Failed to initialize:', error);
      }
    };

    initialize();
  }, [loadModels, getDevices]);

  // Auto-detect face when camera is active
  useEffect(() => {
    if (
      captureMode === 'camera' &&
      captureStep === 'detecting' &&
      modelsLoaded &&
      webcamRef.current
    ) {
      let isDetecting = false;

      const detectInterval = setInterval(async () => {
        if (isDetecting || !webcamRef.current) return;

        const video = webcamRef.current.video;
        if (!video || video.readyState !== 4) return;

        isDetecting = true;

        try {
          // Use lightweight detection for real-time processing
          const result = await detectFaceFromVideo(video, false);

          if (result.success && result.descriptor) {
            // Face detected! Capture the photo
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
              setCapturedImage(imageSrc);
              setCaptureStep('captured');
              clearInterval(detectInterval);

              // Process the face descriptor immediately
              setCaptureStep('processing');
              const saved = await saveFaceDescriptor(
                result.descriptor!,
                'live_camera',
              );
              if (saved) {
                onComplete();
              } else {
                handleRetry();
              }
            }
          } else {
            setDetectionAttempts((prev) => prev + 1);

            // Show guidance less frequently to avoid spam
            if (detectionAttempts > 30) {
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
      }, 500); // Detection interval

      detectionIntervalRef.current = detectInterval;
      return () => {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
        }
      };
    }
  }, [
    captureMode,
    captureStep,
    modelsLoaded,
    detectFaceFromVideo,
    saveFaceDescriptor,
    onComplete,
    detectionAttempts,
  ]);

  const handleStartCamera = () => {
    setCaptureMode('camera');
    setCaptureStep('detecting');
    setDetectionAttempts(0);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid File', {
        description: 'Please select an image file.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setCapturedImage(imageData);
      setCaptureMode('upload');
      setCaptureStep('processing');

      // Create image element for face detection
      const img = new Image();
      img.onload = async () => {
        try {
          const result = await detectFaceFromImage(img);

          if (result.success && result.descriptor) {
            const saved = await saveFaceDescriptor(
              result.descriptor,
              'image_upload',
            );
            if (saved) {
              onComplete();
            } else {
              setCaptureStep('setup');
              setCaptureMode(null);
              setCapturedImage(null);
            }
          } else {
            toast.error('Face Detection Failed', {
              description: result.error || 'No face detected in the image.',
            });
            setCaptureStep('setup');
            setCaptureMode(null);
            setCapturedImage(null);
          }
        } catch (error) {
          console.error('Image processing error:', error);
          setCaptureStep('setup');
          setCaptureMode(null);
          setCapturedImage(null);
        }
      };
      img.src = imageData;
    };
    reader.readAsDataURL(file);
  };

  const handleRetry = () => {
    setCaptureStep('setup');
    setCaptureMode(null);
    setCapturedImage(null);
    setDetectionAttempts(0);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
  };

  const switchCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
  };

  const renderSetupStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Eye className="h-12 w-12 mx-auto text-blue-600" />
        <h3 className="text-lg font-semibold">Face Verification Setup</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Set up face verification for secure attendance check-in. Choose your
          preferred method below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={handleStartCamera}
          disabled={!modelsLoaded || faceLoading}
          className="h-24 flex-col space-y-2"
          variant="outline"
        >
          <Camera className="h-6 w-6" />
          <div className="text-center">
            <div className="font-medium">Live Camera</div>
            <div className="text-xs text-muted-foreground">Recommended</div>
          </div>
        </Button>

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={!modelsLoaded || faceLoading}
          className="h-24 flex-col space-y-2"
          variant="outline"
        >
          <Upload className="h-6 w-6" />
          <div className="text-center">
            <div className="font-medium">Upload Photo</div>
            <div className="text-xs text-muted-foreground">Fallback option</div>
          </div>
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Face verification is required to complete registration
        </p>
      </div>
    </div>
  );

  const renderCameraStep = () => (
    <div className="space-y-4">
      <div className="relative">
        <Webcam
          ref={webcamRef}
          audio={false}
          width={640}
          height={480}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: facingMode,
            deviceId: selectedDeviceId
              ? { exact: selectedDeviceId }
              : undefined,
          }}
          className="w-full max-w-md mx-auto rounded-lg bg-black"
        />

        {captureStep === 'detecting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Detecting face...</p>
              <p className="text-xs opacity-75">Look directly at the camera</p>
              <p className="text-xs opacity-75 mt-1">
                Attempts: {detectionAttempts}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-2">
        {devices.length > 1 && (
          <Button
            onClick={switchCamera}
            variant="outline"
            size="sm"
            disabled={captureStep !== 'detecting'}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Switch Camera
          </Button>
        )}

        <Button onClick={handleRetry} variant="outline" size="sm">
          Cancel
        </Button>
      </div>

      <Badge variant="secondary" className="mx-auto block w-fit">
        {facingMode === 'user' ? 'Front Camera' : 'Back Camera'}
      </Badge>
    </div>
  );

  const renderCapturedStep = () => (
    <div className="space-y-4 text-center">
      {capturedImage && (
        <img
          src={capturedImage}
          alt="Captured face"
          className="w-48 h-48 object-cover rounded-lg mx-auto border"
        />
      )}

      <div className="space-y-2">
        <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
        <h3 className="font-semibold">Face Captured Successfully!</h3>
        <p className="text-sm text-muted-foreground">
          Processing your face data for verification...
        </p>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="space-y-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
      <h3 className="font-semibold">Processing Face Data</h3>
      <p className="text-sm text-muted-foreground">
        Securely storing your face verification data...
      </p>
    </div>
  );

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>Face Verification Setup</span>
        </CardTitle>
        <CardDescription>
          Set up face verification for secure attendance check-in
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

        {faceError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{faceError}</AlertDescription>
          </Alert>
        )}

        {modelsLoaded && !faceError && (
          <>
            {captureStep === 'setup' && renderSetupStep()}
            {captureStep === 'detecting' &&
              captureMode === 'camera' &&
              renderCameraStep()}
            {captureStep === 'captured' && renderCapturedStep()}
            {captureStep === 'processing' && renderProcessingStep()}
          </>
        )}

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <div>Models Loaded: {modelsLoaded ? '✅' : '❌'}</div>
            <div>Capture Mode: {captureMode || 'none'}</div>
            <div>Capture Step: {captureStep}</div>
            <div>Detection Attempts: {detectionAttempts}</div>
            <div>Devices: {devices.length}</div>
            <div>Facing Mode: {facingMode}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
