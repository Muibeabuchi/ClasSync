import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { FaceDetectionDemo } from '@/components/face-verification/FaceDetectionDemo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Zap, Target } from 'lucide-react';

export const Route = createFileRoute('/test/face-detection')({
  component: FaceDetectionTestPage,
});

function FaceDetectionTestPage() {
  const [useHighAccuracy, setUseHighAccuracy] = useState<boolean>(true);

  const accuracyDescriptions = {
    high: {
      name: 'High Accuracy',
      description:
        'Higher input size (416px) and lower threshold (0.2) for better detection',
      icon: '🎯',
      accuracy: 'Very High',
      speed: 'Medium',
    },
    low: {
      name: 'Low Accuracy (Fast)',
      description:
        'Lower input size (320px) and higher threshold (0.3) for faster processing',
      icon: '⚡',
      accuracy: 'Medium',
      speed: 'Very Fast',
    },
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Face Detection System Test
          </h1>
          <p className="text-muted-foreground">
            Test the face detection system with different models and landmark
            visualization. This page helps verify that face detection is working
            properly with the correct models and compare their performance.
          </p>
        </div>

        {/* Accuracy Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Accuracy Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose the accuracy level for TinyFaceDetector. Higher accuracy
                uses more resources but provides better detection.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(accuracyDescriptions).map(([key, accuracy]) => (
                  <div
                    key={key}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      (key === 'high' && useHighAccuracy) ||
                      (key === 'low' && !useHighAccuracy)
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setUseHighAccuracy(key === 'high')}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{accuracy.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-medium">{accuracy.name}</h3>
                        {((key === 'high' && useHighAccuracy) ||
                          (key === 'low' && !useHighAccuracy)) && (
                          <Badge variant="default" className="text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {accuracy.description}
                    </p>

                    <div className="flex justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <Target className="h-3 w-3" />
                        <span>Accuracy: {accuracy.accuracy}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="h-3 w-3" />
                        <span>Speed: {accuracy.speed}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Current Selection:{' '}
                  <strong>
                    {useHighAccuracy
                      ? accuracyDescriptions.high.name
                      : accuracyDescriptions.low.name}
                  </strong>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUseHighAccuracy(true)}
                  disabled={useHighAccuracy}
                >
                  Reset to High Accuracy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Face Detection Demo */}
        <FaceDetectionDemo
          useHighAccuracy={useHighAccuracy}
          onAccuracyChange={setUseHighAccuracy}
        />

        {/* TinyFaceDetector Info */}
        <Card>
          <CardHeader>
            <CardTitle>TinyFaceDetector Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <span className="text-2xl">🎯</span>
                    <span>High Accuracy Mode</span>
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Input size: 416px for better detection</li>
                    <li>• Lower score threshold (0.2)</li>
                    <li>• Better performance in challenging conditions</li>
                    <li>• Slower processing but more reliable</li>
                    <li>• Recommended for onboarding</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <span className="text-2xl">⚡</span>
                    <span>Fast Mode</span>
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Input size: 320px for faster processing</li>
                    <li>• Higher score threshold (0.3)</li>
                    <li>• Lower resource usage</li>
                    <li>• May miss faces in poor lighting</li>
                    <li>• Good for real-time applications</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Testing Tips:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • Try different lighting conditions to see accuracy
                    differences
                  </li>
                  <li>
                    • Compare detection success rates between accuracy modes
                  </li>
                  <li>• Notice the difference in landmark quality</li>
                  <li>
                    • Check the "Currently Using&quot; indicator to confirm
                    settings
                  </li>
                  <li>
                    • Monitor the detection statistics for performance
                    comparison
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
