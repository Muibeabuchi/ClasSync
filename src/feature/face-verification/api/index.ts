import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';

// Face verification status query
export const useGetFaceVerificationStatus = () =>
  useQuery(convexQuery(api.faceVerification.getFaceVerificationStatus, {}));

// Note: Client-side face descriptor fetching removed for security reasons
// All face verification now happens on the server

// Store face descriptor during onboarding
export const useStoreFaceDescriptor = () =>
  useMutation({
    mutationFn: useConvexMutation(api.faceVerification.storeFaceDescriptor),
  });

// Verify face for attendance
export const useVerifyFaceForAttendance = () =>
  useMutation({
    mutationFn: useConvexMutation(api.faceVerification.verifyFaceForAttendance),
  });

// Toggle face verification setting
export const useToggleFaceVerification = () =>
  useMutation({
    mutationFn: useConvexMutation(api.faceVerification.toggleFaceVerification),
  });

// Get session face verification logs (for lecturers)
export const useGetSessionFaceVerificationLogs = ({
  attendanceSessionId,
}: {
  attendanceSessionId: Id<'attendanceSessions'>;
}) =>
  useQuery(
    convexQuery(api.faceVerification.getSessionFaceVerificationLogs, {
      attendanceSessionId,
    }),
  );
