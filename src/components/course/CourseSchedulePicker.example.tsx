import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import CourseSchedulePicker, {
  type LectureSchedule,
} from './CourseSchedulePicker';

// Form validation schema
const courseFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Course name is required')
    .max(100, 'Course name too long'),
  code: z
    .string()
    .min(1, 'Course code is required')
    .max(20, 'Course code too long'),
  description: z.string().optional(),
  schedule: z
    .array(
      z.object({
        day: z.string(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .min(1, 'At least one lecture day is required'),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

const CourseCreationExample: React.FC = () => {
  const [schedule, setSchedule] = useState<LectureSchedule[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      schedule: [],
    },
  });

  // Update form value when schedule changes
  React.useEffect(() => {
    setValue('schedule', schedule);
  }, [schedule, setValue]);

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      console.log('Creating course with data:', data);

      // Here you would typically call your API
      // await createCourse(data);

      alert('Course created successfully!');
    } catch (error) {
      console.error('Failed to create course:', error);
      alert('Failed to create course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Course Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Course Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="e.g., Introduction to Computer Science"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Course Code *</Label>
                <Input
                  id="code"
                  {...register('code')}
                  placeholder="e.g., CS101"
                />
                {errors.code && (
                  <p className="text-sm text-destructive">
                    {errors.code.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of the course..."
                rows={3}
              />
            </div>

            {/* Schedule Picker */}
            <div className="space-y-2">
              <Label>Lecture Schedule *</Label>
              <CourseSchedulePicker
                value={schedule}
                onChange={setSchedule}
                disabled={isSubmitting}
              />
              {errors.schedule && (
                <p className="text-sm text-destructive">
                  {errors.schedule.message}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Course...' : 'Create Course'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Debug Panel */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Form Data (Debug)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(watch(), null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseCreationExample;
