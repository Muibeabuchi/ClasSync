import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConvexAuth } from 'convex/react';
import { useMutation as useConvexMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';

interface OnboardingData {
  fullName: string;
  gender?: 'male' | 'female';
  profileImage?: File;
}

interface OnboardingOptions {
  onSuccess?: (data: { success: boolean; message: string }) => void;
  onError?: (error: Error) => void;
}

export const useOnboarding = () => {
  const { isAuthenticated } = useConvexAuth();
  const queryClient = useQueryClient();

  // Convex mutations
  const generateUploadUrl = useConvexMutation(
    api.imageUpload.generateUploadUrl,
  );
  const completeUserOnboarding = useConvexMutation(
    api.userProfile.completeUserOnboarding,
  );

  const onboardingMutation = useMutation({
    mutationFn: async ({
      data,
      // options,
    }: {
      data: OnboardingData;
      options?: OnboardingOptions;
    }) => {
      if (!isAuthenticated) {
        throw new Error('User must be authenticated to complete onboarding');
      }

      let profileImageId: Id<'_storage'> | undefined;

      // Handle image upload if provided
      if (data.profileImage) {
        // Validate image
        if (!data.profileImage.type.startsWith('image/')) {
          throw new Error('Profile image must be an image file');
        }

        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (data.profileImage.size > maxSize) {
          throw new Error('Profile image size must be less than 5MB');
        }

        try {
          // Generate upload URL
          const uploadUrl = await generateUploadUrl();

          // Upload file to Convex storage
          const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: { 'Content-Type': data.profileImage.type },
            body: data.profileImage,
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload profile image');
          }

          const { storageId } = await uploadResponse.json();
          profileImageId = storageId as Id<'_storage'>;
        } catch (error) {
          console.error('Profile image upload failed:', error);
          throw new Error('Failed to upload profile image');
        }
      }

      // Complete onboarding with or without image
      const result = await completeUserOnboarding({
        fullName: data.fullName,
        gender: data.gender,
        profileImageId,
      });

      return result;
    },
    onSuccess: (data, variables) => {
      toast.success('Onboarding completed successfully!');

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['authenticatedUser'] });
      queryClient.invalidateQueries({ queryKey: ['userOnboardedStatus'] });
      queryClient.invalidateQueries({ queryKey: ['userProfileImage'] });

      // Call custom success handler if provided
      variables.options?.onSuccess?.(data);
    },
    onError: (error, variables) => {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding', {
        description: error.message,
      });

      // Call custom error handler if provided
      variables.options?.onError?.(error as Error);
    },
  });

  return {
    completeOnboarding: (data: OnboardingData, options?: OnboardingOptions) =>
      onboardingMutation.mutate({ data, options }),
    isLoading: onboardingMutation.isPending,
    error: onboardingMutation.error,
  };
};
