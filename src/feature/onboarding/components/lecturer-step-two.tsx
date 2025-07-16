// components/onboarding/LecturerStepTwo.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  lecturerAcademicInfoSchema,
  type LecturerAcademicInfo,
} from '../schema/onboarding-schema';
import {
  getFaculties,
  getDepartmentsByFaculty,
} from '@/constants/faculty-department';

interface LecturerStepTwoProps {
  onNext: (data: LecturerAcademicInfo) => void;
  onBack: () => void;
  onCancel: () => void;
  initialData?: LecturerAcademicInfo;
}

export function LecturerStepTwo({
  onNext,
  onBack,
  onCancel,
  initialData,
}: LecturerStepTwoProps) {
  const [departments, setDepartments] = useState<string[]>([]);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<LecturerAcademicInfo>({
    resolver: zodResolver(lecturerAcademicInfoSchema),
    defaultValues: initialData,
    mode: 'onChange',
  });

  const watchedFaculty = watch('faculty');
  const watchedDepartment = watch('department');

  useEffect(() => {
    if (watchedFaculty) {
      const depts = getDepartmentsByFaculty(watchedFaculty);
      setDepartments(depts);
      // Reset department when faculty changes
      if (!depts.includes(watchedDepartment)) {
        setValue('department', '');
      }
    }
  }, [watchedFaculty, watchedDepartment, setValue]);

  const faculties = getFaculties();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-chart-2 text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              ✓
            </div>
            <div className="w-16 h-1 bg-chart-2"></div>
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div className="w-16 h-1 bg-muted"></div>
            <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
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
          <CardContent>
            <form onSubmit={handleSubmit(onNext)} className="space-y-6">
              {/* Faculty */}
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty</Label>
                <Select
                  value={watchedFaculty}
                  onValueChange={(value) => setValue('faculty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty} value={faculty}>
                        {faculty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.faculty && (
                  <p className="text-sm text-destructive">
                    {errors.faculty.message}
                  </p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={watchedDepartment}
                  onValueChange={(value) => setValue('department', value)}
                  disabled={!watchedFaculty}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        watchedFaculty
                          ? 'Select your department'
                          : 'Select faculty first'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm text-destructive">
                    {errors.department.message}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-between pt-6">
                <div className="space-x-2">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button type="button" variant="outline" onClick={onBack}>
                    Back
                  </Button>
                </div>
                <Button type="submit" disabled={!isValid}>
                  Next Step
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
