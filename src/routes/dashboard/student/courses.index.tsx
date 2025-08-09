import { createFileRoute } from '@tanstack/react-router';
import { Authenticated } from 'convex/react';
import { convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import StudentCoursesPage from '@/feature/student/components/student-course-page';
import MobileStudentCoursesPage from '@/feature/student/components/mobile-student-courses-page';
import { useIsMobile } from '@/hooks/use-mobile';

export const Route = createFileRoute('/dashboard/student/courses/')({
  component: RouteComponent,
  async loader({ context }) {
    // Prefetch student courses data
    await context.queryClient.ensureQueryData(
      convexQuery(api.courses.getStudentCourses, {}),
    );
  },
});

function RouteComponent() {
  const isMobile = useIsMobile();

  return (
    <Authenticated>
      {isMobile ? <MobileStudentCoursesPage /> : <StudentCoursesPage />}
    </Authenticated>
  );
}
