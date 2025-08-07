// import { useQuery } from 'convex/react';
import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';

// Get all join requests for lecturer
export const useGetLecturerJoinRequests = () =>
  useSuspenseQuery(
    convexQuery(api.joinRequests.getAllJoinRequestsForLecturer, {}),
  );

// Get pending join requests count for badge
export const useGetLecturerPendingJoinRequestsCount = () => {
  const { data: joinRequests = [] } = useGetLecturerJoinRequests();
  return joinRequests.filter((req) => req.status === 'pending').length;
};
