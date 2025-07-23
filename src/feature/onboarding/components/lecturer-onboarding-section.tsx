import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
import { CancelModal } from '@/feature/onboarding/components/cancel-modal';
import { CheckCircle } from 'lucide-react';
import { type OnboardingDataType } from '../schema/onboarding-schema';

export default function LecturerOnboardingSection({
  handleConfirmCancel,
  handleCompleteOnboarding,
}: {
  handleConfirmCancel: () => void;
  handleCompleteOnboarding: (data: OnboardingDataType) => Promise<void>;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [fullName, setFullName] = useState('Dr. John Smith');

  const completeOnboarding = async () => {
    // if (faculty && department) {
    setIsSubmitting(true);
    //? store  the users data in the data base. Make  a call to the  backend
    const completeData = { fullName };
    await handleCompleteOnboarding({
      ...completeData,
    });
    setCurrentStep(2);
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  // Step 1: Personal Info
  if (currentStep === 1) {
    // TODO: remove all hard coded tailwind color values
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          {/* Progress Indicator */}

          <Card>
            <CardHeader>
              <CardTitle>Professional Profile</CardTitle>
              <CardDescription>
                Please provide your official academic credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name with Title</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Dr. Jane Smith, Prof. John Doe"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This name will be displayed to your students for
                  identification purposes.
                </p>
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={completeOnboarding}
                  disabled={!fullName || isSubmitting}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* <CancelModal open={showCancelModal} onOpenChange={setShowCancelModal} /> */}
        <CancelModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleConfirmCancel}
        />
      </div>
    );
  }

  if (currentStep === 2) {
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
                <h3 className="font-semibold mb-2">{`What's next?`}</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Create your first course</li>
                  <li>• Set up class schedules</li>
                  <li>• Invite students to join</li>
                  <li>• Start tracking attendance</li>
                </ul>
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                {/* <Button onClick={}>Go to Dashboard</Button> */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* <CancelModal open={showCancelModal} onOpenChange={setShowCancelModal} /> */}
        <CancelModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleConfirmCancel}
        />
      </div>
    );
  }
  // Step 2: Confirmation
}
