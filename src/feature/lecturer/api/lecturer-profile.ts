import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';
import { toast } from 'sonner';

// Query options for lecturer profile data
export const LecturerProfileQueryOptions = {
  getCurrentUser: convexQuery(api.userProfile.getAuthenticatedUser, {}),
  getUserProfileImage: convexQuery(api.imageUpload.getUserProfileImage, {}),
};

// Hook to get current user data
export const useGetCurrentUser = () =>
  useQuery(LecturerProfileQueryOptions.getCurrentUser);

// Hook to get user profile image
export const useGetUserProfileImage = () =>
  useQuery(LecturerProfileQueryOptions.getUserProfileImage);

// Hook to update user profile
export const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.userProfile.updateUserProfile),
    onSuccess: () => {
      // Invalidate and refetch user data
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      // Handle specific error messages from backend
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update profile. Please try again.';
      toast.error(errorMessage);
    },
  });
};

// Hook to upload profile image
export const useUploadProfileImage = () => {
  const uploadUrlMutation = useMutation({
    mutationFn: useConvexMutation(api.imageUpload.generateUploadUrl),
  });

  const updateUserProfileImage = useMutation({
    mutationFn: useConvexMutation(api.imageUpload.updateUserProfileImage),
  });

  return useMutation({
    mutationFn: async (file: File) => {
      // First, generate upload URL
      const uploadUrl = await uploadUrlMutation.mutateAsync({});

      // Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error('Failed to upload image');
      }

      const { storageId } = await result.json();

      // Update user profile with new image
      return await updateUserProfileImage.mutateAsync({
        storageId: storageId as Id<'_storage'>,
      });
    },
    onSuccess: () => {
      toast.success('Profile picture updated successfully!');
    },
    onError: (error) => {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    },
  });
};

// Hook to delete profile image
export const useDeleteProfileImage = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.imageUpload.deleteUserProfileImage),
    onSuccess: () => {
      toast.success('Profile picture removed successfully!');
    },
    onError: (error) => {
      console.error('Image deletion error:', error);
      toast.error('Failed to remove profile picture. Please try again.');
    },
  });
};
