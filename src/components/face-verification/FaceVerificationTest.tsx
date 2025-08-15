import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFaceVerification } from '@/hooks/useFaceVerification';
import { useCamera } from '@/hooks/useCamera';
import { toast } from 'sonner';

export const FaceVerificationTest: React.FC = () => {
  const [currentDescriptor, setCurrentDescriptor] =
    useState<Float32Array | null>(null);

  const { modelsLoaded, loadModels, detectFaceFromVideo, faceApiService } =
    useFaceVerification();

  const {
    isActive: cameraActive,
    videoRef,
    startCamera,
    stopCamera,
    getVideoElement,
  } = useCamera();

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadModels();
        await startCamera('user');
      } catch (error) {
        console.error('Initialization failed:', error);
        toast.error('Failed to initialize face verification test');
      }
    };

    initialize();

    return () => {
      stopCamera();
    };
  }, [loadModels, startCamera, stopCamera]);

  const captureCurrentFace = async () => {
    const videoElement = getVideoElement();
    if (!videoElement) {
      toast.error('Camera not ready');
      return;
    }

    try {
      const result = await detectFaceFromVideo(videoElement, true);
      if (result.success && result.descriptor) {
        setCurrentDescriptor(result.descriptor);
        toast.success('Face captured!', {
          description: `Confidence: ${Math.round((result.confidence || 0) * 100)}% - Descriptor length: ${result.descriptor.length}`,
        });
      } else {
        toast.error('No face detected');
      }
    } catch (error) {
      console.error('Failed to capture face:', error);
      toast.error('Failed to capture face');
    }
  };

  const resetTest = () => {
    setCurrentDescriptor(null);
    toast.info('Test reset');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Face Verification Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!modelsLoaded && (
          <Alert>
            <AlertDescription>
              Loading face recognition models...
            </AlertDescription>
          </Alert>
        )}

        {modelsLoaded && (
          <>
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md mx-auto rounded-lg bg-black"
              />

              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  onClick={captureCurrentFace}
                  disabled={!cameraActive}
                  variant={currentDescriptor ? 'secondary' : 'default'}
                >
                  {currentDescriptor ? '✓ Face Captured' : 'Capture Face'}
                </Button>

                <Button onClick={resetTest} variant="destructive" size="sm">
                  Reset
                </Button>
              </div>
            </div>

            {currentDescriptor && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-semibold">
                      ✅ Face Descriptor Captured
                    </div>
                    <div className="text-sm">
                      <strong>Descriptor Length:</strong>{' '}
                      {currentDescriptor.length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Face descriptor ready for server-side verification
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong>Instructions:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Position your face clearly in the camera frame</li>
                <li>Click "Capture Face&quot; to extract face descriptor</li>
                <li>
                  The descriptor will be used for server-side verification
                </li>
                <li>Try with different lighting and angles for testing</li>
              </ol>
              <p className="mt-2">
                <strong>Note:</strong> Face verification now happens entirely on
                the server for security
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
