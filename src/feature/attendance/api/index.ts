import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';

// create a hook to consume the createAttendanceSession api
export const useCreateAttendanceSession = () =>
  useMutation({
    mutationFn: useConvexMutation(api.attendance.startAttendanceSession),
  });

export const useGetCourseAttendanceSession = ({
  courseId,
}: {
  courseId: Id<'courses'>;
}) =>
  useSuspenseQuery(
    convexQuery(api.attendance.getCourseAttendanceSessions, { courseId }),
  );

export const useAttendanceSessionById = ({
  attendanceSessionId,
  courseId,
}: {
  attendanceSessionId: Id<'attendanceSessions'>;
  courseId: Id<'courses'>;
}) =>
  useSuspenseQuery(
    convexQuery(api.attendance.getAttendanceSessionById, {
      attendanceSessionId,
      courseId,
    }),
  );

export const useGetAttendanceSessionRecords = ({
  attendanceSessionId,
  courseId,
}: {
  attendanceSessionId: Id<'attendanceSessions'>;
  courseId: Id<'courses'>;
}) =>
  useSuspenseQuery(
    convexQuery(api.attendance.getAttendanceSessionRecords, {
      attendanceSessionId,
      courseId,
    }),
  );
