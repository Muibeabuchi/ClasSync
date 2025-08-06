import { useState } from 'react';
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { CancelModal } from '@/feature/onboarding/components/cancel-modal';
import {
  genderSchema,
  // type GenderType,
  type OnboardingDataType,
} from '../schema/onboarding-schema';
import { useImageUpload } from '@/hooks/useImageUpload';
import { z } from 'zod';
import { toast } from 'sonner';
// import { studentGenderSchema } from 'convex/schema';

// Student form schema
const studentFormSchema = z.object({
  fullName: z.string().min(4, 'Full name must be at least 4 characters'),
  registrationNumber: z.string().optional(),
  gender: genderSchema,
  profileImage: z
    .instanceof(File, { message: 'Add a profile image' })
    .refine((file) => file.type.startsWith('image/'), {
      message: 'File must be an image',
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'Image must be smaller than 5MB',
    }),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

export default function StudentOnboardingSection({
  handleConfirmCancel,
  handleCompleteOnboarding,
}: {
  handleConfirmCancel: () => void;
  handleCompleteOnboarding: (data: OnboardingDataType) => Promise<void>;
}) {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { uploadImage, isUploading } = useImageUpload();

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      fullName: '',
      registrationNumber: '',
      gender: undefined,
      profileImage: undefined,
    },
  });

  const onSubmit = async (data: StudentFormData) => {
    try {
      // Upload image if provided
      if (!data.profileImage) return;
      await uploadImage(data.profileImage);
      // Complete onboarding
      await handleCompleteOnboarding(data);
    } catch (error) {
      toast.error('Error completing onboarding');
      console.error('Error completing onboarding:', error);
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground text-primary mb-2">
            Student Registration
          </h1>
          <p className="text-muted-foreground text-xs">
            Complete your profile to start using ClassSynk
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              Please provide your details to set up your student account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Profile Image Upload */}
                <FormField
                  control={form.control}
                  name="profileImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Photo (Optional)</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          disabled={form.formState.isSubmitting}
                          maxSize={5 * 1024 * 1024} // 5MB
                        />
                      </FormControl>
                      <FormDescription>
                        Upload a photo that will be displayed in your profile.
                        Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter your full name as it should appear in the system.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Registration Number */}
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 2021123456"
                          {...field}
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter your school matriculation/registration number or
                        the unique identifier code given to you by your
                        lecturer.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gender */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={form.formState.isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select your gender for profile information.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Action Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={form.formState.isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting || isUploading}
                  >
                    {form.formState.isSubmitting
                      ? 'Setting up account...'
                      : 'Complete Registration'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
