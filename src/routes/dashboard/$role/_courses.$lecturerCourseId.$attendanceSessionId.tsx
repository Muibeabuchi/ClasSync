import { useGetCourseDetails } from '@/feature/course/api/get-course-with-analytics';
import CourseDetailPage from '@/feature/lecturer/components/CourseDetailPage';
import CourseDetailPageSkeleton from '@/feature/lecturer/components/CourseDetailPageSkeleton';
import LecturerAttendancePage from '@/feature/lecturer/components/LecturerAttendancePage';
import LiveAttendancePage from '@/feature/lecturer/components/LiveAttendancePage';
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
    // await context.queryClient.ensureQueryData(
    //   convexQuery(api.courses.getCourseDetails, {
    //     courseId: params.lecturerCourseId,
    //   }),
    // );
  },
  pendingComponent: CourseDetailPageSkeleton,
});

function RouteComponent() {
  const { lecturerCourseId } = Route.useParams();


  // fetch the attendanceSessionData
  
  return <LiveAttendancePage />;
}
