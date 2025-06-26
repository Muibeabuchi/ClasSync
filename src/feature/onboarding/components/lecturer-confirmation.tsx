import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';

interface LecturerConfirmationProps {
  onCancel: () => void;
}

export function LecturerConfirmation({ onCancel }: LecturerConfirmationProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoToDashboard = async () => {
    setIsLoading(true);
    // Mock navigation delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // router.push("/dashboard")
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              ✓
            </div>
            <div className="w-16 h-1 bg-green-600"></div>
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              ✓
            </div>
            <div className="w-16 h-1 bg-green-600"></div>
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              ✓
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Setup Complete!
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 dark:bg-green-900 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Welcome to ClassSync!</CardTitle>
            <CardDescription>
              Your lecturer account has been successfully set up. You can now
              start managing your courses and tracking student attendance.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What's next?</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Create your first course</li>
                <li>• Set up class schedules</li>
                <li>• Invite students to join</li>
                <li>• Start tracking attendance</li>
              </ul>
            </div>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleGoToDashboard} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Go to Dashboard'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
