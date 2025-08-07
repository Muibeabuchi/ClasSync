import { useGetLecturerCoursesWithStats } from '@/feature/course/api/get-lecturer-course-with-stats';
import LecturerCoursesPage, {
  LecturerCoursesPageSkeleton,
} from '@/feature/lecturer/components/MyCoursesPage';
import {
  MobileLecturerCourses,
  MobileLecturerCoursesSkeleton,
} from '@/feature/lecturer/components/mobile/mobile-lecturer-courses';
import { convexQuery } from '@convex-dev/react-query';
import { useNavigate } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';
import { useIsMobile } from '@/hooks/use-mobile';

export const Route = createFileRoute('/dashboard/lecturer/courses')({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loader: async ({ context }) => {
    context.queryClient.prefetchQuery(
      convexQuery(api.classLists.getMyClassLists, {}),
    );
    await context.queryClient.ensureQueryData(
      convexQuery(api.courses.getLecturerCoursesWithStats, {}),
    );
  },
});

function PendingComponent() {
  const isMobile = useIsMobile();

  return isMobile ? (
    <MobileLecturerCoursesSkeleton />
  ) : (
    <LecturerCoursesPageSkeleton />
  );
}

function RouteComponent() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: lecturerCoursesWithStats } = useGetLecturerCoursesWithStats();

  const handleCourseNavigate = (courseId: Id<'courses'>) => {
    navigate({
      to: '/dashboard/lecturer/$courseId',
      params: { courseId },
    });
  };

  return isMobile ? (
    <MobileLecturerCourses
      handleCourseNavigate={handleCourseNavigate}
      lecturerCoursesWithStats={lecturerCoursesWithStats}
    />
  ) : (
    <LecturerCoursesPage
      handleCourseNavigate={handleCourseNavigate}
      lecturerCoursesWithStats={lecturerCoursesWithStats}
    />
  );
}
