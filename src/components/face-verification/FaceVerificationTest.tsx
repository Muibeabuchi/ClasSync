import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Camera,
  Settings,
} from 'lucide-react';
import { useFaceVerification } from '@/hooks/useFaceVerification';
// import { useCamera } from '@/hooks/useCamera';
// import { toast } from 'sonner';

export const FaceVerificationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    modelsLoaded: boolean;
    cameraAccess: boolean;
    faceDetection: boolean;
    descriptorExtraction: boolean;
  }>({
    modelsLoaded: false,
    cameraAccess: false,
    faceDetection: false,
    descriptorExtraction: false,
  });

  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);

  const {
    isLoading: faceLoading,
    modelsLoaded,
    error: faceError,
    loadModels,
    detectFaceFromVideo,
  } = useFaceVerification();

  // const {
  //   isActive: cameraActive,
  //   error: cameraError,
  //   videoRef,
  //   startCamera,
  //   stopCamera,
  //   getVideoElement,
  // } = useCamera();

  const addLog = (message: string) => {
    console.log(`[FaceVerificationTest] ${message}`);
    setTestLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const runTests = async () => {
    setIsRunningTests(true);
    setTestLogs([]);
    addLog('Starting face verification system tests...');

    try {
      // Test 1: Model Loading
      addLog('Test 1: Loading face-api.js models...');
      await loadModels();

      if (modelsLoaded) {
        setTestResults((prev) => ({ ...prev, modelsLoaded: true }));
        addLog('✅ Models loaded successfully');
      } else {
        addLog('❌ Models failed to load');
      }

      // Test 2: Camera Access
      addLog('Test 2: Testing camera access...');
      try {
        await startCamera('user');
        if (cameraActive) {
          setTestResults((prev) => ({ ...prev, cameraAccess: true }));
          addLog('✅ Camera access granted');
        } else {
          addLog('❌ Camera access failed');
        }
      } catch (error) {
        addLog(
          `❌ Camera error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }

      // Test 3: Face Detection (if camera is active)
      if (cameraActive && modelsLoaded) {
        addLog('Test 3: Testing face detection...');

        // Wait a bit for camera to stabilize
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const videoElement = getVideoElement();
        if (videoElement) {
          try {
            const result = await detectFaceFromVideo(videoElement, false);

            if (result.success) {
              setTestResults((prev) => ({ ...prev, faceDetection: true }));
              addLog('✅ Face detection working');

              // Test 4: Descriptor Extraction
              if (result.descriptor) {
                setTestResults((prev) => ({
                  ...prev,
                  descriptorExtraction: true,
                }));
                addLog(
                  `✅ Face descriptor extracted (length: ${result.descriptor.length})`,
                );
              } else {
                addLog('❌ Face descriptor extraction failed');
              }
            } else {
              addLog(
                `❌ Face detection failed: ${result.error || 'No face detected'}`,
              );
            }
          } catch (error) {
            addLog(
              `❌ Face detection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
          }
        } else {
          addLog('❌ Video element not available');
        }
      }

      addLog('Tests completed!');
    } catch (error) {
      addLog(
        `❌ Test suite error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsRunningTests(false);
    }
  };

  const resetTests = () => {
    setTestResults({
      modelsLoaded: false,
      cameraAccess: false,
      faceDetection: false,
      descriptorExtraction: false,
    });
    setTestLogs([]);
    stopCamera();
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Face Verification System Test</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Controls */}
          <div className="flex space-x-2">
            <Button
              onClick={runTests}
              disabled={isRunningTests}
              className="flex items-center space-x-2"
            >
              {isRunningTests ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span>{isRunningTests ? 'Running Tests...' : 'Run Tests'}</span>
            </Button>
            <Button
              onClick={resetTests}
              variant="outline"
              disabled={isRunningTests}
            >
              Reset
            </Button>
          </div>

          {/* Test Results */}
          <div className="space-y-3">
            <h4 className="font-medium">Test Results:</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 p-3 border rounded">
                {getStatusIcon(testResults.modelsLoaded)}
                <span className="text-sm">Models Loaded</span>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded">
                {getStatusIcon(testResults.cameraAccess)}
                <span className="text-sm">Camera Access</span>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded">
                {getStatusIcon(testResults.faceDetection)}
                <span className="text-sm">Face Detection</span>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded">
                {getStatusIcon(testResults.descriptorExtraction)}
                <span className="text-sm">Descriptor Extraction</span>
              </div>
            </div>
          </div>

          {/* Camera Preview */}
          {cameraActive && (
            <div className="space-y-2">
              <h4 className="font-medium">Camera Preview:</h4>
              <div className="flex justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-64 h-48 rounded-lg bg-black border"
                />
              </div>
              <Badge variant="secondary" className="mx-auto block w-fit">
                <Camera className="h-3 w-3 mr-1" />
                Camera Active
              </Badge>
            </div>
          )}

          {/* Error Display */}
          {(faceError || cameraError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{faceError || cameraError}</AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Test Logs */}
          <div className="space-y-2">
            <h4 className="font-medium">Test Logs:</h4>
            <div className="bg-muted p-3 rounded-lg max-h-64 overflow-y-auto">
              {testLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No logs yet. Run tests to see output.
                </p>
              ) : (
                <div className="space-y-1">
                  {testLogs.map((log, index) => (
                    <div key={index} className="text-xs font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
