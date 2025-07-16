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
import {
  type GenderType,
  type OnboardingDataType,
  type yearLevelType,
} from '../schema/onboarding-schema';
import { yearLevelArrayConstant } from '@/constants/onboarding';

export default function StudentOnboardingSection({
  handleConfirmCancel,
  handleCompleteOnboarding,
}: {
  handleConfirmCancel: () => void;
  handleCompleteOnboarding: (data: OnboardingDataType) => Promise<void>;
}) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);

  // Form data
  const [fullName, setFullName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [gender, setGender] = useState<GenderType>();
  const [yearLevel, setYearLevel] = useState<yearLevelType>('100');
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
      await handleCompleteOnboarding({
        ...data,
      });
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Student Registration
          </h1>
          <p className="text-muted-foreground">
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
              <p className="text-xs text-muted-foreground">
                Registration number must start with 202 and be 10 digits
              </p>
              {registrationNumber &&
                !isValidRegistrationNumber(registrationNumber) && (
                  <p className="text-sm text-destructive">
                    Registration number must start with 202 and be 10 digits
                  </p>
                )}
            </div>

            {/* Gender and Year Level Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={gender}
                  onValueChange={(value) => {
                    setGender(value as GenderType);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearLevel">Year Level</Label>
                <Select
                  value={yearLevel}
                  onValueChange={(value) =>
                    setYearLevel(value as yearLevelType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearLevelArrayConstant.map((year) => {
                      return (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      );
                    })}
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
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-border/80 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="text-sm text-muted-foreground">
                  <label htmlFor="passportPhoto" className="cursor-pointer">
                    <span className="text-primary hover:text-primary/80">
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
                <p className="text-xs text-muted-foreground mt-2">
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
