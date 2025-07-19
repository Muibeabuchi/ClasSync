import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
// import { useMutation } from 'convex/react';

export const useGetLecturerJoinRequests = () =>
  useSuspenseQuery(
    convexQuery(api.joinRequests.getAllJoinRequestsForLecturer, {}),
  );

export const useRequestToJoinCourseClassList = () =>
  useMutation({
    mutationFn: useConvexMutation(api.joinRequests.createJoinRequest),
  });

export const useAcceptJoinRequest = () =>
  useMutation({
    mutationFn: useConvexMutation(
      api.joinRequests.linkStudentToAttendanceEntry,
    ),
  });
