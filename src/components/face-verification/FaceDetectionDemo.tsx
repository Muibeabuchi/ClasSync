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
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  Camera,
  CheckCircle,
  AlertCircle,
  Eye,
  Settings,
  Activity,
  Zap,
  Target,
  RotateCcw,
} from 'lucide-react';
import { useFaceVerification } from '@/hooks/useFaceVerification';
import { toast } from 'sonner';

interface FaceDetectionDemoProps {
  useHighAccuracy?: boolean;
  onAccuracyChange?: (useHighAccuracy: boolean) => void;
}

export const FaceDetectionDemo: React.FC<FaceDetectionDemoProps> = ({
  useHighAccuracy = true,
  onAccuracyChange,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceQuality, setFaceQuality] = useState<any>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [currentModelUsed, setCurrentModelUsed] = useState<string>('');
  const [detectionStats, setDetectionStats] = useState({
    totalAttempts: 0,
    successfulDetections: 0,
    averageConfidence: 0,
  });

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isLoading,
    modelsLoaded,
    error: faceError,
    loadModels,
    detectFaceFromVideo,
    faceApiService,
  } = useFaceVerification();

  // Load models on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('FaceDetectionDemo: Loading models...');
        await loadModels();

        if (faceApiService) {
          const info = faceApiService.getModelInfo();
          setModelInfo(info);
          console.log('Model info:', info);
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    };

    initialize();
  }, [loadModels, faceApiService]);

  // Draw landmarks on canvas overlay - Define this BEFORE the useEffect that uses it
  const drawLandmarksOnCanvas = useCallback(
    (video: HTMLVideoElement, landmarks: any, quality: any) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions to match video
      const rect = video.getBoundingClientRect();
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw landmarks if available
      if (landmarks && landmarks.positions) {
        const color = quality?.isGoodQuality ? '#10B981' : '#F59E0B';
        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        // Draw landmark points
        landmarks.positions.forEach((point: any, index: number) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1.5, 0, 2 * Math.PI);
          ctx.fill();

          // Draw point numbers for debugging (optional)
          if (index % 5 === 0) {
            ctx.fillStyle = 'white';
            ctx.font = '8px Arial';
            ctx.fillText(index.toString(), point.x + 3, point.y - 3);
            ctx.fillStyle = color;
          }
        });

        // Draw face outline if we have 68 landmarks
        if (landmarks.positions.length >= 68) {
          ctx.lineWidth = 2;
          ctx.strokeStyle = color;

          // Draw jaw line (points 0-16)
          ctx.beginPath();
          for (let i = 0; i <= 16; i++) {
            const point = landmarks.positions[i];
            if (i === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          }
          ctx.stroke();

          // Draw eyebrows
          if (landmarks.getLeftEyeBrow && landmarks.getRightEyeBrow) {
            try {
              const leftBrow = landmarks.getLeftEyeBrow();
              const rightBrow = landmarks.getRightEyeBrow();

              // Left eyebrow
              ctx.beginPath();
              leftBrow.forEach((point: any, i: number) => {
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
              });
              ctx.stroke();

              // Right eyebrow
              ctx.beginPath();
              rightBrow.forEach((point: any, i: number) => {
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
              });
              ctx.stroke();
            } catch (e) {
              console.warn('Could not draw eyebrows:', e);
            }
          }

          // Draw eyes
          if (landmarks.getLeftEye && landmarks.getRightEye) {
            try {
              const leftEye = landmarks.getLeftEye();
              const rightEye = landmarks.getRightEye();

              // Left eye
              ctx.beginPath();
              leftEye.forEach((point: any, i: number) => {
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
              });
              ctx.closePath();
              ctx.stroke();

              // Right eye
              ctx.beginPath();
              rightEye.forEach((point: any, i: number) => {
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
              });
              ctx.closePath();
              ctx.stroke();
            } catch (e) {
              console.warn('Could not draw eyes:', e);
            }
          }

          // Draw nose
          if (landmarks.getNose) {
            try {
              const nose = landmarks.getNose();
              ctx.beginPath();
              nose.forEach((point: any, i: number) => {
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
              });
              ctx.stroke();
            } catch (e) {
              console.warn('Could not draw nose:', e);
            }
          }

          // Draw mouth
          if (landmarks.getMouth) {
            try {
              const mouth = landmarks.getMouth();
              ctx.beginPath();
              mouth.forEach((point: any, i: number) => {
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
              });
              ctx.closePath();
              ctx.stroke();
            } catch (e) {
              console.warn('Could not draw mouth:', e);
            }
          }
        }

        // Add quality info overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 60);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(
          `Model: ${modelInfo?.primaryDetector || 'Unknown'}`,
          15,
          25,
        );
        ctx.fillText(`Landmarks: ${landmarks.positions.length}`, 15, 40);
        ctx.fillText(
          `Quality: ${quality?.isGoodQuality ? 'Good' : 'Poor'}`,
          15,
          55,
        );
      }
    },
    [modelInfo],
  );

  // Real-time face detection
  useEffect(() => {
    if (isActive && modelsLoaded && webcamRef.current) {
      let isDetecting = false;

      const detectInterval = setInterval(async () => {
        if (isDetecting || !webcamRef.current) return;

        const video = webcamRef.current.video;
        if (!video || video.readyState !== 4) return;

        isDetecting = true;

        try {
          setDetectionStats((prev) => ({
            ...prev,
            totalAttempts: prev.totalAttempts + 1,
          }));

          // Use the accuracy setting for testing

          console.log('FaceDetectionDemo: Calling detectFaceFromVideo with:', {
            useHighAccuracy,
            currentModelUsed,
          });

          const result = await detectFaceFromVideo(video, useHighAccuracy);

          // Update current model used
          if (result.modelUsed) {
            console.log(
              'FaceDetectionDemo: Model used result:',
              result.modelUsed,
            );
            setCurrentModelUsed(result.modelUsed);
          }

          if (result.success && result.quality) {
            setFaceDetected(true);
            setFaceQuality(result.quality);

            // Update success stats
            setDetectionStats((prev) => ({
              ...prev,
              successfulDetections: prev.successfulDetections + 1,
              averageConfidence:
                (prev.averageConfidence + (result.confidence || 0)) / 2,
            }));

            // Draw landmarks on canvas
            if (result.landmarks && canvasRef.current) {
              drawLandmarksOnCanvas(video, result.landmarks, result.quality);
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
          setFaceDetected(false);
          setFaceQuality(null);
        } finally {
          isDetecting = false;
        }
      }, 100); // Fast detection for demo

      detectionIntervalRef.current = detectInterval;
      return () => {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
        }
      };
    }
  }, [
    isActive,
    modelsLoaded,
    detectFaceFromVideo,
    useHighAccuracy,
    drawLandmarksOnCanvas,
    currentModelUsed,
  ]);

  const startDetection = () => {
    setIsActive(true);
    setDetectionStats({
      totalAttempts: 0,
      successfulDetections: 0,
      averageConfidence: 0,
    });
  };

  const stopDetection = () => {
    setIsActive(false);
    setFaceDetected(false);
    setFaceQuality(null);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const successRate =
    detectionStats.totalAttempts > 0
      ? (detectionStats.successfulDetections / detectionStats.totalAttempts) *
        100
      : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Face Detection Demo - TinyFaceDetector + Landmarks</span>
          </CardTitle>
          <CardDescription>
            Real-time face detection with landmark visualization using
            TinyFaceDetector
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Model Status */}
          {modelInfo && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 border rounded">
                <div className="text-sm font-medium">Face Detector</div>
                <Badge
                  variant={
                    modelInfo.tinyFaceDetectorLoaded ? 'default' : 'secondary'
                  }
                >
                  {modelInfo.primaryDetector}
                </Badge>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-sm font-medium">Landmarks</div>
                <Badge
                  variant={
                    modelInfo.faceLandmark68Loaded ? 'default' : 'secondary'
                  }
                >
                  {modelInfo.landmarkModel}
                </Badge>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-sm font-medium">Accuracy Mode</div>
                <Badge variant={useHighAccuracy ? 'default' : 'secondary'}>
                  {useHighAccuracy ? 'High' : 'Fast'}
                </Badge>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-sm font-medium">Currently Using</div>
                <Badge variant="outline">{currentModelUsed || 'None'}</Badge>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-sm font-medium">Status</div>
                <Badge variant={modelsLoaded ? 'default' : 'destructive'}>
                  {modelsLoaded ? 'Ready' : 'Loading'}
                </Badge>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex space-x-2">
            {!isActive ? (
              <Button
                onClick={startDetection}
                disabled={!modelsLoaded || isLoading}
                className="flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>Start Detection</span>
              </Button>
            ) : (
              <Button
                onClick={stopDetection}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <Activity className="h-4 w-4" />
                <span>Stop Detection</span>
              </Button>
            )}
          </div>

          {/* Camera Preview with Landmarks */}
          {isActive && (
            <div className="space-y-4">
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
                    facingMode: 'user',
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

                {/* Detection status overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {faceDetected ? (
                    faceQuality?.isGoodQuality ? (
                      <span className="text-green-400">
                        ✓ High Quality Face
                      </span>
                    ) : (
                      <span className="text-yellow-400">
                        ⚠ Low Quality Face
                      </span>
                    )
                  ) : (
                    <span className="text-red-400">⚪ No Face Detected</span>
                  )}
                </div>
              </div>

              {/* Face Quality Details */}
              {faceDetected && faceQuality && (
                <div className="space-y-3">
                  <h4 className="font-medium text-center">
                    Face Quality Metrics
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 border rounded">
                      <div className="font-medium">Size</div>
                      <div
                        className={
                          faceQuality.faceSize.width >= 120
                            ? 'text-green-600'
                            : 'text-orange-600'
                        }
                      >
                        {faceQuality.faceSize.width} ×{' '}
                        {faceQuality.faceSize.height}
                      </div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="font-medium">Confidence</div>
                      <div
                        className={
                          faceQuality.confidence >= 0.7
                            ? 'text-green-600'
                            : 'text-orange-600'
                        }
                      >
                        {Math.round(faceQuality.confidence * 100)}%
                      </div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="font-medium">Landmarks</div>
                      <div
                        className={
                          faceQuality.landmarkQuality >= 0.7
                            ? 'text-green-600'
                            : 'text-orange-600'
                        }
                      >
                        {Math.round(faceQuality.landmarkQuality * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detection Statistics */}
              <div className="space-y-3">
                <h4 className="font-medium text-center">
                  Detection Statistics
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 border rounded">
                    <div className="font-medium">Attempts</div>
                    <div>{detectionStats.totalAttempts}</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="font-medium">Success Rate</div>
                    <div
                      className={
                        successRate >= 80 ? 'text-green-600' : 'text-orange-600'
                      }
                    >
                      {successRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="font-medium">Avg Confidence</div>
                    <div>
                      {Math.round(detectionStats.averageConfidence * 100)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Detection Performance</span>
                    <span>{successRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={successRate} className="h-2" />
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {faceError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{faceError}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Loading face detection models...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
