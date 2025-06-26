import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
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
import { Upload } from 'lucide-react';
import {
  getFaculties,
  getDepartmentsByFaculty,
} from '@/constants/faculty-department';
// import { mockSubmitStudentOnboarding } from '@/lib/form-utils';

export const Route = createFileRoute('/_auth/onboard/student')({
  component: StudentOnboardingPage,
});

export default function StudentOnboardingPage() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);

  // Form data
  const [fullName, setFullName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [gender, setGender] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');

  const faculties = getFaculties();

  useEffect(() => {
    if (faculty) {
      const depts = getDepartmentsByFaculty(faculty);
      setDepartments(depts);
      if (!depts.includes(department)) {
        setDepartment('');
      }
    }
  }, [faculty, department]);

  const isValidRegistrationNumber = (regNum: string) => {
    return /^202\d{8}$/.test(regNum);
  };

  const isFormValid = () => {
    return (
      fullName &&
      registrationNumber &&
      isValidRegistrationNumber(registrationNumber) &&
      gender &&
      yearLevel &&
      faculty &&
      department
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      const data = {
        fullName,
        registrationNumber,
        gender,
        yearLevel,
        faculty,
        department,
      };
      // await mockSubmitStudentOnboarding(data);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancel = () => {
    // Mock account deletion
    console.log('Account deleted');
    // Mock logout
    console.log('User logged out');
    // Redirect to home
    // navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Student Registration
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Complete your profile to start using ClassSync
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              Please provide your details to set up your student account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            {/* Registration Number */}
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. 2021123456"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Registration number must start with 202 and be 10 digits
              </p>
              {registrationNumber &&
                !isValidRegistrationNumber(registrationNumber) && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Registration number must start with 202 and be 10 digits
                  </p>
                )}
            </div>

            {/* Gender and Year Level Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearLevel">Year Level</Label>
                <Select value={yearLevel} onValueChange={setYearLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 Level</SelectItem>
                    <SelectItem value="200">200 Level</SelectItem>
                    <SelectItem value="300">300 Level</SelectItem>
                    <SelectItem value="400">400 Level</SelectItem>
                    <SelectItem value="500">500 Level</SelectItem>
                    <SelectItem value="600">600 Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Faculty */}
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

            {/* Department */}
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
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Passport Photo Upload */}
            <div className="space-y-2">
              <Label htmlFor="passportPhoto">Passport Photo (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <label htmlFor="passportPhoto" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span>
                    <span> or drag and drop</span>
                  </label>
                  <input
                    id="passportPhoto"
                    type="file"
                    className="hidden"
                    accept="image/*"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
              >
                {isSubmitting
                  ? 'Setting up account...'
                  : 'Complete Registration'}
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
