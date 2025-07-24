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
import { CheckCircle } from 'lucide-react';
import {
  lecturerPersonalInfoSchema,
  type LecturerPersonalInfo,
  type OnboardingDataType,
} from '../schema/onboarding-schema';
import { lecturerTitleArrayConstant } from '@/constants/onboarding';
import { useImageUpload } from '@/hooks/useImageUpload';

export default function LecturerOnboardingSection({
  handleConfirmCancel,
  handleCompleteOnboarding,
}: {
  handleConfirmCancel: () => void;
  handleCompleteOnboarding: (data: OnboardingDataType) => Promise<void>;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { uploadImage, isUploading } = useImageUpload();

  const form = useForm<NonNullable<LecturerPersonalInfo>>({
    resolver: zodResolver(lecturerPersonalInfoSchema),
    defaultValues: {
      fullName: '',
      title: undefined,
      profileImage: undefined,
    },
  });

  const onSubmit = async (data: LecturerPersonalInfo) => {
    try {
      await uploadImage(data.profileImage);
      await handleCompleteOnboarding(data);
      setCurrentStep(2);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  // Step 1: Personal Info Form
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <Card>
            <CardHeader>
              <CardTitle>Professional Profile</CardTitle>
              <CardDescription>
                Please provide your official academic credentials and profile
                information
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
                          Upload a professional photo that will be displayed to
                          your students. Supported formats: JPEG, PNG, GIF, WebP
                          (max 5MB)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Title Selection */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Title</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your academic title" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {lecturerTitleArrayConstant.map((title) => (
                              <SelectItem key={title} value={title}>
                                {title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the appropriate academic title that will be
                          displayed with your name.
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
                            placeholder="e.g., John Smith"
                            {...field}
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter your full name as it should appear to students
                          (without title).
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
                        ? 'Setting up...'
                        : 'Complete Setup'}
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

  // Step 2: Success Screen
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <Card className="border-t-4 border-primary shadow-md">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Setup Complete
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {`Your academic profile has been successfully configured in
                ClassSync. You're now ready to begin your digital teaching
                journey.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="rounded-lg border bg-card p-5">
                <h3 className="font-semibold text-lg mb-3">Getting Started</h3>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">
                      Create and configure your course modules
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">
                      Establish your lecture schedule and attendance policies
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">
                      Generate enrollment codes for student registration
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">
                      Monitor attendance and engagement analytics
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <Button className="px-8">Go to Dashboard</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}

// Loading Skeleton Component
export function LecturerOnboardingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <div className="h-7 bg-muted rounded-md w-48 animate-pulse" />
              <div className="h-4 bg-muted rounded-md w-full animate-pulse" />
              <div className="h-4 bg-muted rounded-md w-3/4 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Profile Image Upload Skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded-md w-32 animate-pulse" />
                <div className="border-2 border-dashed border-muted rounded-lg p-8">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 rounded-full bg-muted animate-pulse">
                      <div className="h-8 w-8 bg-muted-foreground/20 rounded" />
                    </div>
                    <div className="space-y-2 text-center">
                      <div className="h-4 bg-muted rounded-md w-40 mx-auto animate-pulse" />
                      <div className="h-3 bg-muted rounded-md w-32 mx-auto animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-3 bg-muted rounded-md w-48 animate-pulse" />
                      <div className="h-3 bg-muted rounded-md w-32 mx-auto animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-md w-full animate-pulse" />
                <div className="h-3 bg-muted rounded-md w-2/3 animate-pulse" />
              </div>

              {/* Academic Title Selection Skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded-md w-28 animate-pulse" />
                <div className="h-10 bg-muted rounded-md w-full animate-pulse" />
                <div className="h-3 bg-muted rounded-md w-full animate-pulse" />
                <div className="h-3 bg-muted rounded-md w-1/2 animate-pulse" />
              </div>

              {/* Full Name Input Skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded-md w-20 animate-pulse" />
                <div className="h-10 bg-muted rounded-md w-full animate-pulse" />
                <div className="h-3 bg-muted rounded-md w-full animate-pulse" />
                <div className="h-3 bg-muted rounded-md w-3/4 animate-pulse" />
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex justify-between pt-6">
                <div className="h-10 bg-muted rounded-md w-20 animate-pulse" />
                <div className="h-10 bg-muted rounded-md w-32 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
