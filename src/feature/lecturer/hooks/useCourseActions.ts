import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { toast } from 'sonner';

export const useArchiveCourse = () =>
  useMutation({
    mutationFn: useConvexMutation(api.courses.archiveCourse),
    onSuccess: () => {
      toast.success('Course archived successfully', {
        description: 'The course has been archived and is no longer active.',
      });
    },
    onError: (error) => {
      toast.error('Failed to archive course', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
      });
    },
  });

export const useUnarchiveCourse = () =>
  useMutation({
    mutationFn: useConvexMutation(api.courses.unarchiveCourse),
    onSuccess: () => {
      toast.success('Course unarchived successfully', {
        description:
          'The course has been reactivated and is now available for enrollment.',
      });
    },
    onError: (error) => {
      toast.error('Failed to unarchive course', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
      });
    },
  });

export const useDeleteCourse = () =>
  useMutation({
    mutationFn: useConvexMutation(api.courses.deleteCourse),
    onSuccess: () => {
      toast.success('Course deleted successfully', {
        description:
          'The course and all its data have been permanently removed.',
      });
    },
    onError: (error) => {
      toast.error('Failed to delete course', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
      });
    },
  });
