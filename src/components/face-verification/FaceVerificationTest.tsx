import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetFaceVerificationStatus } from '@/feature/face-verification/api';
import { toast } from 'sonner';

export const FaceVerificationTest: React.FC = () => {
  const {
    data: verificationStatus,
    isLoading,
    error,
  } = useGetFaceVerificationStatus();

  const handleTestSave = async () => {
    try {
      // Create a dummy face descriptor for testing
      const dummyDescriptor = new Float32Array(128);
      for (let i = 0; i < 128; i++) {
        dummyDescriptor[i] = Math.random();
      }

      // Import the hook dynamically to test
      const { useFaceVerification } = await import(
        '@/hooks/useFaceVerification'
      );

      toast.info('Test face descriptor save initiated...');
      console.log('Testing face descriptor save with dummy data');
    } catch (error) {
      console.error('Test failed:', error);
      toast.error('Test failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div>Loading verification status...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Face Verification Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-red-600 text-sm">Error: {error.message}</div>
        )}

        <div className="space-y-2 text-sm">
          <div>
            <strong>Has Descriptor:</strong>{' '}
            {verificationStatus?.hasDescriptor ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <strong>Capture Method:</strong>{' '}
            {verificationStatus?.captureMethod || 'None'}
          </div>
          <div>
            <strong>Verification Enabled:</strong>{' '}
            {verificationStatus?.verificationEnabled ? '✅ Yes' : '❌ No'}
          </div>
        </div>

        <Button onClick={handleTestSave} variant="outline" className="w-full">
          Test Face Descriptor Save
        </Button>
      </CardContent>
    </Card>
  );
};
