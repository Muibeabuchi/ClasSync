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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CancelModal } from '@/feature/onboarding/components/cancel-modal';
import { CheckCircle } from 'lucide-react';
import {
  getFaculties,
  getDepartmentsByFaculty,
} from '@/constants/faculty-department';
// import { useNavigate } from '@tanstack/react-router';
import {
  lecturerTitleType,
  OnboardingDataType,
} from '../schema/onboarding-schema';
import { lecturerTitleArrayConstant } from '@/constants/constants';

export default function LecturerOnboardingSection({
  handleConfirmCancel,
  // handleCompleteOnboarding,
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
  const [title, setTitle] = useState<lecturerTitleType>();
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');

  const faculties = getFaculties();
  const departments = faculty ? getDepartmentsByFaculty(faculty) : [];

  const handleStepOneNext = () => {
    if (fullName && title) {
      setCurrentStep(2);
    }
  };

  const handleStepTwoNext = async () => {
    if (faculty && department) {
      setIsSubmitting(true);
      //? store  the users data in the data base. Make  a call to the  backend
      const completeData = { fullName, title, faculty, department };
      handleCompleteOnboarding({
        ...completeData,
      });
      setCurrentStep(3);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  // Step 1: Personal Info
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700"></div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700"></div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Step 1 of 3: Personal Information
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                {`Let's start with your basic information`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Select
                  value={title}
                  onValueChange={(value) =>
                    setTitle(value as lecturerTitleType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your title" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturerTitleArrayConstant.map((title) => (
                      <SelectItem key={title} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={handleStepOneNext}
                  disabled={!fullName || !title}
                >
                  Next Step
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

  // Step 2: Academic Info
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
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700"></div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Step 2 of 3: Academic Information
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>
                Tell us about your academic affiliation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty</Label>
                <Select
                  value={faculty}
                  onValueChange={(value) => {
                    setFaculty(value);
                    setDepartment('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={department}
                  onValueChange={setDepartment}
                  disabled={!faculty}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        faculty
                          ? 'Select your department'
                          : 'Select faculty first'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d: string) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between pt-6">
                <div className="space-x-2">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                </div>
                <Button
                  onClick={handleStepTwoNext}
                  disabled={!faculty || !department || isSubmitting}
                >
                  {isSubmitting ? 'Setting up...' : 'Next Step'}
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

  // Step 3: Confirmation
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
