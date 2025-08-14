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
  Target,
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
    'setup' | 'ready' | 'captured' | 'processing'
  >('setup');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceQuality, setFaceQuality] = useState<any>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  // Draw landmarks on canvas overlay - Define this BEFORE the useEffect that uses it
  const drawLandmarks = useCallback(
    (video: HTMLVideoElement, landmarks: any, quality: any) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw face bounding box
      if (quality && quality.isGoodQuality) {
        ctx.strokeStyle = '#10B981'; // Green for good quality
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = '#F59E0B'; // Orange for poor quality
        ctx.lineWidth = 2;
      }

      // Draw landmarks if available
      if (landmarks && landmarks.positions) {
        ctx.fillStyle = quality?.isGoodQuality ? '#10B981' : '#F59E0B';

        landmarks.positions.forEach((point: any) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Draw face outline if we have enough landmarks
        if (landmarks.positions.length >= 17) {
          ctx.strokeStyle = quality?.isGoodQuality ? '#10B981' : '#F59E0B';
          ctx.lineWidth = 2;
          ctx.beginPath();

          // Draw jaw line (points 0-16)
          for (let i = 0; i <= 16; i++) {
            const point = landmarks.positions[i];
            if (i === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          }
          ctx.stroke();
        }
      }
    },
    [],
  );

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

  // Continuous face detection for real-time feedback (no auto-capture)
  useEffect(() => {
    if (
      captureMode === 'camera' &&
      captureStep === 'ready' &&
      modelsLoaded &&
      webcamRef.current
    ) {
      // Add a small delay to ensure models are fully loaded
      const startDelay = setTimeout(() => {
        let isDetecting = false;

        const detectInterval = setInterval(async () => {
          if (isDetecting || !webcamRef.current) return;

          const video = webcamRef.current.video;
          if (!video || video.readyState !== 4) return;

          // Check video dimensions to prevent canvas drawing errors
          if (video.videoWidth === 0 || video.videoHeight === 0) return;

          isDetecting = true;

          try {
            // Double-check models are loaded before detection
            if (!modelsLoaded) {
              console.warn(
                'Detection attempted but models not loaded in component state',
              );
              return;
            }

            // Use high accuracy detection with TinyFaceDetector for onboarding
            const result = await detectFaceFromVideo(video, true);

            if (result.success && result.quality) {
              setFaceDetected(true);
              setFaceQuality(result.quality);

              // Draw landmarks on canvas if available
              if (result.landmarks && canvasRef.current) {
                drawLandmarks(video, result.landmarks, result.quality);
              }
            } else {
              setFaceDetected(false);
              setFaceQuality(null);

              // Clear canvas
              if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                  ctx.clearRect(
                    0,
                    0,
                    canvasRef.current.width,
                    canvasRef.current.height,
                  );
                }
              }
            }
          } catch (error) {
            console.error('Face detection error:', error);

            // If it's a models not loaded error, try to reload
            if (
              error instanceof Error &&
              error.message.includes('Models not loaded')
            ) {
              console.log(
                'Models not loaded error detected, attempting to reload...',
              );
              try {
                await loadModels();
              } catch (reloadError) {
                console.error('Failed to reload models:', reloadError);
              }
            }

            setFaceDetected(false);
            setFaceQuality(null);
          } finally {
            isDetecting = false;
          }
        }, 200); // Faster detection for real-time feedback

        detectionIntervalRef.current = detectInterval;
      }, 1000); // Wait 1 second before starting detection

      return () => {
        clearTimeout(startDelay);
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
    drawLandmarks,
    loadModels,
  ]);

  const handleStartCamera = () => {
    setCaptureMode('camera');
    setCaptureStep('ready');
    setFaceDetected(false);
    setFaceQuality(null);
  };

  // Manual capture when user clicks the button
  const handleCaptureFace = async () => {
    if (!webcamRef.current || !faceDetected || !faceQuality?.isGoodQuality) {
      toast.warning('Face Not Ready', {
        description:
          'Please ensure your face is clearly visible and well-lit before capturing.',
      });
      return;
    }

    setCaptureStep('processing');

    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.error('Face capture timeout - operation took too long');
      toast.error('Operation Timeout', {
        description: 'Face capture is taking too long. Please try again.',
      });
      setCaptureStep('ready');
    }, 30000); // 30 second timeout

    try {
      // Capture the screenshot
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        throw new Error('Failed to capture image');
      }

      setCapturedImage(imageSrc);

      // Create image element for face detection (same as image upload)
      const img = new Image();
      img.onload = async () => {
        try {
          // Use the same detection method as image upload
          const result = await detectFaceFromImage(img);

          if (result.success && result.descriptor) {
            console.log('Camera face capture successful:', {
              model: 'TinyFaceDetector',
              confidence: result.confidence,
              success: result.success,
            });

            console.log('Attempting to save face descriptor from camera...');

            try {
              const saved = await saveFaceDescriptor(
                result.descriptor,
                'live_camera',
              );

              console.log('Camera face descriptor save result:', saved);

              if (saved) {
                console.log(
                  'Face descriptor saved from camera, completing onboarding...',
                );
                clearTimeout(timeoutId);

                // Show success message
                toast.success('Face Verification Complete!', {
                  description: `High quality face captured with ${Math.round((result.confidence || 0) * 100)}% confidence`,
                });

                // Set captured state briefly to show success
                setCaptureStep('captured');

                // Complete onboarding after a very short delay to show success state
                setTimeout(() => {
                  console.log(
                    'Calling onComplete to finish onboarding from camera...',
                  );
                  onComplete();
                }, 1000);
              } else {
                throw new Error(
                  'Failed to save face descriptor - function returned false',
                );
              }
            } catch (saveError) {
              console.error(
                'Error saving face descriptor from camera:',
                saveError,
              );

              let errorMessage = 'Failed to save face data. Please try again.';
              if (saveError instanceof Error) {
                if (saveError.message.includes('timed out')) {
                  errorMessage =
                    'Save operation timed out. Please check your connection and try again.';
                } else if (
                  saveError.message.includes('Authentication required')
                ) {
                  errorMessage = 'Please refresh the page and log in again.';
                } else if (
                  saveError.message.includes('User profile not found')
                ) {
                  errorMessage = 'Please complete your profile setup first.';
                } else {
                  errorMessage = saveError.message;
                }
              }

              toast.error('Save Failed', {
                description: errorMessage,
              });
              setCaptureStep('ready');
            }
          } else {
            toast.error('Face Detection Failed', {
              description:
                result.error ||
                'No clear face detected in the captured image. Please try again with better lighting and face positioning.',
            });
            setCaptureStep('ready');
          }
        } catch (error) {
          console.error('Camera face processing error:', error);
          toast.error('Processing Error', {
            description:
              'Failed to process the captured image. Please try again.',
          });
          setCaptureStep('ready');
        }
      };

      // Set the image source to trigger the onload event
      img.src = imageSrc;
    } catch (error) {
      console.error('Face capture error:', error);
      toast.error('Capture Failed', {
        description:
          error instanceof Error
            ? error.message
            : 'Failed to capture face. Please try again.',
      });
      setCaptureStep('ready');
    } finally {
      clearTimeout(timeoutId);
    }
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
            console.log('Enhanced image upload face detection:', {
              model: 'TinyFaceDetector',
              confidence: result.confidence,
              success: result.success,
            });

            console.log(
              'Attempting to save face descriptor from image upload...',
            );

            try {
              const saved = await saveFaceDescriptor(
                result.descriptor,
                'image_upload',
              );

              console.log('Image upload face descriptor save result:', saved);

              if (saved) {
                console.log(
                  'Face descriptor saved from image upload, completing onboarding...',
                );

                // Show success message
                toast.success('Face Verification Complete!', {
                  description: `Face detected from uploaded image with ${Math.round((result.confidence || 0) * 100)}% confidence`,
                });

                // Set captured state briefly to show success
                setCaptureStep('captured');

                // Complete onboarding after a very short delay to show success state
                setTimeout(() => {
                  console.log(
                    'Calling onComplete to finish onboarding from image upload...',
                  );
                  onComplete();
                }, 1000);
              } else {
                throw new Error(
                  'Failed to save face descriptor - function returned false',
                );
              }
            } catch (saveError) {
              console.error(
                'Error saving face descriptor from image upload:',
                saveError,
              );

              let errorMessage = 'Failed to save face data. Please try again.';
              if (saveError instanceof Error) {
                if (saveError.message.includes('timed out')) {
                  errorMessage =
                    'Save operation timed out. Please check your connection and try again.';
                } else if (
                  saveError.message.includes('Authentication required')
                ) {
                  errorMessage = 'Please refresh the page and log in again.';
                } else if (
                  saveError.message.includes('User profile not found')
                ) {
                  errorMessage = 'Please complete your profile setup first.';
                } else {
                  errorMessage = saveError.message;
                }
              }

              toast.error('Save Failed', {
                description: errorMessage,
              });
              setCaptureStep('setup');
              setCaptureMode(null);
              setCapturedImage(null);
            }
          } else {
            toast.error('Face Detection Failed', {
              description:
                result.error ||
                'No clear face detected in the uploaded image. Please try a different photo with better lighting and face visibility.',
            });
            setCaptureStep('setup');
            setCaptureMode(null);
            setCapturedImage(null);
          }
        } catch (error) {
          console.error('Enhanced image processing error:', error);
          toast.error('Processing Error', {
            description:
              'Failed to process the uploaded image. Please try again with a different photo.',
          });
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
    setFaceDetected(false);
    setFaceQuality(null);
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
        <div className="relative w-full max-w-md mx-auto">
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
            className="w-full rounded-lg bg-black"
          />

          {/* Canvas overlay for landmarks */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
            style={{
              width: '100%',
              height: 'auto',
              aspectRatio: '4/3',
            }}
          />

          {/* Face detection status overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {faceDetected ? (
              faceQuality?.isGoodQuality ? (
                <span className="text-green-400">✓ Face Ready</span>
              ) : (
                <span className="text-yellow-400">⚠ Improve Position</span>
              )
            ) : (
              <span className="text-red-400">⚪ No Face Detected</span>
            )}
          </div>

          {/* Model info overlay */}
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            ⚡ TinyFaceDetector
          </div>

          {/* Quality indicators */}
          {faceQuality && (
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              Quality: {Math.round(faceQuality.confidence * 100)}%
            </div>
          )}
        </div>
      </div>

      {/* Face quality feedback */}
      {faceDetected && faceQuality && (
        <div className="text-center space-y-2">
          <div className="flex justify-center space-x-4 text-xs">
            <div
              className={`flex items-center space-x-1 ${
                faceQuality.faceSize.width >= 120
                  ? 'text-green-600'
                  : 'text-orange-600'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  faceQuality.faceSize.width >= 120
                    ? 'bg-green-600'
                    : 'bg-orange-600'
                }`}
              />
              <span>Size: {faceQuality.faceSize.width}px</span>
            </div>
            <div
              className={`flex items-center space-x-1 ${
                faceQuality.confidence >= 0.7
                  ? 'text-green-600'
                  : 'text-orange-600'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  faceQuality.confidence >= 0.7
                    ? 'bg-green-600'
                    : 'bg-orange-600'
                }`}
              />
              <span>
                Confidence: {Math.round(faceQuality.confidence * 100)}%
              </span>
            </div>
            <div
              className={`flex items-center space-x-1 ${
                faceQuality.landmarkQuality >= 0.7
                  ? 'text-green-600'
                  : 'text-orange-600'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  faceQuality.landmarkQuality >= 0.7
                    ? 'bg-green-600'
                    : 'bg-orange-600'
                }`}
              />
              <span>
                Landmarks: {Math.round(faceQuality.landmarkQuality * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Capture button */}
      <div className="flex justify-center">
        <Button
          onClick={handleCaptureFace}
          disabled={!faceDetected || !faceQuality?.isGoodQuality}
          className="px-8 py-3"
          size="lg"
        >
          <Target className="h-5 w-5 mr-2" />
          {faceDetected && faceQuality?.isGoodQuality
            ? 'Capture Face'
            : 'Position Your Face'}
        </Button>
      </div>

      <div className="flex justify-center space-x-2">
        {devices.length > 1 && (
          <Button
            onClick={switchCamera}
            variant="outline"
            size="sm"
            disabled={captureStep !== 'ready'}
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
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground space-y-1">
          <div>
            Debug: Face loading state -{' '}
            {faceLoading ? 'Loading' : 'Not loading'}
          </div>
          <div>Capture mode: {captureMode}</div>
          <div>Capture step: {captureStep}</div>
          <div>Models loaded: {modelsLoaded ? 'Yes' : 'No'}</div>
        </div>
      )}
      <Button
        onClick={handleRetry}
        variant="outline"
        size="sm"
        className="mt-4"
      >
        Cancel & Retry
      </Button>
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
            {captureStep === 'ready' &&
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
            <div>Face Detected: {faceDetected ? '✅' : '❌'}</div>
            <div>Face Quality: {faceQuality?.isGoodQuality ? '✅' : '❌'}</div>
            <div>Devices: {devices.length}</div>
            <div>Facing Mode: {facingMode}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
