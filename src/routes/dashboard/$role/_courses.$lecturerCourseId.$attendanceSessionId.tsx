import {
  useAttendanceSessionById,
  useGetAttendanceSessionRecords,
} from '@/feature/attendance/api';
// import { useGetCourseDetails } from '@/feature/course/api/get-course-with-analytics';
// import CourseDetailPage from '@/feature/lecturer/components/CourseDetailPage';
// import CourseDetailPageSkeleton from '@/feature/lecturer/components/CourseDetailPageSkeleton';
// import LecturerAttendancePage from '@/feature/lecturer/components/LecturerAttendancePage';
import LiveAttendancePage, {
  LiveAttendancePageSkeleton,
} from '@/feature/lecturer/components/LiveAttendancePage';
import { convexQuery } from '@convex-dev/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';
import { Suspense } from 'react';

export const Route = createFileRoute(
  '/dashboard/$role/_courses/$lecturerCourseId/$attendanceSessionId',
)({
  params: {
    parse: (params) => {
      return {
        attendanceSessionId:
          params.attendanceSessionId as Id<'attendanceSessions'>,
        lecturerCourseId: params.lecturerCourseId as Id<'courses'>,
      };
    },
  },
  component: RouteComponent,
  loader: async ({ context, params }) => {
    // prefetch the checkedIn students ahead of time
    context.queryClient.prefetchQuery(
      convexQuery(api.attendance.getAttendanceSessionRecords, {
        attendanceSessionId: params.attendanceSessionId,
        courseId: params.lecturerCourseId,
      }),
    );

    await context.queryClient.ensureQueryData(
      convexQuery(api.attendance.getAttendanceSessionById, {
        courseId: params.lecturerCourseId,
        attendanceSessionId: params.attendanceSessionId,
      }),
    );
  },
  pendingComponent: LiveAttendancePageSkeleton,
});

function RouteComponent() {
  const { lecturerCourseId, attendanceSessionId } = Route.useParams();

  // fetch the attendanceSessionData
  const { data: attendanceSession } = useAttendanceSessionById({
    attendanceSessionId,
    courseId: lecturerCourseId,
  });
  const { data: attendanceSessionRecords } = useGetAttendanceSessionRecords({
    attendanceSessionId,
    courseId: lecturerCourseId,
  });

  return (
    <Suspense fallback={<LiveAttendancePageSkeleton />}>
      <LiveAttendancePage
        attendanceSession={attendanceSession}
        attendanceSessionRecords={attendanceSessionRecords}
      />
      ;
    </Suspense>
  );
}
