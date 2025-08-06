import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useConvexAuth } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';

interface UploadImageOptions {
  onSuccess?: (data: {
    success: boolean;
    message: string;
    imageUrl?: string;
  }) => void;
  onError?: (error: Error) => void;
}

interface UploadImageParams {
  file: File;
  options?: UploadImageOptions;
}

export const useImageUpload = () => {
  const { isAuthenticated } = useConvexAuth();
  const queryClient = useQueryClient();

  // Convex mutations
  const generateUploadUrl = useMutation({
    mutationFn: useConvexMutation(api.imageUpload.generateUploadUrl),
  });
  const { mutateAsync: updateUserProfileImage } = useMutation({
    mutationFn: useConvexMutation(api.imageUpload.updateUserProfileImage),
  });
  const deleteUserProfileImage = useMutation({
    mutationFn: useConvexMutation(api.imageUpload.deleteUserProfileImage),
    onSuccess: () => {
      toast.success('Profile image deleted successfully');

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['userProfileImage'] });
      queryClient.invalidateQueries({ queryKey: ['authenticatedUser'] });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('Failed to delete image', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async ({ file }: UploadImageParams) => {
      if (!isAuthenticated) {
        throw new Error('User must be authenticated to upload images');
      }

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Image size must be less than 5MB');
      }

      try {
        // Step 1: Generate upload URL
        const uploadUrl = await generateUploadUrl.mutateAsync({});

        // Step 2: Upload file to Convex storage
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image to storage');
        }

        const { storageId } = await uploadResponse.json();

        // Step 3: Update user profile with new image
        const result = await updateUserProfileImage({
          storageId: storageId as Id<'_storage'>,
        });

        return result;
      } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Profile image updated successfully');
    },
    onError: (error, variables) => {
      console.error('Upload error:', error);
      toast.error('Failed to upload image', {
        description: error.message,
      });

      // Call custom error handler if provided
      variables.options?.onError?.(error as Error);
    },
  });

  return {
    uploadImage: (file: File, options?: UploadImageOptions) =>
      uploadImageMutation.mutateAsync({ file, options }),
    deleteImage: () => deleteUserProfileImage.mutateAsync,
    isUploading: uploadImageMutation.isPending,
    isDeleting: deleteUserProfileImage.isPending,
    uploadError: uploadImageMutation.error,
    deleteError: deleteUserProfileImage.error,
  };
};

// Hook to get user profile image URL
export const useUserProfileImage = () => {
  const { isAuthenticated } = useConvexAuth();

  const { data: imageUrl, isLoading } = useQuery(
    convexQuery(
      api.imageUpload.getUserProfileImage,
      isAuthenticated ? {} : 'skip',
    ),
  );

  return {
    imageUrl,
    isLoading: imageUrl === undefined || isLoading,
  };
};

// Hook to get any image URL by storage ID
export const useImageUrl = (storageId: Id<'_storage'> | null) => {
  const { data: imageUrl, isLoading } = useQuery(
    convexQuery(
      api.imageUpload.getImageUrl,
      storageId ? { storageId } : 'skip',
    ),
  );

  return {
    imageUrl,
    isLoading,
  };
};
