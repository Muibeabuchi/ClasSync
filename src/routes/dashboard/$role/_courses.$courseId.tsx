import { useGetCourseDetails } from '@/feature/course/api/get-course-with-analytics';
import CourseDetailPage from '@/feature/lecturer/components/CourseDetailPage';
import CourseDetailPageSkeleton from '@/feature/lecturer/components/CourseDetailPageSkeleton';
import { convexQuery } from '@convex-dev/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';
import { Suspense } from 'react';

export const Route = createFileRoute('/dashboard/$role/_courses/$courseId')({
  params: {
    parse: (params) => {
      return {
        courseId: params.courseId as Id<'courses'>,
      };
    },
  },
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.courses.getCourseDetails, { courseId: params.courseId }),
    );
  },
  pendingComponent: CourseDetailPageSkeleton,
});

function RouteComponent() {
  const { courseId } = Route.useParams();
  // fetch the courseData
  const { data: courseDetails } = useGetCourseDetails({ courseId });
  return (
    <Suspense fallback={<CourseDetailPageSkeleton />}>
      <CourseDetailPage
        courseId={courseId}
        courseDetails={courseDetails}
        // onBack={handleBackToCourses}
        // onStudentClick={() => {}}
        // onAnalyticsClick={handleCourseAnalyticsClick}
        // onAttendanceClick={handleAttendanceClick}
        // onLiveAttendanceClick={handleLiveAttendanceClick}
        // onAttendanceHistoryClick={handleAttendanceHistoryClick}
      />
    </Suspense>
  );
}
