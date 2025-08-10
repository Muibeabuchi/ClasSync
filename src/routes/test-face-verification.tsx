import { createFileRoute } from '@tanstack/react-router';
import { FaceVerificationTest } from '@/components/face-verification/FaceVerificationTest';

export const Route = createFileRoute('/test-face-verification')({
  component: TestFaceVerificationPage,
});

function TestFaceVerificationPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Face Verification System Test
          </h1>
          <p className="text-muted-foreground">
            Use this page to test and debug the face verification system
            components.
          </p>
        </div>

        <FaceVerificationTest />
      </div>
    </div>
  );
}
