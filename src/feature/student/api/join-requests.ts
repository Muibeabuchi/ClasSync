import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { toast } from 'sonner';

// Get all join requests for the current student
export const useGetMyJoinRequests = () => {
  return useSuspenseQuery(convexQuery(api.joinRequests.getMyJoinRequests, {}));
};

// Get pending join requests count for badge
export const useGetPendingJoinRequestsCount = () => {
  const { data: joinRequests = [] } = useGetMyJoinRequests();
  return joinRequests.filter((req: any) => req.status === 'pending').length;
};

// Cancel a pending join request
export const useCancelJoinRequest = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.joinRequests.cancelJoinRequest),
    onSuccess: () => {
      toast.success('Request cancelled', {
        description: 'Join Request Cancelled successfully',
      });
    },
    onError: (error) => {
      toast.error('Failed to cancel request', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });
};

// Delete a rejected or approved join request
export const useDeleteJoinRequest = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.joinRequests.deleteJoinRequest),
    onSuccess: () => {
      toast.success('Request deleted', {
        description: 'Join Request Denied',
      });
    },
    onError: (error) => {
      toast.error('Failed to delete request', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });
};
