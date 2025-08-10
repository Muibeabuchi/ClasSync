import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Eye,
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  Settings,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useFaceVerification } from '@/hooks/useFaceVerification';
import { FaceOnboardingCapture } from './FaceOnboardingCapture';
import { toast } from 'sonner';

export const FaceVerificationSettings: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { verificationStatus, toggleFaceVerification, isLoading, error } =
    useFaceVerification();

  const handleToggleVerification = async (enabled: boolean) => {
    if (enabled && !verificationStatus?.hasDescriptor) {
      // Need to set up face verification first
      setShowOnboarding(true);
      return;
    }

    setIsUpdating(true);
    const success = await toggleFaceVerification(enabled);
    if (success) {
      // Status will be updated via the query
    }
    setIsUpdating(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    toast.success('Face Verification Setup Complete', {
      description: 'You can now use face verification for attendance.',
    });
  };

  const handleReconfigureFace = () => {
    setShowOnboarding(true);
  };

  if (showOnboarding) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setShowOnboarding(false)}
          className="mb-4"
        >
          ← Back to Settings
        </Button>
        <FaceOnboardingCapture
          onComplete={handleOnboardingComplete}
          onSkip={() => setShowOnboarding(false)}
        />
      </div>
    );
  }

  if (verificationStatus === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading face verification settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Face Verification Settings</span>
          </CardTitle>
          <CardDescription>
            Configure face verification for secure attendance check-in
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Current Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Face Verification Status
                </Label>
                <p className="text-sm text-muted-foreground">
                  Current state of your face verification setup
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {verificationStatus?.hasDescriptor ? (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Set Up
                  </Badge>
                )}
              </div>
            </div>

            {verificationStatus?.hasDescriptor && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  {verificationStatus.captureMethod === 'live_camera' ? (
                    <Camera className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Upload className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="font-medium">
                    Setup Method:{' '}
                    {verificationStatus.captureMethod === 'live_camera'
                      ? 'Live Camera'
                      : 'Image Upload'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Face data securely stored</span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Enable/Disable Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label
                  htmlFor="face-verification-toggle"
                  className="text-base font-medium"
                >
                  Enable Face Verification
                </Label>
                <p className="text-sm text-muted-foreground">
                  Require face verification for attendance check-in
                </p>
              </div>
              <Switch
                id="face-verification-toggle"
                checked={verificationStatus?.verificationEnabled ?? false}
                onCheckedChange={handleToggleVerification}
                disabled={isLoading || isUpdating}
              />
            </div>

            {verificationStatus?.verificationEnabled && (
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  Face verification is enabled. You'll need to verify your face
                  during attendance check-in.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Actions</Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!verificationStatus?.hasDescriptor ? (
                <Button
                  onClick={() => setShowOnboarding(true)}
                  className="flex items-center space-x-2"
                  disabled={isLoading}
                >
                  <Eye className="h-4 w-4" />
                  <span>Set Up Face Verification</span>
                </Button>
              ) : (
                <Button
                  onClick={handleReconfigureFace}
                  variant="outline"
                  className="flex items-center space-x-2"
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reconfigure Face Data</span>
                </Button>
              )}

              {verificationStatus?.hasDescriptor && (
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                  disabled={isLoading}
                  onClick={() => {
                    toast.info('Feature Coming Soon', {
                      description:
                        'Face data removal will be available in a future update.',
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove Face Data</span>
                </Button>
              )}
            </div>
          </div>

          {/* Information */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">How it works</span>
            </div>
            <ul className="text-sm text-blue-800 space-y-1 ml-6">
              <li>• Your face data is processed locally and stored securely</li>
              <li>
                • Only mathematical descriptors are saved, not actual images
              </li>
              <li>
                • Face verification adds an extra layer of security to
                attendance
              </li>
              <li>
                • You can always fall back to GPS-only verification if needed
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
