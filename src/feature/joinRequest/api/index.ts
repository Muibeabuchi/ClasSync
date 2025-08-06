import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { toast } from 'sonner';

export const useGetLecturerJoinRequests = () =>
  useSuspenseQuery(
    convexQuery(api.joinRequests.getAllJoinRequestsForLecturer, {}),
  );

export const useRequestToJoinCourseClassList = () =>
  useMutation({
    mutationFn: useConvexMutation(api.joinRequests.createJoinRequest),
    // onSuccess: () => {
    //   toast.success('Join request sent', {
    //     description: 'Your request has been sent to the lecturer for review',
    //   });
    // },
    // onError: (error) => {
    //   toast.error('Failed to send request', {
    //     description: error instanceof Error ? error.message : 'Unknown error',
    //   });
    // },
  });

export const useAcceptJoinRequest = () =>
  useMutation({
    mutationFn: useConvexMutation(
      api.joinRequests.linkStudentToAttendanceEntry,
    ),
    // onSuccess: () => {
    //   toast.success('Student approved', {
    //     description: 'Student has been successfully added to the course',
    //   });
    // },
    // onError: (error) => {
    //   toast.error('Failed to approve student', {
    //     description: error instanceof Error ? error.message : 'Unknown error',
    //   });
    // },
  });

export const useRejectJoinRequest = () =>
  useMutation({
    mutationFn: useConvexMutation(api.joinRequests.rejectJoinRequest),
    onSuccess: () => {
      toast.success('Request rejected', {
        description: 'The join request has been rejected successfully',
      });
    },
    // onError: (error) => {
    //   toast.error('Failed to reject request', {
    //     description: error instanceof Error ? error.message : 'Unknown error',
    //   });
    // },
  });

export const useBatchAcceptJoinRequests = () =>
  useMutation({
    mutationFn: useConvexMutation(api.joinRequests.batchAcceptJoinRequests),
    // onSuccess and onError will be handled in the component for custom toast messages
  });
