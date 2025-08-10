import { createFileRoute } from '@tanstack/react-router';
import { Authenticated } from 'convex/react';
import { convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import StudentCourseDetailPage from '@/feature/student/components/StudentCourseDetailPage';
import MobileStudentCourseDetailPage from '@/feature/student/components/MobileStudentCourseDetailPage';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Id } from 'convex/_generated/dataModel';

export const Route = createFileRoute('/dashboard/student/courses/$courseId')({
  params: {
    parse: (params) => {
      return {
        courseId: params.courseId as Id<'courses'>,
      };
    },
  },
  component: RouteComponent,
  async loader({ context, params }) {
    // Prefetch course detail data
    await context.queryClient.ensureQueryData(
      convexQuery(api.courses.getStudentCourseDetail, {
        courseId: params.courseId,
      }),
    );
  },
});

function RouteComponent() {
  const isMobile = useIsMobile();

  return (
    <Authenticated>
      {isMobile ? (
        <MobileStudentCourseDetailPage />
      ) : (
        <StudentCourseDetailPage />
      )}
    </Authenticated>
  );
}
